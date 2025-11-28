const express = require('express');
const router = express.Router();
const orderController = require('@controllers/orderController');

router.get('/', orderController.getAll);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.get('/:id', orderController.getById);
router.delete('/:id', orderController.delete);
router.delete('/item/:id', orderController.deleteItem);

module.exports = router;
