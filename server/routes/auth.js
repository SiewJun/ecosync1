const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const cuid = require('cuid'); 
const { User } = require('../models'); // Import the User model

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      cuid: cuid(),
      username,
      email,
      password: hashedPassword,
      role: role || 'CONSUMER', // Default role is CONSUMER
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
