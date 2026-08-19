// C:\AI-Exam-System\backend\src\routes\submissionRoutes.js
import express from "express";

import {
  submitExam,
  getSubmissionById,
} from "../controllers/submissionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { verifyResult } from "../controllers/verifyController.js";

const router = express.Router();



router.post(
  "/submit",
  protect,
  submitExam
);


router.get(
  "/verify/:id",
  verifyResult
);



router.get(
  "/:id",
  protect,
  getSubmissionById
);

export default router;