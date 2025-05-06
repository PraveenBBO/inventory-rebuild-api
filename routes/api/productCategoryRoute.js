const express = require('express');
const router = express.Router();
const productCategoryController = require('@controllers/productCategoryController');

router.get('/', productCategoryController.getAll);
router.post('/', productCategoryController.create);
router.put('/:id', productCategoryController.update);
router.get('/:id', productCategoryController.getById);
router.delete('/:id', productCategoryController.delete);

module.exports = router;
