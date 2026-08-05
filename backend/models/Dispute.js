import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    // ==========================================
    // Basic Information
    // ==========================================

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

    // ==========================================
    // Customer
    // ==========================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // Organizations
    // ==========================================

    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    paymentGateway: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // ==========================================
    // Current Assignment
    // ==========================================

    assignedOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    currentStage: {
      type: String,
      enum: [
        "Customer Submitted",

        "Merchant Review",

        "Bank Verification",

        "Gateway Verification",

        "Resolved",

        "Rejected",
      ],
      default: "Customer Submitted",
    },

    // ==========================================
    // Issue
    // ==========================================

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

    // ==========================================
    // Status
    // ==========================================

    status: {
      type: String,
      enum: [
        "Open",

        "In Progress",

        "Awaiting Customer",

        "Awaiting Merchant",

        "Awaiting Bank",

        "Awaiting Gateway",

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

    // ==========================================
    // Evidence
    // ==========================================

    evidence: [
      {
        fileName: String,

        fileUrl: String,

        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==========================================
    // Timeline
    // ==========================================

    timeline: [
      {
        stage: String,

        action: String,

        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        remarks: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==========================================
    // Internal Comments
    // ==========================================

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },

        comment: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    organization: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Organization",
  default: null,
},

    // ==========================================
    // SLA
    // ==========================================

    slaDeadline: Date,

    resolvedAt: Date,

    closedAt: Date,
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