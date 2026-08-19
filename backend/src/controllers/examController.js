// C:\AI-Exam-System\backend\src\controllers\examController.js
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import AnswerKey from "../models/AnswerKey.js";

const canModifyExam = (exam, user) => {
  if (user.role === "admin") return true;

  return (
    user.role === "examiner" &&
    exam.createdBy?.toString() === user.id?.toString()
  );
};

 
 export const updateExamRanks = async (examId) => {
  try {
     
    const results = await Result.find({ exam: examId, evaluated: true }).sort({
      obtainedMarks: -1,
      totalTimeSpent: 1,
    });

    for (let i = 0; i < results.length; i++) {
      results[i].rank = i + 1;
      await results[i].save();
    }
  } catch (error) {
    console.error("Error updating exam ranks:", error);
  }
};

export const createExam = async (req, res) => {
  try {
    console.log("CREATE EXAM USER:", req.user);
    console.log("CREATE EXAM BODY:", JSON.stringify(req.body, null, 2));

    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    console.error("CREATE EXAM ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Exam validation failed",
        errors: Object.fromEntries(
          Object.entries(error.errors).map(([field, err]) => [
            field,
            err.message,
          ]),
        ),
      });
    }

    return res.status(500).json({
      message: "Failed to create exam",
      error: error.message,
    });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    exam.questions.push(req.body);
    await exam.save();

    res.json({
      message: "Question added successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addMultipleQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Questions must be a non-empty array",
      });
    }

    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    exam.questions.push(...questions);
    await exam.save();

    res.json({
      message: "Questions added successfully",
      totalQuestions: exam.questions.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllExams = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { isPublished: true } : {};

    const exams = await Exam.find(filter).sort({ createdAt: -1 });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can start exams",
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

    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const publishExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    exam.isPublished =
      req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true;

    await exam.save();

    res.json({
      message: `Exam ${
        exam.isPublished ? "published" : "unpublished"
      } successfully`,
      exam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleResultRelease = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    exam.resultReleased =
      req.body.resultReleased !== undefined
        ? Boolean(req.body.resultReleased)
        : true;

    await exam.save();

    res.json({
      message: `Results ${
        exam.resultReleased ? "released" : "hidden"
      } successfully`,
      exam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await exam.deleteOne();

    res.json({
      message: "Exam deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateExamTiming = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    exam.startTime = startTime || null;
    exam.endTime = endTime || null;

    await exam.save();

    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAnswerKey = async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Invalid answer key",
      });
    }

    await AnswerKey.findOneAndUpdate(
      { exam: exam._id },
      {
        exam: exam._id,
        answers,
      },
      {
        upsert: true,
        new: true,
      },
    );

    const results = await Result.find({
      exam: exam._id,
      evaluated: false,
    });

    for (const result of results) {
      let obtainedMarks = 0;
      let totalMarks = 0;

      for (const question of exam.questions) {
        const qId = question._id.toString();

        const correctOption = answers[qId];
        const selectedOption = result.answers?.get(qId);

        const marks = Number(question.marks || 0);
        const negativeMarks = Number(question.negativeMarks || 0);

        totalMarks += marks;

        if (selectedOption !== undefined && selectedOption !== null) {
          if (selectedOption === correctOption) {
            obtainedMarks += marks;
          } else {
            obtainedMarks -= negativeMarks;
          }
        }
      }

      const percentage =
        totalMarks > 0
          ? Number(((obtainedMarks / totalMarks) * 100).toFixed(2))
          : 0;

      result.obtainedMarks = obtainedMarks;
      result.totalMarks = totalMarks;
      result.percentage = percentage;
      result.evaluated = true;

     
      result.isReleased = true;
      result.releasedAt = new Date();

      await result.save();
    }
    await updateExamRanks(exam._id);

     
    exam.resultReleased = true;
    await exam.save();

    res.json({
      message:
        "Answer key uploaded, results evaluated, and ranks assigned successfully",
      totalStudentsEvaluated: results.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentResult = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    const result = await Result.findOne({
      student: req.user.id,
      exam: req.params.examId,
    });

    if (!result) {
      return res.status(404).json({
        message: "You have not attempted this exam",
      });
    }

    if (!exam.resultReleased) {
      return res.status(403).json({
        message: "Result coming soon. The examiner has not released them yet.",
      });
    }

    res.json({
      obtainedMarks: result.obtainedMarks,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      evaluated: result.evaluated,
      rank: result.rank,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const question = exam.questions.id(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const { questionText, options, marks, negativeMarks } = req.body;

    if (questionText !== undefined) {
      question.questionText = questionText;
    }

    if (options !== undefined) {
      question.options = options;
    }

    if (marks !== undefined) {
      question.marks = marks;
    }

    if (negativeMarks !== undefined) {
      question.negativeMarks = negativeMarks;
    }

    await exam.save();

    res.json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (!canModifyExam(exam, req.user)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const question = exam.questions.id(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    question.deleteOne();
    await exam.save();

    res.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
