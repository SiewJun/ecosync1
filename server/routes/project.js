const express = require("express");
const router = express.Router();
const {
  User,
  ConsumerProfile,
  CompanyDetail,
  Quotation,
  QuotationVersion,
  Project,
  ProjectStep,
} = require("../models");
const authenticateToken = require("../middleware/auth");

router.get("/consumer-projects", authenticateToken, async (req, res) => {
  const consumerId = req.user.id;
  const userRole = req.user.role;

  // Only consumers can view their projects
  if (userRole !== "CONSUMER") {
    return res.status(403).json({ message: "Only consumers can view their projects." });
  }

  try {
    // Fetch all projects that belong to the consumer
    const projects = await Project.findAll({
      where: { consumerId },
      include: [
        {
          model: User, // Include company details
          as: "company",
          attributes: ["id", "avatarUrl"],
          include: [
            {
              model: CompanyDetail,
              attributes: ["companyName", "phoneNumber", "address", "businessLicense", "website"],
            },
          ],
        },
        {
          model: Quotation, // Include quotation details
          as: "quotation",
          attributes: [
            "id", "quotationStatus", "averageMonthlyElectricityBill", "propertyType", "address", "state"
          ],
          include: [
            {
              model: QuotationVersion,
              as: "latestVersion",
              attributes: [
                "id", "systemSize", "panelSpecifications", "costBreakdown", "estimatedEnergyProduction", "savings", "paybackPeriod", "roi", "incentives", "productWarranties", "timeline", "versionNumber", "status"
              ],
            },
          ],
        },
        {
          model: ProjectStep, // Include the project steps
          as: "steps",
          attributes: ["id", "stepName", "stepType", "status", "dueDate", "completedAt"],
        },
      ],
    });

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found for this consumer." });
    }

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching consumer projects:", error);
    res.status(500).json({ message: "Failed to fetch consumer projects." });
  }
});

router.get("/company-projects", authenticateToken, async (req, res) => {
  const companyId = req.user.id;
  const userRole = req.user.role;

  // Only consumers can view their projects
  if (userRole !== "COMPANY") {
    return res.status(403).json({ message: "Only companiess can view their projects." });
  }

  try {
    // Fetch all projects that belong to the consumer
    const projects = await Project.findAll({
      where: { companyId },
      include: [
        {
          model: User, // Include company details
          as: "consumer",
          attributes: ["id", "avatarUrl", "email", "username"],
          include: [
            {
              model: ConsumerProfile,
              attributes: ["phoneNumber", "address"],
            },
          ],
        },
        {
          model: Quotation, // Include quotation details
          as: "quotation",
          attributes: [
            "id", "quotationStatus", "averageMonthlyElectricityBill", "propertyType", "address", "state"
          ],
          include: [
            {
              model: QuotationVersion,
              as: "latestVersion",
              attributes: [
                "id", "systemSize", "panelSpecifications", "costBreakdown", "estimatedEnergyProduction", "savings", "paybackPeriod", "roi", "incentives", "productWarranties", "timeline", "versionNumber", "status"
              ],
            },
          ],
        },
        {
          model: ProjectStep, // Include the project steps
          as: "steps",
          attributes: ["id", "stepName", "stepType", "status", "dueDate", "completedAt"],
        },
      ],
    });

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found for this company." });
    }

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching company projects:", error);
    res.status(500).json({ message: "Failed to fetch company projects." });
  }
});

module.exports = router;
