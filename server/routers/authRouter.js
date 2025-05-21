const express = require("express");
const { 
  sendOTP,
  verifyOTP, 
  googleLogin, 
  loginUser, 
  verifyOTPAndRegister,
  resetPasswordSendOTP,
  resetPasswordVerifyOTP,
  resetPassword
} = require("../controllers/authController");

const router = express.Router();

// OTP এবং রেজিস্ট্রেশন রাউট
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/verify-otp-and-register", verifyOTPAndRegister);

// লগিন রাউট
router.post("/login", loginUser);
router.post("/google", googleLogin);

// পাসওয়ার্ড রিসেট রাউট
router.post("/reset-password-send-otp", resetPasswordSendOTP);
router.post("/reset-password-verify-otp", resetPasswordVerifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;