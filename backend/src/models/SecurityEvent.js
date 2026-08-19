// backend/src/models/SecurityEvent.js
import mongoose from "mongoose";

const securityEventSchema = new mongoose.Schema(
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

    eventType: {
      type: String,
      enum: [
        "TAB_SWITCH",
        "WINDOW_BLUR",
        "FULLSCREEN_EXIT",
        "COPY_ATTEMPT",
        "PASTE_ATTEMPT",
        "CUT_ATTEMPT",
        "CAMERA_DISCONNECTED",
        "MULTIPLE_FACE_DETECTED",
        "NO_FACE_DETECTED",
        "FACE_NOT_RECOGNIZED",
        "SUSPICIOUS_ACTIVITY",
        "MULTIPLE_LOGIN",
        "SESSION_MISMATCH",
        "IP_CHANGE",
        "DEVICE_CHANGE",
        "ANSWER_KEY_ACCESS",
        "UNAUTHORIZED_ACCESS",
        "TIME_MANIPULATION",
        "DUPLICATE_SUBMISSION",
        "CONCURRENT_SESSION",
      ],
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    riskPoints: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

    sessionId: {
      type: String,
      default: null,
      index: true,
    },

    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolutionNote: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

securityEventSchema.index({ student: 1, exam: 1, createdAt: -1 });
securityEventSchema.index({ exam: 1, severity: 1, createdAt: -1 });
securityEventSchema.index({ submission: 1, createdAt: -1 });
securityEventSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model("SecurityEvent", securityEventSchema);