import bcrypt from "bcryptjs";
import validator from "validator";

import User from "../models/User.js";
import OTP from "../models/OTP.js";
import generateToken from "../utils/generateToken.js";
import serializeUser from "../utils/serializeUser.js";

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const serverError = (res, error) => {
  console.error(error);
  return fail(res, 500, "Something went wrong. Please try again.");
};

// Email OTP verification is required unless explicitly disabled
const requireEmailVerification = () =>
  process.env.REQUIRE_EMAIL_VERIFICATION !== "false";

// =====================================================
// Customer Registration
// =====================================================

export const registerUser = async (req, res) => {
  try {
    const { fullName, phoneNumber, password } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!fullName?.trim() || !email || !password) {
      return fail(res, 400, "Please fill all required fields.");
    }

    if (!validator.isEmail(email)) {
      return fail(res, 400, "Invalid email address.");
    }

    if (password.length < 8) {
      return fail(res, 400, "Password must be at least 8 characters.");
    }

    if (phoneNumber && !/^[0-9+\-\s]{7,15}$/.test(phoneNumber)) {
      return fail(res, 400, "Enter a valid phone number.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return fail(res, 400, "An account with this email already exists.");
    }

    let emailVerified = false;

    const otpRecord = await OTP.findOne({
      email,
      purpose: "EMAIL_VERIFICATION",
      verified: true,
    });

    if (otpRecord) {
      emailVerified = true;
    } else if (requireEmailVerification()) {
      return fail(res, 400, "Please verify your email with the OTP first.");
    }

    // Role is always Customer for self-registration.
    // Staff accounts are created by admins.
    const user = await User.create({
      fullName: fullName.trim(),
      email,
      phoneNumber: phoneNumber?.trim() || "",
      password: await bcrypt.hash(password, 10),
      role: "Customer",
      emailVerified,
      lastLogin: new Date(),
    });

    await OTP.deleteMany({ email, purpose: "EMAIL_VERIFICATION" });

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token: generateToken(user._id),
      user: serializeUser(user),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =====================================================
// Login
// =====================================================

export const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return fail(res, 400, "Email and password are required.");
    }

    const user = await User.findOne({ email }).populate("organization");

    if (!user) {
      return fail(res, 401, "Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return fail(res, 401, "Invalid email or password.");
    }

    if (user.accountStatus !== "Active") {
      return fail(res, 403, "Your account is not active. Please contact support.");
    }

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token: generateToken(user._id),
      user: serializeUser(user),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =====================================================
// Get Logged In User
// =====================================================

export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: serializeUser(req.user),
  });
};

// =====================================================
// Update Profile
// =====================================================

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;

    const user = await User.findById(req.user._id).populate("organization");

    if (!user) return fail(res, 404, "User not found.");

    if (fullName !== undefined) {
      if (!fullName.trim()) return fail(res, 400, "Name cannot be empty.");
      user.fullName = fullName.trim();
    }

    if (phoneNumber !== undefined) {
      if (phoneNumber && !/^[0-9+\-\s]{7,15}$/.test(phoneNumber)) {
        return fail(res, 400, "Enter a valid phone number.");
      }
      user.phoneNumber = phoneNumber.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =====================================================
// Change Password
// =====================================================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return fail(res, 400, "New password must be at least 8 characters.");
    }

    const user = await User.findById(req.user._id);

    const matches =
      currentPassword && (await bcrypt.compare(currentPassword, user.password));

    if (!matches) {
      return fail(res, 400, "Current password is incorrect.");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};
