import express from "express";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  createDispute,
  getMyDisputes,
  getDisputeById,
  updateDisputeStatus,
  addTimelineEntry,
  deleteDispute,
  getDashboardSummary,
} from "../controllers/disputeController.js";

const router = express.Router();

// Dashboard
router.get(
  "/dashboard-summary",
  protect,
  getDashboardSummary
);

// Disputes
router.post(
  "/",
  protect,
  upload.array("evidence", 5),
  createDispute
);

router.get(
  "/",
  protect,
  getMyDisputes
);

router.get(
  "/:id",
  protect,
  getDisputeById
);

router.put(
  "/:id/status",
  protect,
  updateDisputeStatus
);

router.post(
  "/:id/timeline",
  protect,
  addTimelineEntry
);

router.delete(
  "/:id",
  protect,
  deleteDispute
);

export default router;