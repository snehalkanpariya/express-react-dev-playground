const mongoose = require('mongoose');

const validateProduct = (req, res, next) => {
  const { title, price } = req.body;
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required and must be a non-empty string'
      });
    }
  }

  if (!isUpdate || price !== undefined) {
    if (price === undefined || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price is required and must be a positive number'
      });
    }
  }

  next();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid MongoDB ObjectId format: ${id}`
    });
  }

  next();
};

module.exports = {
  validateProduct,
  validateObjectId
};