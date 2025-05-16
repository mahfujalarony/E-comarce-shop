const Product = require('../model/productsModel');

const createProduct = async (req, res) => {
  try {
    console.log('Received request to insert product:', req.body);
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product inserted successfully', product });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ error: 'Failed to insert product' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // ডিফল্ট 10
    const offset = parseInt(req.query.offset) || 0;

    const products = await Product.find()
      .skip(offset)
      .limit(limit);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};


// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error });
//   }
// };

// একটি নির্দিষ্ট প্রোডাক্ট ফেচ করা (ID দিয়ে)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}



module.exports = { createProduct, getAllProducts, getProductById };
