// backend/src/models/Submission.js

import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
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

    answers: {
      type: Map,
      of: { type: Number, min: 0, max: 3 },
      default: {},
    },

    score: {
      type: Number,
      default: null,
    },

    hash: {
      type: String,
      default: null,
      select: false,
    },

    signature: {
      type: String,
      default: null,
      select: false,
    },

    isFinalized: {
      type: Boolean,
      default: false,
      index: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    sessionId: {
      type: String,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
      select: false,
    },

    userAgent: {
      type: String,
      default: null,
      select: false,
    },

    security: {
      tabSwitches: {
        type: Number,
        default: 0,
        min: 0,
      },

      fullscreenExits: {
        type: Number,
        default: 0,
        min: 0,
      },

      copyAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      pasteAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      cutAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      suspiciousEvents: {
        type: Number,
        default: 0,
        min: 0,
      },

      multipleFaceDetected: {
        type: Number,
        default: 0,
        min: 0,
      },

      noFaceDetected: {
        type: Number,
        default: 0,
        min: 0,
      },

      faceNotRecognized: {
        type: Number,
        default: 0,
        min: 0,
      },

      cameraDisconnected: {
        type: Number,
        default: 0,
        min: 0,
      },

      windowBlurEvents: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    securityViolationCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    aiEvaluated: {
      type: Boolean,
      default: false,
    },

    aiEvaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIAnalysis",
      default: null,
    },

    completionReason: {
      type: String,
      enum: [
        "manual_submit",
        "time_expired",
        "security_auto_submit",
        "system",
        "unknown",
      ],
      default: "manual_submit",
    },

    integrityVerified: {
      type: Boolean,
      default: false,
    },

    lastSecurityEventAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


 
submissionSchema.index(
  { student: 1, exam: 1 },
  { unique: true }
);

submissionSchema.index({
  exam: 1,
  isFinalized: 1,
});

 
submissionSchema.index({
  sessionId: 1,
});

 
submissionSchema.index({
  riskLevel: 1,
  createdAt: -1,
});

 
submissionSchema.index({
  createdAt: -1,
});

export default mongoose.model("Submission", submissionSchema);