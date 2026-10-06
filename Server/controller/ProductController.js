const mongoose = require('mongoose');
const productModel = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler'); // Utility to catch async errors automatically

const getProducts = asyncHandler(async (req, res) => {
  // 1. Build features query with population attached
  const features = new APIFeatures(
    productModel.find().populate({
      path: 'user', // Lowercase key matching productSchema field
      select: 'name email'
    }),
    req.query
  )
    .search()
    .filter()
    .sort()
    .paginate();

  // 2. Execute query
  const products = await features.query;
  const totalCount = await productModel.countDocuments();

  // 3. Send response
  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts: totalCount,
    data: products
  });
});
// @desc    Create a product
// @route   POST /api/products/add-products
const createProduct = asyncHandler(async (req, res) => {
  req.body.user=req.user.id;
  const newProduct = await productModel.create(
    req.body
  );

  res.status(201).json({
    success: true,
    data: newProduct
  });
});

// @desc    Update a product
// @route   PUT /api/products/update-products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params; // Keep string as-is! No parseInt()

  // 1. Check if ID is a valid 24-char hexadecimal MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: '${id}'. Must be a 24-character hexadecimal string.`
    });
  }

  // 2. Perform atomic update in MongoDB
  const updatedProduct = await productModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    return res.status(404).json({
      success: false,
      message: `Product not found with id of ${id}`
    });
  }

  res.status(200).json({
    success: true,
    data: updatedProduct
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/delete-products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params; // Keep string as-is! No parseInt()

  // 1. Check if ID is a valid 24-char hexadecimal MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: '${id}'. Must be a 24-character hexadecimal string.`
    });
  }

  // 2. Perform delete in MongoDB
  const deletedProduct = await productModel.findByIdAndDelete(id);

  if (!deletedProduct) {
    return res.status(404).json({
      success: false,
      message: `Product not found with id of ${id}`
    });
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully"
  });
});

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};