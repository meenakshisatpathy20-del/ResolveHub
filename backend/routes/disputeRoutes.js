import express from "express";

import protect, { authorize } from "../middleware/authMiddleware.js";
import { uploadEvidence } from "../middleware/uploadMiddleware.js";

import {
  createDispute,
  getMyDisputes,
  getDisputeById,
  updateDisputeStatus,
  addTimelineEntry,
  addComment,
  addEvidence,
  downloadEvidence,
  deleteDispute,
  getDashboardSummary,
  assignDispute,
  getAssignableEmployees,
  getOrganizationDisputes,
  getAllDisputes,
} from "../controllers/disputeController.js";

const router = express.Router();

// Every dispute route requires login.
// Per-dispute permissions are checked inside the controller.
router.use(protect);

// =======================================
// Dashboard
// =======================================

router.get("/dashboard-summary", getDashboardSummary);

// =======================================
// Lists (role-scoped)
// =======================================

router.get("/", getMyDisputes);

router.get(
  "/organization/all",
  authorize("OrganizationAdmin", "Employee"),
  getOrganizationDisputes
);

router.get("/admin/all", authorize("Admin"), getAllDisputes);

// =======================================
// Create
// =======================================

router.post("/", authorize("Customer"), uploadEvidence, createDispute);

// =======================================
// Single dispute
// =======================================

router.get("/:id", getDisputeById);

router.delete("/:id", deleteDispute);

router.post("/:id/comments", addComment);

router.post("/:id/evidence", uploadEvidence, addEvidence);

router.get("/:id/evidence/:evidenceId", downloadEvidence);

// =======================================
// Organization / Admin actions
// =======================================

router.get(
  "/:id/assignable-employees",
  authorize("OrganizationAdmin", "Admin"),
  getAssignableEmployees
);

router.put(
  "/:id/assign",
  authorize("OrganizationAdmin", "Admin"),
  assignDispute
);

router.put(
  "/:id/status",
  authorize("OrganizationAdmin", "Employee", "Admin"),
  updateDisputeStatus
);

router.post(
  "/:id/timeline",
  authorize("OrganizationAdmin", "Employee", "Admin"),
  addTimelineEntry
);

export default router;
