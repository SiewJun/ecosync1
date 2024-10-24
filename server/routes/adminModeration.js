const express = require("express");
const router = express.Router();
const { Incentive } = require("../models");
const authenticateToken = require("../middleware/auth");

// Get all incentives
router.get("/incentives", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const incentives = await Incentive.findAll();
    res.status(200).json({ incentives });
  } catch (error) {
    console.error("Error fetching incentives:", error);
    res.status(500).json({ message: "Failed to fetch incentives." });
  }
});

// Get a single incentive by ID
router.get("/incentives/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;

  try {
    const incentive = await Incentive.findByPk(id);
    if (!incentive) {
      return res.status(404).json({ message: "Incentive not found." });
    }
    res.status(200).json({ incentive });
  } catch (error) {
    console.error("Error fetching incentive:", error);
    res.status(500).json({ message: "Failed to fetch incentive." });
  }
});

// Create a new incentive
router.post("/incentives", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const {
    title,
    description,
    region,
    eligibilityCriteria,
    incentiveAmount,
    expirationDate,
    applicationLink,
    source,
    status
  } = req.body;

  try {
    const newIncentive = await Incentive.create({
      title,
      description,
      region,
      eligibilityCriteria,
      incentiveAmount,
      expirationDate,
      applicationLink,
      source,
      status
    });
    res.status(201).json({ message: "Incentive created successfully", newIncentive });
  } catch (error) {
    console.error("Error creating incentive:", error);
    res.status(500).json({ message: "Failed to create incentive." });
  }
});

// Update an existing incentive
router.put("/incentives/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;
  const {
    title,
    description,
    region,
    eligibilityCriteria,
    incentiveAmount,
    expirationDate,
    applicationLink,
    source,
    status
  } = req.body;

  try {
    const incentive = await Incentive.findByPk(id);
    if (!incentive) {
      return res.status(404).json({ message: "Incentive not found." });
    }

    incentive.title = title;
    incentive.description = description;
    incentive.region = region;
    incentive.eligibilityCriteria = eligibilityCriteria;
    incentive.incentiveAmount = incentiveAmount;
    incentive.expirationDate = expirationDate;
    incentive.applicationLink = applicationLink;
    incentive.source = source;
    incentive.status = status;

    await incentive.save();

    res.status(200).json({ message: "Incentive updated successfully", incentive });
  } catch (error) {
    console.error("Error updating incentive:", error);
    res.status(500).json({ message: "Failed to update incentive." });
  }
});

// Delete an incentive
router.delete("/incentives/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;

  try {
    const incentive = await Incentive.findByPk(id);
    if (!incentive) {
      return res.status(404).json({ message: "Incentive not found." });
    }

    await incentive.destroy();

    res.status(200).json({ message: "Incentive deleted successfully." });
  } catch (error) {
    console.error("Error deleting incentive:", error);
    res.status(500).json({ message: "Failed to delete incentive." });
  }
});

router.get("/public/incentives", async (req, res) => {
  try {
    const incentives = await Incentive.findAll();
    res.status(200).json({ incentives });
  } catch (error) {
    console.error("Error fetching incentives:", error);
    res.status(500).json({ message: "Failed to fetch incentives." });
  }
});

module.exports = router;
