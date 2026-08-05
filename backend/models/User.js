import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Customer | Employee | OrganizationAdmin | Admin
    role: {
      type: String,
      enum: [
        "Customer",
        "Employee",
        "OrganizationAdmin",
        "Admin",
      ],
      default: "Customer",
    },

    // Bank | Merchant | Payment Gateway | Logistics
    employeeRole: {
      type: String,
      enum: [
        "Bank",
        "Merchant",
        "Payment Gateway",
        "Logistics",
      ],
      default: null,
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    accountStatus: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Suspended",
      ],
      default: "Active",
    },

    profileImage: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "User",
  userSchema
);