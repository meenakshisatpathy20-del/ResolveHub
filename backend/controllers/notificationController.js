import mongoose from "mongoose";
import Notification from "../models/Notification.js";

// =======================================
// Get Logged In User Notifications
// =======================================

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("dispute", "disputeId status");

    const unread = await Notification.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unread,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Unread Count
// =======================================

export const getUnreadCount = async (req, res) => {
  try {
    const unread = await Notification.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.status(200).json({ success: true, unread });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Mark Notification As Read
// =======================================

export const markAsRead = async (req, res) => {
  try {
    const notification = mongoose.Types.ObjectId.isValid(req.params.id)
      ? await Notification.findById(req.params.id)
      : null;

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (
      notification.receiver.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Mark All Notifications As Read
// =======================================

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        receiver: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Delete Notification
// =======================================

export const deleteNotification = async (
  req,
  res
) => {
  try {
    const notification = mongoose.Types.ObjectId.isValid(req.params.id)
      ? await Notification.findById(req.params.id)
      : null;

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (
      notification.receiver.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized."
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};