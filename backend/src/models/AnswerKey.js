// C:\AI-Exam-System\backend\src\models\AnswerKey.js
import mongoose from "mongoose";

const answerKeySchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      unique: true,  
    },

    
    answers: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AnswerKey", answerKeySchema);
