import api from "./api";

// Uses the shared axios instance — no hardcoded URL, token handled automatically
export const verifyResult = async (submissionId) => {
  const res = await api.get(`/verify/${submissionId}`);
  return res.data;
};