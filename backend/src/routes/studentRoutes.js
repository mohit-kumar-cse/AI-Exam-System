// C:\AI-Exam-System\backend\src\routes\studentRoutes.js
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";

import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const student =
        await User.findById(req.user.id);

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      const results =
        await Result.find({
          student: req.user.id,
        });

      const totalAttempted =
        results.length;

      const totalPassed =
        results.filter(
          (result) =>
            (result.percentage ?? 0) >= 40
        ).length;

      const upcomingExam =
        await Exam.findOne({
          isPublished: true,
          startTime: {
            $gte: new Date(),
          },
        }).sort({
          startTime: 1,
        });

      return res.json({
        name: student.name,
        totalAttempted,
        totalPassed,
        upcomingExam: upcomingExam
          ? {
              _id: upcomingExam._id,
              title: upcomingExam.title,
              subject:
                upcomingExam.subject,
              startTime:
                upcomingExam.startTime,
              endTime:
                upcomingExam.endTime,
              duration:
                upcomingExam.duration,
            }
          : null,
      });
    } catch (error) {
      console.error(
        "Student dashboard error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load student dashboard",
      });
    }
  }
);

router.get(
  "/exams",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const exams =
        await Exam.find({
          isPublished: true,
        })
          .select("-questions.explanation")
          .sort({
            createdAt: -1,
          });

      return res.json(exams);
    } catch (error) {
      console.error(
        "Student exams error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch available exams",
      });
    }
  }
);

export default router;