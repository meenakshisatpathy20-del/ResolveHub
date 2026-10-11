import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// Public Routes
// ===============================

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

// ===============================
// Protected Routes
// ===============================

router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);

export default router;