const AsyncHandler = require("@utils/AsyncHandler");
const {sendSuccess, sendError} = require("@utils/responseHandler");
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
} = require("@services/productService");
const {getCategoryById} = require("../services/productCategoryService");

//Get All products
exports.getAll = AsyncHandler(async (req, res) => {
        const products = await getAllProducts();
        sendSuccess(res, products);
});

//Create a category
exports.create = AsyncHandler(async (req, res) => {
        const {name, category_id, sku, status} = req.body;

        const errors = {};
        if (!name || name.trim() === '') errors.name = 'Name is required.';
        if (!sku || sku.trim() === '') errors.sku = 'SKU is required.';
        if (category_id !== undefined && isNaN(category_id)) errors.category_id = 'Category ID number must be a number.';
        if (status && !['active', 'inactive'].includes(status)) errors.status = 'Invalid status value.';

        if (Object.keys(errors).length > 0) {
            return sendError(res, errors, 422);
        }

        const product = await createProduct(req.body);
        sendSuccess(res, product);
});

//Update category
exports.update = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const { name, sku, status, category_id } = req.body;

    // Validation
    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Name is required.';
    if (!sku || sku.trim() === '') errors.sku = 'SKU is required.';
    if (category_id !== undefined && isNaN(category_id)) errors.category_id = 'Category ID number must be a number.';
    if (status && !['active', 'inactive'].includes(status)) errors.status = 'Invalid status value.';

    if (Object.keys(errors).length > 0) {
        return sendError(res, errors, 422);
    }

    const updated = await updateProduct(id, req.body);
    sendSuccess(res, updated);

});

//Get detail by id
exports.getById = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await getProductById(id);
    sendSuccess(res, product);
});

//Delete
exports.delete = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    await deleteProduct(id);
    sendSuccess(res, 'Product deleted successfully');
});