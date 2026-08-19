// C:\AI-Exam-System\backend\src\routes\examRoutes.js
import express from "express";

import {
  createExam,
  addQuestion,
  addMultipleQuestions,
  getAllExams,
  startExam,
  publishExam,
  updateExamTiming,
  uploadAnswerKey,
  getStudentResult,
  updateQuestion,
  deleteQuestion,
  deleteExam,
  toggleResultRelease, 
} from "../controllers/examController.js";

import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", protect, getAllExams);

router.post(
  "/",
  protect,
  authorize("admin", "examiner"),
  createExam
);

router.post(
  "/:examId/question",
  protect,
  authorize("admin", "examiner"),
  addQuestion
);

router.post(
  "/:examId/questions",
  protect,
  authorize("admin", "examiner"),
  addMultipleQuestions
);

router.put(
  "/:examId/question/:questionId",
  protect,
  authorize("admin", "examiner"),
  updateQuestion
);

router.delete(
  "/:examId/question/:questionId",
  protect,
  authorize("admin", "examiner"),
  deleteQuestion
);

router.post(
  "/:examId/answer-key",
  protect,
  authorize("admin", "examiner"),
  uploadAnswerKey
);

router.patch(
  "/:examId/publish",
  protect,
  authorize("admin", "examiner"),
  publishExam
);


router.patch(
  "/:examId/toggle-results",
  protect,
  authorize("admin", "examiner"),
  toggleResultRelease
);

router.patch(
  "/:examId/timing",
  protect,
  authorize("admin", "examiner"),
  updateExamTiming
);

router.delete(
  "/:examId",
  protect,
  authorize("admin", "examiner"),
  deleteExam
);

router.get(
  "/:examId/start",
  protect,
  authorize("student"),
  startExam
);

router.get(
  "/:examId/result",
  protect,
  authorize("student"),
  getStudentResult
);

export default router;