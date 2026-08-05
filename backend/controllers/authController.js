import bcrypt from "bcryptjs";
import validator from "validator";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// =====================================================
// Customer Registration
// =====================================================

export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
    } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,

      role: "Customer",

      emailVerified: false,

      phoneVerified: false,
    });

    res.status(201).json({
      success: true,

      message: "Registration Successful",

      token: generateToken(user._id),

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =====================================================
// Login
// =====================================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email,
    }).populate("organization");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (
      user.accountStatus !== "Active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    user.lastLogin = new Date();

    await user.save();

    res.status(200).json({
      success: true,

      message: "Login Successful",

      token: generateToken(user._id),

      user: {
        id: user._id,

        fullName: user.fullName,

        email: user.email,

        role: user.role,

        employeeRole:
          user.employeeRole,

        organization:
          user.organization,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =====================================================
// Get Logged In User
// =====================================================

export const getProfile = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(req.user._id)
        .select("-password")
        .populate("organization");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =====================================================
// Update Profile
// =====================================================

export const updateProfile = async (
  req,
  res
) => {
  try {

    const {
      fullName,
      phoneNumber,
    } = req.body;

    const user =
      await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (fullName)
      user.fullName = fullName;

    if (phoneNumber)
      user.phoneNumber = phoneNumber;

    await user.save();

    res.status(200).json({
      success: true,

      message:
        "Profile updated successfully.",

      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};