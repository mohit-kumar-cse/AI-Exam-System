import Submission from "../models/Submission.js";

import {
  generateHash,
  verifySignature,
} from "../utils/security.js";

export const verifyResult = async (req, res) => {
  try {
    const submission = await Submission.findById(
      req.params.id
    ).select("+hash +signature");

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    if (
      !submission.hash ||
      !submission.signature
    ) {
      return res.status(400).json({
        message:
          "Submission has no integrity data",
      });
    }

    const answers =
      submission.answers instanceof Map
        ? Object.fromEntries(
            submission.answers
          )
        : submission.answers || {};

    const recalculatedHash = generateHash({
      studentId:
        submission.student.toString(),

      examId:
        submission.exam.toString(),

      answers,

      submittedAt:
        submission.createdAt,
    });

    const isHashValid =
      recalculatedHash === submission.hash;

    let isSignatureValid = false;

    if (isHashValid) {
      try {
        isSignatureValid = verifySignature(
          submission.hash,
          submission.signature
        );
      } catch {
        isSignatureValid = false;
      }
    }

    const valid =
      isHashValid && isSignatureValid;

    return res.json({
      valid,

      hashValid: isHashValid,

      signatureValid:
        isSignatureValid,

      integrityVerified: valid,

      message: valid
        ? "Result is authentic and untampered"
        : "Result integrity check failed",
    });
  } catch (error) {
    console.error(
      "Verification error:",
      error
    );

    return res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};