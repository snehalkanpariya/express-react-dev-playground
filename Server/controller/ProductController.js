const mongoose = require('mongoose');
const productModel = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler'); // Utility to catch async errors automatically

const getProducts = asyncHandler(async (req, res) => {
    const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) || 10;
    const skip=(page-1)*limit;
    const sort=req.query.sort || '-createdAt';
    const searchCondition=req.query.keyword?{
        title:{
            $regex:req.query.keyword,
            $option:'i'
        }
    }:{};
    let priceFilter={}
    if(req.query.minPrice || req.query.maxPrice){
        priceFilter.price={}
        if(req.query.minPrice) priceFilter.price.$gte=Number(req.query.minPrice)
            if(req.query.maxPrice) priceFilter.price.$lte=Number(req.query.maxPrice)
    }
  const products = await productModel.find().sort(sort).skip(skip).limit(limit);
  const totalMatchingProducts=await productModel.countDocuments(searchCondition)
  
  res.status(200).json({
    success: true,
    limit:limit,
    skip:skip,
    sortedBy:sort,
    count: products.length,
    totalMatching:totalMatching,
    data: products
  });
});

// @desc    Create a product
// @route   POST /api/products/add-products
const createProduct = asyncHandler(async (req, res) => {
  const { title, price } = req.body;

  const newProduct = await productModel.create({
    title,
    price
  });

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