const express = require('express');
const { Project, ProjectStep } = require("../models");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// POST /:projectId/steps
router.post('/:projectId/steps', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { steps } = req.body;  // Assume this contains an array of steps data

  try {
    // Check if the project belongs to the authenticated company
    const project = await Project.findOne({
      where: { id: projectId, companyId: req.user.id },  // Ensure project belongs to the company
    });

    if (!project) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this project.' });
    }

    // Create steps for the project
    const createdSteps = await ProjectStep.bulkCreate(
      steps.map(step => ({
        ...step,
        projectId: project.id,
        paymentAmount: step.paymentAmount === '' ? null : step.paymentAmount, // Convert empty string to null
      }))
    );

    res.status(201).json({ message: 'Steps created successfully', steps: createdSteps });
  } catch (error) {
    console.error('Error creating steps:', error);  // Add logging for debugging
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /:projectId/steps
router.get('/:projectId/steps', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    // Check if the project belongs to the company
    const project = await Project.findOne({
      where: { id: projectId, companyId: req.user.id },
    });

    if (!project) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this project.' });
    }

    // Fetch the steps for the project
    const steps = await ProjectStep.findAll({ where: { projectId: project.id } });

    res.status(200).json({ steps });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /:projectId/steps/:stepId
router.put('/:projectId/steps/:stepId', authenticateToken, async (req, res) => {
  const { projectId, stepId } = req.params;
  const { stepData } = req.body;

  try {
    // Check if the project belongs to the company
    const project = await Project.findOne({
      where: { id: projectId, companyId: req.user.id },
    });

    if (!project) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this project.' });
    }

    // Find and update the project step
    const step = await ProjectStep.findOne({ where: { id: stepId, projectId: project.id } });
    if (!step) {
      return res.status(404).json({ error: 'Step not found.' });
    }

    await step.update(stepData);
    res.status(200).json({ message: 'Step updated successfully', step });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /:projectId/steps/:stepId
router.delete('/:projectId/steps/:stepId', authenticateToken, async (req, res) => {
  const { projectId, stepId } = req.params;

  try {
    // Check if the project belongs to the company
    const project = await Project.findOne({
      where: { id: projectId, companyId: req.user.id },
    });

    if (!project) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this project.' });
    }

    // Find and delete the project step
    const step = await ProjectStep.findOne({ where: { id: stepId, projectId: project.id } });
    if (!step) {
      return res.status(404).json({ error: 'Step not found.' });
    }

    await step.destroy();
    res.status(200).json({ message: 'Step deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
