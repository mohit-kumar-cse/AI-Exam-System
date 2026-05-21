// C:\AI-Exam-System\backend\src\routes\resultRoutes.js
import express from "express";
import Result from "../models/Result.js";
import AnswerKey from "../models/AnswerKey.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateResultPDF } from "../utils/generateResultPDF.js";
import { verifySignature } from "../utils/security.js";

// ✅ router initialized FIRST — always before any route definitions
const router = express.Router();

/* ==========================================
   GET MY RESULTS (LIST VIEW)
========================================== */
router.get("/my-results", protect, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate("exam")
      .sort({ createdAt: -1 });

    const formattedResults = [];

    for (const r of results) {
      const exam = r.exam;
      if (!exam) continue;

      const percentage =
        r.percentage != null && r.percentage !== 0
          ? r.percentage
          : r.totalMarks > 0
          ? parseFloat(((r.obtainedMarks / r.totalMarks) * 100).toFixed(2))
          : 0;

      formattedResults.push({
        _id: r._id,
        exam: exam._id,
        examTitle: exam.title,
        examSubject: exam.subject,
        totalMarks: r.totalMarks ?? 0,
        obtainedMarks: r.obtainedMarks ?? 0,
        percentage,
        rank: r.rank || "N/A",
        createdAt: r.createdAt,
        evaluated: r.evaluated ?? false,
      });
    }

    res.json(formattedResults);
  } catch (error) {
    console.error("🔥 My results fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================
   DOWNLOAD PDF
========================================== */
router.get("/:id/download-pdf", protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate({
      path: "exam",
      populate: { path: "questions" },
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const exam = result.exam;

    // Fetch submission for hash + signature
    const submission = result.submission
      ? await Submission.findById(result.submission)
      : null;

    // Fetch answer key to build question statuses
    const answerKey = await AnswerKey.findOne({ exam: exam._id });
    const answerKeyMap     = answerKey?.answers ? Object.fromEntries(answerKey.answers) : {};
    const resultAnswersMap = result.answers     ? Object.fromEntries(result.answers)    : {};
    const timeSpentMap     = result.timeSpent   ? Object.fromEntries(result.timeSpent)  : {};

    // Build question palette data
    const questions = exam.questions.map((q, i) => {
      const qId     = q._id.toString();
      const correct = answerKeyMap[qId];
      const selected = resultAnswersMap[qId];
      let status = "skipped";
      if (selected !== undefined && selected !== null) {
        status = selected === correct ? "correct" : "wrong";
      }
      return [`Q${i + 1}`, status];
    });

    // Total time spent
    let totalSecs = 0;
    for (const secs of Object.values(timeSpentMap)) {
      totalSecs += Number(secs) || 0;
    }
    const timeSpent = totalSecs > 0
      ? `${Math.floor(totalSecs / 60)} min ${totalSecs % 60}s`
      : "N/A";

    // Verify submission integrity
    let verified = false;
    if (submission?.hash && submission?.signature) {
      verified = verifySignature(submission.hash, submission.signature);
    }

    // Calculate correct/wrong/skipped counts
    let correctCount = 0, wrongCount = 0, skippedCount = 0;
    questions.forEach(([, status]) => {
      if (status === "correct") correctCount++;
      else if (status === "wrong") wrongCount++;
      else skippedCount++;
    });

    // Fetch full user from DB — JWT only has id/role, not name
    const fullUser = await User.findById(req.user.id).select("name email username rollNumber");
    const studentName = fullUser?.name || fullUser?.username || fullUser?.email || "Student";
    const studentId   = fullUser?.rollNumber || fullUser?.email || req.user.id?.toString() || "";

    // Build PDF data payload
    const pdfData = {
      examTitle:   exam.title,
      studentName,
      studentId,
      subject:     exam.subject || "",
      date:        new Date().toLocaleDateString("en-IN", {
                     day: "numeric", month: "long", year: "numeric"
                   }),
      score:       result.obtainedMarks ?? 0,
      total:       result.totalMarks ?? 0,
      percentage:  result.percentage ?? 0,
      correct:     correctCount,
      wrong:       wrongCount,
      skipped:     skippedCount,
      verified,
      hashVal:     submission?.hash || "N/A",
      rank:        result.rank || "N/A",
      timeSpent,
      questions,
    };

    // Generate and stream PDF directly to response
    generateResultPDF(pdfData, res);

  } catch (error) {
    console.error("🔥 PDF download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

/* ==========================================
   GET SINGLE RESULT (FULL ANALYSIS)
========================================== */
router.get("/:id", protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate({
      path: "exam",
      populate: { path: "questions" },
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const exam = result.exam;
    if (!exam) {
      return res.status(400).json({ message: "Exam missing" });
    }

    // Not yet evaluated
    if (!result.evaluated) {
      return res.json({
        result: {
          _id: result._id,
          submissionId: result.submission,
          examTitle: exam.title,
          obtainedMarks: null,
          totalMarks: null,
          percentage: 0,
          totalTimeSpent: 0,
          statistics: {
            totalQuestions:   exam.questions.length,
            correctAnswers:   0,
            wrongAnswers:     0,
            skippedQuestions: exam.questions.length,
          },
          questionResults: [],
          evaluated: false,
        },
        released: exam.resultReleased ?? false,
      });
    }

    const answerKey        = await AnswerKey.findOne({ exam: exam._id });
    const answerKeyMap     = answerKey?.answers ? Object.fromEntries(answerKey.answers) : {};
    const resultAnswersMap = result.answers     ? Object.fromEntries(result.answers)    : {};
    const timeSpentMap     = result.timeSpent   ? Object.fromEntries(result.timeSpent)  : {};

    let correct = 0, wrong = 0, skipped = 0;
    const questionResults = [];

    for (let i = 0; i < exam.questions.length; i++) {
      const q    = exam.questions[i];
      const qId  = q._id.toString();
      const correctAnswer = answerKeyMap[qId];
      const userAnswer    = resultAnswersMap[qId];

      let status = "skipped";
      if (userAnswer === undefined || userAnswer === null) { skipped++; }
      else if (userAnswer === correctAnswer)               { correct++; status = "correct"; }
      else                                                 { wrong++;   status = "wrong"; }

      questionResults.push({
        questionNumber: i + 1,
        questionText:   q.questionText || "No question available",
        options:        q.options || [],
        correctOption:  correctAnswer,
        selectedOption: userAnswer,
        timeTaken:      timeSpentMap[qId] || 0,
        status,
      });
    }

    const percentage =
      result.percentage != null && result.percentage !== 0
        ? result.percentage
        : result.totalMarks > 0
        ? parseFloat(((result.obtainedMarks / result.totalMarks) * 100).toFixed(2))
        : 0;

    res.json({
      result: {
        _id:          result._id,
        submissionId: result.submission,
        examTitle:    exam.title,
        obtainedMarks: result.obtainedMarks,
        totalMarks:    result.totalMarks,
        percentage,
        totalTimeSpent: result.totalTimeSpent || 0,
        statistics: {
          totalQuestions:   exam.questions.length,
          correctAnswers:   correct,
          wrongAnswers:     wrong,
          skippedQuestions: skipped,
        },
        questionResults,
        evaluated: result.evaluated,
      },
      released: exam.resultReleased ?? true,
    });
  } catch (error) {
    console.error("🔥 Single result error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;