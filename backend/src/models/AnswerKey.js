// backend/src/models/AnswerKey.js
import mongoose from "mongoose";

const answerKeySchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      unique: true,
      index: true,
    },

    answers: {
      type: Map,
      of: { type: Number, min: 0, max: 3 },
      required: true,
    },

    hash: {
      type: String,
      required: true,
      select: false,
    },

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    isFinalized: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    finalizedAt: {
      type: Date,
      default: null,
    },

    integrityVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

answerKeySchema.index({ exam: 1, isFinalized: 1 });

export default mongoose.model("AnswerKey", answerKeySchema);