const { Product } = require('@models');
const { Op } = require('sequelize');
const { capitalizeWords, toUpperCase } = require('@utils/stringUtils');
const { erpCreateProduct } = require('@utils/erpClient');
const { createLog: createProductLog } = require('@services/productLogService');
const { uploadToCloudinary, deleteFromCloudinary } = require('@utils/cloudinaryUpload');

const getAllProducts = async (query) => {
    const whereClause = {};

    if (query.category === 'archive') {
        whereClause.archive = true;
    }
    else if (query.category) {
        whereClause.category_id = query.category;
        whereClause.archive = false;
    }
    if(!query.category){
        whereClause.archive = false;
    }
    if (query.search) {
        whereClause[Op.or] = [
            { sku: { [Op.iLike]: `%${query.search}%` } },
            { name: { [Op.iLike]: `%${query.search}%` } }
        ];
    }

    return await Product.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
    });
};
const createProduct = async (data, { syncPolicy = 'hard-fail' } = {}) => {
    data.name = capitalizeWords(data.name);
    data.sku = toUpperCase(data.sku);

    const created = await Product.create(data, {
        fields: [
            'name', 'sku', 'sku_combo', 'status',
            'category_id', 'cost', 'quantity', 'threshold', 'location', 'note', 'photo',
            'china_quantity', 'china_threshold', 'china_photo', 'china_location'
        ]
    });

    // Create opening stock log if opening quantity is more than 1
    try {
        if (Number(created.quantity) > 1) {
            await createProductLog({
                product_id: created.id,
                action: 'SKU_CREATED',
                detail: `opening stock ${created.quantity}`,
                is_for: 'usa',
            });
        }
    } catch (e) {
        // Do not block product creation if logging fails
    }

    const erpPayload = {
        sku_id: created.id,
        product_name: created.name,
        mrp: 1,
        sale_price:1,
        status: 'inactive',
    };

    const idemKey = `${created.sku}:${created.created_at ? new Date(created.created_at).getTime() : Date.now()}`;

    try {
        const erpResp = await erpCreateProduct(erpPayload, { idemKey });
        return created;

    } catch (err) {
        if (syncPolicy === 'hard-fail') {
            throw err; 
        } else {
            if ('sync_status' in created) {
                created.sync_status = 'FAILED';
                created.sync_error = String(err.message).slice(0, 500);
                await created.save();
            }
            return created;
        }
    }
};
const getProductById = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};

const updateProduct = async (id, payload) => {
    const product = await getProductById(id);

    const oldQty = Number(product.quantity);
    const newQty = Number(payload.quantity);
    const oldChinaQty = Number(product.china_quantity);
    const newChinaQty = Number(payload.china_quantity);
    const oldChinaThreshold = Number(product.china_threshold);
    const newChinaThreshold = Number(payload.china_threshold);

    if (payload.name !== undefined) payload.name = capitalizeWords(payload.name);
    if (payload.sku !== undefined) payload.sku = toUpperCase(payload.sku);

    const updated = await product.update(payload);

    // Log stock change for USA quantity when it actually changed
    try {
            if (!Number.isNaN(oldQty) && !Number.isNaN(newQty) && oldQty !== newQty) {
                await createProductLog({
                    product_id: updated.id,
                    action: 'SKU_UPDATED',
                    detail: `Stock updated ${oldQty} to ${newQty}`,
                    is_for: 'usa',
                });
        }
    } catch (e) {
    }

    // Log stock change for China quantity when it actually changed
    try {
        if (!Number.isNaN(oldChinaQty) && !Number.isNaN(newChinaQty) && oldChinaQty !== newChinaQty) {
            await createProductLog({
                product_id: updated.id,
                action: 'SKU_UPDATED',
                detail: `China stock updated ${oldChinaQty} to ${newChinaQty}`,
                is_for: 'china',
            });
        }
    } catch (e) {
    }

    // Log threshold change for China when it actually changed
    try {
        if (!Number.isNaN(oldChinaThreshold) && !Number.isNaN(newChinaThreshold) && oldChinaThreshold !== newChinaThreshold) {
            await createProductLog({
                product_id: updated.id,
                action: 'THRESHOLD_UPDATED',
                detail: `China threshold updated ${oldChinaThreshold} to ${newChinaThreshold}`,
                is_for: 'china',
            });
        }
    } catch (e) {
    }

    return updated;
};

const deleteProduct = async (id) => {
    const product = await getProductById(id);
    await product.destroy();
    return true;
};

const uploadProductImage = async (id, fileBuffer, location) => {
    if (!fileBuffer) {
        throw new Error('No image file provided');
    }

    if (!location || !['china', 'usa'].includes(location)) {
        throw new Error('Invalid location. Must be "china" or "usa"');
    }

    const product = await getProductById(id);
    const imageUrl = await uploadToCloudinary(fileBuffer, 'products');

    const photoField = location === 'china' ? 'china_photo' : 'photo';

    const oldImageUrl = product[photoField];
    if (oldImageUrl) {
        await deleteFromCloudinary(oldImageUrl);
    }

    const updateData = {
        [photoField]: imageUrl
    };

    const updatedProduct = await updateProduct(id, updateData);

    return updatedProduct;
};

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    uploadProductImage,
};