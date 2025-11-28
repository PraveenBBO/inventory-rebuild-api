const express = require('express');
const router = express.Router();
const apiAuthMiddleware = require('@middleware/authMiddleware');
//Api Routes
const productCategoryRoute = require('./api/productCategoryRoute');
const productRoute = require('./api/productRoute');
const orderRoute = require('./api/orderRoute');
const productLogRoute = require('./api/productLogRoute');

//For API
router.use('/api/product-category', apiAuthMiddleware, productCategoryRoute);
router.use('/api/product', apiAuthMiddleware, productRoute);
router.use('/api/order', apiAuthMiddleware, orderRoute);
router.use('/api/product-log', apiAuthMiddleware, productLogRoute);


module.exports = router;