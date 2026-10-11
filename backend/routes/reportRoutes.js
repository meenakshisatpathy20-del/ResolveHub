import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getReportSummary,
  exportDisputesCsv,
} from "../controllers/reportController.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getReportSummary);

router.get("/export/csv", exportDisputesCsv);

export default router;
