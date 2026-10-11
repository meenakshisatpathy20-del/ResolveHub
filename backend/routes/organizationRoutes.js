import express from "express";

import protect, { authorize } from "../middleware/authMiddleware.js";

import {
  createOrganization,
  updateOrganization,
  getOrganizations,
  getOrganizationById,
  getMembers,
  addMember,
  updateMemberStatus,
  deleteOrganization,
} from "../controllers/organizationController.js";

const router = express.Router();

router.use(protect);

// List (all logged-in users; admins get extra details)
router.get("/", getOrganizations);

router.post("/", authorize("Admin"), createOrganization);

router.get("/:id", getOrganizationById);

router.put("/:id", authorize("Admin"), updateOrganization);

router.delete("/:id", authorize("Admin"), deleteOrganization);

// Members (Admin, or OrganizationAdmin of that organization)
router.get(
  "/:id/members",
  authorize("Admin", "OrganizationAdmin"),
  getMembers
);

router.post(
  "/:id/members",
  authorize("Admin", "OrganizationAdmin"),
  addMember
);

router.put(
  "/:id/members/:userId/status",
  authorize("Admin", "OrganizationAdmin"),
  updateMemberStatus
);

export default router;
