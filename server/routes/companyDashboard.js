const express = require("express");
const router = express.Router();
const { User, CompanyDetail } = require("../models");
const authenticateToken = require("../middleware/auth");

router.get('/company-details', authenticateToken, async (req, res) => {
  if (req.user.role !== 'COMPANY') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['username', 'email', 'avatarUrl'], // Select fields you want to return
      include: {
        model: CompanyDetail, // Include related CompanyDetail model
        attributes: ['companyName', 'phoneNumber', 'address', 'website', 'registrationNumber', 'businessLicense', 'createdAt'],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
