const express = require('express');
const router = express.Router();
const productLogController = require('@controllers/productLogController');

// List logs for a product (optional query: ?is_for=usa|china)
router.get('/:productId', productLogController.getByProduct);

module.exports = router;
