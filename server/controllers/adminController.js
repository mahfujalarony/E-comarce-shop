const rateLimit = require('express-rate-limit');
require('dotenv').config();
const User = require('../model/UserModel');

const makeAdminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: true,
    message: 'You can only request admin access 5 times per hour. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.reqmakeadmin = [
  makeAdminLimiter,
  async (req, res) => {
    try { // try-catch যুক্ত করা হয়েছে
      const code = req.body.code;
      const userId = req.user._id;
      const AdminSecret = process.env.ADMIN_SECRET;

      if (!code) {
        return res.status(400).json({
          error: true,
          message: 'Secret code is required.'
        });
      }

      if (!AdminSecret) {
        return res.status(500).json({
          error: true,
          message: 'Admin secret code is not set. Please contact support.'
        });
      }

      if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized request. Please log in.'
        });
      }

      if (code !== AdminSecret) {
        return res.status(403).json({
          error: true,
          message: 'Invalid secret code. Please provide the correct code.'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId, 
        { role: 'admin' }, 
        { new: true }
      );

      if (!user) { // user existence check
        return res.status(404).json({
          error: true,
          message: 'User not found.'
        });
      }

      res.status(200).json({
        error: false,
        message: 'You have successfully become an admin.',

      });

    } catch (error) {
      console.error('Error in reqmakeadmin:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Please try again later.'
      });
    }
  }
];