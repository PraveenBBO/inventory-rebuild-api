const express = require('express');
const router = express.Router();
const apiAuthMiddleware = require('@middleware/authMiddleware');
//Api Routes
const productCategoryRoute = require('./api/productCategoryRoute');
const productRoute = require('./api/productRoute');

//For API
router.use('/api/product-category', apiAuthMiddleware, productCategoryRoute);
router.use('/api/product', apiAuthMiddleware, productRoute);


module.exports = router;