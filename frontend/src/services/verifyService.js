// C:\AI-Exam-System\frontend\src\services\verifyService.js
import api from "./api";

export const verifyResult = async (submissionId) => {
  const res = await api.get(`/verify/${submissionId}`);
  return res.data;
};