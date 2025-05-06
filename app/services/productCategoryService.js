const { ProductCategory } = require('@models');


const getAllCategories = async () => {
    return await  ProductCategory.findAll({
        order: [['order_no', 'ASC']]
    });
};
const createCategory = async ({ name, order_no, status }) => {
    return await ProductCategory.create({ name, order_no, status });
};


const getCategoryById = async (id) => {
    const category = await ProductCategory.findByPk(id);
    if (!category) {
        throw new Error("Category not found");
    }
    return category;
};

const updateCategory = async (id, payload) => {
    const category = await getCategoryById(id);
    return await category.update(payload);
};
const deleteCategory = async (id) => {
    const category = await getCategoryById(id);
    await category.destroy();
    return true;
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
};