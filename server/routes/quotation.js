const express = require("express");
const router = express.Router();
const moment = require("moment");
const {
  User,
  Quotation,
  Chat,
  Message,
  CompanyDetail,
  CompanyProfile,
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

    // Format the date to a more readable format
    const formattedDate = moment(newQuotation.createdAt).format('MMMM Do YYYY, h:mm:ss a');

    // Send a message in the chat notifying the company about the quotation
    const message = await Message.create({
      chatId: chat.id,
      senderId: consumerId, // The consumer is the sender of the message
      messageText: `Quotation requested on ${formattedDate}`, // Message to the company
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

router.get("/consumer-quotations", authenticateToken, async (req, res) => {
  const consumerId = req.user.id;
  const userRole = req.user.role;

  // Check if the role is CONSUMER
  if (userRole !== "CONSUMER") {
    return res.status(403).json({ message: "Forbidden: Access is denied" });
  }

  try {
    const quotations = await Quotation.findAll({
      where: { consumerId },
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "avatarUrl"],
          include: [
            {
              model: CompanyDetail,
              attributes: ["companyName", "businessLicense"],
            },
            {
              model: CompanyProfile,
              attributes: ["certificate"],
            },
          ],
        },
      ],
    });

    res.json({ quotations });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;