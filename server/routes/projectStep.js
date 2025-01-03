const express = require("express");
const { User, Project, ProjectStep, Notification } = require("../models");
const router = express.Router();
const authenticateSession = require("../middleware/auth");
const upload = require("../middleware/multer");

module.exports = (io) => {
  // POST /:projectId/steps
  router.post("/:projectId/steps", authenticateSession, async (req, res) => {
    const { projectId } = req.params;
    const { steps } = req.body; // Assume this contains an array of steps data

    try {
      // Check if the project belongs to the authenticated company
      const project = await Project.findOne({
        where: { id: projectId, companyId: req.user.id }, // Ensure project belongs to the company
      });

      if (!project) {
        return res
          .status(403)
          .json({ error: "Unauthorized: You do not own this project." });
      }

      // Create steps for the project
      const createdSteps = await ProjectStep.bulkCreate(
        steps.map((step) => ({
          ...step,
          projectId: project.id,
          paymentAmount: step.paymentAmount === "" ? null : step.paymentAmount, // Convert empty string to null
        }))
      );

      res
        .status(201)
        .json({ message: "Steps created successfully", steps: createdSteps });
    } catch (error) {
      console.error("Error creating steps:", error); // Add logging for debugging
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // GET /:projectId/steps
  router.get("/:projectId/steps", authenticateSession, async (req, res) => {
    const { projectId } = req.params;

    try {
      // Check if the project belongs to the company
      const project = await Project.findOne({
        where: { id: projectId, companyId: req.user.id },
      });

      if (!project) {
        return res
          .status(403)
          .json({ error: "Unauthorized: You do not own this project." });
      }

      // Fetch the steps for the project
      const steps = await ProjectStep.findAll({
        where: { projectId: project.id },
      });

      res.status(200).json({ steps, projectStatus: project.status });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // GET /consumer/:projectId/steps
  router.get(
    "/consumer/:projectId/steps",
    authenticateSession,
    async (req, res) => {
      const { projectId } = req.params;

      try {
        // Check if the project belongs to the consumer
        const project = await Project.findOne({
          where: { id: projectId, consumerId: req.user.id },
          include: [
            {
              model: User,
              as: "company",
              attributes: ["username", "avatarUrl"],
            },
          ],
        });

        if (!project) {
          return res
            .status(403)
            .json({
              error: "Unauthorized: This project does not belong to you.",
            });
        }

        // Fetch the steps for the project
        const steps = await ProjectStep.findAll({
          where: { projectId: project.id },
          order: [["stepOrder", "ASC"]],
        });

        res.status(200).json({ project, steps });
      } catch (error) {
        console.error("Error fetching consumer project steps:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  // GET /company/:projectId/steps
  router.get(
    "/company/:projectId/steps",
    authenticateSession,
    async (req, res) => {
      const { projectId } = req.params;

      try {
        // Check if the project belongs to the company
        const project = await Project.findOne({
          where: { id: projectId, companyId: req.user.id },
          include: [
            {
              model: User,
              as: "consumer",
              attributes: ["username", "avatarUrl"],
            },
          ],
        });

        if (!project) {
          return res
            .status(403)
            .json({
              error: "Unauthorized: This project does not belong to you.",
            });
        }

        // Fetch the steps for the project
        const steps = await ProjectStep.findAll({
          where: { projectId: project.id },
          order: [["stepOrder", "ASC"]],
        });

        res.status(200).json({ project, steps });
      } catch (error) {
        console.error("Error fetching company project steps:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  // PUT /:projectId/steps/:stepId
  router.put(
    "/:projectId/steps/:stepId",
    authenticateSession,
    async (req, res) => {
      const { projectId, stepId } = req.params;
      const { stepData } = req.body;

      try {
        // Check if the project belongs to the company
        const project = await Project.findOne({
          where: { id: projectId, companyId: req.user.id },
        });

        if (!project) {
          return res
            .status(403)
            .json({ error: "Unauthorized: You do not own this project." });
        }

        // Find and update the project step
        const step = await ProjectStep.findOne({
          where: { id: stepId, projectId: project.id },
        });
        if (!step) {
          return res.status(404).json({ error: "Step not found." });
        }

        await step.update(stepData);
        res.status(200).json({ message: "Step updated successfully", step });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  // DELETE /:projectId/steps/:stepId
  router.delete(
    "/:projectId/steps/:stepId",
    authenticateSession,
    async (req, res) => {
      const { projectId, stepId } = req.params;

      try {
        // Check if the project belongs to the company
        const project = await Project.findOne({
          where: { id: projectId, companyId: req.user.id },
        });

        if (!project) {
          return res
            .status(403)
            .json({ error: "Unauthorized: You do not own this project." });
        }

        // Find and delete the project step
        const step = await ProjectStep.findOne({
          where: { id: stepId, projectId: project.id },
        });
        if (!step) {
          return res.status(404).json({ error: "Step not found." });
        }

        await step.destroy();
        res.status(200).json({ message: "Step deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  // PUT /:projectId/publish
  router.put("/:projectId/publish", authenticateSession, async (req, res) => {
    const { projectId } = req.params;

    try {
      // Check if the project belongs to the company
      const project = await Project.findOne({
        where: { id: projectId, companyId: req.user.id },
      });

      if (!project) {
        return res
          .status(403)
          .json({ error: "Unauthorized: You do not own this project." });
      }

      // Check if the project already has steps
      const steps = await ProjectStep.findAll({
        where: { projectId: project.id },
      });

      if (steps.length < 5) {
        return res
          .status(400)
          .json({
            error:
              "Not enough steps to publish the project. A minimum of 5 steps is required.",
          });
      }

      // Update project status to IN_PROGRESS
      await project.update({ status: "IN_PROGRESS" });

      // Create notifications
      const consumerNotification = await Notification.create({
        userId: project.consumerId,
        title: "Project Published",
        message: `Your project (ID: ${project.id}) has been published and is now in progress.`,
      });

      const companyNotification = await Notification.create({
        userId: project.companyId,
        title: "Project Published",
        message: `You have successfully published the project (ID: ${project.id}).`,
      });

      // Emit the notification events to specific rooms
      io.to(project.consumerId).emit("newNotification", consumerNotification);
      io.to(project.companyId).emit("newNotification", companyNotification);

      res
        .status(200)
        .json({
          message:
            "Project successfully published and status updated to IN_PROGRESS.",
        });
    } catch (error) {
      console.error("Error publishing project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // POST /consumer/:projectId/steps/:stepId/upload
  router.post(
    "/consumer/:projectId/steps/:stepId/upload",
    authenticateSession,
    upload.array("documents", 5),
    async (req, res) => {
      const { projectId, stepId } = req.params;

      try {
        const consumerId = req.user.id;

        // Fetch user information to check their role
        const user = await User.findByPk(consumerId);

        if (user.role !== "CONSUMER") {
          return res
            .status(403)
            .json({ message: "Only consumers can request a quotation." });
        }

        // Check if the project belongs to the consumer
        const project = await Project.findOne({
          where: { id: projectId, consumerId: req.user.id },
        });

        if (!project) {
          return res
            .status(403)
            .json({
              error: "Unauthorized: This project does not belong to you.",
            });
        }

        // Find the project step
        const step = await ProjectStep.findOne({
          where: { id: stepId, projectId: project.id },
        });
        if (!step) {
          return res.status(404).json({ error: "Step not found." });
        }

        // Get the uploaded file paths
        const filePaths = req.files.map((file) => file.path);

        // Update the step with new file paths
        const updatedFilePaths = [...(step.filePaths || []), ...filePaths];
        await step.update({
          filePaths: updatedFilePaths,
          status: "COMPLETED", // Update status to COMPLETED
          completedAt: new Date(), // Add completedAt timestamp
        });

        res
          .status(200)
          .json({ message: "Documents uploaded successfully", step });
      } catch (error) {
        console.error("Error uploading documents:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  router.put(
    "/:projectId/steps/:stepId/complete",
    authenticateSession,
    async (req, res) => {
      const { projectId, stepId } = req.params;

      try {
        // Check if the project belongs to the company
        const project = await Project.findOne({
          where: { id: projectId, companyId: req.user.id },
        });

        if (!project) {
          return res
            .status(403)
            .json({ error: "Unauthorized: You do not own this project." });
        }

        // Find the project step
        const step = await ProjectStep.findOne({
          where: { id: stepId, projectId: project.id },
        });
        if (!step) {
          return res.status(404).json({ error: "Step not found." });
        }

        // Update the step status to COMPLETED and add completedAt timestamp
        await step.update({
          status: "COMPLETED",
          completedAt: new Date(),
        });

        // Check if this is the COMPLETION step
        if (step.stepType === "COMPLETION") {
          // Check if all other steps are completed
          const allSteps = await ProjectStep.findAll({
            where: { projectId: project.id },
          });
          const allCompleted = allSteps.every((s) => s.status === "COMPLETED");

          if (allCompleted) {
            // Update project status to COMPLETED
            await project.update({
              status: "COMPLETED",
              endDate: new Date(),
            });
          }
        }

        res.status(200).json({
          message: "Step marked as completed successfully",
          step,
          projectStatus: project.status,
        });
      } catch (error) {
        console.error("Error marking step as completed:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  return router;
};
