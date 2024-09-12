const express = require("express");
const {
  User,
  Chat,
  Message,
  CompanyDetail,
  CompanyProfile,
} = require("../models");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

router.post("/chats/initiate", authenticateToken, async (req, res) => {
  const { companyId } = req.body;
  const consumerId = req.user.id; // Get consumer ID from token

  try {
    // Check if the user initiating the chat is a consumer
    const consumer = await User.findOne({
      where: { id: consumerId, role: "CONSUMER" },
    });
    if (!consumer) {
      return res
        .status(403)
        .json({ message: "Only consumers can initiate chats" });
    }

    // Check if chat already exists between the consumer and company
    let chat = await Chat.findOne({ where: { consumerId, companyId } });

    // If no chat exists, create one
    if (!chat) {
      chat = await Chat.create({ consumerId, companyId });
    }

    return res.status(201).json({ chat });
  } catch (error) {
    return res.status(500).json({ error: "Failed to initiate chat" });
  }
});

router.get("/companies/:companyId", authenticateToken, async (req, res) => {
  const { companyId } = req.params;

  try {
    // Fetch company avatarUrl
    const company = await User.findByPk(companyId, {
      attributes: ["avatarUrl"],
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Fetch companyName from CompanyDetail
    const companyDetail = await CompanyDetail.findOne({
      where: { userId: companyId },
      attributes: ["companyName", "businessLicense", "website"],
    });

    if (!companyDetail) {
      return res.status(404).json({ message: "Company details not found" });
    }

    // Fetch overview from CompanyProfile
    const companyProfile = await CompanyProfile.findOne({
      where: { userId: companyId },
      attributes: ["certificate"],
    });

    if (!companyProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // Respond with the combined data
    res.json({
      company: {
        id: companyId,
        website: companyDetail.website,
        avatarUrl: company.avatarUrl,
        companyName: companyDetail.companyName,
        businessLicense: companyDetail.businessLicense,
        certificate: companyDetail.certificate,
      },
    });
  } catch (error) {
    console.error("Error fetching company data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/chats/consumer", authenticateToken, async (req, res) => {
  const consumerId = req.user.id; // Get consumer ID from token
  const userRole = req.user.role; // Get user role from token

  // Check if the role is CONSUMER
  if (userRole !== "CONSUMER") {
    return res.status(403).json({ message: "Forbidden: Access is denied" });
  }

  try {
    const chats = await Chat.findAll({
      where: { consumerId },
      include: [
        {
          model: User,
          as: "Company",
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
        {
          model: Message,
          attributes: ["id"], // Only fetch the message ID to check existence
        },
      ],
    });

    // Filter out chats that have no messages
    const chatsWithMessages = chats.filter((chat) => chat.Messages.length > 0);

    if (!chatsWithMessages.length) {
      return res.status(404).json({ message: "No chats with messages found" });
    }

    res.json({ chats: chatsWithMessages });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/chats/company", authenticateToken, async (req, res) => {
  const companyId = req.user.id; // Get company ID from token
  const userRole = req.user.role; // Get user role from token

  // Ensure the user is a company
  if (userRole !== "COMPANY") {
    return res.status(403).json({
      message: "Forbidden: Only companies can view received messages",
    });
  }

  try {
    // Find all chats where the company is involved
    const chats = await Chat.findAll({
      where: { companyId },
      include: [
        {
          model: Message,
          attributes: ["id"], // Only fetch the message ID to check existence
        },
        {
          model: User, // Assuming User is the model for consumers
          as: "Consumer",
          attributes: ["id", "username", "avatarUrl"], // Adjust these attributes based on your User model
        },
      ],
    });

    // Filter out chats that have no messages
    const chatsWithMessages = chats.filter(chat => chat.Messages.length > 0);

    res.json({ chats: chatsWithMessages });
  } catch (error) {
    console.error("Error fetching company messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/chats/:companyId", authenticateToken, async (req, res) => {
  const { companyId } = req.params;
  const consumerId = req.user.id; // Get consumer ID from token

  try {
    // Find the chat for the given company and consumer
    const chat = await Chat.findOne({
      where: { consumerId, companyId },
      include: [Message],
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Format the messages, ensuring timestamps are in ISO 8601 format
    const formattedMessages = chat.Messages.map((message) => ({
      ...message.toJSON(),
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    }));

    // Return formatted messages associated with the chat
    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/chats/:companyId/messages",
  authenticateToken,
  async (req, res) => {
    const { companyId } = req.params;
    const { content } = req.body; // assuming `content` holds the message text
    const consumerId = req.user.id; // Get consumer ID from token

    try {
      // Find the chat between the consumer and the company
      const chat = await Chat.findOne({ where: { consumerId, companyId } });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Create a new message associated with the chat
      const message = await Message.create({
        chatId: chat.id,
        senderId: consumerId, // assuming consumer is the sender
        messageText: content,
        messageType: "text", // for now assuming all messages are text
      });

      // Respond with the new message
      return res.status(201).json({ message });
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
