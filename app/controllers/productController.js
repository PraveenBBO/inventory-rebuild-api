const AsyncHandler = require("@utils/AsyncHandler");
const {sendSuccess, sendError} = require("@utils/responseHandler");
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    uploadProductImage,
} = require("@services/productService");
const {UniqueConstraintError} = require("sequelize");

//Get All products
exports.getAll = AsyncHandler(async (req, res) => {
    const products = await getAllProducts(req.query);
    sendSuccess(res, products);
});

//Create a SKU
exports.create = AsyncHandler(async (req, res) => {
    const {name} = req.body;

    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Name is required.';

    try {
        const product = await createProduct(req.body, { syncPolicy: 'soft-fail' });
        sendSuccess(res, product);
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            const errors = {};
            err.errors.forEach(error => {
                if (error.path === 'sku') {
                    errors.sku = 'SKU must be unique.';
                } else if (error.path === 'name') {
                    errors.name = 'Product name must be unique.';
                }
            });
            return sendError(res, errors, 422);
        }
        if (err?.status && err?.erpBody) {
            return sendError(res, `ERP error: ${err.erpBody}`, err.status);
        }
        return sendError(res, 'Something went wrong.', 500);
    }
});

//Update category
exports.update = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const {name, sku, status, category_id, length, width, height} = req.body;

    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Name is required.';
    if (!sku || sku.trim() === '') errors.sku = 'SKU is required.';
    if (category_id !== undefined && isNaN(category_id)) errors.category_id = 'Category ID number must be a number.';
    if (status && !['active', 'inactive'].includes(status)) errors.status = 'Invalid status value.';
    if (length !== undefined && isNaN(length)) errors.length = 'Length must be a number.';
    if (width !== undefined && isNaN(width)) errors.width = 'Width must be a number.';
    if (height !== undefined && isNaN(height)) errors.height = 'Height must be a number.';

    if (Object.keys(errors).length > 0) {
        return sendError(res, errors, 422);
    }

    if (length && width && height) {
        const l = parseFloat(length);
        const w = parseFloat(width);
        const h = parseFloat(height);
        req.body.unit_cbm = (l * w * h) / 1000000; // cm³ to m³
    }
    try {
        const updated = await updateProduct(id, req.body);
        sendSuccess(res, updated);
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            const errors = {};
            err.errors.forEach(error => {
                if (error.path === 'sku') {
                    errors.sku = 'SKU must be unique.';
                } else if (error.path === 'name') {
                    errors.name = 'Product name must be unique.';
                }
            });
           return sendError(res, errors, 422);
        }
        return sendError(res, 'Something went wrong.', 500);
    }

});

//Partial Update category
exports.partialUpdate = AsyncHandler(async (req, res) => {
    const id = req.params.id;
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

exports.moveToArchive = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const product = await getProductById(id);
    await updateProduct(id, {archive: product.archive ? false : true});
    sendSuccess(res, 'Product has been moved successfully');
});

// Upload product image
exports.uploadImage = AsyncHandler(async (req, res) => {
    const id = req.params.id;
    const { location } = req.body;
    const fileBuffer = req.file?.buffer;

    const result = await uploadProductImage(id, fileBuffer, location);
    sendSuccess(res, result);
});