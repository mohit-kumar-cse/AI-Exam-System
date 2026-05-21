// src/pages/student/examAttempt/hooks/useExamAttempt.js
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";

export function useExamAttempt(examId, token) {
  const navigate = useNavigate();

  const [exam,         setExam]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers,      setAnswers]      = useState({});
  const [timeSpent,    setTimeSpent]    = useState({});
  const [submitted,    setSubmitted]    = useState(false);

  // stable storage key — won't change between renders
  const storageKey = useMemo(() => `exam_${examId}_progress`, [examId]);

  // refs so timer/submit callbacks always read latest state
  const answersRef      = useRef(answers);
  const timeSpentRef    = useRef(timeSpent);
  const submittedRef    = useRef(submitted);

  useEffect(() => { answersRef.current   = answers;   }, [answers]);
  useEffect(() => { timeSpentRef.current = timeSpent; }, [timeSpent]);
  useEffect(() => { submittedRef.current = submitted; }, [submitted]);

  /* ── Warn before page exit ─────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  /* ── Tab switch detection ──────────────────────────────────────────────── */
  useEffect(() => {
    const handler = () => {
      if (document.hidden) alert("Warning: Tab switching detected!");
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  /* ── Fullscreen ────────────────────────────────────────────────────────── */
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {
      console.log("Fullscreen not available — continuing anyway");
    });
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  /* ── Fetch exam ────────────────────────────────────────────────────────── */
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
        console.error("Failed to load exam:", err);
        setLoading(false);
      });
  }, [examId, token, storageKey]);

  /* ── Save progress to localStorage ────────────────────────────────────── */
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        savedAnswers:  answers,
        savedIndex:    currentIndex,
        savedTimeLeft: timeLeft,
        savedTimeSpent: timeSpent,
      })
    );
  }, [answers, currentIndex, timeLeft, timeSpent, exam, storageKey]);

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = useCallback(() => {
    // guard against double submit (timer + button)
    if (submittedRef.current) return;
    setSubmitted(true);

    localStorage.removeItem(storageKey);

    api.post("/submissions/submit", {
      examId,
      answers:   answersRef.current,
      timeSpent: timeSpentRef.current,
    })
      .then(({ data }) => {
        if (data.message) alert(data.message);
        navigate("/student/results", { replace: true });
      })
      .catch((err) => {
        console.error("Submit error:", err);
        alert("Error submitting exam. Please try again.");
        setSubmitted(false);
      });
  }, [examId, navigate, storageKey]);

  // stable ref for handleSubmit so timer never restarts due to function identity change
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  /* ── Countdown timer ───────────────────────────────────────────────────── */
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
    // ✅ only depends on exam — handleSubmit accessed via ref, so no restart
  }, [exam]);

  /* ── Time per question tracker ─────────────────────────────────────────── */
  useEffect(() => {
    if (!exam) return;
    const qId = exam.questions[currentIndex]._id;
    const interval = setInterval(() => {
      setTimeSpent((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, exam]);

  /* ── Select answer ─────────────────────────────────────────────────────── */
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