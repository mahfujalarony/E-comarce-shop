const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/ReviewController');
const { protect } = require('../auth/authMiddleware');

router.post('/review',  createReview);

module.exports = router;