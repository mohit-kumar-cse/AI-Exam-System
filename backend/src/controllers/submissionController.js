// C:\AI-Exam-System\backend\src\controllers\submissionController.js
import Submission from "../models/Submission.js";
import AnswerKey from "../models/AnswerKey.js";
import Result from "../models/Result.js";
import Exam from "../models/Exam.js";
import { updateExamRanks } from "./examController.js"; 

import {
  generateHash,
  generateSignature,
} from "../utils/security.js";

import { createLog } from "../utils/logger.js";

const getAnswersObject = (answers) => {
  if (answers instanceof Map) {
    return Object.fromEntries(answers);
  }

  if (
    answers &&
    typeof answers === "object" &&
    !Array.isArray(answers)
  ) {
    return answers;
  }

  return {};
};

const calculateTotalMarks = (exam) => {
  return exam.questions.reduce(
    (total, question) => total + Number(question.marks || 0),
    0
  );
};

const calculateUnanswered = (questions, answers) => {
  return questions.filter(
    (question) =>
      answers[question._id.toString()] === undefined ||
      answers[question._id.toString()] === null
  ).length;
};

const calculateTotalTime = (timeSpent) => {
  if (!timeSpent || typeof timeSpent !== "object") {
    return 0;
  }

  return Object.values(timeSpent).reduce(
    (total, value) => total + Math.max(0, Number(value) || 0),
    0
  );
};

export const submitExam = async (req, res) => {
  try {
    const { examId, answers, timeSpent = {} } = req.body;
    const studentId = req.user.id;

    if (!examId) {
      return res.status(400).json({
        message: "examId is required",
      });
    }

    if (
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        message: "Invalid answers format",
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    
    if (!exam.isPublished) {
      return res.status(403).json({
        message: "This exam is not published yet.",
      });
    }

    const now = new Date();

    if (exam.startTime && now < new Date(exam.startTime)) {
      return res.status(403).json({
        message: "This exam has not started yet.",
      });
    }

    if (exam.endTime && now > new Date(exam.endTime)) {
      return res.status(403).json({
        message: "This exam has already ended.",
      });
    }

     
    const existingSubmission = await Submission.findOne({
      student: studentId,
      exam: examId,
    });

    if (existingSubmission) {
      return res.status(409).json({
        message: "You have already submitted this exam",
        submissionId: existingSubmission._id,
      });
    }

    const answersObject = getAnswersObject(answers);

    
    for (const [questionId, selectedOption] of Object.entries(answersObject)) {
      if (
        !Number.isInteger(selectedOption) ||
        selectedOption < 0 ||
        selectedOption > 3
      ) {
        return res.status(400).json({
          message: `Invalid answer for question ${questionId}`,
        });
      }
    }

     
    const submission = await Submission.create({
      student: studentId,
      exam: examId,
      answers: answersObject,
      isFinalized: true,
      startedAt: null,
      submittedAt: now,
      completionReason: "manual_submit",
    });

    const hash = generateHash({
      studentId: studentId.toString(),
      examId: examId.toString(),
      answers: answersObject,
      submittedAt: submission.createdAt,
    });

    submission.hash = hash;
    submission.signature = generateSignature(hash);
    submission.integrityVerified = true;

    await submission.save();

     
    const answerKey = await AnswerKey.findOne({ exam: examId });

    
    if (!answerKey) {
      const result = await Result.create({
        student: studentId,
        exam: examId,
        submission: submission._id,
        answers: answersObject,
        timeSpent,
        totalTimeSpent: calculateTotalTime(timeSpent),
        obtainedMarks: null,
        totalMarks: exam.totalMarks || calculateTotalMarks(exam),
        percentage: 0,
        evaluated: false,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unanswered: calculateUnanswered(exam.questions, answersObject),
      });

       

      await createLog({
        user: studentId,
        action: "SUBMIT_EXAM",
        exam: examId,
        submission: submission._id,
        resource: examId,
        metadata: { evaluated: false },
        status: "success",
      });

      return res.status(201).json({
        message: "Exam submitted successfully. Results will be available once evaluated and released.",
        submissionId: submission._id,
        resultId: result._id,
      });
    }

     
    let obtainedMarks = 0;
    let totalMarks = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    for (const question of exam.questions) {
      const questionId = question._id.toString();
      const selected = answersObject[questionId];

      
      const correctOption = answerKey.answers?.get
        ? answerKey.answers.get(questionId)
        : answerKey.answers?.[questionId];

      const marks = Number(question.marks || 0);
      const negativeMarks = Number(question.negativeMarks || 0);

      totalMarks += marks;

      if (selected === undefined || selected === null) {
        skipped++;
        continue;
      }

      if (selected === correctOption) {
        correct++;
        obtainedMarks += marks;
      } else {
        wrong++;
        obtainedMarks -= negativeMarks;
      }
    }

    const percentage =
      totalMarks > 0
        ? Number(Math.max(0, (obtainedMarks / totalMarks) * 100).toFixed(2))
        : 0;

    const result = await Result.create({
      student: studentId,
      exam: examId,
      submission: submission._id,
      answers: answersObject,
      timeSpent,
      totalTimeSpent: calculateTotalTime(timeSpent),
      obtainedMarks,
      totalMarks,
      percentage,
      evaluated: true,
      evaluatedAt: new Date(),
      correctAnswers: correct,
      incorrectAnswers: wrong,
      unanswered: skipped,
    });
    
    await updateExamRanks(examId);

    await createLog({
      user: studentId,
      action: "SUBMIT_EXAM",
      exam: examId,
      submission: submission._id,
      resource: examId,
      metadata: {
        correct,
        wrong,
        skipped,
        obtainedMarks,
        totalMarks,
        percentage,
      },
      status: "success",
    });

    return res.status(201).json({
      message: exam.resultReleased
        ? "Exam submitted and evaluated successfully."
        : "Exam submitted successfully. Results will be visible once released by the examiner.",
      submissionId: submission._id,
      resultId: result._id,
    });
  } catch (error) {
    console.error("SUBMIT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted this exam",
      });
    }

    return res.status(500).json({
      message: "Submission failed",
      error: error.message,
    });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const isOwner = submission.student.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";
    const isExaminer = req.user.role === "examiner";

    if (!isOwner && !isAdmin && !isExaminer) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    return res.json({
      submission,
    });
  } catch (error) {
    console.error("getSubmissionById ERROR:", error);

    return res.status(500).json({
      message: "Error fetching submission",
      error: error.message,
    });
  }
};