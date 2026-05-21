// backend/src/models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
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

        // ✅ FIXED: OBJECT instead of ARRAY
        answers: {
            type: Map,
            of: Number
        },

        score: Number,

        // 🔐 SECURITY
        hash: String,
        signature: String,
        isFinalized: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);