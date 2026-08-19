// backend/src/models/Result.js
import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    attempted: { type: Number, default: 0, min: 0 },
    correct: { type: Number, default: 0, min: 0 },
    incorrect: { type: Number, default: 0, min: 0 },
    marks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
      index: true,
    },

    answers: {
      type: Map,
      of: { type: Number, min: 0, max: 3 },
      default: {},
    },

    timeSpent: {
      type: Map,
      of: { type: Number, min: 0 },
      default: {},
    },

    totalTimeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    obtainedMarks: {
      type: Number,
      default: null,
    },

    totalMarks: {
      type: Number,
      default: null,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    rank: {
      type: Number,
      default: null,
      min: 1,
    },

    evaluated: {
      type: Boolean,
      default: false,
      index: true,
    },

    evaluatedAt: {
      type: Date,
      default: null,
    },

    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    unanswered: {
      type: Number,
      default: 0,
      min: 0,
    },

    topicPerformance: {
      type: Map,
      of: performanceSchema,
      default: {},
    },

    difficultyPerformance: {
      easy: { type: performanceSchema, default: () => ({}) },
      medium: { type: performanceSchema, default: () => ({}) },
      hard: { type: performanceSchema, default: () => ({}) },
    },

    aiAnalyzed: {
      type: Boolean,
      default: false,
      index: true,
    },

    aiAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIAnalysis",
      default: null,
    },

    aiSummary: {
      type: String,
      default: null,
      trim: true,
      maxlength: 10000,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendedTopics: {
      type: [String],
      default: [],
    },

    isReleased: {
      type: Boolean,
      default: false,
      index: true,
    },

    releasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index({ student: 1, exam: 1 }, { unique: true });
resultSchema.index({ exam: 1, percentage: -1 });
resultSchema.index({ exam: 1, rank: 1 });
resultSchema.index({ exam: 1, isReleased: 1 });
resultSchema.index({ student: 1, createdAt: -1 });

export default mongoose.model("Result", resultSchema);