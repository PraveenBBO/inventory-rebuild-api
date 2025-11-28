const express = require('express');
const router = express.Router();
const productController = require('@controllers/productController');
const upload = require('@utils/upload');

router.get('/', productController.getAll);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.put('/partial/:id', productController.partialUpdate);
router.get('/:id', productController.getById);
router.delete('/:id', productController.delete);
router.post('/archive/:id', productController.moveToArchive);
router.post('/:id/upload-image', upload.single('image'), productController.uploadImage);

module.exports = router;
