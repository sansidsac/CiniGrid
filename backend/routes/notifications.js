import express from "express";
import Notification from "../models/Notification.js";
import Scene from "../models/Scene.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get notifications for a user (demo - no auth required)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId, page = 1, limit = 20, unreadOnly = false } = req.query;

    // Build query
    const query = { recipientId: userId };
    if (projectId) {
      query.projectId = projectId;
    }
    if (unreadOnly === 'true') {
      query.read = false;
    }

    // Execute query with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("sentBy", "username")
      .populate("projectId", "title");

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadQuery = { recipientId: userId, read: false };
    if (projectId) {
      unreadQuery.projectId = projectId;
    }
    const unreadCount = await Notification.countDocuments(unreadQuery);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message
    });
  }
});

// Mark notification as read (demo - no auth required)
router.patch("/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Mark as read (simplified for demo)
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message
    });
  }
});

// Mark all notifications as read for a user
router.patch("/user/:userId/read-all", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId } = req.query;

    // Build query
    const query = { 
      recipientId: userId,
      read: false
    };
    if (projectId) {
      query.projectId = projectId;
    }

    // Update all unread notifications
    const result = await Notification.updateMany(
      query,
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read",
      error: error.message
    });
  }
});

// Create schedule notification (demo - send to all users, no auth required)
router.post("/schedule", async (req, res) => {
  try {
    const { itemId, itemType, projectId } = req.body;

    // Validate input
    if (!itemId || !itemType || !projectId) {
      return res.status(400).json({
        success: false,
        message: "itemId, itemType, and projectId are required"
      });
    }

    if (!['scene', 'task'].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "itemType must be 'scene' or 'task'"
      });
    }

    // For demo: Send notifications to all users in the database
    const allUsers = await User.find({});
    
    if (allUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found in database"
      });
    }

    // Create dummy item data for testing
    const dummyItem = {
      title: `Test ${itemType === 'scene' ? 'Scene' : 'Task'} - ${new Date().toLocaleTimeString()}`,
      scheduledDate: new Date().toISOString().split('T')[0], // Today's date
      scheduledTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    // Create notification for each user
    const notifications = [];
    for (const user of allUsers) {
      const notification = new Notification({
        type: 'schedule_reminder',
        title: `Schedule Update: ${dummyItem.title}`,
        message: `${itemType === 'scene' ? 'Scene' : 'Task'} "${dummyItem.title}" has been scheduled. Please check your dashboard for details.`,
        recipientId: user._id,
        sentBy: user._id, // For demo, use the same user as sender
        projectId: projectId,
        data: {
          itemId: itemId,
          itemType: itemType,
          itemTitle: dummyItem.title,
          scheduledDate: dummyItem.scheduledDate,
          scheduledTime: dummyItem.scheduledTime,
          scheduleInfo: `${itemType === 'scene' ? 'Scene' : 'Task'} notification sent on ${new Date().toLocaleDateString()}`
        },
        read: false
      });
      
      await notification.save();
      notifications.push(notification);
    }

    res.json({
      success: true,
      message: `Schedule notification sent to ${notifications.length} users`,
      data: {
        notificationCount: notifications.length,
        itemTitle: dummyItem.title,
        itemType: itemType
      }
    });
  } catch (error) {
    console.error("Error creating schedule notification:", error);
    res.status(500).json({
      success: false,
      message: "Error creating schedule notification",
      error: error.message
    });
  }
});

// Delete notification (demo - no auth required)
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message
    });
  }
});

// Get unread notification count for a user (demo - no auth required)
router.get("/user/:userId/unread-count", async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId } = req.query;

    const query = { 
      recipientId: userId,
      read: false
    };
    if (projectId) {
      query.projectId = projectId;
    }

    const unreadCount = await Notification.countDocuments(query);

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error getting unread count",
      error: error.message
    });
  }
});

export default router;