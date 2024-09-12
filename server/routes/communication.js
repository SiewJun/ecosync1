const express = require("express");
const {
  User,
  Chat,
  Message,
  CompanyDetail,
  CompanyProfile,
  Attachment,
} = require("../models");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/multer");

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
      attributes: ["id", "avatarUrl"],
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

router.get("/consumers/:consumerId", authenticateToken, async (req, res) => {
  const { consumerId } = req.params;

  try {
    const consumer = await User.findByPk(consumerId, {
      attributes: ["id", "avatarUrl", "username", "role"],
    });

    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    // Respond with the combined data
    res.json({
      consumer: {
        id: consumer.id,
        avatarUrl: consumer.avatarUrl,
        username: consumer.username,
        role: consumer.role,
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
    const chatsWithMessages = chats.filter((chat) => chat.Messages.length > 0);

    res.json({ chats: chatsWithMessages });
  } catch (error) {
    console.error("Error fetching company messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get(
  "/company-chats/:consumerId",
  authenticateToken,
  async (req, res) => {
    const companyId = req.user.id; // Get company ID from token
    const { consumerId } = req.params;
    const userRole = req.user.role; // Get user role from token

    if (userRole !== "COMPANY") {
      return res.status(403).json({
        message: "Forbidden: Only companies can view chat with a consumer",
      });
    }

    try {
      const chat = await Chat.findOne({
        where: { companyId, consumerId },
        include: [
          {
            model: Message,
            include: [Attachment], // Include attachments in the message
          },
        ],
      });

      if (!chat) {
        return res
          .status(404)
          .json({
            message: "Chat not found between the company and this consumer",
          });
      }
      const formattedMessages = chat.Messages.map((message) => ({
        ...message.toJSON(),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        attachments: message.Attachments.map((attachment) =>
          attachment.toJSON()
        ),
      }));

      // Return formatted messages associated with the chat
      res.json({ messages: formattedMessages });
    } catch (error) {
      console.error("Error fetching company-consumer chat:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/chats/:companyId", authenticateToken, async (req, res) => {
  const { companyId } = req.params;
  const consumerId = req.user.id; // Get consumer ID from token

  try {
    // Find the chat for the given company and consumer
    const chat = await Chat.findOne({
      where: { consumerId, companyId },
      include: [
        {
          model: Message,
          include: [Attachment], // Include attachments in the message
        },
      ],
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Format the messages, ensuring timestamps are in ISO 8601 format
    const formattedMessages = chat.Messages.map((message) => ({
      ...message.toJSON(),
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      attachments: message.Attachments.map((attachment) => attachment.toJSON()), // Include attachments
    }));

    // Return formatted messages associated with the chat
    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/chats/:consumerId", authenticateToken, async (req, res) => {
  const { consumerId } = req.params;
  const companyId = req.user.id; // Get company ID from token

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
  upload.single("attachment"),
  async (req, res) => {
    const { companyId } = req.params;
    const { content } = req.body; // Text content of the message
    const consumerId = req.user.id; // Get consumer ID from token

    try {
      const chat = await Chat.findOne({ where: { consumerId, companyId } });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Create a new message
      const message = await Message.create({
        chatId: chat.id,
        senderId: consumerId,
        messageText: req.file ? req.file.originalname : content,
        messageType: req.file ? "attachment" : "text",
      });

      let attachments = [];
      if (req.file) {
        const fileType = req.file.mimetype.startsWith("image/") ? "image" : "document";
        const attachment = await Attachment.create({
          messageId: message.id,
          filePath: `uploads/${req.file.filename}`,
          fileType: fileType,
        });
        attachments.push(attachment);
      }

      return res.status(201).json({ message: { ...message.toJSON(), attachments } });
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/company-chats/:consumerId/messages",
  authenticateToken,
  upload.single("attachment"), // Handle file uploads for companies
  async (req, res) => {
    const { consumerId } = req.params;
    const { content } = req.body;
    const companyId = req.user.id;

    try {
      const chat = await Chat.findOne({ where: { consumerId, companyId } });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const message = await Message.create({
        chatId: chat.id,
        senderId: companyId,
        messageText: req.file ? req.file.originalname : content, // Use file name if attachment
        messageType: req.file ? "attachment" : "text",
      });

      let attachments = [];
      if (req.file) {
        const fileType = req.file.mimetype.startsWith("image/") ? "image" : "document";
        const attachment = await Attachment.create({
          messageId: message.id,
          filePath: `uploads/${req.file.filename}`,
          fileType: fileType,
        });
        attachments.push(attachment);
      }

      return res.status(201).json({ message: { ...message.toJSON(), attachments } });
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
