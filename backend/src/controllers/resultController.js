// C:\AI-Exam-System\backend\src\controllers\resultController.js
import Result from "../models/Result.js";
import Question from "../models/Question.js";
import AnswerKey from "../models/AnswerKey.js";

export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("exam", "title");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // ✅ Get answer key
    const answerKey = await AnswerKey.findOne({
      exam: result.exam._id,
    });

    // ✅ Get all questions of this exam
    const questions = await Question.find({
      exam: result.exam._id,
    });

    // ✅ Build detailed question data
    const questionResults = questions.map((q, index) => {
      const qId = q._id.toString();

      const selected = result.answers?.[qId];
      const correct = answerKey?.answers?.get(qId);

      return {
        questionNumber: index + 1,
        questionText: q.questionText,
        options: q.options,

        selectedOption: selected,
        correctOption: correct,

        status:
          selected === undefined
            ? "skipped"
            : selected === correct
            ? "correct"
            : "wrong",

        timeTaken: result.timePerQuestion?.[qId] || 0,
      };
    });

    // ✅ Stats
    const stats = {
      correctAnswers: questionResults.filter(q => q.status === "correct").length,
      wrongAnswers: questionResults.filter(q => q.status === "wrong").length,
      skippedQuestions: questionResults.filter(q => q.status === "skipped").length,
    };

    res.json({
      result: {
        _id: result._id,
        examTitle: result.exam.title,
        obtainedMarks: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        totalTimeSpent: result.totalTimeSpent,

        statistics: stats,
        questionResults,
      },
    });

  } catch (error) {
    console.error("🔥 getResultById ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};