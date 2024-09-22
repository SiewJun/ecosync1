const express = require("express");
const router = express.Router();
const {
  User,
  Quotation,
} = require("../models");
const authenticateToken = require("../middleware/auth");

router.post("/submit-quotation", authenticateToken, async (req, res) => {
  try {
    const consumerId = req.user.id;

    // Fetch user information to check their role
    const user = await User.findByPk(consumerId);

    if (user.role !== "CONSUMER") {
      return res.status(403).json({ message: "Only consumers can request a quotation." });
    }

    const {
      companyId,
      salutation,
      name,
      email,
      phoneNumber,
      electricityBill,
      propertyType,
      address,
      state
    } = req.body;

    const newQuotation = await Quotation.create({
      consumerId,
      companyId,
      salutation,
      name,
      email,
      phoneNumber,
      averageMonthlyElectricityBill: electricityBill,
      propertyType,
      address,
      state,
    });

    res.status(201).json({ message: "Quotation submitted successfully", quotation: newQuotation });
  } catch (error) {
    console.error("Error submitting quotation:", error);
    res.status(500).json({ error: "Failed to submit the quotation request." });
  }
});

module.exports = router;