import express from "express";

import protect, {
  authorize,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import {
  createDispute,
  getMyDisputes,
  getDisputeById,
  updateDisputeStatus,
  addTimelineEntry,
  deleteDispute,
  getDashboardSummary,
  assignDispute,
  getOrganizationDisputes,
  getAllDisputes,
} from "../controllers/disputeController.js";

const router = express.Router();

// =======================================
// Dashboard
// =======================================

router.get(
  "/dashboard-summary",
  protect,
  getDashboardSummary
);

// =======================================
// Customer
// =======================================

// Raise Dispute
router.post(
  "/",
  protect,
  upload.array("evidence", 5),
  createDispute
);

// My Disputes
router.get(
  "/",
  protect,
  getMyDisputes
);

// Single Dispute
router.get(
  "/:id",
  protect,
  getDisputeById
);

// Delete
router.delete(
  "/:id",
  protect,
  deleteDispute
);

// =======================================
// Organization
// =======================================

// Assigned Cases
router.get(
  "/organization/all",
  protect,
  authorize(
    "OrganizationAdmin",
    "Employee"
  ),
  getOrganizationDisputes
);

// Assign Employee
router.put(
  "/:id/assign",
  protect,
  authorize(
    "OrganizationAdmin",
    "Admin"
  ),
  assignDispute
);

// Update Status
router.put(
  "/:id/status",
  protect,
  authorize(
    "OrganizationAdmin",
    "Employee",
    "Admin"
  ),
  updateDisputeStatus
);

// Timeline
router.post(
  "/:id/timeline",
  protect,
  authorize(
    "OrganizationAdmin",
    "Employee",
    "Admin"
  ),
  addTimelineEntry
);

// =======================================
// Admin
// =======================================

// View All Disputes
router.get(
  "/admin/all",
  protect,
  authorize("Admin"),
  getAllDisputes
);

export default router;