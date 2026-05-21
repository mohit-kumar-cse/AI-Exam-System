// src/pages/student/examAttempt/components/QuestionPalette.jsx

export default function QuestionPalette({
  questions,
  answers,
  currentIndex,
  onJump,
}) {
  const answeredCount = Object.keys(answers).length;
  const total         = questions.length;
  const progressPct   = Math.round((answeredCount / total) * 100);

  return (
    <div className="w-72 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
      <h3 className="font-semibold mb-3 text-center">Question Palette</h3>

      {/* PROGRESS */}
      <p className="text-sm mb-2">
        Progress: {answeredCount} / {total}
      </p>
      <div className="w-full bg-[var(--bg-hover)] h-2 rounded mb-4">
        <div
          className="h-2 bg-blue-500 rounded transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* LEGEND */}
      <div className="flex gap-3 text-xs mb-3">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500 inline-block" />
          Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[var(--bg-hover)] border border-[var(--border)] inline-block" />
          Not answered
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isAnswered = answers[q._id] !== undefined;
          const isCurrent  = index === currentIndex;
          return (
            <button
              key={q._id}
              onClick={() => onJump(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                ${isCurrent  ? "ring-2 ring-blue-500" : ""}
                ${isAnswered ? "bg-green-500 text-white" : "bg-[var(--bg-hover)]"}
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}