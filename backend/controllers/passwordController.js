import bcrypt from "bcryptjs";

import User from "../models/User.js";
import OTP from "../models/OTP.js";

import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";

// =======================================
// Send Reset Password OTP
// =======================================

export const sendResetOTP = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
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
      `Your password reset OTP is ${otp}. It expires in 5 minutes.`
    );

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
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

    const { email, otp } = req.body;

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

    const {
      email,
      otp,
      newPassword,
    } = req.body;

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