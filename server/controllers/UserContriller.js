const User = require('../model/UserModel');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
 // console.log('name', name, 'email', email, 'pass',password )
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, 'shh', { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'shh', { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};