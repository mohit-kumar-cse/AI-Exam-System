// src/pages/student/examAttempt/components/SubmitModal.jsx
export default function SubmitModal({
  show,
  totalQuestions,
  answeredCount,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const unanswered = totalQuestions - answeredCount;
  const pct        = Math.round((answeredCount / totalQuestions) * 100);
  const allDone    = unanswered === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-2xl">

        {/* Icon */}
        <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
          allDone
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-yellow-500/10 border border-yellow-500/30"
        }`}>
          {allDone ? "✓" : "⚠️"}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-2">
          Submit Exam?
        </h3>

        {/* Stats */}
        <div className="flex justify-between items-center my-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{answeredCount}</p>
            <p className="text-xs text-gray-400">Answered</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${unanswered > 0 ? "text-yellow-400" : "text-gray-500"}`}>
              {unanswered}
            </p>
            <p className="text-xs text-gray-400">Skipped</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">{pct}%</p>
            <p className="text-xs text-gray-400">Complete</p>
          </div>
        </div>

         
        {!allDone && (
          <p className="text-yellow-400 text-xs text-center mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
            ⚠️ You have {unanswered} unanswered question{unanswered !== 1 ? "s" : ""}.
            Skipped questions score zero.
          </p>
        )}

        <p className="text-gray-400 text-xs text-center mb-5">
          This action cannot be undone. Your answers will be submitted for evaluation.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-sm font-medium transition touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition touch-manipulation ${
              allDone
                ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                : "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800"
            }`}
          >
            Submit
          </button>
        </div>

      </div>
    </div>
  );
}