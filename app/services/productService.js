const { Product } = require('@models');


const getAllProducts = async () => {
    return await  Product.findAll({
        order: [['name', 'ASC']]
    });
};
const createProduct = async (data) => {
    return await Product.create(data, {
        fields: ['name', 'sku', 'sku_combo', 'status',
            'category_id', 'cost', 'quantity', 'threshold', 'location', 'note', 'photo',
        'china_quantity', 'china_threshold', 'china_photo', 'china_location']
    });
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
    return await product.update(payload);
};

const deleteProduct = async (id) => {
    const product = await getProductById(id);
    await product.destroy();
    return true;
};

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
};