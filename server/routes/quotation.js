const express = require("express");
const router = express.Router();
const {
  User,
  Quotation,
  Chat,
  Message,
  Attachment,
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

    // Create the quotation
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

    // Ensure a chat exists between consumer and company
    let chat = await Chat.findOne({ where: { consumerId, companyId } });
    if (!chat) {
      chat = await Chat.create({ consumerId, companyId });
    }

    // Send a message in the chat notifying the company about the quotation
    const message = await Message.create({
      chatId: chat.id,
      senderId: consumerId, // The consumer is the sender of the message
      messageText: `Quotation requested on ${newQuotation.createdAt}`, // Message to the company
      messageType: 'text',
    });

    res.status(201).json({ 
      message: "Quotation submitted successfully", 
      quotation: newQuotation,
      chat,
      message
    });
  } catch (error) {
    console.error("Error submitting quotation:", error);
    res.status(500).json({ error: "Failed to submit the quotation request." });
  }
});

module.exports = router;
