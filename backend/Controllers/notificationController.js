// controllers/notificationController.js
const Notification = require("../Models/notificationModel");
const User = require("../Models/usermodel");

// Helper function to create notification
const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      metadata,
      relatedId: metadata.relatedId,
      relatedModel: metadata.relatedModel,
      actionUrl: metadata.actionUrl,
      priority: metadata.priority || "medium"
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// =============== USER FUNCTIONS ===============

// User gets their notifications
const getUserNotifications = async (req, res) => {
  try {
    const { read, type, limit = 20, page = 1 } = req.query;
    
    let filter = { user: req.user._id, isArchived: false };
    if (read !== undefined) filter.isRead = read === "true";
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false,
      isArchived: false 
    });

    res.json({
      notifications,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      unreadCount
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User marks notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to update this notification" 
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User marks all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ 
      message: "All notifications marked as read" 
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User archives a notification
const archiveNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to archive this notification" 
      });
    }

    notification.isArchived = true;
    await notification.save();

    res.json({
      message: "Notification archived",
      notification
    });
  } catch (error) {
    console.error("Archive notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User deletes a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "Not authorized to delete this notification" 
      });
    }

    await notification.deleteOne();

    res.json({ 
      message: "Notification deleted successfully" 
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User clears all notifications
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.json({ 
      message: "All notifications cleared" 
    });
  } catch (error) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User gets notification settings
const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("preferences");
    
    res.json(user.preferences?.notifications || {
      email: true,
      sms: false,
      push: true
    });
  } catch (error) {
    console.error("Get notification settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User updates notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const { email, sms, push, newsletter } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user.preferences) {
      user.preferences = {};
    }
    
    if (!user.preferences.notifications) {
      user.preferences.notifications = {};
    }
    
    if (email !== undefined) user.preferences.notifications.email = email;
    if (sms !== undefined) user.preferences.notifications.sms = sms;
    if (push !== undefined) user.preferences.notifications.push = push;
    if (newsletter !== undefined) user.preferences.newsletter = newsletter;
    
    await user.save();

    res.json({
      message: "Notification settings updated successfully",
      settings: user.preferences
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============== ADMIN FUNCTIONS ===============

// Admin sends notification to all users
const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        message: "Title and message are required" 
      });
    }

    // Get all users
    const users = await User.find().select("_id");
    
    // Create notifications for all users (in production, use queue/batch)
    const notifications = users.map(user => ({
      user: user._id,
      type: type || "system",
      title,
      message,
      priority: priority || "medium",
      metadata: { broadcast: true }
    }));

    // Insert in batches to avoid memory issues
    for (let i = 0; i < notifications.length; i += 100) {
      const batch = notifications.slice(i, i + 100);
      await Notification.insertMany(batch);
    }

    res.json({
      message: `Broadcast notification sent to ${users.length} users`,
      count: users.length
    });
  } catch (error) {
    console.error("Send broadcast notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const [
      totalNotifications,
      readNotifications,
      unreadNotifications,
      notificationsByType,
      recentActivity
    ] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: true }),
      Notification.countDocuments({ isRead: false }),
      Notification.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Notification.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
          } 
        },
        { 
          $group: { 
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            }, 
            count: { $sum: 1 }
          } 
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalNotifications,
      readNotifications,
      unreadNotifications,
      readRate: totalNotifications > 0 ? 
        Math.round((readNotifications / totalNotifications) * 100) : 0,
      notificationsByType,
      recentActivity
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // Helper function (not exported as route)
  createNotification,
  
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
};