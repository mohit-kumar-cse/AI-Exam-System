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
    <div className="flex justify-between mt-6">
      <button
        disabled={isFirst}
        onClick={onPrev}
        className="px-4 py-2 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--border)] disabled:opacity-50 transition"
      >
        Previous
      </button>

      {!isLast ? (
        <button
          onClick={onNext}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
        >
          Save & Next
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={submitted}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
        >
          {submitted ? "Submitting..." : "Submit Exam"}
        </button>
      )}
    </div>
  );
}