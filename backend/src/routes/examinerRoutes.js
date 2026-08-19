// C:\AI-Exam-System\backend\src\routes\examinerRoutes.js
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import Submission from "../models/Submission.js";
import SecurityEvent from "../models/SecurityEvent.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("examiner", "admin"),
  async (req, res) => {
    try {
      const filter =
        req.user.role === "admin"
          ? {}
          : {
              $or: [
                { createdBy: req.user.id },
                { assignedExaminer: req.user.id },
              ],
            };

      const exams = await Exam.find(filter).lean();

      const activeExams = exams.filter(
        (exam) => exam.isPublished && !exam.resultReleased,
      );

      return res.json({
        examsCreated: exams.length,
        activeExams: activeExams.length,
        pendingKeys: activeExams.length,
      });
    } catch (error) {
      console.error("Examiner dashboard error:", error);

      return res.status(500).json({
        message: "Failed to load examiner dashboard",
      });
    }
  },
);

router.get(
  "/exams",
  protect,
  authorize("examiner", "admin"),
  async (req, res) => {
    try {
      const filter =
        req.user.role === "admin"
          ? {}
          : {
              $or: [
                { createdBy: req.user.id },
                { assignedExaminer: req.user.id },
              ],
            };

      const exams = await Exam.find(filter)
        .populate("createdBy", "name email role")
        .populate("assignedExaminer", "name email role")
        .sort({ createdAt: -1 });

      return res.json(exams);
    } catch (error) {
      console.error("Examiner exams error:", error);

      return res.status(500).json({
        message: "Failed to fetch exams",
      });
    }
  },
);

router.get(
  "/monitor/:examId",
  protect,
  authorize("examiner", "admin"),
  async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.examId);

      if (!exam) {
        return res.status(404).json({
          message: "Exam not found",
        });
      }

      if (req.user.role !== "admin") {
        const isOwner = exam.createdBy?.toString() === req.user.id.toString();

        const isAssigned =
          exam.assignedExaminer?.toString() === req.user.id.toString();

        if (!isOwner && !isAssigned) {
          return res.status(403).json({
            message: "Access denied",
          });
        }
      }

      const results = await Result.find({
        exam: exam._id,
      })
        .populate("student", "name email")
        .sort({ createdAt: -1 });

      const studentsData = results.map((result) => {
        const answers = result.answers
          ? Object.fromEntries(result.answers)
          : {};

        return {
          studentId: result.student?._id,
          name: result.student?.name,
          email: result.student?.email,
          answeredQuestions: Object.keys(answers).length,
          totalQuestions: exam.questions?.length || 0,
          submittedAt: result.createdAt,
          evaluated: result.evaluated,
          percentage: result.percentage ?? 0,
          status: result.evaluated ? "completed" : "submitted",
        };
      });

      return res.json({
        examTitle: exam.title,
        totalStudents: studentsData.length,
        studentsData,
      });
    } catch (error) {
      console.error("Exam monitor error:", error);

      return res.status(500).json({
        message: "Failed to monitor exam",
      });
    }
  },
);

router.get(
  "/monitor/:examId/security",
  protect,
  authorize("examiner", "admin"),
  async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.examId);

      if (!exam) {
        return res.status(404).json({
          message: "Exam not found",
        });
      }

      if (req.user.role !== "admin") {
        const isOwner = exam.createdBy?.toString() === req.user.id.toString();

        const isAssigned =
          exam.assignedExaminer?.toString() === req.user.id.toString();

        if (!isOwner && !isAssigned) {
          return res.status(403).json({
            message: "Access denied",
          });
        }
      }

      const events = await SecurityEvent.find({
        exam: exam._id,
      })
        .populate("student", "name email")
        .sort({ createdAt: -1 })
        .limit(500);

      return res.json(events);
    } catch (error) {
      console.error("Security monitoring error:", error);

      return res.status(500).json({
        message: "Failed to fetch security events",
      });
    }
  },
);

export default router;
