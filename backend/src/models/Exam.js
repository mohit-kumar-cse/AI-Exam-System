// backend/src/models/Exam.js

import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) =>
          Array.isArray(v) &&
          v.length === 4 &&
          v.every(
            (o) =>
              typeof o === "string" &&
              o.trim().length > 0
          ),
        message: "Exactly 4 non-empty options are required",
      },
    },

    marks: {
      type: Number,
      default: 1,
      min: 0,
      max: 100,
    },

    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    topic: {
      type: String,
      default: "General",
      trim: true,
      maxlength: 200,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    explanation: {
      type: String,
      default: null,
      trim: true,
      maxlength: 10000,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 5000,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
    },

    startTime: {
      type: Date,
      default: null,
    },

    endTime: {
      type: Date,
      default: null,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    resultReleased: {
      type: Boolean,
      default: false,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedExaminer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    questionSettings: {
      randomizeQuestions: {
        type: Boolean,
        default: false,
      },

      randomizeOptions: {
        type: Boolean,
        default: false,
      },

      showQuestionResult: {
        type: Boolean,
        default: false,
      },

      allowBackNavigation: {
        type: Boolean,
        default: true,
      },

      showExplanationAfterSubmit: {
        type: Boolean,
        default: false,
      },
    },

    securitySettings: {
      fullscreenRequired: {
        type: Boolean,
        default: true,
      },

      tabSwitchDetection: {
        type: Boolean,
        default: true,
      },

      copyPasteProtection: {
        type: Boolean,
        default: true,
      },

      cameraRequired: {
        type: Boolean,
        default: false,
      },

      multipleFaceDetection: {
        type: Boolean,
        default: false,
      },

      maxTabSwitches: {
        type: Number,
        default: 3,
        min: 0,
      },

      maxSecurityViolations: {
        type: Number,
        default: 10,
        min: 0,
      },

      autoSubmitOnSecurityViolation: {
        type: Boolean,
        default: false,
      },

      preventConcurrentSessions: {
        type: Boolean,
        default: true,
      },

      blockRightClick: {
        type: Boolean,
        default: true,
      },

      detectDevTools: {
        type: Boolean,
        default: false,
      },
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

 
examSchema.pre("save", function () {
  this.totalMarks = this.questions.reduce(
    (sum, question) => sum + (question.marks || 1),
    0
  );
});

 
examSchema.index({
  createdBy: 1,
});

 
examSchema.index({
  isPublished: 1,
  startTime: 1,
  endTime: 1,
});

 
examSchema.index({
  subject: 1,
});

 
examSchema.index({
  createdAt: -1,
});

export { questionSchema };

export default mongoose.model("Exam", examSchema);