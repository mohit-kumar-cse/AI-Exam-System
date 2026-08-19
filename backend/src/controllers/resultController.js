// C:\AI-Exam-System\backend\src\controllers\resultController.js
import Result from "../models/Result.js";
import AnswerKey from "../models/AnswerKey.js";
import Exam from "../models/Exam.js";
import AIAnalysis from "../models/AIAnalysis.js";
import ai, { GEMINI_MODEL } from "../config/gemini.js";

 
export const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate({
        path: "exam",
        select: "title subject resultReleased totalMarks",
      })
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate(
      "exam",
      "title questions resultReleased",
    );

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (
      req.user.role === "student" &&
      result.student.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const exam = result.exam;

    if (!exam) {
      return res
        .status(404)
        .json({ message: "Exam associated with result not found" });
    }

    if (req.user.role === "student" && !exam.resultReleased) {
      return res.status(403).json({
        message:
          "Your exam was submitted successfully, but the examiner has not released the results yet.",
      });
    }

    const answerKey = await AnswerKey.findOne({
      exam: exam._id,
    }).select("+hash");

    const answers =
      result.answers instanceof Map
        ? Object.fromEntries(result.answers)
        : result.answers || {};

    const timeSpent =
      result.timeSpent instanceof Map
        ? Object.fromEntries(result.timeSpent)
        : result.timeSpent || {};

    const questionResults = exam.questions.map((question, index) => {
      const questionId = question._id.toString();

      const selected = answers[questionId];
      const correct = answerKey?.answers?.get(questionId);

      let status = "skipped";

      if (selected !== undefined && selected !== null) {
        status =
          correct !== undefined && selected === correct ? "correct" : "wrong";
      }

      return {
        questionNumber: index + 1,
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        topic: question.topic,
        difficulty: question.difficulty,

        selectedOption: selected !== undefined ? selected : null,
        correctOption: correct !== undefined ? correct : null,

        status,
        timeTaken: Number(timeSpent[questionId] || 0),
      };
    });

    const statistics = {
      correctAnswers: questionResults.filter(
        (question) => question.status === "correct",
      ).length,

      wrongAnswers: questionResults.filter(
        (question) => question.status === "wrong",
      ).length,

      skippedQuestions: questionResults.filter(
        (question) => question.status === "skipped",
      ).length,
    };

    return res.json({
      result: {
        _id: result._id,
        student: result.student,

        exam: exam._id,
        examTitle: exam.title,

        obtainedMarks: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: result.percentage,

        totalTimeSpent: result.totalTimeSpent,

        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        unanswered: result.unanswered,

        evaluated: result.evaluated,
        evaluatedAt: result.evaluatedAt,

         
        isReleased: exam.resultReleased === true || result.isReleased === true,

        resultReleased: exam.resultReleased === true,

        releasedAt:
          exam.resultReleased === true ? exam.updatedAt : result.releasedAt,

        aiAnalyzed: result.aiAnalyzed,

        statistics,
        questionResults,
      },
    });
  } catch (error) {
    console.error("getResultById ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch result",
      error: error.message,
    });
  }
};

const buildPerformanceBreakdown = (
  examQuestions,
  answerKeyAnswers,
  studentAnswers,
) => {
  const topicMap = new Map();

  const difficultyMap = {
    easy: { attempted: 0, correct: 0, incorrect: 0, marks: 0 },
    medium: { attempted: 0, correct: 0, incorrect: 0, marks: 0 },
    hard: { attempted: 0, correct: 0, incorrect: 0, marks: 0 },
  };

  for (const question of examQuestions) {
    const qId = question._id.toString();
    const selected = studentAnswers[qId];

    const correctOption = answerKeyAnswers?.get
      ? answerKeyAnswers.get(qId)
      : answerKeyAnswers?.[qId];

    const topic = question.topic || "General";
    const difficulty = ["easy", "medium", "hard"].includes(question.difficulty)
      ? question.difficulty
      : "medium";
    const marks = Number(question.marks || 0);

    if (!topicMap.has(topic)) {
      topicMap.set(topic, { attempted: 0, correct: 0, incorrect: 0, marks: 0 });
    }

    const topicStats = topicMap.get(topic);
    const diffStats = difficultyMap[difficulty];

    if (selected !== undefined && selected !== null) {
      topicStats.attempted += 1;
      diffStats.attempted += 1;

      if (selected === correctOption) {
        topicStats.correct += 1;
        diffStats.correct += 1;
        topicStats.marks += marks;
        diffStats.marks += marks;
      } else {
        topicStats.incorrect += 1;
        diffStats.incorrect += 1;
      }
    }
  }

  const topicPerformance = {};
  for (const [topic, stats] of topicMap.entries()) {
    const percentage =
      stats.attempted > 0
        ? Number(((stats.correct / stats.attempted) * 100).toFixed(2))
        : 0;
    topicPerformance[topic] = { ...stats, percentage };
  }

  const difficultyPerformance = {};
  for (const [level, stats] of Object.entries(difficultyMap)) {
    const percentage =
      stats.attempted > 0
        ? Number(((stats.correct / stats.attempted) * 100).toFixed(2))
        : 0;
    difficultyPerformance[level] = { ...stats, percentage };
  }

  return { topicPerformance, difficultyPerformance };
};

