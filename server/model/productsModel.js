const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number,
  },
  description: String,
  stars: {
    type: Number,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    enum: ['S', 'M', 'L', 'XL'],
    default: 'M'
  },
  images: {
    type: [String], 
    default: []
  },
  discount: {
    type: Number,
    default: 0
  },
  category: String,
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;