const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authenticateSession = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const cuid = require('cuid');
const nodemailer = require("nodemailer");

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send email
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Validation middleware
const validateCreateAdmin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("username").notEmpty().withMessage("Name is required"),
];

router.post("/create-admin", authenticateSession, validateCreateAdmin, async (req, res) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, username } = req.body;

  try {
    // Ensure the admin doesn't already exist
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password and create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      cuid: cuid(),
      email,
      password: hashedPassword,
      username,
      role: "ADMIN", // Assign ADMIN role here
    });

    res.status(201).json({
      message: "Admin created successfully.",
      admin: { id: newAdmin.id, cuid: newAdmin.cuid, email: newAdmin.email, username: newAdmin.username },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Failed to create admin." });
  }
});

// View all user accounts
router.get("/users", authenticateSession, async (req, res) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const users = await User.findAll();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Demote admin to regular user
router.put("/demote-admin/:id", authenticateSession, async (req, res) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role !== "ADMIN") {
      return res.status(400).json({ message: "User is not an admin." });
    }

    user.role = "CONSUMER";
    await user.save();

    // Send email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Account Demotion</h2>
        <p>Dear ${user.username},</p>
        <p>We wanted to inform you that your account has been demoted to a regular user.</p>
        <p>If you have any questions or believe this was a mistake, please contact our support team.</p>
        <p>Best regards,</p>
        <p>The Admin Team</p>
      </div>
    `;
    await sendEmail(user.email, 'Account Demotion', emailHtml);

    res.status(200).json({ message: "Admin demoted to regular user." });
  } catch (error) {
    console.error("Error demoting admin:", error);
    res.status(500).json({ message: "Failed to demote admin." });
  }
});

// Delete user account
router.delete("/delete-user/:id", authenticateSession, async (req, res) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.destroy();

    // Send email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Account Deletion</h2>
        <p>Dear ${user.username},</p>
        <p>We regret to inform you that your account has been deleted.</p>
        <p>If you have any questions or believe this was a mistake, please contact our support team.</p>
        <p>Best regards,</p>
        <p>The Admin Team</p>
      </div>
    `;
    await sendEmail(user.email, 'Account Deletion', emailHtml);

    res.status(200).json({ message: "User account deleted." });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Failed to delete user account." });
  }
});

module.exports = router;