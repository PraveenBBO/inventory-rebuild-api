const {
    InventoryOrder,
    InventoryOrderProduct,
    Product, sequelize
} = require('@models');

const User = require('../models/userManagement/User');
const { createLog: createProductLog } = require('@services/productLogService');

const getAllOrders = async ({page = 1, limit = 10}) => {
    const offset = (page - 1) * limit;

    const {count, rows: orders} = await InventoryOrder.findAndCountAll({
        order: [['createdAt', 'DESC']],
        offset,
        limit,
    });

    const userIds = [...new Set(orders.map(order => order.user_id))];

    const users = await User.findAll({
        where: {id: userIds},
        attributes: ['id', 'name'],
    });

    const userMap = {};
    users.forEach(user => {
        userMap[user.id] = user.name;
    });

    const enrichedOrders = orders.map(order => ({
        ...order.toJSON(),
        user_name: userMap[order.user_id] || null,
    }));

    return {
        total: count,
        page,
        pageSize: limit,
        orders: enrichedOrders,
    };
};


const getOrderById = async (id) => {
    const order = await InventoryOrder.findByPk(id, {
        include: [{
            model: InventoryOrderProduct,
            as: 'products',
            include: [{
                model: Product,
                as: 'product',
            }]
        }]
    });
    if (!order) throw new Error('Order not found');
    return order;
};

const sanitizeDate = (date) => {
    return (date && date !== 'Invalid date' && !isNaN(new Date(date))) ? date : null;
};
const IMPORT_STATUS = "Import into inventory";
const ON_THE_WAY_STATUS = "On the way";
const NO_REVERT_STATUSES = new Set(["Complete", "Pending", "Archive"]);

const createOrder = async (data) => {
    return await sequelize.transaction(async (t) => {
        const {products, ...orderData} = data;
        const sanitized = {
            ...orderData,
            loading_date: sanitizeDate(orderData.loading_date),
            etd: sanitizeDate(orderData.etd),
            eta: sanitizeDate(orderData.eta),
        };
        const order = await InventoryOrder.create(sanitized, {transaction: t});

        const items = products.map(p => ({
            inventory_order_id: order.id,
            product_id: p.product_id,
            cost: p.cost || 0,
            qty: p.qty,
            ctn: p.ctn,
            unit_cbm: p.unit_cbm || 0
        }));

        await InventoryOrderProduct.bulkCreate(items, {transaction: t});

        // Adjust inventory based on initial status
        if (sanitized.status === ON_THE_WAY_STATUS) {
            // Deduct from China when items are on the way
            for (const p of items) {
                await Product.increment({ china_quantity: -p.qty }, {
                    where: { id: p.product_id },
                    transaction: t
                });
                // Log the deduction from China inventory
                await createProductLog({
                    product_id: p.product_id,
                    action: 'ORDER_ON_THE_WAY',
                    detail: `Order ${order.order_no} created with On the way status - deducted ${p.qty} from China stock`,
                    is_for: 'china'
                }, { transaction: t });
            }
        } else if (sanitized.status === IMPORT_STATUS) {
            // On import, add to USA quantity only (China was already deducted when On the way)
            for (const p of items) {
                await Product.increment({ quantity: p.qty }, {
                    where: { id: p.product_id },
                    transaction: t
                });
                // Log import into USA from China
                await createProductLog({
                    product_id: p.product_id,
                    action: 'IMPORT_TO_CHINA',
                    detail: `Item import from china ${p.qty}`,
                    is_for: 'usa'
                }, { transaction: t });
            }
        }

        return order;
    });
};


