// backend/src/controllers/verifyController.js
import Submission from "../models/Submission.js";
import { generateHash, verifySignature } from "../utils/security.js";

export const verifyResult = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (!submission.hash || !submission.signature) {
      return res.status(400).json({ message: "Submission has no integrity data" });
    }

    // ── Convert answers the SAME way as submissionController ─────────────────
    // submissionController received answers as plain object from req.body
    // MongoDB stores it as a Mongoose Map — must convert back to plain object
    // Then stableStringify in generateHash ensures key order doesn't matter
    const answersAsObject = submission.answers
      ? Object.fromEntries(submission.answers)
      : {};

    // ── Recalculate hash using EXACT same fields as submission time ───────────
    const recalculatedHash = generateHash({
      studentId:   submission.student.toString(),
      examId:      submission.exam.toString(),
      answers:     answersAsObject,
      submittedAt: submission.createdAt,   // same field used at submission time
    });

    const isHashValid      = recalculatedHash === submission.hash;
    const isSignatureValid = verifySignature(submission.hash, submission.signature);
    const valid            = isHashValid && isSignatureValid;

    res.json({
      valid,
      message: valid ? "Result is authentic and untampered" : "Result integrity check failed",
    });

  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};