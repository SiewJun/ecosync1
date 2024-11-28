const express = require("express");
const { sequelize } = require("../models");
const { Op } = require('sequelize');
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
  Project,
  Notification,
} = require("../models");
const authenticateSession = require("../middleware/auth");
const checkStripeAccount = require("../middleware/checkStripeAccount");

module.exports = (io) => {
  router.post("/submit-quotation", authenticateSession, async (req, res) => {
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

      // Create a notification for the company
      const companyNotification = await Notification.create({
        userId: companyId,
        title: "New Quotation Request",
        message: `You have received a new quotation request from ${name}.`,
      });

      // Create a notification for the consumer
      const consumerNotification = await Notification.create({
        userId: consumerId,
        title: "Quotation Submitted",
        message:
          "You have successfully submitted a quotation. Please wait for the company to draft one for you.",
      });

      // Emit the notification events to specific rooms
      io.to(companyId).emit("newNotification", companyNotification);
      io.to(consumerId).emit("newNotification", consumerNotification);

      res.status(201).json({
        message: "Quotation submitted successfully",
        quotation: newQuotation,
        chat,
        message,
        companyNotification,
        consumerNotification,
      });
    } catch (error) {
      console.error("Error submitting quotation:", error);
      res
        .status(500)
        .json({ error: "Failed to submit the quotation request." });
    }
  });

  router.get("/consumer-quotations", authenticateSession, async (req, res) => {
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

  router.get(
    "/submitted-versions/:quotationId",
    authenticateSession,
    async (req, res) => {
      const { quotationId } = req.params;
      const userRole = req.user.role;
  
      // Check if the user is either a CONSUMER or COMPANY
      if (userRole !== "CONSUMER") {
        return res.status(403).json({ message: "Forbidden: Access is denied" });
      }
  
      try {
        const submittedVersions = await QuotationVersion.findAll({
          where: {
            quotationId,
            status: {
              [Op.ne]: "DRAFT", // Use Op directly instead of sequelize.Op
            },
          },
          order: [["versionNumber", "ASC"]],
          include: [
            {
              model: Quotation,
              as: "quotation",
              attributes: ["id", "consumerId", "companyId"],
              include: [
                {
                  model: User,
                  as: "consumer",
                  attributes: ["id", "username", "avatarUrl"],
                },
                {
                  model: User,
                  as: "company",
                  attributes: ["id", "username", "avatarUrl"],
                },
              ],
            },
          ],
        });
  
        res.status(200).json({ versions: submittedVersions });
      } catch (error) {
        console.error("Error fetching submitted quotation versions:", error);
        res.status(500).json({ message: "Failed to fetch submitted quotation versions." });
      }
    }
  );

  router.get(
    "/version-details/:versionId",
    authenticateSession,
    async (req, res) => {
      const { versionId } = req.params;
      const userRole = req.user.role;
  
      // Check if the user is either a CONSUMER or COMPANY
      if (userRole !== "CONSUMER" && userRole !== "COMPANY") {
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
                  as: "consumer",
                  attributes: ["id", "username", "avatarUrl"],
                },
                {
                  model: User,
                  as: "company",
                  attributes: ["id", "username", "avatarUrl"],
                  include: [
                    {
                      model: CompanyDetail,
                      attributes: [
                        "companyName",
                        "businessLicense",
                        "address",
                        "website",
                        "phoneNumber",
                      ],
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
    }
  );

  router.post("/reject/:id", authenticateSession, async (req, res) => {
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

  router.get("/company-quotations", authenticateSession, async (req, res) => {
    const companyId = req.user.id;
    const userRole = req.user.role;

    // Check if the role is COMPANY
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

  router.post("/draft/:quotationId", authenticateSession, checkStripeAccount, async (req, res) => {
    const { quotationId } = req.params;
    const userRole = req.user.role;
  
    if (userRole !== "COMPANY") {
      return res.status(403).json({ message: "Only companies can draft quotations." });
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
      productWarranties,
      timeline,
    } = req.body;
  
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
          estimatedEnergyProduction,
          savings,
          paybackPeriod,
          roi,
          incentives,
          productWarranties,
          timeline,
          status: "DRAFT",
          versionNumber: newVersionNumber,
        },
        { transaction: t }
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
  
  router.get(
    "/version-details/:versionId",
    authenticateSession,
    async (req, res) => {
      const { versionId } = req.params;
      const userRole = req.user.role;
  
      // Check if the user is either a CONSUMER or COMPANY
      if (userRole !== "CONSUMER" && userRole !== "COMPANY") {
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
                  as: "consumer",
                  attributes: ["id", "username", "avatarUrl"],
                },
                {
                  model: User,
                  as: "company",
                  attributes: ["id", "username", "avatarUrl"],
                  include: [
                    {
                      model: CompanyDetail,
                      attributes: [
                        "companyName",
                        "businessLicense",
                        "address",
                        "website",
                        "phoneNumber",
                      ],
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
    }
  );

  router.put(
    "/update-version/:versionId",
    authenticateSession,
    checkStripeAccount,
    async (req, res) => {
      const { versionId } = req.params;
      const userRole = req.user.role;
  
      if (userRole !== "COMPANY") {
        return res
          .status(403)
          .json({ message: "Only companies can update quotation versions." });
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
      } = req.body;
  
      try {
        const quotationVersion = await QuotationVersion.findByPk(versionId);
  
        if (!quotationVersion) {
          return res.status(404).json({ message: "Quotation version not found." });
        }
  
        // Ensure the company owns the quotation
        const quotation = await Quotation.findOne({
          where: { id: quotationVersion.quotationId, companyId: req.user.id },
        });
  
        if (!quotation) {
          return res.status(403).json({ message: "Access denied." });
        }
  
        // Update the quotation version
        await quotationVersion.update({
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
        });
  
        res.status(200).json({
          message: "Quotation version updated successfully.",
          quotationVersion,
        });
      } catch (error) {
        console.error("Error updating quotation version:", error);
        res.status(500).json({ message: "Failed to update quotation version." });
      }
    }
  );

  router.post(
    "/submit-version/:versionId",
    authenticateSession,
    checkStripeAccount,
    async (req, res) => {
      const { versionId } = req.params;
      const userRole = req.user.role;
  
      if (userRole !== "COMPANY") {
        return res
          .status(403)
          .json({ message: "Only companies can submit quotation versions." });
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
                  as: "consumer",
                  attributes: ["id", "username"],
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
  
        // Ensure the company owns the quotation
        const quotation = await Quotation.findOne({
          where: { id: quotationVersion.quotationId, companyId: req.user.id },
        });
  
        if (!quotation) {
          return res.status(403).json({ message: "Access denied." });
        }
  
        // Update the status of the quotation version and the quotation
        quotationVersion.status = "SUBMITTED";
        await quotationVersion.save();
  
        quotation.quotationStatus = "RECEIVED";
        await quotation.save();
  
        // Create notifications
        const consumerNotification = await Notification.create({
          userId: quotation.consumerId,
          title: "New Quotation Version",
          message: `A new version of your requested quotation has been received`,
        });
  
        const companyNotification = await Notification.create({
          userId: quotation.companyId,
          title: "Quotation Version Submitted",
          message: `You have successfully submitted a new version of quotation (ID: ${quotation.id}).`,
        });
  
        // Emit the notification events to specific rooms
        io.to(quotation.consumerId).emit("newNotification", consumerNotification);
        io.to(quotation.companyId).emit("newNotification", companyNotification);
  
        res.status(200).json({
          message: "Quotation version submitted successfully.",
          quotationVersion,
          consumerNotification,
          companyNotification,
        });
      } catch (error) {
        console.error("Error submitting quotation version:", error);
        res.status(500).json({ message: "Failed to submit quotation version." });
      }
    }
  );

  router.get("/versions/:quotationId", authenticateSession, async (req, res) => {
    const { quotationId } = req.params;
    const userRole = req.user.role;
  
    // Check if the user is either a CONSUMER or COMPANY
    if (userRole !== "CONSUMER" && userRole !== "COMPANY") {
      return res.status(403).json({ message: "Forbidden: Access is denied" });
    }
  
    try {
      const quotationVersions = await QuotationVersion.findAll({
        where: { quotationId },
        order: [["versionNumber", "ASC"]],
        include: [
          {
            model: Quotation,
            as: "quotation",
            attributes: ["id", "consumerId", "companyId"],
            include: [
              {
                model: User,
                as: "consumer",
                attributes: ["id", "username", "avatarUrl"],
              },
              {
                model: User,
                as: "company",
                attributes: ["id", "username", "avatarUrl"],
              },
            ],
          },
        ],
      });
  
      res.status(200).json({ versions: quotationVersions });
    } catch (error) {
      console.error("Error fetching quotation versions:", error);
      res.status(500).json({ message: "Failed to fetch quotation versions." });
    }
  });
  
  router.post("/accept/:id", authenticateSession, async (req, res) => {
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
  
      quotation.quotationStatus = "ACCEPTED";
      await quotation.save();
  
      // Create a project for the accepted quotation
      const project = await Project.create({
        quotationId: quotation.id,
        consumerId: quotation.consumerId,
        companyId: quotation.companyId,
        status: "PENDING",
        startDate: new Date(), // Set the start date to the current date
        endDate: null,
      });
  
      // Create notifications
      const companyNotification = await Notification.create({
        userId: quotation.companyId,
        title: "Quotation Accepted",
        message: `The quotation (ID: ${quotation.id}) has been accepted by the consumer. Proceed with Project steps drafting now!`,
      });
  
      const consumerNotification = await Notification.create({
        userId: consumerId,
        title: "Quotation Accepted",
        message: `You have successfully accepted the quotation (ID: ${quotation.id}). View the project now!`,
      });
  
      // Emit the notification events to specific rooms
      io.to(quotation.companyId).emit("newNotification", companyNotification);
      io.to(consumerId).emit("newNotification", consumerNotification);
  
      res.json({ message: "Quotation accepted successfully", project });
    } catch (error) {
      console.error("Error accepting quotation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/finalize/:quotationId", authenticateSession, async (req, res) => {
    const { quotationId } = req.params;
    const userRole = req.user.role;
  
    // Check if the role is COMPANY
    if (userRole !== "COMPANY") {
      return res.status(403).json({ message: "Only companies can finalize quotations." });
    }
  
    try {
      const quotation = await Quotation.findOne({
        where: { id: quotationId, companyId: req.user.id },
        include: [
          {
            model: QuotationVersion,
            as: "versions",
            order: [["versionNumber", "DESC"]],
          },
        ],
      });
  
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
  
      const lastVersion = quotation.versions[0];
  
      if (!lastVersion || lastVersion.status !== "SUBMITTED") {
        return res.status(400).json({ message: "Only the last submitted version can be finalized." });
      }
  
      lastVersion.status = "FINALIZED";
      await lastVersion.save();
  
      quotation.quotationStatus = "FINALIZED";
      await quotation.save();
  
      // Create notifications
      const consumerNotification = await Notification.create({
        userId: quotation.consumerId,
        title: "Quotation Finalized",
        message: `The quotation (ID: ${quotation.id}) has been finalized by the company.`,
      });
  
      const companyNotification = await Notification.create({
        userId: quotation.companyId,
        title: "Quotation Finalized",
        message: `You have successfully finalized the quotation (ID: ${quotation.id}).`,
      });
  
      // Emit the notification events to specific rooms
      io.to(quotation.consumerId).emit("newNotification", consumerNotification);
      io.to(quotation.companyId).emit("newNotification", companyNotification);
  
      res.json({ message: "Quotation finalized successfully", quotation });
    } catch (error) {
      console.error("Error finalizing quotation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.post("/finalize/:quotationId", authenticateSession, async (req, res) => {
    const { quotationId } = req.params;
    const userRole = req.user.role;
  
    // Check if the role is COMPANY
    if (userRole !== "COMPANY") {
      return res.status(403).json({ message: "Only companies can finalize quotations." });
    }
  
    try {
      const quotation = await Quotation.findOne({
        where: { id: quotationId, companyId: req.user.id },
        include: [
          {
            model: QuotationVersion,
            as: "versions",
            order: [["versionNumber", "DESC"]],
          },
        ],
      });
  
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
  
      const lastVersion = quotation.versions[0];
  
      if (!lastVersion || lastVersion.status !== "SUBMITTED") {
        return res.status(400).json({ message: "Only the last submitted version can be finalized." });
      }
  
      // Ensure no other versions are in SUBMITTED status
      const submittedVersions = quotation.versions.filter(version => version.status === "SUBMITTED");
      if (submittedVersions.length > 1) {
        return res.status(400).json({ message: "Only the last submitted version can be finalized." });
      }
  
      lastVersion.status = "FINALIZED";
      await lastVersion.save();
  
      quotation.quotationStatus = "FINALIZED";
      await quotation.save();
  
      // Create notifications
      const consumerNotification = await Notification.create({
        userId: quotation.consumerId,
        title: "Quotation Finalized",
        message: `The quotation (ID: ${quotation.id}) has been finalized by the company.`,
      });
  
      const companyNotification = await Notification.create({
        userId: quotation.companyId,
        title: "Quotation Finalized",
        message: `You have successfully finalized the quotation (ID: ${quotation.id}).`,
      });
  
      // Emit the notification events to specific rooms
      io.to(quotation.consumerId).emit("newNotification", consumerNotification);
      io.to(quotation.companyId).emit("newNotification", companyNotification);
  
      res.json({ message: "Quotation finalized successfully", quotation });
    } catch (error) {
      console.error("Error finalizing quotation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};
