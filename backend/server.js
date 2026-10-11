// Must be the first import so every module sees the environment variables
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// Behind a load balancer / reverse proxy in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// =============================
// Middleware
// =============================

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Brute-force protection on login, signup and OTP endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

// =============================
// Health Check
// =============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ResolveHub Backend Running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;

  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    database: dbUp ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
  });
});

// =============================
// Routes
// =============================

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/google", authLimiter, googleAuthRoutes);
app.use("/api/otp", authLimiter, otpRoutes);
app.use("/api/password", authLimiter, passwordRoutes);

app.use("/api/disputes", disputeRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

// =============================
// 404 (must be after all routes)
// =============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// =============================
// Error handler
// =============================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body." });
  }

  res.status(err.status || 500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
});

// =============================
// Start Server
// =============================

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 ResolveHub Server running on Port ${PORT}`);
  });
};

start();

export default app;
