const express = require('express');
const { User, CompanyDetail, CompanyProfile, SolarSolution } = require('../models');
const authenticateSession = require('../middleware/auth');
const router = express.Router();

// Fetch company users with their details
router.get('/company-details', authenticateSession, async (req, res) => {
  try {
    // Fetch users with role 'COMPANY' along with their company details and profile
    const companyUsers = await User.findAll({
      where: { role: 'COMPANY' },
      attributes: ['id', 'email', 'avatarUrl'], // Fetch necessary user fields
      include: [
        {
          model: CompanyDetail,
          attributes: ['companyName', 'phoneNumber', 'address', 'website', 'businessLicense'],
        },
        {
          model: CompanyProfile,
          attributes: ['overview', 'certificate', 'services'],
        },
      ],
    });

    if (companyUsers.length === 0) {
      return res.status(404).json({ message: 'No companies found' });
    }

    return res.status(200).json(companyUsers);
  } catch (error) {
    console.error('Error fetching company details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/solar-solutions', authenticateSession, async (req, res) => {
  try {
    // Fetch all solar solutions, including company profile (certificate) and company details (company name)
    const solarSolutions = await SolarSolution.findAll({
      include: [
        {
          model: CompanyProfile,
          attributes: ['certificate'],
          include: [
            {
              model: User,
              include: [
                {
                  model: CompanyDetail,
                  attributes: ['companyName'],
                },
              ],
            },
          ],
        },
      ],
    });

    // Return the fetched solar solutions with company details
    return res.status(200).json(solarSolutions);
  } catch (error) {
    console.error('Error fetching solar solutions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;