const sanitizeTopicAnalysis = (arr) => {
  const allowed = ["excellent", "good", "average", "weak"];

  if (!Array.isArray(arr)) return [];

  return arr
    .filter((t) => t && typeof t.topic === "string")
    .map((t) => ({
      topic: t.topic,
      score: Number.isFinite(t.score) ? t.score : 0,
      percentage: Number.isFinite(t.percentage)
        ? Math.min(100, Math.max(0, t.percentage))
        : 0,
      performance: allowed.includes(t.performance) ? t.performance : "average",
      feedback:
        typeof t.feedback === "string" ? t.feedback.slice(0, 5000) : null,
    }));
};

export const generateAIInsights = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate(
      "exam",
      "title questions",
    );

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (
      req.user.role === "student" &&
      result.student.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!result.evaluated) {
      return res.status(400).json({
        message: "Result has not been evaluated yet",
      });
    }

    const existing = await AIAnalysis.findOne({ result: result._id });

    if (existing && existing.status === "completed") {
      return res.json({ aiAnalysis: existing });
    }

    const exam = result.exam;
    const answerKey = await AnswerKey.findOne({ exam: exam._id });

    const studentAnswers =
      result.answers instanceof Map
        ? Object.fromEntries(result.answers)
        : result.answers || {};

    const { topicPerformance, difficultyPerformance } =
      buildPerformanceBreakdown(
        exam.questions,
        answerKey?.answers,
        studentAnswers,
      );

    const analysisDoc =
      existing ||
      new AIAnalysis({
        student: result.student,
        exam: exam._id,
        result: result._id,
        submission: result.submission,
        provider: "google-gemini",
      });

    analysisDoc.status = "processing";
    await analysisDoc.save();

    const wrongQuestions = exam.questions
      .filter((q) => {
        const qId = q._id.toString();
        const selected = studentAnswers[qId];
        const correctOption = answerKey?.answers?.get
          ? answerKey.answers.get(qId)
          : answerKey?.answers?.[qId];

        return (
          selected !== undefined &&
          selected !== null &&
          selected !== correctOption
        );
      })
      .map((q) => q.questionText)
      .slice(0, 15);

    const prompt = `
You are an encouraging, expert AI tutor speaking directly to a student. They just completed an exam titled "${exam.title}".

## Student's Performance Data
- Overall Score: ${result.obtainedMarks} / ${result.totalMarks} (${result.percentage}%)
- Accuracy: Correct: ${result.correctAnswers} | Incorrect: ${result.incorrectAnswers} | Skipped: ${result.unanswered}
- Topic Breakdown: ${JSON.stringify(topicPerformance)}
- Difficulty Breakdown: ${JSON.stringify(difficultyPerformance)}

## Specific Questions the Student Got Wrong:
${JSON.stringify(wrongQuestions, null, 2)}

## Instructions for the Insights
1. **Speak Directly:** Use the second person ("You scored...", "Your accuracy...").
2. **Identify Specific Concepts:** Look at the "Specific Questions the Student Got Wrong" above. Extract the actual academic concepts.
3. **No Fluff:** Name the specific concepts they failed in your summary, strengths, and weaknesses.
4. **Actionable Recommendations:** Give specific study strategies for the exact concepts they missed.
5. **Recommended Topics:** Fill the "recommendedTopics" array with 2-3 highly specific sub-topics you extracted from their wrong answers.

Return ONLY valid JSON (no markdown, no code fences) in this exact shape:
{
  "summary": "2-3 sentence personalized overview highlighting the exact concepts they missed.",
  "strengths": ["punchy strength 1", "punchy strength 2"],
  "weaknesses": ["Missed questions related to [Specific Concept]", "punchy weakness 2"],
  "recommendations": ["actionable study strategy 1", "actionable study strategy 2"],
  "recommendedTopics": ["Specific Sub-topic 1", "Specific Sub-topic 2"],
  "recommendedDifficulty": "easy|medium|hard|mixed",
  "performanceLevel": "excellent|good|average|needs-improvement",
  "confidenceScore": 90,
  "topicAnalysis": [
    { "topic": "General / [Specific Sub-concept]", "score": 0, "percentage": 0, "performance": "excellent|good|average|weak", "feedback": "one line actionable feedback on this concept" }
  ]
}
`.trim();

    const startTime = Date.now();
    let aiJson;

    try {
      const aiResponse = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = aiResponse.text;
      const cleanText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      aiJson = JSON.parse(cleanText);
    } catch (aiError) {
      console.error("Gemini generation/parse error:", aiError);

      analysisDoc.status = "failed";
      analysisDoc.errorMessage = (
        aiError.message || "AI generation failed"
      ).slice(0, 2000);
      await analysisDoc.save();

      return res.status(502).json({
        message: "AI insight generation failed. Please try again.",
      });
    }

    analysisDoc.model = GEMINI_MODEL;
    analysisDoc.summary =
      typeof aiJson.summary === "string" ? aiJson.summary : null;
    analysisDoc.strengths = Array.isArray(aiJson.strengths)
      ? aiJson.strengths
      : [];
    analysisDoc.weaknesses = Array.isArray(aiJson.weaknesses)
      ? aiJson.weaknesses
      : [];
    analysisDoc.recommendations = Array.isArray(aiJson.recommendations)
      ? aiJson.recommendations
      : [];
    analysisDoc.recommendedTopics = Array.isArray(aiJson.recommendedTopics)
      ? aiJson.recommendedTopics
      : [];
    analysisDoc.recommendedDifficulty = [
      "easy",
      "medium",
      "hard",
      "mixed",
    ].includes(aiJson.recommendedDifficulty)
      ? aiJson.recommendedDifficulty
      : "medium";
    analysisDoc.performanceLevel = [
      "excellent",
      "good",
      "average",
      "needs-improvement",
    ].includes(aiJson.performanceLevel)
      ? aiJson.performanceLevel
      : "average";
    analysisDoc.confidenceScore = Number.isFinite(aiJson.confidenceScore)
      ? Math.min(100, Math.max(0, aiJson.confidenceScore))
      : null;
    analysisDoc.topicAnalysis = sanitizeTopicAnalysis(aiJson.topicAnalysis);
    analysisDoc.status = "completed";
    analysisDoc.generatedAt = new Date();
    analysisDoc.processingTimeMs = Date.now() - startTime;

    await analysisDoc.save();

    result.aiAnalyzed = true;
    result.aiAnalysis = analysisDoc._id;
    result.aiSummary = analysisDoc.summary;
    result.strengths = analysisDoc.strengths;
    result.weaknesses = analysisDoc.weaknesses;
    result.recommendedTopics = analysisDoc.recommendedTopics;
    result.topicPerformance = topicPerformance;
    result.difficultyPerformance = difficultyPerformance;

    await result.save();

    return res.json({ aiAnalysis: analysisDoc });
  } catch (error) {
    console.error("generateAIInsights ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate AI insights",
      error: error.message,
    });
  }
};

export const getAIInsights = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    if (
      req.user.role === "student" &&
      result.student.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const analysis = await AIAnalysis.findOne({ result: result._id });

    if (!analysis) {
      return res.status(404).json({ message: "AI insights not generated yet" });
    }

    return res.json({ aiAnalysis: analysis });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch AI insights",
      error: error.message,
    });
  }
};
