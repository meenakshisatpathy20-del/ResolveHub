import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";

dotenv.config();

connectDB();

const app = express();

// =============================
// Middleware
// =============================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// Routes
// =============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ResolveHub Backend Running 🚀",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/otp", otpRoutes);

app.use("/api/disputes", disputeRoutes);

// =============================
// 404
// =============================

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// =============================
// Server
// =============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});