const Order = require('../model/Order');
const Product = require('../model/productsModel'); // প্রোডাক্ট মডেল

exports.createOrder = async (req, res) => {
  try {
    const { userId, id, quantity } = req.body;

    if (!userId && (!req.user || !req.user.id)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const order = new Order({
      userId: userId || req.user.id,
      product: {
        productId: product._id,
        quantity: quantity || 1,
        price: product.price,
        image: product.images?.[0] || null
      },
      totalAmount: (product.price * (quantity || 1)),
      status: 'pending'
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
      const userId = req.params.userId || req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log('Fetching orders for user:', userId);
  try {


    const orders = await Order.find({ userId }).populate('product.productId', 'name price images');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json({ orders });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.cancelOrder = async (req, res) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
