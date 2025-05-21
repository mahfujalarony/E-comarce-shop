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
  oldPrice: Number,
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

// 🔁 Discount অটোমেটিক হিসাব করার জন্য:
productSchema.pre('save', function (next) {
  if (this.oldPrice && this.price && this.oldPrice > this.price) {
    const discount = ((this.oldPrice - this.price) / this.oldPrice) * 100;
    this.discount = Math.round(discount); // শতাংশ হিসেবে রাখছি
  } else {
    this.discount = 0;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;




// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   oldPrice: {
//     type: Number,
//   },
//   description: String,
//   stars: {
//     type: Number,
//     default: 0
//   },
//   reviews: {
//     type: Number,
//     default: 0
//   },
//   size: {
//     type: String,
//     enum: ['S', 'M', 'L', 'XL'],
//     default: 'M'
//   },
//   images: {
//     type: [String], 
//     default: []
//   },
//   discount: {
//     type: Number,
//     default: 0
//   },
//   category: String,
//   inStock: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// const Product = mongoose.model('Product', productSchema);
// module.exports = Product;