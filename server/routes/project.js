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
const authenticateSession = require("../middleware/auth");
const upload = require("../middleware/multer"); 
const stripe = require('stripe')('your_stripe_secret_key'); // Add your Stripe secret key here

router.get("/consumer-projects", authenticateSession, async (req, res) => {
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
    
    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching consumer projects:", error);
    res.status(500).json({ message: "Failed to fetch consumer projects." });
  }
});

router.get("/company-projects", authenticateSession, async (req, res) => {
  const companyId = req.user.id;
  const userRole = req.user.role;

  // Only consumers can view their projects
  if (userRole !== "COMPANY") {
    return res.status(403).json({ message: "Only companies can view their projects." });
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
            "id", "name", "email", "phoneNumber", "quotationStatus", "averageMonthlyElectricityBill", "propertyType", "address", "state"
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

router.post("/:projectId/steps", authenticateSession, upload.single("document"), async (req, res) => {
  const { stepName, stepType, dueDate, description } = req.body;
  const { projectId } = req.params;

  try {
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ensure the user can only create steps for their own project (consumer or company)
    if (req.user.id !== project.companyId) {
      return res.status(403).json({ message: "Unauthorized to add steps to this project." });
    }

    // For DOCUMENT_UPLOAD type, handle file upload
    let uploadedFilePath = null;
    if (stepType === "DOCUMENT_UPLOAD" && req.file) {
      uploadedFilePath = req.file.path; // multer stores the file at this path
    }

    const newStep = await ProjectStep.create({
      projectId: project.id,
      stepName,
      stepType,
      description,
      status: "PENDING",
      dueDate,
      ...(stepType === "DOCUMENT_UPLOAD" && { description: `Uploaded file: ${uploadedFilePath}` }), // Add file path if DOCUMENT_UPLOAD
    });

    res.status(201).json({ message: "Step created successfully", newStep });
  } catch (error) {
    console.error("Error creating project step:", error);
    res.status(500).json({ message: "Failed to create project step." });
  }
});

module.exports = router;