// C:\AI-Exam-System\backend\src\routes\resultRoutes.js
import express from "express";

import Result from "../models/Result.js";
import AnswerKey from "../models/AnswerKey.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";

import { protect } from "../middleware/authMiddleware.js";
import { generateResultPDF } from "../utils/generateResultPDF.js";
import { verifySignature } from "../utils/security.js";
import {
  generateAIInsights,
  getAIInsights,
} from "../controllers/resultController.js";

const router = express.Router();



router.get("/my-results", protect, async (req, res) => {
  try {
    const results = await Result.find({
      student: req.user.id,
    })
      .populate("exam", "title subject resultReleased")
      .sort({ createdAt: -1 });

    const formattedResults = results
      .filter((result) => result.exam)
      .map((result) => {
        const percentage =
          result.percentage != null
            ? result.percentage
            : result.totalMarks > 0
              ? Number(
                  ((result.obtainedMarks / result.totalMarks) * 100).toFixed(2),
                )
              : 0;

        return {
          _id: result._id,
          exam: result.exam._id,
          examTitle: result.exam.title,
          examSubject: result.exam.subject,
          totalMarks: result.totalMarks ?? 0,
          obtainedMarks: result.obtainedMarks ?? 0,
          percentage,
          rank: result.rank ?? "N/A",
          createdAt: result.createdAt,
          evaluated: result.evaluated ?? false,
          isReleased:
            result.exam.resultReleased === true ||  
            result.isReleased === true,
        };
      });

    return res.json(formattedResults);
  } catch (error) {
    console.error("My results error:", error);

    return res.status(500).json({
      message: "Failed to fetch results",
    });
  }
});



router.get("/:id/ai-insights", protect, getAIInsights);

router.post("/:id/ai-insights", protect, generateAIInsights);



router.get("/:id/download-pdf", protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate("exam");

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      result.student.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!result.evaluated) {
      return res.status(400).json({
        message: "Result has not been evaluated yet",
      });
    }

    const exam = result.exam;

    if (!exam) {
      return res.status(400).json({
        message: "Exam missing",
      });
    }

    const submission = result.submission
      ? await Submission.findById(result.submission).select("+hash +signature")
      : null;

    const answerKey = await AnswerKey.findOne({
      exam: exam._id,
    }).select("+hash");

    const answerKeyMap = answerKey?.answers
      ? Object.fromEntries(answerKey.answers)
      : {};

    const resultAnswersMap = result.answers
      ? Object.fromEntries(result.answers)
      : {};

    const timeSpentMap = result.timeSpent
      ? Object.fromEntries(result.timeSpent)
      : {};

    const questions = exam.questions.map((question, index) => {
      const qId = question._id.toString();

      const selected = resultAnswersMap[qId];

      const correct = answerKeyMap[qId];

      let status = "skipped";

      if (selected !== undefined && selected !== null) {
        status = selected === correct ? "correct" : "wrong";
      }

      return [`Q${index + 1}`, status];
    });

    const totalSeconds = Object.values(timeSpentMap).reduce(
      (total, value) => total + (Number(value) || 0),
      0,
    );

    const timeSpent =
      totalSeconds > 0
        ? `${Math.floor(totalSeconds / 60)} min ${totalSeconds % 60}s`
        : "N/A";

    let verified = false;

    if (submission?.hash && submission?.signature) {
      try {
        verified = verifySignature(submission.hash, submission.signature);
      } catch {
        verified = false;
      }
    }

    const correctCount = questions.filter(
      ([, status]) => status === "correct",
    ).length;

    const wrongCount = questions.filter(
      ([, status]) => status === "wrong",
    ).length;

    const skippedCount = questions.filter(
      ([, status]) => status === "skipped",
    ).length;

    const user = await User.findById(result.student).select("name email");

    const studentName = user?.name || user?.email || "Student";

    const studentId = user?.email || result.student.toString();

    generateResultPDF(
      {
        examTitle: exam.title,
        studentName,
        studentId,
        subject: exam.subject || "",
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        score: result.obtainedMarks ?? 0,
        total: result.totalMarks ?? 0,
        percentage: result.percentage ?? 0,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        verified,
        hashVal: submission?.hash || "N/A",
        rank: result.rank || "N/A",
        timeSpent,
        questions,
      },
      res,
    );
  } catch (error) {
    console.error("Result PDF error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate result PDF",
      });
    }
  }
});



router.get("/:id", protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate("exam");

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      result.student.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const exam = result.exam;

    if (!exam) {
      return res.status(400).json({
        message: "Exam missing",
      });
    }

    if (!result.evaluated || !exam.resultReleased) {
      return res.json({
        result: {
          _id: result._id,
          submissionId: result.submission,
          examTitle: exam.title,
          obtainedMarks:
            result.evaluated && exam.resultReleased
              ? result.obtainedMarks
              : null,
          totalMarks:
            result.evaluated && exam.resultReleased ? result.totalMarks : null,
          percentage:
            result.evaluated && exam.resultReleased ? result.percentage : 0,
          totalTimeSpent: result.totalTimeSpent || 0,
          statistics: {
            totalQuestions: exam.questions.length,
            correctAnswers: 0,
            wrongAnswers: 0,
            skippedQuestions: exam.questions.length,
          },
          questionResults: [],
          evaluated: result.evaluated,
        },
        released: exam.resultReleased ?? false,
      });
    }

    const answerKey = await AnswerKey.findOne({
      exam: exam._id,
    });

    const answerKeyMap = answerKey?.answers
      ? Object.fromEntries(answerKey.answers)
      : {};

    const resultAnswersMap = result.answers
      ? Object.fromEntries(result.answers)
      : {};

    const timeSpentMap = result.timeSpent
      ? Object.fromEntries(result.timeSpent)
      : {};

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const questionResults = exam.questions.map((question, index) => {
      const qId = question._id.toString();

      const correctOption = answerKeyMap[qId];

      const selectedOption = resultAnswersMap[qId];

      let status = "skipped";

      if (selectedOption === undefined || selectedOption === null) {
        skipped++;
      } else if (selectedOption === correctOption) {
        correct++;
        status = "correct";
      } else {
        wrong++;
        status = "wrong";
      }

      return {
        questionNumber: index + 1,
        questionText: question.questionText,
        options: question.options,
        correctOption,
        selectedOption,
        timeTaken: timeSpentMap[qId] || 0,
        status,
      };
    });

    return res.json({
      result: {
        _id: result._id,
        submissionId: result.submission,
        examTitle: exam.title,
        obtainedMarks: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        totalTimeSpent: result.totalTimeSpent || 0,
        statistics: {
          totalQuestions: exam.questions.length,
          correctAnswers: correct,
          wrongAnswers: wrong,
          skippedQuestions: skipped,
        },
        questionResults,
        evaluated: result.evaluated,
      },
      released: exam.resultReleased ?? false,
    });
  } catch (error) {
    console.error("Get result error:", error);

    return res.status(500).json({
      message: "Failed to fetch result",
    });
  }
});

export default router;
