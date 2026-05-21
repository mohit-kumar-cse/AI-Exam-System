// src/pages/student/results/hooks/useResults.js
import { useState, useEffect } from "react";
import api from "../../../../services/api";

export function useResults(token) {
  const [results,      setResults]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [detailed,     setDetailed]     = useState(null);
  const [verification, setVerification] = useState(null);
  const [verifying,    setVerifying]    = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [selectedQ,    setSelectedQ]    = useState(null);

  useEffect(() => {
    if (token) fetchResults();
  }, [token]);

  // ── All results list ──────────────────────────────────────────────────────
  const fetchResults = async () => {
    try {
      const res = await api.get("/results/my-results");
      setResults(res.data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Single detailed result ────────────────────────────────────────────────
  const fetchDetailed = async (id) => {
    try {
      const res = await api.get(`/results/${id}`);
      if (!res.data?.result) return;
      setDetailed(res.data.result);
      setSelectedQ(null);
      setVerification(null);
    } catch (err) {
      console.error("Failed to fetch detailed result:", err);
    }
  };

  // ── Verify submission ─────────────────────────────────────────────────────
  const verifyResult = async () => {
    if (!detailed?.submissionId) {
      alert("Submission ID missing — cannot verify");
      return;
    }
    setVerifying(true);
    try {
      const res = await api.get(`/submissions/verify/${detailed.submissionId}`);
      setVerification(res.data);
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── Download PDF ──────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!detailed) { alert("No result selected"); return; }
    setDownloading(true);
    try {
      const res = await api.get(`/results/${detailed._id}/download-pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `result_${detailed.examTitle}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  // ── Copy submission ID ────────────────────────────────────────────────────
  const copySubmissionId = () => {
    if (!detailed?.submissionId) return;
    navigator.clipboard.writeText(detailed.submissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Toggle question selection ─────────────────────────────────────────────
  const toggleQuestion = (q) => {
    setSelectedQ((prev) =>
      prev?.questionNumber === q.questionNumber ? null : q
    );
  };

  return {
    results,
    loading,
    detailed,
    verification,
    verifying,
    downloading,
    copied,
    selectedQ,
    fetchDetailed,
    verifyResult,
    downloadPDF,
    copySubmissionId,
    toggleQuestion,
  };
}