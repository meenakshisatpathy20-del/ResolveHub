import bcrypt from "bcryptjs";

import User from "../models/User.js";
import OTP from "../models/OTP.js";

import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";
import { isDemoAccount, DEMO_LOCKED_MESSAGE } from "../utils/demoAccounts.js";

// =======================================
// Send Reset Password OTP
// =======================================

export const sendResetOTP = async (
  req,
  res
) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email,
    });

    // Same response whether or not the account exists,
    // so this endpoint can't be used to discover registered emails.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP has been sent.",
      });
    }

    await OTP.deleteMany({
      email,
      purpose: "FORGOT_PASSWORD",
    });

    const otp = generateOTP();

    await OTP.create({
      email,

      otp,

      purpose: "FORGOT_PASSWORD",

      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      ),
    });

    await sendEmail(
      email,
      "ResolveHub Password Reset",
      `<div style="font-family:Arial,sans-serif;padding:20px">
        <h2 style="color:#2563eb;">ResolveHub password reset</h2>
        <p>Your password reset OTP is:</p>
        <h1 style="letter-spacing:5px;">${otp}</h1>
        <p>It expires in <strong>5 minutes</strong>. If you didn't request this, ignore this email.</p>
      </div>`
    );

    res.status(200).json({
      success: true,
      message: "If this email is registered, an OTP has been sent.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =======================================
// Verify Reset OTP
// =======================================

export const verifyResetOTP = async (
  req,
  res
) => {

  try {

    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.toString().trim();

    const record = await OTP.findOne({
      email,
      otp,
      purpose: "FORGOT_PASSWORD",
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    record.verified = true;

    await record.save();

    res.status(200).json({
      success: true,
      message: "OTP Verified",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =======================================
// Reset Password
// =======================================

export const resetPassword = async (
  req,
  res
) => {

  try {

    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.toString().trim();
    const { newPassword } = req.body;

    const record = await OTP.findOne({
      email,
      otp,
      purpose: "FORGOT_PASSWORD",
      verified: true,
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP Verification Required",
      });
    }

    if (isDemoAccount(email)) {
      return res.status(403).json({
        success: false,
        message: DEMO_LOCKED_MESSAGE,
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      }
    );

    await OTP.deleteMany({
      email,
      purpose: "FORGOT_PASSWORD",
    });

    res.status(200).json({
      success: true,
      message: "Password Reset Successful",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};