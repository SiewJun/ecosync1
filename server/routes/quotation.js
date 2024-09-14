const express = require("express");
const router = express.Router();
const {
  User,
} = require("../models");

router.post("/submit-quotation", async (req, res) => {
  try {
    const { consumerId, companyId, salutation, name, email, phoneNumber, electricityBill, propertyType, address, state } = req.body;

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

    res.status(201).json(newQuotation);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit quotation request." });
  }
});

module.exports = router;