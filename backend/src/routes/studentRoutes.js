// backend/src/routes/studentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User   from "../models/User.js";
import Exam   from "../models/Exam.js";
import Result from "../models/Result.js";

const router = express.Router();

/* ── Student dashboard ───────────────────────────────────────────────────── */
router.get("/dashboard", protect, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // count exams this student attempted
    const myResults    = await Result.find({ student: req.user.id });
    const totalAttempted = myResults.length;
    const totalPassed    = myResults.filter((r) => (r.percentage ?? 0) >= 40).length;

    // next upcoming published exam
    const upcomingExam = await Exam.findOne({
      isPublished: true,
      startTime:   { $gte: new Date() },
    }).sort({ startTime: 1 });

    res.json({
      name:          student.name,
      totalAttempted,
      totalPassed,
      upcomingExam:  upcomingExam
        ? { title: upcomingExam.title, startTime: upcomingExam.startTime }
        : null,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── Student exams list ──────────────────────────────────────────────────── */
// ✅ Returns plain array of published exams (matches what Exams.jsx expects)
router.get("/exams", protect, async (req, res) => {
  try {
    const exams = await Exam.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(exams);   // plain array, not { exams, message }
  } catch (err) {
    console.error("Exams fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;