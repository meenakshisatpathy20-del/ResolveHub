import express from "express";

import protect, {
  authorize,
} from "../middleware/authMiddleware.js";

import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  assignEmployee,
  deleteOrganization,
} from "../controllers/organizationController.js";

const router = express.Router();

// =======================================
// Admin Only
// =======================================

// Create Organization
router.post(
  "/",
  protect,
  authorize("Admin"),
  createOrganization
);

// Get All Organizations
router.get(
  "/",
  protect,
  getOrganizations
);

// Get Single Organization
router.get(
  "/:id",
  protect,
  getOrganizationById
);

// Assign Employee
router.put(
  "/:id/assign",
  protect,
  authorize("Admin", "OrganizationAdmin"),
  assignEmployee
);

// Delete Organization
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteOrganization
);

export default router;