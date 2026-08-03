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

    organizationName: {
      type: String,
      required: true,
      trim: true,
    },

    organizationType: {
      type: String,
      enum: [
        "Customer",
        "Bank",
        "Merchant",
        "Payment Gateway",
        "E-commerce Platform",
        "Logistics Partner",
      ],
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
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
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },

    profileImage: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;