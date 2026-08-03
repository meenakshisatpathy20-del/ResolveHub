import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    disputeId: {
      type: String,
      unique: true,
    },

    transactionId: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    issueType: {
      type: String,
      required: true,
      enum: [
        "Payment Failed",
        "Duplicate Payment",
        "Refund Pending",
        "Unauthorized Transaction",
        "Chargeback",
        "Wrong Amount",
        "Merchant Issue",
        "Bank Issue",
        "Gateway Issue",
        "Other",
      ],
    },

    description: {
      type: String,
      required: true,
    },

    merchant: {
      type: String,
      required: true,
    },

    bank: {
      type: String,
      required: true,
    },

    paymentGateway: {
      type: String,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Open",
        "Under Review",
        "Awaiting Merchant",
        "Awaiting Bank",
        "Awaiting Customer",
        "Resolved",
        "Rejected",
      ],
      default: "Open",
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    evidence: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    timeline: [
      {
        action: String,
        performedBy: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    nextActionBy: {
      type: String,
      default: "Merchant",
    },

    slaDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

disputeSchema.pre("save", function (next) {
  if (!this.disputeId) {
    this.disputeId =
      "DSP-" +
      Math.floor(
        100000 + Math.random() * 900000
      );
  }

  next();
});

export default mongoose.model(
  "Dispute",
  disputeSchema
);