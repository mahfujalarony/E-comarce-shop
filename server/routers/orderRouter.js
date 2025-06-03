const express = require('express');
const router = express.Router();
const { createOrder, getOrders, cancelOrder } = require('../controllers/orderController');

router.post('/cash-on-delivery', createOrder);
router.get('/getOrders/:userId', getOrders);
router.post('/cancelOrder/:orderId', cancelOrder);

module.exports = router;