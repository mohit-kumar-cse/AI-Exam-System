// backend/src/controllers/examController.js
import Exam      from "../models/Exam.js";
import Result    from "../models/Result.js";
import AnswerKey from "../models/AnswerKey.js";

/* =====================================================
   CREATE EXAM (Admin / Examiner)
===================================================== */
export const createExam = async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   ADD SINGLE QUESTION (Admin / Examiner)
===================================================== */
export const addQuestion = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.questions.push(req.body);
    await exam.save();
    res.json({ message: "Question added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   ADD MULTIPLE QUESTIONS (Admin / Examiner)
===================================================== */
export const addMultipleQuestions = async (req, res) => {
  try {
    const { examId }    = req.params;
    const { questions } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(400).json({ message: "Questions must be a non-empty array" });

    exam.questions.push(...questions);
    await exam.save();

    res.json({
      message:        "Questions added successfully",
      totalQuestions: exam.questions.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET ALL EXAMS
   — Students see only published, non-expired exams
   — Examiners / Admins see all
===================================================== */
export const getAllExams = async (req, res) => {
  try {
    const role = req.user?.role;

    let exams;

    if (role === "student") {
      // only published exams — let frontend handle schedule display
      exams = await Exam.find({ isPublished: true });
    } else {
      // examiners and admins see everything
      exams = await Exam.find();
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   START EXAM (Student)
   — checks published + schedule window
===================================================== */
export const startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (!exam.isPublished)
      return res.status(400).json({ message: "Exam is not published yet" });

    // check schedule window if set
    if (exam.startTime && exam.endTime) {
      const now   = new Date();
      const start = new Date(exam.startTime);
      const end   = new Date(exam.endTime);

      if (now < start)
        return res.status(400).json({ message: "Exam has not started yet" });

      if (now > end)
        return res.status(400).json({ message: "Exam has ended" });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   PUBLISH / UNPUBLISH EXAM (Admin / Examiner)
===================================================== */
export const publishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.isPublished = req.body.isPublished !== undefined
      ? req.body.isPublished
      : true;
    await exam.save();

    res.json({
      message: `Exam ${exam.isPublished ? "published" : "unpublished"} successfully`,
      exam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   DELETE EXAM (Admin / Examiner)
===================================================== */
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   UPDATE EXAM TIMING (Admin / Examiner)
===================================================== */
export const updateExamTiming = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const exam = await Exam.findByIdAndUpdate(
      req.params.examId,
      { startTime, endTime },
      { new: true }
    );
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   UPLOAD ANSWER KEY & AUTO-EVALUATE RESULTS
===================================================== */
export const uploadAnswerKey = async (req, res) => {
  try {
    const { examId }  = req.params;
    const { answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // save answer key
    await AnswerKey.create({ exam: examId, answers });

    // evaluate all unevaluated results for this exam
    const results = await Result.find({ exam: examId });

    for (const result of results) {
      if (result.evaluated) continue;

      let obtainedMarks = 0;
      let totalMarks    = 0;

      exam.questions.forEach((question) => {
        const qId           = question._id.toString();
        const correctOption = answers[qId];
        const selectedOption = result.answers?.get(qId);

        totalMarks += question.marks;

        if (selectedOption !== undefined && selectedOption !== null) {
          if (selectedOption === correctOption) {
            obtainedMarks += question.marks;
          } else {
            obtainedMarks -= question.negativeMarks || 0;
          }
        }
      });

      const percentage = totalMarks > 0
        ? parseFloat(((obtainedMarks / totalMarks) * 100).toFixed(2))
        : 0;

      result.obtainedMarks = obtainedMarks;
      result.totalMarks    = totalMarks;
      result.percentage    = percentage;
      result.evaluated     = true;
      await result.save();
    }

    exam.resultReleased = true;
    await exam.save();

    res.json({
      message:                "Answer key uploaded and results evaluated successfully",
      totalStudentsEvaluated: results.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   GET STUDENT RESULT (Student)
===================================================== */
export const getStudentResult = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const result = await Result.findOne({ student: req.user.id, exam: examId });
    if (!result)
      return res.status(404).json({ message: "You have not attempted this exam" });

    if (!exam.resultReleased)
      return res.json({ message: "Result coming soon" });

    res.json({
      obtainedMarks: result.obtainedMarks,
      totalMarks:    result.totalMarks,
      percentage:    result.percentage,
      evaluated:     result.evaluated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   UPDATE QUESTION (Admin / Examiner)
===================================================== */
export const updateQuestion = async (req, res) => {
  try {
    const { examId, questionId }                        = req.params;
    const { questionText, options, marks, negativeMarks } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const question = exam.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    question.questionText  = questionText  ?? question.questionText;
    question.options       = options       ?? question.options;
    question.marks         = marks         ?? question.marks;
    question.negativeMarks = negativeMarks ?? question.negativeMarks;

    await exam.save();
    res.json({ message: "Question updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   DELETE QUESTION (Admin / Examiner)
===================================================== */
export const deleteQuestion = async (req, res) => {
  try {
    const { examId, questionId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.questions = exam.questions.filter(
      (q) => q._id.toString() !== questionId
    );
    await exam.save();
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};