// backend/src/routes/examRoutes.js
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
} from "../controllers/examController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =======================================================
   ADMIN AND EXAMINER ROUTES
======================================================= */

// Create exam
router.post("/", protect, createExam);

// Add single question to exam
router.post("/:examId/question", protect, addQuestion);

// Add multiple questions at once
router.post("/:examId/questions", protect, addMultipleQuestions);

// Update a specific question
router.put("/:examId/question/:questionId", protect, updateQuestion);

// Delete a specific question
router.delete("/:examId/question/:questionId", protect, deleteQuestion);

// Upload answer key — triggers auto-evaluation of all saved results
router.post("/:examId/answer-key", protect, uploadAnswerKey);

// Publish or unpublish exam
router.patch("/:examId/publish", protect, publishExam);

// Update exam start and end timing
router.patch("/:examId/timing", protect, updateExamTiming);

// Delete exam
router.delete("/:examId", protect, deleteExam);

/* =======================================================
   STUDENT ROUTES
======================================================= */

// Get all published exams
router.get("/", protect, getAllExams);

// Start exam — returns questions
router.get("/:examId/start", protect, startExam);

// Get student result for a specific exam
router.get("/:examId/result", protect, getStudentResult);

// NOTE: Exam submission is at POST /api/submissions/submit
// See: submissionRoutes.js and submissionController.js

export default router;