import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notificationController.js";

const router = express.Router();

// Logged in user's notifications
router.get("/", protect, getNotifications);

// Unread badge count
router.get("/unread-count", protect, getUnreadCount);

// Mark all notifications as read (before /:id so it isn't captured)
router.put("/read-all", protect, markAllAsRead);

// Mark one notification as read
router.put("/:id/read", protect, markAsRead);

// Delete notification
router.delete("/:id", protect, deleteNotification);

export default router;