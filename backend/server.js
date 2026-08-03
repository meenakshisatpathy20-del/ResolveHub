import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";

dotenv.config();

// =============================
// Database
// =============================

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

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =============================
// Health Check
// =============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ResolveHub Backend Running 🚀",
  });
});

// =============================
// Routes
// =============================

app.use("/api/auth", authRoutes);

app.use("/api/google", googleAuthRoutes);

app.use("/api/otp", otpRoutes);

app.use("/api/password", passwordRoutes);

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
// Start Server
// =============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 ResolveHub Server running on Port ${PORT}`
  );
});