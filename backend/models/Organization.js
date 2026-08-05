import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    organizationType: {
      type: String,
      enum: [
        "Bank",
        "Merchant",
        "Payment Gateway",
        "E-commerce Platform",
        "Logistics Partner",
      ],
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Organization",
  organizationSchema
);