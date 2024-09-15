const express = require("express");
const router = express.Router();
const {
  User,
  Quotation,
} = require("../models");
const authenticateToken = require("../middleware/auth");

router.post("/submit-quotation", authenticateToken, async (req, res) => {
  try {
    // Extract the authenticated user's consumerId
    const consumerId = req.user.id; // assuming req.user.id is the consumerId from the token

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