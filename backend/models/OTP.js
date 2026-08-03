import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: [
        "EMAIL_VERIFICATION",
        "FORGOT_PASSWORD",
        "LOGIN_OTP",
      ],
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired OTPs
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Fast lookup for verification
otpSchema.index({
  email: 1,
  purpose: 1,
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;