import express from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================
// Authentication
// ======================

router.post("/register", registerUser);

router.post("/login", loginUser);

// ======================
// Protected Routes
// ======================

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;