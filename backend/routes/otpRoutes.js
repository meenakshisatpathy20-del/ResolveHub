import express from "express";
import {
  sendEmailOTP,
  verifyEmailOTP,
} from "../controllers/otpController.js";

const router = express.Router();

router.post("/send-email-otp", sendEmailOTP);
router.post("/verify-email-otp", verifyEmailOTP);

export default router;