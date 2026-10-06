const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controller/ProductController');
const { validateProduct, validateObjectId } = require('../middleware/ValidateMiddleware');

router.get('/get-products', getProducts);
router.post('/add-products', validateProduct, createProduct);

router.put('/update-products/:id', validateObjectId, validateProduct, updateProduct);
router.delete('/delete-products/:id', validateObjectId, deleteProduct);

module.exports = router;