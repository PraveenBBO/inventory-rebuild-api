const AsyncHandler = require('@utils/AsyncHandler');
const { sendSuccess, sendError } = require('@utils/responseHandler');
const { UniqueConstraintError } = require('sequelize');
const {
    getAllOrders,
    createOrder,
    updateOrder,
    getOrderById,
    deleteOrder
} = require('@services/orderService');
const {deleteOrderItem} = require("../services/orderService");

// GET /orders
exports.getAll = AsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getAllOrders({ page, limit });

    sendSuccess(res, result);
});

// GET /orders/:id
exports.getById = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const order = await getOrderById(id);
    sendSuccess(res, order);
});

// POST /orders
exports.create = AsyncHandler(async (req, res) => {

    const { order_no, user_id, status, loading_date, etd, eta, input_date, products } = req.body;
    const errors = {};

    if (!order_no || order_no.trim() === '') errors.order_no = 'Order No is required.';
    if (user_id !== undefined && isNaN(user_id)) errors.user_id = 'User Id must be a number.';
    if (!status) errors.status = 'Status is required.';
    if (!Array.isArray(products) || products.length === 0) errors.products = 'At least one product is required.';

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        if (!p.product_id) errors[`products[${i}].product_id`] = 'Product ID is required.';
        if (typeof p.qty !== 'number') errors[`products[${i}].qty`] = 'Qty must be a number.';
        if (typeof p.ctn !== 'number') errors[`products[${i}].ctn`] = 'CTN must be a number.';
    }

    if (Object.keys(errors).length > 0) return sendError(res, errors, 422);

    try {
        const order = await createOrder(req.body);
        sendSuccess(res, order);
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            return sendError(res, 'Order No must be unique.', 422);
        }
        return sendError(res, 'Something went wrong.', 500);
    }
});

// PUT /orders/:id
exports.update = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const { order_no, status, loading_date, etd, eta, input_date, products } = req.body;

    const errors = {};
    if (!order_no || order_no.trim() === '') errors.order_no = 'Order No is required.';
    if (!status) errors.status = 'Status is required.';
    if (!Array.isArray(products) || products.length === 0) errors.products = 'At least one product is required.';

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        if (!p.product_id) errors[`products[${i}].product_id`] = 'Product ID is required.';
        if (typeof p.qty !== 'number') errors[`products[${i}].qty`] = 'Qty must be a number.';
        if (typeof p.ctn !== 'number') errors[`products[${i}].ctn`] = 'CTN must be a number.';
    }

    if (Object.keys(errors).length > 0) return sendError(res, errors, 422);

    try {
        const { user_id, ...updateData } = req.body;
        const updated = await updateOrder(id, updateData);
        sendSuccess(res, updated);
    } catch (err) {
        return sendError(res, 'Something went wrong.', 500);
    }
});

// DELETE /orders/:id
exports.delete = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    await deleteOrder(id);
    sendSuccess(res, 'Order deleted successfully');
});

// DELETE /orders/item/:id
exports.deleteItem = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    await deleteOrderItem(id);
    sendSuccess(res, 'Order Item deleted successfully');
});