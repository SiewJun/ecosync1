const express = require("express");
const router = express.Router();
const { User, CompanyDetail, CompanyProfile, CompanyGallery, SolarSolution } = require("../models");
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/multer");

router.get("/company-details", authenticateToken, async (req, res) => {
  if (req.user.role !== "COMPANY") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["username", "email", "avatarUrl"], // Select fields you want to return
      include: {
        model: CompanyDetail, // Include related CompanyDetail model
        attributes: [
          "companyName",
          "phoneNumber",
          "address",
          "website",
          "registrationNumber",
          "businessLicense",
          "createdAt",
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the full URL to the businessLicense field
    const userWithUrls = {
      ...user.dataValues,
      CompanyDetail: {
        ...user.CompanyDetail.dataValues,
        businessLicense: `${req.protocol}://${req.get("host")}/${
          user.CompanyDetail.businessLicense
        }`,
      },
    };

    res.json({ user: userWithUrls });
  } catch (error) {
    console.error("Error fetching company details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/update-details",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const {
        username,
        email,
        phoneNumber,
        address,
        website,
      } = req.body;

      // Find the user and company details
      const user = await User.findByPk(req.user.id);
      const companyDetail = await CompanyDetail.findOne({
        where: { userId: req.user.id },
      });

      if (!user || !companyDetail) {
        return res
          .status(404)
          .json({ message: "User or company details not found" });
      }

      // Update user details
      if (username) user.username = username;
      if (email) user.email = email;

      // Check if avatar was uploaded
      if (req.file) {
        const avatarUrl = req.file.path;
        user.avatarUrl = avatarUrl;
      }

      // Update company details
      if (phoneNumber) companyDetail.phoneNumber = phoneNumber;
      if (address) companyDetail.address = address;
      if (website) companyDetail.website = website;

      // Save updated data
      await user.save();
      await companyDetail.save();

      res.status(200).json({ message: "Details updated successfully" });
    } catch (error) {
      console.error("Error updating details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/company-profile", authenticateToken, async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({
      where: { userId: req.user.id },
      attributes: ["description", "overview", "certificate", "services"],
      include: [
        {
          model: CompanyGallery,
          attributes: ["imageUrl"],
        },
        {
          model: SolarSolution,
          attributes: ["solutionName", "solarPanelType", "powerOutput", "efficiency", "warranty", "price"],
        },
      ],
    });

    if (!profile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
