const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupUser = async () => {
  const user = new User({
    username: 'testuser',
    email: 'test@test.com',
    password: 'password',
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash('password', salt);
  await user.save();
  const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return { userId: user._id, token };
};

module.exports = { setupUser };
