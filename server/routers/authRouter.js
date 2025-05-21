const express = require("express");
const { sendOTP,verifyOTP, registerUser , loginUser , verifyOTPAndRegister } = require("../controllers/authController");

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/verify-otp-and-register", verifyOTPAndRegister);

module.exports = router;
