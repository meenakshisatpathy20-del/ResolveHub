import mongoose from "mongoose";

export const DISPUTE_STATUSES = [
  "Open",
  "In Progress",
  "Awaiting Customer",
  "Awaiting Merchant",
  "Awaiting Bank",
  "Awaiting Gateway",
  "Resolved",
  "Rejected",
];

export const CLOSED_STATUSES = ["Resolved", "Rejected"];

export const DISPUTE_STAGES = [
  "Customer Submitted",
  "Merchant Review",
  "Bank Verification",
  "Gateway Verification",
  "Resolved",
  "Rejected",
];

export const ISSUE_TYPES = [
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
];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"];

// Days allowed to resolve a dispute, by priority
export const SLA_DAYS = {
  Low: 15,
  Medium: 10,
  High: 5,
  Critical: 2,
};

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
      trim: true,
    },

    transactionDate: {
      type: Date,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
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
    // Organizations involved in the transaction
    // ==========================================

    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    paymentGateway: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
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
      enum: DISPUTE_STAGES,
      default: "Customer Submitted",
    },

    // ==========================================
    // Issue
    // ==========================================

    issueType: {
      type: String,
      required: true,
      enum: ISSUE_TYPES,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    // ==========================================
    // Status
    // ==========================================

    status: {
      type: String,
      enum: DISPUTE_STATUSES,
      default: "Open",
    },

    priority: {
      type: String,
      enum: PRIORITIES,
      default: "Medium",
    },

    // ==========================================
    // Evidence
    // ==========================================

    evidence: [
      {
        fileName: String,

        // "local" files are served through an authorized endpoint,
        // "cloudinary" files are served from fileUrl
        storage: {
          type: String,
          enum: ["local", "cloudinary"],
          default: "local",
        },

        storedName: String,

        fileUrl: String,

        mimeType: String,

        size: Number,

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

        performedByName: String,

        remarks: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==========================================
    // Comments
    // ==========================================

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        userName: String,

        userRole: String,

        organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          default: null,
        },

        comment: {
          type: String,
          maxlength: 2000,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

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

disputeSchema.index({ customer: 1, createdAt: -1 });
disputeSchema.index({ merchant: 1 });
disputeSchema.index({ bank: 1 });
disputeSchema.index({ paymentGateway: 1 });
disputeSchema.index({ assignedEmployee: 1 });

disputeSchema.pre("save", function () {
  if (!this.disputeId) {
    const time = Date.now().toString(36).toUpperCase().slice(-5);
    const random = Math.random().toString(36).toUpperCase().slice(2, 5);

    this.disputeId = `DSP-${time}${random}`;
  }

  if (!this.slaDeadline) {
    const days = SLA_DAYS[this.priority] || 10;

    this.slaDeadline = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    );
  }
});

export default mongoose.model("Dispute", disputeSchema);
