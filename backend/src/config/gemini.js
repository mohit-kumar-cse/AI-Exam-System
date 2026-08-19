// C:\AI-Exam-System\backend\src\config\gemini.js
import { GoogleGenAI } from "@google/genai";

 
export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY is not configured. AI Insights will not work."
  );
}

 
const ai = new GoogleGenAI({
  apiKey,
});


export default ai;