//  backend\src\models\Exam.js
import mongoose from "mongoose";

/* ================= QUESTION SCHEMA ================= */
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },

  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: "Exactly 4 options are required"
    }
  },

  

  marks: {
    type: Number,
    default: 1
  },

  negativeMarks: {
    type: Number,
    default: 0
  }
});

/* ================= EXAM SCHEMA ================= */
const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    duration: {
      type: Number,
      required: true
    },

    startTime: {
      type: Date
    },

    endTime: {
      type: Date
    },

    isPublished: {
      type: Boolean,
      default: false
    },

    // 🔥 NEW FIELD
    resultReleased: {
      type: Boolean,
      default: false
    },

    questions: [questionSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
