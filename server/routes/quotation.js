const express = require("express");
const { sequelize } = require("../models");
const router = express.Router();
const moment = require("moment");
const {
  User,
  ConsumerProfile,
  Quotation,
  QuotationVersion,
  Chat,
  Message,
  CompanyDetail,
  CompanyProfile,
  Project
} = require("../models");
const authenticateToken = require("../middleware/auth");
const checkStripeAccount = require('../middleware/checkStripeAccount');

router.post("/submit-quotation", authenticateToken, async (req, res) => {
  try {
    const consumerId = req.user.id;

    // Fetch user information to check their role
    const user = await User.findByPk(consumerId);

    if (user.role !== "CONSUMER") {
      return res
        .status(403)
        .json({ message: "Only consumers can request a quotation." });
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
      state,
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
    const formattedDate = moment(newQuotation.createdAt).format(
      "MMMM Do YYYY, h:mm:ss a"
    );

    // Send a message in the chat notifying the company about the quotation
    const message = await Message.create({
      chatId: chat.id,
      senderId: consumerId, // The consumer is the sender of the message
      messageText: `Quotation requested on ${formattedDate}`, // Message to the company
      messageType: "text",
    });

    res.status(201).json({
      message: "Quotation submitted successfully",
      quotation: newQuotation,
      chat,
      message,
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
        {
          model: QuotationVersion,
          as: "versions",
          attributes: [
            "id",
            "quotationId",
            "systemSize",
            "panelSpecifications",
            "costBreakdown",
            "estimatedEnergyProduction",
            "savings",
            "paybackPeriod",
            "roi",
            "incentives",
            "productWarranties",
            "timeline",
            "versionNumber",
            "status",
            "createdAt",
          ],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "status", "startDate", "endDate"],
        },
      ],
    });

    res.json({ quotations });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/consumer-quotations/:versionId", authenticateToken, async (req, res) => {
  const versionId = req.params.versionId;
  const userRole = req.user.role;

  // Check if the role is CONSUMER
  if (userRole !== "CONSUMER") {
    return res.status(403).json({ message: "Forbidden: Access is denied" });
  }

  try {
    const quotationVersion = await QuotationVersion.findByPk(versionId, {
      include: [
        {
          model: Quotation,
          as: "quotation",
          include: [
            {
              model: User,
              as: "company",
              attributes: ["id", "avatarUrl"],
              include: [
                {
                  model: CompanyDetail,
                  attributes: ["companyName", "businessLicense", "address", "website", "phoneNumber"],
                },
              ],
            },
            {
              model: Project,
              as: "project",
              attributes: ["id", "status", "startDate", "endDate"],
            },
          ],
        },
      ],
    });

    if (!quotationVersion) {
      return res.status(404).json({ message: "Quotation version not found" });
    }

    res.status(200).json(quotationVersion);
  } catch (error) {
    console.error("Error retrieving quotation version details:", error);
    res.status(500).json({ error: "Failed to retrieve the quotation version details." });
  }
});

