// src/pages/student/examAttempt/ExamAttempt.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useExamAttempt } from "./hooks/useExamAttempt";

import ExamHeader      from "./components/ExamHeader";
import QuestionCard    from "./components/QuestionCard";
import NavButtons      from "./components/NavButtons";
import QuestionPalette from "./components/QuestionPalette";
import SubmitModal     from "./components/SubmitModal";

export default function ExamAttempt() {
  const { examId }    = useParams();
  const { token }     = useAuth();
  const [paletteOpen,     setPaletteOpen]     = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const {
    exam, loading, timeLeft, currentIndex,
    answers, submitted, setCurrentIndex,
    handleOptionChange, handleSubmit,
  } = useExamAttempt(examId, token);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-500">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-wide">Loading your exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0f172a]">
        <div className="text-center animate-in zoom-in-95 duration-300">
          <p className="text-5xl mb-4 opacity-80">⚠️</p>
          <h2 className="text-xl font-bold mb-2">Exam Unavailable</h2>
          <p className="text-gray-400 text-sm max-w-sm">
            Failed to load this exam. It may have ended or you might not have access.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIndex];
  
  const answeredCount   = Object.values(answers).filter(val => val !== undefined && val !== null).length;
  const total           = exam.questions.length;
  const progressPct     = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <div className="exam-mode min-h-screen bg-[#0f172a] text-white animate-in fade-in duration-500">
      
      
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex gap-6 p-4 sm:p-6 pt-6 sm:pt-8">
        <div className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-6">
          
          <ExamHeader title={exam.title} timeLeft={timeLeft} />

          
          <div className="md:hidden flex items-center justify-between px-1">
            <div className="flex flex-col">
              <p className="text-xs text-gray-400 font-medium">Progress</p>
              <p className="text-sm font-bold text-blue-400">{answeredCount} / {total}</p>
            </div>
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-white hover:bg-blue-600 transition-colors touch-manipulation px-3 py-2 rounded-lg border border-blue-500/30"
            >
              <span className="text-lg leading-none">⊞</span> Palette
            </button>
          </div>

          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={total}
            selectedAnswer={answers[currentQuestion._id]}
            onOptionChange={handleOptionChange}
          />

          <NavButtons
            currentIndex={currentIndex}
            totalQuestions={total}
            submitted={submitted}
            onPrev={() => setCurrentIndex((prev) => prev - 1)}
            onNext={() => setCurrentIndex((prev) => prev + 1)}
            onSubmit={() => setShowSubmitModal(true)}
          />
        </div>

        <QuestionPalette
          questions={exam.questions}
          answers={answers}
          currentIndex={currentIndex}
          onJump={setCurrentIndex}
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
        />
      </div>

      <SubmitModal
        show={showSubmitModal}
        totalQuestions={total}
        answeredCount={answeredCount}
        onConfirm={() => { 
          setShowSubmitModal(false); 
          handleSubmit(); 
        }}
        onCancel={() => setShowSubmitModal(false)}
      />
    </div>
  );
}