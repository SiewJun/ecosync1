const express = require("express");
const { User, Chat, Message, CompanyDetail, CompanyProfile} = require("../models");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

router.post('/chats/initiate', authenticateToken, async (req, res) => {
  const { companyId } = req.body;
  const consumerId = req.user.id; // Get consumer ID from token

  try {
    // Check if the user initiating the chat is a consumer
    const consumer = await User.findOne({ where: { id: consumerId, role: 'CONSUMER' } });
    if (!consumer) {
      return res.status(403).json({ message: 'Only consumers can initiate chats' });
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

router.get('/companies/:companyId', authenticateToken, async (req, res) => {
  const { companyId } = req.params;

  try {
    // Fetch company avatarUrl
    const company = await User.findByPk(companyId, {
      attributes: ['avatarUrl'],
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Fetch companyName from CompanyDetail
    const companyDetail = await CompanyDetail.findOne({
      where: { userId: companyId },
      attributes: ['companyName', 'businessLicense'],
    });

    if (!companyDetail) {
      return res.status(404).json({ message: 'Company details not found' });
    }

    // Fetch overview from CompanyProfile
    const companyProfile = await CompanyProfile.findOne({
      where: { userId: companyId },
      attributes: ['certificate'],
    });

    if (!companyProfile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Respond with the combined data
    res.json({
      company: {
        avatarUrl: company.avatarUrl,
        companyName: companyDetail.companyName,
        businessLicense: companyDetail.businessLicense,
        certificate: companyDetail.certificate,
      },
    });
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/chats/consumer', authenticateToken, async (req, res) => {
  const consumerId = req.user.id; // Get consumer ID from token

  try {
    const chats = await Chat.findAll({
      where: { consumerId },
      include: [
        {
          model: User,
          as: 'Company',
          attributes: ['id', 'avatarUrl'],
          include: [
            {
              model: CompanyDetail,
              attributes: ['companyName', 'businessLicense']
            },
            {
              model: CompanyProfile,
              attributes: ['certificate']
            }
          ]
        }
      ]
    });

    if (!chats.length) {
      return res.status(404).json({ message: 'No chats found' });
    }

    res.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/chats/:companyId', authenticateToken, async (req, res) => {
  const { companyId } = req.params;
  const consumerId = req.user.id; // Get consumer ID from token

  try {
    // Find the chat for the given company and consumer
    const chat = await Chat.findOne({
      where: { consumerId, companyId },
      include: [Message]
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Return messages associated with the chat
    res.json({ messages: chat.Messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
