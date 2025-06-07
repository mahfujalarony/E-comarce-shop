const express = require('express');
const router = express.Router();
const { reqmakeadmin } = require('../controllers/adminController');
const { protect } = require('../auth/authMiddleware');

router.post('/reqmakeadmin', protect, reqmakeadmin);

module.exports = router;