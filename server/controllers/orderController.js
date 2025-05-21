const Order = require('../model/Order');
const Product = require('../model/productsModel'); // ধরে নিচ্ছি প্রোডাক্ট মডেল আলাদা আছে

exports.createDirectOrder = async (req, res) => {
  try {
    const { items } = req.body; // items = [{ product: productId, quantity: 2 }, ...]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No products provided for order.' });
    }

    // প্রোডাক্ট ও দামের তথ্য আনতে হবে
    const populatedItems = await Promise.all(items.map(async item => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    }));

    const totalAmount = populatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      user: req.user.id,
      items: populatedItems,
      totalAmount,
    });

    await order.save();
    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
