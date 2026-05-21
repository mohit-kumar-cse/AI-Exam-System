// C:\AI-Exam-System\backend\src\controllers\submissionController.js
import Submission from "../models/Submission.js";
import AnswerKey from "../models/AnswerKey.js";
import Result from "../models/Result.js";
import { generateHash, generateSignature } from "../utils/security.js";
import { createLog } from "../utils/logger.js";

/* ================= SUBMIT EXAM ================= */
export const submitExam = async (req, res) => {
  try {
    const { examId, answers, timeSpent } = req.body;
    const studentId = req.user.id;

    console.log("📥 Incoming Submission:", req.body);

    /* ================= VALIDATION ================= */
    if (!examId || !answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Invalid examId or answers format",
      });
    }

    /* ================= PREVENT DUPLICATE ================= */
    const existing = await Submission.findOne({
      student: studentId,
      exam: examId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already submitted" });
    }

    /* ================= SAVE SUBMISSION FIRST (no hash yet) ================= */
    // Save first so MongoDB assigns the real createdAt timestamp
    // We need createdAt BEFORE hashing so verifyController can reproduce it
    const submission = await Submission.create({
      student: studentId,
      exam: examId,
      answers,
      isFinalized: true,
    });

    console.log("✅ Submission saved:", submission._id);

    /* ================= HASH + SIGNATURE (using real createdAt) ================= */
    // Convert answers to plain object for consistent JSON.stringify
    const answersAsObject =
      answers instanceof Map ? Object.fromEntries(answers) : answers;

    const dataToHash = {
      studentId: studentId.toString(),
      examId: examId.toString(),
      answers: answersAsObject,
      submittedAt: submission.createdAt, // ✅ real DB timestamp, reproducible
    };

    const hash = generateHash(dataToHash);
    const signature = generateSignature(hash);

    // Save hash + signature back to the submission record
    submission.hash = hash;
    submission.signature = signature;
    await submission.save();

    console.log("✅ Hash & signature saved");

    /* ================= FETCH ANSWER KEY ================= */
    const answerKey = await AnswerKey.findOne({ exam: examId });

    /* ================= NO ANSWER KEY → SAVE UNEVALUATED RESULT ================= */
    if (!answerKey) {
      console.log("⚠️ No answer key found. Saving unevaluated result.");

      const result = await Result.create({
        student: studentId,
        exam: examId,
        submission: submission._id,
        answers,
        timeSpent: timeSpent || {},
        obtainedMarks: null,
        totalMarks: null,
        percentage: 0,
        evaluated: false,
      });

      console.log("✅ Unevaluated result saved:", result._id);

      await createLog({
        user: studentId,
        action: "SUBMIT_EXAM",
        resource: examId,
        metadata: { evaluated: false, reason: "No answer key yet" },
      });

      return res.json({
        message: "Submitted successfully. Result will be available after the answer key is uploaded.",
        submissionId: submission._id,
        resultId: result._id,
      });
    }

    /* ================= EVALUATION ================= */
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const questionResults = [];

    // ✅ for..of on Map entries — forEach doesn't work on Mongoose Map
    for (const [qId, correctOption] of answerKey.answers.entries()) {
      const selectedOption = answersAsObject[qId];

      let status = "skipped";
      if (selectedOption === undefined || selectedOption === null) {
        skipped++;
        status = "skipped";
      } else if (selectedOption === correctOption) {
        correct++;
        status = "correct";
      } else {
        wrong++;
        status = "wrong";
      }

      questionResults.push({
        questionId: qId,
        selectedOption,
        correctOption,
        status,
        timeTaken: timeSpent?.[qId] || 0,
      });
    }

    const total = answerKey.answers.size;
    const percentage =
      total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0;

    /* ================= SAVE RESULT ================= */
    const result = await Result.create({
      student: studentId,
      exam: examId,
      submission: submission._id,
      answers,
      timeSpent: timeSpent || {},
      obtainedMarks: correct,
      totalMarks: total,
      percentage,
      evaluated: true,
    });

    console.log("✅ Result created:", result._id);

    /* ================= LOGGING ================= */
    await createLog({
      user: studentId,
      action: "SUBMIT_EXAM",
      resource: examId,
      metadata: { correct, wrong, skipped, percentage },
    });

    /* ================= RESPONSE ================= */
    res.json({
      message: "Submitted & evaluated successfully",
      submissionId: submission._id,
      resultId: result._id,
    });

  } catch (err) {
    console.error("❌ SUBMIT ERROR:", err);
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
};

/* ================= GET SUBMISSION BY ID ================= */
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    console.error("❌ FETCH SUBMISSION ERROR:", err);
    res.status(500).json({ message: "Error fetching submission", error: err.message });
  }
};