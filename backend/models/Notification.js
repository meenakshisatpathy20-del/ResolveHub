import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "Dispute",
        "Assignment",
        "Comment",
        "Organization",
        "System",
      ],
      default: "Dispute",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    dispute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispute",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ receiver: 1, createdAt: -1 });

export default mongoose.model(
  "Notification",
  notificationSchema
);