const express = require("express");
const { Notification, User, Sequelize } = require("../models");
const authenticateSession = require("../middleware/auth");
const router = express.Router();
const { Op } = Sequelize;

module.exports = (io) => {
  // Create a new notification
router.post("/create-noti", authenticateSession, async (req, res) => {
  const { userId, role, title, message } = req.body;

  try {
    const notification = await Notification.create({
      userId,
      role,
      title,
      message,
    });

    // Emit the notification event to the specific user room
    io.to(userId).emit("newNotification", notification);
    io.emit("notificationCreated", notification); // Emit to all clients

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Failed to create notification." });
  }
});

// Update a notification
router.put("/:id", authenticateSession, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;
  const { title, message, role } = req.body;

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // Update the notification details
    if (title) notification.title = title;
    if (message) notification.message = message;
    if (role) notification.role = role;

    await notification.save();
    io.emit("notificationUpdated", notification); // Emit to all clients

    res.status(200).json({ message: "Notification updated successfully", notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Failed to update notification." });
  }
});

// Delete a notification
router.delete("/:id", authenticateSession, async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    await notification.destroy();
    io.emit("notificationDeleted", id); // Emit to all clients

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification." });
  }
});

  // Get all notifications created by the admin
  router.get("/admin/notifications", authenticateSession, async (req, res) => {
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const notifications = await Notification.findAll({
        where: {
          [Op.or]: [{ role: "CONSUMER" }, { role: "COMPANY" }],
        },
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications." });
    }
  });

  // Get notifications for the authenticated user
  router.get("/noti", authenticateSession, async (req, res) => {
    const { id, role } = req.user;

    try {
      const notifications = await Notification.findAll({
        where: {
          [Op.or]: [{ userId: id }, { role }],
        },
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications." });
    }
  });

  // Mark a notification as read
  router.put("/:id/read", authenticateSession, async (req, res) => {
    const { id } = req.params;

    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found." });
      }

      notification.isRead = true;
      await notification.save();
      res.status(200).json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read." });
    }
  });

  return router;
};