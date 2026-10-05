const express = require('express');
const router = express.Router();
const { getProducts,createProduct}=require('../controller/ProductController');
const validateProduct=require('../middleware/ValidateMiddleware');

router.get('/get-products',getProducts);
router.post('/add-products',validateProduct,createProduct);

module.exports=router;