const updateOrder = async (id, data) => {
    return await sequelize.transaction(async (t) => {
        const order = await InventoryOrder.findByPk(id);
        if (!order) throw new Error('Order not found');

        const prevStatus = order.status;

        // Capture old items before we overwrite them
        const oldItems = await InventoryOrderProduct.findAll({
            where: { inventory_order_id: id },
            transaction: t
        });

        const {products, ...orderData} = data;
        await order.update(orderData, {transaction: t});

        // Replace items with new set
        await InventoryOrderProduct.destroy({
            where: {inventory_order_id: id},
            transaction: t
        });

        const newItems = products.map(p => ({
            inventory_order_id: id,
            product_id: p.product_id,
            cost: p.cost || 0,
            qty: p.qty,
            ctn: p.ctn,
            unit_cbm: p.unit_cbm || 0
        }));

        await InventoryOrderProduct.bulkCreate(newItems, {transaction: t});

        const newStatus = order.status; // after update

        // Inventory adjustments depending on status transitions
        // 1) ON_THE_WAY affects China inventory only
        if (prevStatus !== ON_THE_WAY_STATUS && newStatus === ON_THE_WAY_STATUS) {
            for (const p of newItems) {
                await Product.increment({ china_quantity: -p.qty }, {
                    where: { id: p.product_id },
                    transaction: t
                });
                // Log the deduction from China inventory
                await createProductLog({
                    product_id: p.product_id,
                    action: 'ORDER_ON_THE_WAY',
                    detail: `Order ${order.order_no} status changed to On the way - deducted ${p.qty} from China stock`,
                    is_for: 'china'
                }, { transaction: t });
            }
        } else if (prevStatus === ON_THE_WAY_STATUS && newStatus !== ON_THE_WAY_STATUS) {
            if (newStatus !== IMPORT_STATUS && !NO_REVERT_STATUSES.has(newStatus)) {
                // Revert China deduction if moving away from On the way and not importing
                for (const p of oldItems) {
                    await Product.increment({ china_quantity: p.qty }, {
                        where: { id: p.product_id },
                        transaction: t
                    });
                }
            }
        } else if (prevStatus === ON_THE_WAY_STATUS && newStatus === ON_THE_WAY_STATUS) {
            // Adjust China by diff
            const oldMap = new Map();
            for (const p of oldItems) oldMap.set(p.product_id, (oldMap.get(p.product_id) || 0) + p.qty);
            const newMap = new Map();
            for (const p of newItems) newMap.set(p.product_id, (newMap.get(p.product_id) || 0) + p.qty);
            const productIds = new Set([...oldMap.keys(), ...newMap.keys()]);
            for (const pid of productIds) {
                const diff = (newMap.get(pid) || 0) - (oldMap.get(pid) || 0);
                if (diff !== 0) {
                    await Product.increment({ china_quantity: -diff }, {
                        where: { id: pid },
                        transaction: t
                    });
                }
            }
        }

        // 2) IMPORT affects USA quantity only
        if (prevStatus !== IMPORT_STATUS && newStatus === IMPORT_STATUS) {
            for (const p of newItems) {
                await Product.increment({ quantity: p.qty }, {
                    where: { id: p.product_id },
                    transaction: t
                });
                await createProductLog({
                    product_id: p.product_id,
                    action: 'IMPORT_TO_CHINA',
                    detail: `Item import from china ${p.qty}`,
                    is_for: 'usa'
                }, { transaction: t });
            }
        } else if (prevStatus === IMPORT_STATUS && newStatus !== IMPORT_STATUS && !NO_REVERT_STATUSES.has(newStatus)) {
            // Revert USA additions
            for (const p of oldItems) {
                await Product.increment({ quantity: -p.qty }, {
                    where: { id: p.product_id },
                    transaction: t
                });
            }
        } else if (prevStatus === IMPORT_STATUS && newStatus === IMPORT_STATUS) {
            const oldMap = new Map();
            for (const p of oldItems) oldMap.set(p.product_id, (oldMap.get(p.product_id) || 0) + p.qty);
            const newMap = new Map();
            for (const p of newItems) newMap.set(p.product_id, (newMap.get(p.product_id) || 0) + p.qty);
            const productIds = new Set([...oldMap.keys(), ...newMap.keys()]);
            for (const pid of productIds) {
                const diff = (newMap.get(pid) || 0) - (oldMap.get(pid) || 0);
                if (diff !== 0) {
                    await Product.increment({ quantity: diff }, {
                        where: { id: pid },
                        transaction: t
                    });
                    if (diff > 0) {
                        await createProductLog({
                            product_id: pid,
                            action: 'IMPORT_TO_CHINA',
                            detail: `Item import from china ${diff}`,
                            is_for: 'usa'
                        }, { transaction: t });
                    }
                }
            }
        }

        return order;
    });
};

const deleteOrder = async (id) => {
    return await sequelize.transaction(async (t) => {
        await InventoryOrderProduct.destroy({
            where: {inventory_order_id: id},
            transaction: t
        });
        await InventoryOrder.destroy({
            where: {id},
            transaction: t
        });
    });
};

const deleteOrderItem = async (id) => {
    return await sequelize.transaction(async (t) => {
        await InventoryOrderProduct.destroy({
            where: {id},
            transaction: t
        });
    });
};

module.exports = {
    getAllOrders,
    createOrder,
    updateOrder,
    getOrderById,
    deleteOrder,
    deleteOrderItem,
};