const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const router = express.Router();
const {
  User,
  CompanyDetail,
  CompanyApplication,
  CompanyProfile,
} = require("../models");
const authenticateSession = require("../middleware/auth");
require("dotenv").config();
const { Op } = require("sequelize");
const JWT_SECRET = process.env.JWT_SECRET;
const upload = require("../middleware/multer");

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email function
const sendApprovalEmail = (email, token, status) => {
  let subject, htmlContent;

  if (status === "Approved") {
    subject = "Complete Your Registration";
    htmlContent = `
      <p style="padding: 10px 0;">Your application has been approved. Please complete your registration within 2 weeks by clicking the button below:</p>
      <a href="${process.env.FRONTEND_URL}/complete-registration?token=${token}" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">
        Complete Registration
      </a>
      <style>
        a:hover {
          background-color: #0056b3;
        }
      </style>
    `;
  } else if (status === "Rejected") {
    subject = "Application Rejected";
    htmlContent = `
      <p style="padding: 10px 0;">We regret to inform you that your application has been rejected. If you have any questions, please contact our support team.</p>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

router.post(
  "/register-company",
  upload.single("businessLicense"),
  async (req, res) => {
    const {
      companyName,
      email,
      phoneNumber,
      address,
      website,
      registrationNumber,
    } = req.body;

    const businessLicense = req.file ? req.file.path : null; // File path

    try {
      // Check if company name, email, or registration number already exists
      const existingCompany = await CompanyApplication.findOne({
        where: {
          [Op.or]: [{ companyName }, { email }, { registrationNumber }],
        },
      });

      if (
        existingCompany &&
        (existingCompany.status == "Pending" ||
          existingCompany.status == "Approved")
      ) {
        return res.status(400).json({
          message: "Company name, email, or registration number already exists",
        });
      }

      // Create a new application record
      const application = await CompanyApplication.create({
        companyName,
        email,
        phoneNumber,
        address,
        website,
        registrationNumber,
        businessLicense,
        status: "Pending",
      });

      res
        .status(201)
        .json({ message: "Application submitted successfully", application });
    } catch (error) {
      console.error("Error submitting company application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/all-applications", authenticateSession, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const applications = await CompanyApplication.findAll({
      attributes: [
        "id",
        "companyName",
        "email",
        "phoneNumber",
        "address",
        "website",
        "registrationNumber",
        "businessLicense",
        "status",
      ],
    });

    // Add the full URL to the businessLicense field
    const applicationsWithUrls = applications.map((app) => ({
      ...app.dataValues,
      businessLicense: `${req.protocol}://${req.get("host")}/${app.businessLicense}`,
    }));

    res.json({ applications: applicationsWithUrls });
  } catch (error) {
    console.error("Error fetching all applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/review-application/:id", authenticateSession, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const application = await CompanyApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    if (status === "Approved") {
      const token = jwt.sign(
        { id: application.id, role: "COMPANY" },
        JWT_SECRET,
        { expiresIn: "336h" }
      ); // expiration time 336 hours (2 weeks)

      // Send an email to the company with a link to complete registration
      sendApprovalEmail(application.email, token, status);
    } else if (status === "Rejected") {
      // Send an email to the company notifying them of the rejection
      sendApprovalEmail(application.email, null, status);
    }

    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application,
    });
  } catch (error) {
    console.error("Error reviewing application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/resend-approval-email/:id", authenticateSession, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;

  try {
    const application = await CompanyApplication.findByPk(id);

    if (!application || application.status !== "Approved") {
      return res.status(404).json({ message: "Application not found or not approved" });
    }

    const companyDetail = await CompanyDetail.findOne({ where: { registrationNumber: application.registrationNumber } });

    if (companyDetail) {
      return res.status(400).json({ message: "Company already exist. Cannot resend email." });
    }

    const token = jwt.sign(
      { id: application.id, role: "COMPANY" },
      JWT_SECRET,
      { expiresIn: "336h" }
    ); // expiration time 336 hours (2 weeks)

    // Send an email to the company with a link to complete registration
    sendApprovalEmail(application.email, token);

    res.json({ message: "Approval email resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/complete-registration-company", async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({
      message:
        "A valid token is required to complete company registration. Please ensure you have applied for a company account.",
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    const applicationId = decoded.id;

    const application = await CompanyApplication.findByPk(applicationId);

    if (!application || application.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Invalid or unapproved application." });
    }

    // Create the user
    const user = await User.create({
      username: application.companyName,
      email: application.email,
      password: await bcrypt.hash(password, 10),
      role: "COMPANY",
    });

    // Create company details
    const companyDetail = await CompanyDetail.create({
      userId: user.id,
      companyName: application.companyName,
      phoneNumber: application.phoneNumber,
      address: application.address,
      website: application.website,
      registrationNumber: application.registrationNumber,
      businessLicense: application.businessLicense,
    });

    // Create company profile
    await CompanyProfile.create({
      userId: user.id,
      description: "",
      overview: "",
      certificate: null, // Can be updated by the company later
    });

    res.status(201).json({ message: "Registration completed successfully." });
  } catch (error) {
    if (
      error.name === "SequelizeUniqueConstraintError" &&
      error.errors[0].path === "email"
    ) {
      return res.status(400).json({ message: "Email is already in use." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token." });
    }
    console.error("Error completing registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;