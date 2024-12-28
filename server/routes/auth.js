const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User } = require("../models");
const authenticateSession = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const otpGenerator = require('otp-generator');

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/register-request", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Invalid Registration" });
    }

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = jwt.sign({ username, email, hashedPassword, role, otp }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    const message = `
      <div style="padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #333;">Your OTP Code</h1>
        <p style="margin: 20px 0; color: #555;">Use the following OTP code to complete your registration:</p>
        <h2 style="color: #007BFF;">${otp}</h2>
      </div>
    `;
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL,
      subject: "Complete Your Registration",
      html: message,
    });

    res.status(200).json({ message: "OTP sent to your email. Please check your email to complete the registration.", token });
  } catch (error) {
    console.error("Error during registration request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { token, otp } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, email, hashedPassword, role, otp: storedOtp } = decoded;

    if (otp !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Invalid Registration" });
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "CONSUMER",
    });

    res.status(201).json({ message: "Registration completed successfully", user: newUser });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/resend-otp", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, email, hashedPassword, role } = decoded;

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

    const newToken = jwt.sign({ username, email, hashedPassword, role, otp }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    const message = `
      <div style="padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #333;">Your OTP Code</h1>
        <p style="margin: 20px 0; color: #555;">Use the following OTP code to complete your registration:</p>
        <h2 style="color: #007BFF;">${otp}</h2>
      </div>
    `;
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL,
      subject: "Complete Your Registration",
      html: message,
    });

    res.status(200).json({ message: "OTP resent to your email. Please check your email to complete the registration.", token: newToken });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials or insufficient permissions" });
    }

    if (user.role !== "CONSUMER" && user.role !== "COMPANY") {
      return res
        .status(403)
        .json({ message: "Invalid credentials or insufficient permissions" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create a session
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return res
        .status(403)
        .json({ message: "Invalid credentials or insufficient permissions" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create a session
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Logout Endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ message: 'Logout successful' });
  });
});


// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(400)
        .json({ message: "No account found with this email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    console.log(user.resetTokenExpiry);
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `
      <div style="padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: auto; font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p style="margin: 20px 0; color: #555;">To reset your password, click the link below:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
    `;
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL,
      subject: "Password Reset",
      html: message,
    });

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      where: { resetToken: token, resetTokenExpiry: { [Op.gt]: new Date() } },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/change-password", authenticateSession, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", authenticateSession, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ["id", "username", "email", "role", "avatarUrl"], // Add more fields as needed
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
