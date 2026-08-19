// C:\AI-Exam-System\frontend\src\services\resultService.js
import api from "./api";

export const getMyResults = async () => {
  const res = await api.get("/results/my-results");
  return res.data;
};

export const getResultById = async (resultId) => {
  const res = await api.get(`/results/${resultId}`);
  return res.data;
};

export const downloadResultPDF = async (resultId) => {
  const res = await api.get(`/results/${resultId}/download-pdf`, {
    responseType: "blob",
  });
  return res.data;
};

 
export const getAIInsights = async (resultId) => {
  const res = await api.get(`/results/${resultId}/ai-insights`);
  return res.data;  
};

 
export const generateAIInsights = async (resultId) => {
  const res = await api.post(`/results/${resultId}/ai-insights`);
  return res.data;  
};