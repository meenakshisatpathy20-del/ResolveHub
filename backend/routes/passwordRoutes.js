import express from "express";

import {
  sendResetOTP,
  verifyResetOTP,
  resetPassword,
} from "../controllers/passwordController.js";

const router = express.Router();

// Send OTP
router.post(
  "/send-reset-otp",
  sendResetOTP
);

// Verify OTP
router.post(
  "/verify-reset-otp",
  verifyResetOTP
);

// Reset Password
router.post(
  "/reset-password",
  resetPassword
);

export default router;