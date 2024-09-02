const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cuid = require("cuid");
const multer = require('multer');
const router = express.Router();
const { User, CompanyDetail, CompanyApplication } = require('../models');
const middleware = require('../middleware/auth');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email function
const sendApprovalEmail = (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Complete Your Registration',
    text: `Your application has been approved. Please complete your registration by following this link: ${process.env.FRONTEND_URL}/complete-registration?token=${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

router.post('/register-company', upload.single('businessLicense'), async (req, res) => {
  const { companyName, email, phoneNumber, address, website, registrationNumber } = req.body;
  const businessLicense = req.file ? req.file.path : null; // File path

  try {
    const application = await CompanyApplication.create({
      companyName,
      email,
      phoneNumber,
      address,
      website,
      registrationNumber,
      businessLicense,
      status: 'Pending',
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Error submitting company application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/pending-applications', middleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const applications = await CompanyApplication.findAll({ where: { status: 'Pending' } });
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/review-application/:id', middleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const application = await CompanyApplication.findByPk(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    if (status === 'Approved') {
      const token = jwt.sign({ id: application.id, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '336h' }); // Updated expiration time to 336 hours (2 weeks)

      // Send an email to the company with a link to complete registration
      sendApprovalEmail(application.email, token);
    }

    res.json({ message: `Application ${status.toLowerCase()} successfully`, application });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/complete-registration', async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    const applicationId = decoded.id;

    const application = await CompanyApplication.findByPk(applicationId);

    if (!application || application.status !== 'Approved') {
      return res.status(404).json({ message: 'Application not found or not approved' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: application.companyName,
      cuid: cuid(),
      email: application.email,
      password: hashedPassword,
      role: 'COMPANY',
    });

    await CompanyDetail.create({
      userId: user.id,
      companyName: application.companyName,
      phoneNumber: application.phoneNumber,
      address: application.address,
      website: application.website,
      registrationNumber: application.registrationNumber,
      businessLicense: application.businessLicense,
    });

    res.status(201).json({ message: 'Registration completed successfully', user });
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