router.post("/reject/:id", authenticateToken, async (req, res) => {
  const quotationId = req.params.id;
  const consumerId = req.user.id;
  const userRole = req.user.role;

  // Check if the role is CONSUMER
  if (userRole !== "CONSUMER") {
    return res.status(403).json({ message: "Forbidden: Access is denied" });
  }

  try {
    const quotation = await Quotation.findOne({
      where: { id: quotationId, consumerId },
    });

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    quotation.quotationStatus = "REJECTED";
    await quotation.save();

    res.json({ message: "Quotation rejected successfully" });
  } catch (error) {
    console.error("Error rejecting quotation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/company-quotations", authenticateToken, async (req, res) => {
  const companyId = req.user.id;
  const userRole = req.user.role;

  // Check if the role is CONSUMER
  if (userRole !== "COMPANY") {
    return res.status(403).json({ message: "Forbidden: Access is denied" });
  }

  try {
    const quotations = await Quotation.findAll({
      where: { companyId },
      include: [
        {
          model: User,
          as: "consumer",
          attributes: ["id", "username", "avatarUrl"],
          include: [
            {
              model: ConsumerProfile,
              attributes: ["phoneNumber", "address"],
            },
          ],
        },
        {
          model: QuotationVersion,
          as: "versions",
          attributes: [
            "id",
            "quotationId",
            "systemSize",
            "panelSpecifications",
            "costBreakdown",
            "estimatedEnergyProduction",
            "savings",
            "paybackPeriod",
            "roi",
            "incentives",
            "productWarranties",
            "timeline",
            "versionNumber",
            "status",
            "createdAt",
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

router.post("/draft", authenticateToken, checkStripeAccount, async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== "COMPANY") {
    return res.status(403).json({ message: "Only companies can draft quotations." });
  }

  const {
    systemSize,
    panelSpecifications,
    costBreakdown,
    timeline,
    estimatedEnergyProduction,
    savings,
    paybackPeriod,
    roi,
    incentives,
    rebates,
    productWarranties,
    quotationId,
  } = req.body;

  if (!quotationId) {
    return res.status(400).json({ message: "Quotation ID is required." });
  }

  const t = await sequelize.transaction();

  try {
    const quotation = await Quotation.findOne({
      where: { id: quotationId, companyId: req.user.id },
      transaction: t,
    });

    if (!quotation) {
      await t.rollback();
      return res.status(403).json({ message: "Access denied." });
    }

    const latestVersion = await QuotationVersion.findOne({
      where: { quotationId },
      order: [["versionNumber", "DESC"]],
      transaction: t,
    });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const quotationVersion = await QuotationVersion.create(
      {
        quotationId,
        systemSize,
        panelSpecifications,
        costBreakdown,
        timeline,
        estimatedEnergyProduction,
        savings,
        paybackPeriod,
        roi,
        incentives,
        rebates,
        productWarranties,
        status: "DRAFT",
        versionNumber: newVersionNumber,
      },
      { transaction: t }
    );

    await quotation.update(
      { quotationStatus: "RECEIVED" },
      { where: { id: quotationId }, transaction: t }
    );

    await t.commit();
    res.status(200).json({
      message: "Quotation draft saved successfully.",
      quotationVersion,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error saving draft:", error);
    res.status(500).json({ message: "Failed to save quotation draft." });
  }
});

router.post("/finalize", authenticateToken, checkStripeAccount, async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== "COMPANY") {
    return res
      .status(403)
      .json({ message: "Only companies can finalize quotations." });
  }

  const {
    systemSize,
    panelSpecifications,
    costBreakdown,
    estimatedEnergyProduction,
    savings,
    paybackPeriod,
    roi,
    incentives,
    rebates,
    productWarranties,
    timeline,
    quotationVersionId,
    quotationId, // Quotation ID must be included
  } = req.body;

  if (!quotationId) {
    return res.status(400).json({ message: "Quotation ID is required." });
  }

  const t = await sequelize.transaction();

  try {
    // Ensure the company owns the quotation
    const quotation = await Quotation.findOne({
      where: { id: quotationId, companyId: req.user.id },
    });

    if (!quotation) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!quotationVersionId) {
      return res
        .status(400)
        .json({ message: "Quotation draft is required for finalization." });
    }

    // Check if the quotation draft exists to finalize
    const quotationVersion = await QuotationVersion.findOne({
      where: { id: quotationVersionId, quotationId },
    });

    if (!quotationVersion) {
      return res.status(404).json({ message: "Quotation draft not found." });
    }

    const latestVersion = await QuotationVersion.findOne({
      where: { quotationId },
      order: [["versionNumber", "DESC"]],
      transaction: t,
    });

    const newVersionNumber = latestVersion
      ? latestVersion.versionNumber + 1
      : 1;

    // Create a new record for the finalized quotation version
    const newQuotationVersion = await QuotationVersion.create(
      {
        quotationId,
        systemSize,
        panelSpecifications,
        costBreakdown,
        estimatedEnergyProduction,
        savings,
        paybackPeriod,
        roi,
        incentives,
        rebates,
        productWarranties,
        timeline,
        status: "FINALIZED",
        versionNumber: newVersionNumber,
      },
      { transaction: t }
    );

    await quotation.update(
      {
        quotationStatus: "FINALIZED",
      },
      { transaction: t }
    );

    await t.commit();
    res
      .status(200)
      .json({
        message: "Quotation finalized successfully.",
        newQuotationVersion,
      });
  } catch (error) {
    await t.rollback();
    console.error("Error finalizing quotation:", error);
    res.status(500).json({ message: "Failed to finalize quotation." });
  }
});

// New endpoint to fetch the latest quotation version
router.get("/latest/:quotationId", authenticateToken, checkStripeAccount, async (req, res) => {
  const { quotationId } = req.params;
  const userRole = req.user.role;

  if (!quotationId) {
    return res.status(400).json({ message: "QuotationId is required." });
  }

  if (userRole !== "COMPANY") {
    return res
      .status(403)
      .json({ message: "Only companies can access this resource." });
  }

  try {
    const quotation = await Quotation.findOne({
      where: { id: quotationId, companyId: req.user.id },
    });

    if (!quotation) {
      return res.status(403).json({ message: "Access denied." });
    }

    const latestQuotationVersion = await QuotationVersion.findOne({
      where: { quotationId },
      order: [["versionNumber", "DESC"]],
      include: [
        {
          model: Quotation,
          as: "quotation",
          attributes: ["companyId"],
        },
      ],
    });

    if (!latestQuotationVersion) {
      return res.status(200).json({
        message: "No quotation versions found.",
        canFinalize: false,
        isNewQuotation: true,
      });
    }

    res.status(200).json({
      ...latestQuotationVersion.toJSON(),
      canFinalize: true,
      isNewQuotation: false,
    });
  } catch (error) {
    console.error("Error fetching latest quotation version:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch latest quotation version." });
  }
});

router.post("/accept/:quotationVersionId", authenticateToken, async (req, res) => {
  const { quotationVersionId } = req.params;
  const consumerId = req.user.id;
  const userRole = req.user.role;

  // Only consumers can accept quotations
  if (userRole !== "CONSUMER") {
    return res.status(403).json({ message: "Only consumers can accept quotations." });
  }

  try {
    // Fetch the specific quotation version by ID
    const quotationVersion = await QuotationVersion.findByPk(quotationVersionId, {
      include: [
        {
          model: Quotation,
          as: "quotation",
          include: [
            {
              model: User,
              as: "consumer",
              attributes: ["id"],
            },
            {
              model: User,
              as: "company",
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    if (!quotationVersion) {
      return res.status(404).json({ message: "Quotation version not found." });
    }

    // Check if the consumer owns this quotation
    const quotation = quotationVersion.quotation;
    if (quotation.consumerId !== consumerId) {
      return res.status(403).json({ message: "You do not have access to this quotation." });
    }

    // Update the quotation status to ACCEPTED
    quotation.quotationStatus = "ACCEPTED";
    await quotation.save();

    // Create a project between the consumer and company
    const project = await Project.create({
      consumerId: quotation.consumerId,
      companyId: quotation.companyId,
      quotationId: quotation.id,
    });

    res.status(200).json({ message: "Quotation accepted successfully, project created", project });
  } catch (error) {
    console.error("Error accepting quotation:", error);
    res.status(500).json({ message: "Failed to accept quotation." });
  }
});

module.exports = router;
