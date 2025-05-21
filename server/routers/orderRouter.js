const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');
const { protect } = require('../auth/authMiddleware');

router.post('/', createOrder);

module.exports = router;