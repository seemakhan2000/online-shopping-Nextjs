const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ name, email, password: hashedPassword, phone, address });
      await user.save();
    }

    res.status(201).json({ message: 'User registered successfully', user });

  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

module.exports = { registerUser, getAllUsers };
