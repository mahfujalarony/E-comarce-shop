const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const otpStore = {}; 

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "This email is already registered" });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000; 

  otpStore[email] = {
    otp,
    expiresAt,
    attempts: 0
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'mahfujalamrony07@gmail.com',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
};

exports.verifyOTPAndRegister = async (req, res) => {
  const { name, email, password, imgUrl, token } = req.body;
  const otp = token;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ error: "OTP expired or not sent" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }

  if (record.attempts >= 5) {
    delete otpStore[email];
    return res.status(403).json({ error: "Too many failed attempts. Please request a new OTP." });
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    return res.status(400).json({ error: `Invalid OTP. Attempts left: ${5 - record.attempts}` });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      imgUrl,
    });

    await newUser.save();
    delete otpStore[email];

    const jwtToken = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration completed successfully",
      success: true,
      token: jwtToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        imgUrl: newUser.imgUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
    console.log(err);
  }
};

exports.verifyOTP = (req, res) => {
  const { email, code } = req.body;
  const token = code;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, error: "OTP expired or not send" });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, error: "OTP expired" });
  }
  if (record.attempts >= 5) {
    delete otpStore[email];
    return res.status(403).json({ success: false, error: "send anather otp" });
  }

  if (record.otp !== token) {
    record.attempts += 1;
    return res.status(400).json({
      success: false,
      error: `remaing: ${5 - record.attempts}`
    });
  }

  delete otpStore[email];
  return res.status(200).json({ success: true, message: "Success OTP verification" });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "yourSecretKey",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imgUrl: user.imgUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPasswordSendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(409).json({ error: "No account found with this email !" });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000; 

  otpStore[email] = {
    otp,
    expiresAt,
    attempts: 0
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'mahfujalamrony07@gmail.com',
    to: email,
    subject: "Your Password Reset OTP Code",
    text: `Your OTP code for password reset is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
};

exports.resetPasswordVerifyOTP = (req, res) => {
  const { email, code } = req.body;
  const token = code;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, error: "OTP expired or not send" });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ success: false, error: "OTP expired" });
  }
  if (record.attempts >= 5) {
    delete otpStore[email];
    return res.status(403).json({ success: false, error: "send anather otp" });
  }

  if (record.otp !== token) {
    record.attempts += 1;
    return res.status(400).json({
      success: false,
      error: `remaing: ${5 - record.attempts}`
    });
  }

  delete otpStore[email];
  return res.status(200).json({ success: true, message: "Success OTP verification" });
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.googleLogin = async (req, res) => {
  const { name, email, imgUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "",
        imgUrl,
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Google Login successful",
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imgUrl: user.imgUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};






// const nodemailer = require("nodemailer");
// const bcrypt = require("bcrypt");
// const User = require("../model/UserModel");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();


// const otpStore = {}; 

// exports.sendOTP = async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ error: "Email is required" });
//   }
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return res.status(409).json({ error: "This email is already registered" });
//   }
  
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const expiresAt = Date.now() + 2 * 60 * 1000; 

//   otpStore[email] = {
//     otp,
//     expiresAt,
//     attempts: 0
//   };

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.NODEMAILER_EMAIL,
//       pass: process.env.NODEMAILER_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: 'mahfujalamrony07@gmail.com',
//     to: email,
//     subject: "Your OTP Code",
//     text: `Your OTP code is: ${otp}`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ success: true, message: "OTP sent" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Failed to send OTP" });
//   }
// };



// exports.verifyOTPAndRegister = async (req, res) => {
//   const { name, email, password, imgUrl, token } = req.body;
//   const otp = token;
//   const record = otpStore[email];

//   if (!record) {
//     return res.status(400).json({ error: "OTP expired or not sent" });
//   }

//   if (Date.now() > record.expiresAt) {
//     delete otpStore[email];
//     return res.status(400).json({ error: "OTP expired" });
//   }

//   if (record.attempts >= 5) {
//     delete otpStore[email];
//     return res.status(403).json({ error: "Too many failed attempts. Please request a new OTP." });
//   }

//   if (record.otp !== otp) {
//     record.attempts += 1;
//     return res.status(400).json({ error: `Invalid OTP. Attempts left: ${5 - record.attempts}` });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       imgUrl,
//     });

//     await newUser.save();
//     delete otpStore[email];

//     const jwtToken = jwt.sign(
//       { userId: newUser._id, email: newUser.email },
//       process.env.JWT_SECRET || "yourSecretKey",
//       { expiresIn: "7d" }
//     );

//     res.status(201).json({
//       message: "Registration completed successfully",
//       success: true,
//       token: jwtToken,
//       user: {
//         _id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         imgUrl: newUser.imgUrl,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Registration failed" });
//     console.log(err);
//   }
// };



// exports.verifyOTP = (req, res) => {
//   const { email, code } = req.body;
//   const token = code;
//   const record = otpStore[email];

//   if (!record) {
//     return res.status(400).json({ success: false, error: "OTP expired or not send" });
//   }
//   if (Date.now() > record.expiresAt) {
//     delete otpStore[email];
//     return res.status(400).json({ success: false, error: "OTP expired" });
//   }
//   if (record.attempts >= 5) {
//     delete otpStore[email];
//     return res.status(403).json({ success: false, error: "send anather otp" });
//   }

//   if (record.otp !== token) {
//     record.attempts += 1;
//     return res.status(400).json({
//       success: false,
//       error: `remaing: ${5 - record.attempts}`
//     });
//   }

  
//   delete otpStore[email];
//   return res.status(200).json({ success: true, message: "Success OTP verification" });
// };



// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const jwtToken = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET || "yourSecretKey",
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       success: true,
//       token: jwtToken,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         imgUrl: user.imgUrl,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.resetPasswordSendOTP = async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ error: "Email is required" });
//   }
//   const existingUser = await User.findOne({ email });
//   if (!existingUser) {
//     return res.status(409).json({ error: "No account found with this email !" });
//   }
  
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const expiresAt = Date.now() + 2 * 60 * 1000; 

//   otpStore[email] = {
//     otp,
//     expiresAt,
//     attempts: 0
//   };

//   exports.resetPasswordVerifyOTP = (req, res) => {
//   const { email, code } = req.body;
//   const token = code;
//   const record = otpStore[email];

//   if (!record) {
//     return res.status(400).json({ success: false, error: "OTP expired or not send" });
//   }
//   if (Date.now() > record.expiresAt) {
//     delete otpStore[email];
//     return res.status(400).json({ success: false, error: "OTP expired" });
//   }
//   if (record.attempts >= 5) {
//     delete otpStore[email];
//     return res.status(403).json({ success: false, error: "send anather otp" });
//   }

//   if (record.otp !== token) {
//     record.attempts += 1;
//     return res.status(400).json({
//       success: false,
//       error: `remaing: ${5 - record.attempts}`
//     });
//   }

  
//   delete otpStore[email];
//   return res.status(200).json({ success: true, message: "Success OTP verification" });
// };


// exports.resetPassword = async (req, res) => {
//   const { email, code, newPassword } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (
//       !user ||
//       user.resetCode !== code ||
//       user.resetCodeExpires < Date.now()
//     ) {
//       return res.status(400).json({ message: "কোড ভুল বা মেয়াদ শেষ।" });
//     }

//     const hashed = await bcrypt.hash(newPassword, 10);
//     user.password = hashed;
//     user.resetCode = null;
//     user.resetCodeExpires = null;
//     await user.save();

//     res.json({ message: "পাসওয়ার্ড সফলভাবে রিসেট হয়েছে।" });
//   } catch (err) {
//     res.status(500).json({ message: "সার্ভার এরর।" });
//   }
// };



// exports.googleLogin = async (req, res) => {
//   const { name, email, imgUrl } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = new User({
//         name,
//         email,
//         password: "",
//         imgUrl,
//       });
//       await user.save();
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.status(200).json({
//       message: "Google Login successful",
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         imgUrl: user.imgUrl,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Login failed", error: err.message });
//   }
// };
