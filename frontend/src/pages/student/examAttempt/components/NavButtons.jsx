// src/pages/student/examAttempt/components/NavButtons.jsx
export default function NavButtons({
  currentIndex,
  totalQuestions,
  submitted,
  onPrev,
  onNext,
  onSubmit,
}) {
  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center mt-4 sm:mt-6 gap-3">
      <button
        disabled={isFirst}
        onClick={onPrev}
        className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition touch-manipulation min-h-[44px]"
      >
        ← Previous
      </button>

      
      <span className="hidden sm:block text-xs text-gray-500 shrink-0">
        {currentIndex + 1} / {totalQuestions}
      </span>

      {!isLast ? (
        <button
          onClick={onNext}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition touch-manipulation min-h-[44px]"
        >
          Save & Next →
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={submitted}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition touch-manipulation min-h-[44px]"
        >
          {submitted ? "Submitting..." : "Submit Exam ✓"}
        </button>
      )}
    </div>
  );
}