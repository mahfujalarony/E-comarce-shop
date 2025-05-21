const express = require('express');
const router = express.Router();
const { addToCart } = require('../controllers/cartController');
const { protect } = require('../auth/authMiddleware');

router.post('/cart',  addToCart);

module.exports = router;