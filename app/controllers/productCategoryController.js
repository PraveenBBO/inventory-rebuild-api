const AsyncHandler = require("@utils/AsyncHandler");
const {sendSuccess, sendError} = require("@utils/responseHandler");
const {
    getAllCategories,
    createCategory,
    updateCategory,
    getCategoryById,
    deleteCategory
} = require("@services/productCategoryService");
const {UniqueConstraintError} = require("sequelize");

//Get All category
exports.getAll = AsyncHandler(async (req, res) => {
        const categories = await getAllCategories();
        sendSuccess(res, categories);
});

function validateCategoryInput(name, order_no, status) {
    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Name is required.';
    if (order_no !== undefined && isNaN(order_no)) errors.order_no = 'Order number must be a number.';
    if (status && !['active', 'inactive'].includes(status)) errors.status = 'Invalid status value.';
    return errors;
}
//Create a category
exports.create = AsyncHandler(async (req, res) => {
    const {name, order_no, status} = req.body;
    // Validation
    const errors = validateCategoryInput(name, order_no, status);
    if (Object.keys(errors).length > 0) {
        return sendError(res, errors, 422);
    }
    try {
        const category = await createCategory({ name, order_no, status });
        return sendSuccess(res, category);
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            return sendError(res, 'Name must be unique.', 422);
        }
        return sendError(res, 'Something went wrong.', 500);
    }
});

//Update category
exports.update = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const { name, order_no, status } = req.body;

    // Validation
    const errors = validateCategoryInput(name, order_no, status);
    if (Object.keys(errors).length > 0) {
        return sendError(res, errors, 422);
    }

    try {
        const updated = await updateCategory(id, { name, order_no, status });
        sendSuccess(res, updated);
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            return sendError(res, 'Name must be unique.', 422);
        }
        return sendError(res, 'Something went wrong.', 500);
    }

});

//Get detail by id
exports.getById = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const category = await getCategoryById(id);
    sendSuccess(res, category);
});

//Delete
exports.delete = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    await deleteCategory(id);
    sendSuccess(res, 'Category deleted successfully');
});