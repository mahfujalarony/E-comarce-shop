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

module.exports = { createProduct };
