const express = require('express');
const { User, ConsumerProfile } = require('../models');
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/multer");

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user ID from token middleware

    // Fetch user details
    const user = await User.findByPk(userId, {
      attributes: ['username', 'email', 'avatarUrl'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch consumer profile
    const consumerProfile = await ConsumerProfile.findOne({ where: { userId } });

    return res.status(200).json({
      user,
      consumerProfile: consumerProfile || null, // Return null if no profile found
    });
  } catch (error) {
    console.error('Error fetching user or profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user ID from token middleware
    const { phoneNumber, address } = req.body;

    // Check if profile already exists
    const existingProfile = await ConsumerProfile.findOne({ where: { userId } });

    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    // Create new profile
    const newProfile = await ConsumerProfile.create({
      userId,
      phoneNumber: phoneNumber || null,
      address: address || null,
    });

    return res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (error) {
    console.error('Error creating profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id; // Get the user ID from token middleware
    const { username, email, phoneNumber, address } = req.body;

    // Fetch user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;

    // Check if an avatar file was uploaded
    if (req.file) {
      user.avatarUrl = req.file.path;
    }

    await user.save();

    // Fetch consumer profile
    let consumerProfile = await ConsumerProfile.findOne({ where: { userId } });

    if (consumerProfile) {
      // Update consumer profile if it exists
      consumerProfile.phoneNumber = phoneNumber || consumerProfile.phoneNumber;
      consumerProfile.address = address || consumerProfile.address;
      await consumerProfile.save();
    } else {
      // Create a new consumer profile if it doesn't exist
      consumerProfile = await ConsumerProfile.create({
        userId,
        phoneNumber: phoneNumber || null,
        address: address || null,
      });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      consumerProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
