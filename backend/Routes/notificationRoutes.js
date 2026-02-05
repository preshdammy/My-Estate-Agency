// routes/notificationRoutes.js
const express = require("express");
const {
  // User functions
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  
  // Admin functions
  sendBroadcastNotification,
  getNotificationStats
} = require("../Controllers/notificationController");

const { protect, adminProtect } = require("../Middlewares/authMiddleware");

const router = express.Router();

// =============== USER PROTECTED ROUTES ===============

// User gets notifications
router.get("/", protect, getUserNotifications);

// User marks notification as read
router.put("/:notificationId/read", protect, markAsRead);

// User marks all notifications as read
router.put("/read-all", protect, markAllAsRead);

// User archives notification
router.put("/:notificationId/archive", protect, archiveNotification);

// User deletes notification
router.delete("/:notificationId", protect, deleteNotification);

// User clears all notifications
router.delete("/", protect, clearAllNotifications);

// User gets notification settings
router.get("/settings", protect, getNotificationSettings);

// User updates notification settings
router.put("/settings", protect, updateNotificationSettings);

// =============== ADMIN PROTECTED ROUTES ===============

// Admin sends broadcast notification
router.post("/admin/broadcast", protect, adminProtect, sendBroadcastNotification);

// Admin gets notification statistics
router.get("/admin/stats", protect, adminProtect, getNotificationStats);

module.exports = router;