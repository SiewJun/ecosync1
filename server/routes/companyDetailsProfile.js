const express = require("express");
const router = express.Router();
const {
  User,
  CompanyDetail,
  CompanyProfile,
  CompanyGallery,
  SolarSolution,
} = require("../models");
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
          "stripeAccountId",
          "stripeOnboardingComplete",
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
      const { username, email, phoneNumber, address, website } = req.body;

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
          attributes: ["id", "imageUrl"],
        },
        {
          model: SolarSolution,
          attributes: [
            "id",
            "solutionName",
            "solutionPic",
            "solarPanelType",
            "powerOutput",
            "efficiency",
            "warranty",
            "price",
          ],
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

router.put(
  "/update-company-profile",
  authenticateToken,
  upload.single("certificate"),
  async (req, res) => {
    const { description, overview, services } = req.body;

    try {
      const profile = await CompanyProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!profile) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      // Update profile fields
      if (description) profile.description = description;
      if (overview) profile.overview = overview;
      if (services) profile.services = services;

      // Check if the certificate file is uploaded
      if (req.file) {
        const certificatePath = req.file.path; // Path of the uploaded file
        profile.certificate = certificatePath;
      }

      // Save updated profile
      await profile.save();
      res.status(200).json({ message: "Company profile updated successfully" });
    } catch (error) {
      console.error("Error updating company profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put(
  "/update-gallery",
  authenticateToken,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Find the user's company profile
      const companyProfile = await CompanyProfile.findOne({
        where: { userId },
      });

      if (!companyProfile) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      const companyProfileId = companyProfile.id; // Get the company profile ID

      // Check if files are uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Create entries for each uploaded image
      const imageEntries = req.files.map((file) => ({
        companyProfileId, // Use the retrieved companyProfileId
        imageUrl: file.path,
      }));

      // Bulk create or update gallery images
      await CompanyGallery.bulkCreate(imageEntries);

      res.status(200).json({ message: "Gallery updated successfully" });
    } catch (error) {
      console.error("Error updating gallery:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete("/company-gallery/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the company profile associated with the user
    const companyProfile = await CompanyProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // Delete the image by id and companyProfileId
    const deletedImage = await CompanyGallery.destroy({
      where: {
        id,
        companyProfileId: companyProfile.id,
      },
    });

    if (!deletedImage) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/add-solar-solution",
  authenticateToken,
  upload.single("solutionPic"), // Single file upload for the solution picture
  async (req, res) => {
    try {
      const {
        solutionName,
        solarPanelType,
        powerOutput,
        efficiency,
        warranty,
        price,
      } = req.body;

      // Check if the company profile exists for the user
      const companyProfile = await CompanyProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!companyProfile) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      // Construct the new solar solution data
      const newSolutionData = {
        companyProfileId: companyProfile.id,
        solutionName,
        solarPanelType,
        powerOutput,
        efficiency,
        warranty,
        price,
      };

      // Check if the solutionPic is uploaded
      if (req.file) {
        const solutionPicUrl = req.file.path;
        newSolutionData.solutionPic = solutionPicUrl;
      }

      // Create new solar solution
      const newSolution = await SolarSolution.create(newSolutionData);

      res
        .status(201)
        .json({
          message: "Solar solution added successfully",
          solution: newSolution,
        });
    } catch (error) {
      console.error("Error adding solar solution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/solar-solution/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the company profile of the authenticated user
    const companyProfile = await CompanyProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // Find the solar solution by ID and company profile ID
    const solarSolution = await SolarSolution.findOne({
      where: { id, companyProfileId: companyProfile.id },
    });

    if (!solarSolution) {
      return res.status(404).json({ message: "Solar solution not found" });
    }

    res.status(200).json({ solution: solarSolution });
  } catch (error) {
    console.error("Error fetching solar solution", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/update-solar-solution/:id",
  authenticateToken,
  upload.single("solutionPic"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        solutionName,
        solarPanelType,
        powerOutput,
        efficiency,
        warranty,
        price,
      } = req.body;

      const companyProfile = await CompanyProfile.findOne({
        where: { userId: req.user.id },
      });

      const solarSolution = await SolarSolution.findOne({
        where: { id, companyProfileId: companyProfile.id },
      });

      if (!solarSolution) {
        return res.status(404).json({ message: "Solar solution not found" });
      }

      // Update fields if they exist
      if (solutionName) solarSolution.solutionName = solutionName;
      if (solarPanelType) solarSolution.solarPanelType = solarPanelType;
      if (powerOutput) solarSolution.powerOutput = powerOutput;
      if (efficiency) solarSolution.efficiency = efficiency;
      if (warranty) solarSolution.warranty = warranty;
      if (price) solarSolution.price = price;

      if (req.file) {
        solarSolution.solutionPic = req.file.path;
      }

      await solarSolution.save();

      res
        .status(200)
        .json({
          message: "Solar solution updated successfully",
          solution: solarSolution,
        });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete(
  "/delete-solar-solution/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const companyProfile = await CompanyProfile.findOne({
        where: { userId: req.user.id },
      });

      const deleted = await SolarSolution.destroy({
        where: { id, companyProfileId: companyProfile.id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Solar solution not found" });
      }

      res.status(200).json({ message: "Solar solution deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
