const express = require("express");
const router = express.Router();
const {
  User,
  CompanyDetail,
  CompanyProfile,
  CompanyGallery,
  SolarSolution,
} = require("../models");
const authenticateSession = require("../middleware/auth");

router.get('/company/:companyId', authenticateSession, async (req, res) => {
  const { companyId } = req.params;
  
  try {
    // Fetch user details (company info) along with profile, details, galleries, and solar solutions
    const companyUser = await User.findOne({
      where: { id: companyId, role: 'COMPANY' },
      attributes: ['id', 'email', 'avatarUrl'], // User fields
      include: [
        {
          model: CompanyProfile,
          attributes: ['description', 'certificate', 'overview', 'services', 'createdAt'], // CompanyProfile fields
          include: [
            {
              model: CompanyGallery,
              attributes: ['id', 'imageUrl'], // CompanyGallery fields
            },
            {
              model: SolarSolution,
              attributes: [
                'id',
                'solutionName',
                'solutionPic',
                'solarPanelType',
                'powerOutput',
                'efficiency',
                'warranty',
                'price'
              ], // SolarSolution fields
            }
          ]
        },
        {
          model: CompanyDetail,
          attributes: ['companyName', 'phoneNumber', 'address', 'website', 'businessLicense'] // CompanyDetail fields
        }
      ]
    });

    if (!companyUser) {
      return res.status(404).json({ message: 'Company not found' });
    }

    return res.status(200).json(companyUser);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;