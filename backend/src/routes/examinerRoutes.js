// backend/src/routes/examinerRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";
import Exam   from "../models/Exam.js";
import Result from "../models/Result.js";

const router = express.Router();

/* ── Dashboard stats ─────────────────────────────────────────────────────── */
router.get("/dashboard", protect, authorize("examiner", "admin"), async (req, res) => {
  try {
    const exams       = await Exam.find({ createdBy: req.user.id });
    const activeExams = exams.filter((e) => e.isPublished && !e.resultReleased);
    const pendingKeys = exams.filter((e) => {
      // exams that are published, have submissions, but no answer key uploaded yet
      return e.isPublished && !e.resultReleased;
    });

    res.json({
      examsCreated: exams.length,
      activeExams:  activeExams.length,
      pendingKeys:  pendingKeys.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Get all exams for this examiner ─────────────────────────────────────── */
router.get("/exams", protect, authorize("examiner", "admin"), async (req, res) => {
  try {
    // ✅ Filter by createdBy so examiner only sees their own exams
    // Admin sees all
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    const exams  = await Exam.find(filter).sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Live monitor ────────────────────────────────────────────────────────── */
router.get("/monitor/:examId", protect, authorize("examiner", "admin"), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const results = await Result.find({ exam: req.params.examId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    const studentsData = results.map((r) => ({
      studentId:        r.student?._id,
      name:             r.student?.name,
      email:            r.student?.email,
      answeredQuestions: r.answers ? r.answers.size || Object.keys(r.answers).length : 0,
      totalQuestions:   exam.questions?.length || 0,
      submittedAt:      r.createdAt,
      status:           r.evaluated ? "completed" : "submitted",
    }));

    res.json({
      examTitle:     exam.title,
      totalStudents: studentsData.length,
      studentsData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;