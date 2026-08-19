// backend/src/models/AIAnalysis.js
import mongoose from "mongoose";

const topicAnalysisSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, trim: true },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    performance: {
      type: String,
      enum: ["excellent", "good", "average", "weak"],
      default: "average",
    },
    feedback: {
      type: String,
      default: null,
      trim: true,
      maxlength: 5000,
    },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
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

    result: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Result",
      required: true,
      unique: true,
      index: true,
    },

    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
      index: true,
    },

    provider: {
      type: String,
      enum: ["google-gemini"],
      default: "google-gemini",
      index: true,
    },

    model: {
      type: String,
      default: null,
    },

    promptVersion: {
      type: String,
      default: "v1",
    },

    summary: {
      type: String,
      default: null,
      trim: true,
      maxlength: 10000,
    },

    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },

    topicAnalysis: {
      type: [topicAnalysisSchema],
      default: [],
    },

    recommendedTopics: { type: [String], default: [] },

    recommendedDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "medium",
    },

    performanceLevel: {
      type: String,
      enum: ["excellent", "good", "average", "needs-improvement"],
      default: "average",
    },

    confidenceScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },

    errorMessage: {
      type: String,
      default: null,
      trim: true,
      maxlength: 5000,
    },

    inputTokens: { type: Number, default: null },
    outputTokens: { type: Number, default: null },
    totalTokens: { type: Number, default: null },

    generatedAt: {
      type: Date,
      default: null,
    },

    processingTimeMs: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

aiAnalysisSchema.index({ student: 1, createdAt: -1 });
aiAnalysisSchema.index({ exam: 1, createdAt: -1 });
aiAnalysisSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("AIAnalysis", aiAnalysisSchema);