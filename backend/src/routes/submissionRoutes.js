// backend/src/routes/submissionRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitExam,
  getSubmissionById,
} from "../controllers/submissionController.js";
import { verifyResult } from "../controllers/verifyController.js";

const router = express.Router();

/* ================= SUBMIT EXAM ================= */
router.post("/submit", protect, submitExam);

// ✅ FIX: /verify/:id MUST come BEFORE /:id
// Otherwise Express matches "verify" as the id param and hits getSubmissionById instead
/* ================= VERIFY RESULT ================= */
router.get("/verify/:id", verifyResult);

/* ================= GET SINGLE SUBMISSION ================= */
router.get("/:id", protect, getSubmissionById);

export default router;