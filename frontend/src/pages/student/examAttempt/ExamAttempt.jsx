// src/pages/student/examAttempt/ExamAttempt.jsx
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useExamAttempt } from "./hooks/useExamAttempt";

import ExamHeader      from "./components/ExamHeader";
import QuestionCard    from "./components/QuestionCard";
import NavButtons      from "./components/NavButtons";
import QuestionPalette from "./components/QuestionPalette";

export default function ExamAttempt() {
  const { examId } = useParams();
  const { token }  = useAuth();

  const {
    exam,
    loading,
    timeLeft,
    currentIndex,
    answers,
    submitted,
    setCurrentIndex,
    handleOptionChange,
    handleSubmit,
  } = useExamAttempt(examId, token);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Failed to load exam. Please go back and try again.</p>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIndex];

  return (
    <div className="exam-mode min-h-screen flex max-w-7xl mx-auto gap-6 p-6">

      {/* LEFT PANEL */}
      <div className="flex-1">
        <ExamHeader
          title={exam.title}
          timeLeft={timeLeft}
        />

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={exam.questions.length}
          selectedAnswer={answers[currentQuestion._id]}
          onOptionChange={handleOptionChange}
        />

        <NavButtons
          currentIndex={currentIndex}
          totalQuestions={exam.questions.length}
          submitted={submitted}
          onPrev={() => setCurrentIndex((prev) => prev - 1)}
          onNext={() => setCurrentIndex((prev) => prev + 1)}
          onSubmit={handleSubmit}
        />
      </div>

      {/* RIGHT PANEL */}
      <QuestionPalette
        questions={exam.questions}
        answers={answers}
        currentIndex={currentIndex}
        onJump={setCurrentIndex}
      />

    </div>
  );
}