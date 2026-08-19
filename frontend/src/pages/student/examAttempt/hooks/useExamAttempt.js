// src/pages/student/examAttempt/hooks/useExamAttempt.js
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";

export function useExamAttempt(examId, token) {
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const storageKey = useMemo(() => `exam_${examId}_progress`, [examId]);

  const answersRef = useRef(answers);
  const timeSpentRef = useRef(timeSpent);
  const submittedRef = useRef(submitted);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeSpentRef.current = timeSpent; }, [timeSpent]);
  useEffect(() => { submittedRef.current = submitted; }, [submitted]);

  
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

 
  useEffect(() => {
    const handler = () => {
      if (document.hidden) alert("Warning: Tab switching detected!");
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {
      console.log("Fullscreen not available — continuing anyway");
    });

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        setTimeout(() => {
          document.documentElement.requestFullscreen().catch(() => {});
        }, 500);
        alert("Warning: Please stay in fullscreen mode during the exam.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  
  useEffect(() => {
    if (!token) return;

    api.get(`/exams/${examId}/start`)
      .then(({ data }) => {
        setExam(data);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const { savedAnswers, savedIndex, savedTimeLeft, savedTimeSpent }
            = JSON.parse(saved);
          setAnswers(savedAnswers || {});
          setCurrentIndex(savedIndex || 0);
          setTimeSpent(savedTimeSpent || {});
          setTimeLeft(
            savedTimeLeft > 0 && savedTimeLeft <= data.duration * 60
              ? savedTimeLeft
              : data.duration * 60
          );
        } else {
          setTimeLeft(data.duration * 60);
        }
        setLoading(false);
      })
      .catch((err) => {
        const status = err.response?.status;
        const message = err.response?.data?.message || "";

        if (status === 400 && message.toLowerCase().includes("already")) {
          navigate("/student/results", {
            replace: true,
            state: { notice: "You have already submitted this exam." },
          });
        } else if (status === 403) {
          navigate("/student/exams", {
            replace: true,
            state: { notice: "This exam is not available right now." },
          });
        } else {
          console.error("Failed to load exam:", err);
          setLoading(false);
        }
      });
  }, [examId, token, storageKey, navigate]);

  
  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;  

    setSubmitted(true);

    try {
      const res = await api.post("/submissions/submit", {
        examId,
        answers: answersRef.current,
        timeSpent: timeSpentRef.current,
      });

      localStorage.removeItem(storageKey);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      navigate("/student/results", {
        replace: true,
        state: { resultId: res.data?.resultId, notice: "Exam submitted successfully." },
      });
    } catch (err) {
      console.error("Submit failed:", err);

      
      if (err.response?.status === 409) {
        localStorage.removeItem(storageKey);
        navigate("/student/results", { replace: true });
        return;
      }

      alert("Failed to submit exam. Please check your connection and try again.");
      setSubmitted(false);
    }
  }, [examId, storageKey, navigate]);

  
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  
  useEffect(() => {
    if (!exam || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => handleSubmitRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam]);

  
  useEffect(() => {
    if (!exam) return;
    const qId = exam.questions[currentIndex]._id;
    const interval = setInterval(() => {
      setTimeSpent((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, exam]);

  
  useEffect(() => {
    if (!exam || submitted) return;

    const payload = {
      savedAnswers: answers,
      savedIndex: currentIndex,
      savedTimeLeft: timeLeft,
      savedTimeSpent: timeSpent,
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [exam, submitted, answers, currentIndex, timeLeft, timeSpent, storageKey]);

  
  const handleOptionChange = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  return {
    exam,
    loading,
    timeLeft,
    currentIndex,
    answers,
    submitted,
    setCurrentIndex,
    handleOptionChange,
    handleSubmit,
  };
}