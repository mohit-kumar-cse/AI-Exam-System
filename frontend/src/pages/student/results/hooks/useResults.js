// src/pages/student/results/hooks/useResults.js
import { useState, useEffect } from "react";
import api from "../../../../services/api";

export function useResults(token) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailed, setDetailed] = useState(null);
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedQ, setSelectedQ] = useState(null);

  useEffect(() => {
    if (token) fetchResults();
  }, [token]);

  
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

  
  const fetchDetailed = async (id) => {
    try {
      const res = await api.get(`/results/${id}`);
      if (!res.data?.result) return;

      const resData = res.data.result;

      
      const isReleased =
        resData.isReleased ?? resData.exam?.resultReleased ?? true;
      if (!isReleased) {
        alert("🔒 Results are locked. The examiner has not released them yet.");
        setDetailed(null);
        return;
      }

      setDetailed(resData);
      setSelectedQ(null);
      setVerification(null);

      
      fetchResults();
    } catch (err) {
      console.error("Failed to fetch detailed result:", err);
      
      if (err.response?.status === 403) {
        alert("🔒 Results are pending release by the examiner.");
        
        fetchResults();
      } else {
        alert("Failed to load result details.");
      }
      setDetailed(null);
    }
  };

  
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

  
  const downloadPDF = async () => {
    if (!detailed) {
      alert("No result selected");
      return;
    }
    setDownloading(true);
    try {
      const res = await api.get(`/results/${detailed._id}/download-pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
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

 
  const copySubmissionId = () => {
    if (!detailed?.submissionId) return;
    navigator.clipboard.writeText(detailed.submissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

   
  const toggleQuestion = (q) => {
    setSelectedQ((prev) =>
      prev?.questionNumber === q.questionNumber ? null : q,
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
