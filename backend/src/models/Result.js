// C:\AI-Exam-System\backend\src\models\Result.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },


    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: false,
    },


    answers: {
      type: Map,
      of: Number,
    },


    timeSpent: {
      type: Map,
      of: Number,
      default: {},
    },


    obtainedMarks: {
      type: Number,
      default: null,
    },

    totalMarks: {
      type: Number,
      default: null,
    },

    percentage: {
      type: Number,
      default: 0,
    },


    rank: {
      type: Number,
      default: null,
    },


    evaluated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


resultSchema.index({ student: 1, exam: 1 });

export default mongoose.model("Result", resultSchema);