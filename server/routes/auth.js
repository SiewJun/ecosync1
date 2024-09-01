const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const cuid = require('cuid');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Import the User model
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      cuid: cuid(),
      username,
      email,
      password: hashedPassword,
      role: role || 'CONSUMER',
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // Invalidate the token on the client-side
  res.json({ message: 'Logout successful' });
});

module.exports = router;
