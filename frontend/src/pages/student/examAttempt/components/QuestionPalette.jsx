// src/pages/student/examAttempt/components/QuestionPalette.jsx
export default function QuestionPalette({
  questions,
  answers,
  currentIndex,
  onJump,
  isOpen,        
  onClose,       
}) {
  const answeredCount = Object.keys(answers).length;
  const total         = questions.length;
  const progressPct   = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const content = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm sm:text-base">Question Palette</h3>
        
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white text-xl leading-none touch-manipulation"
            aria-label="Close palette"
          >
            ✕
          </button>
        )}
      </div>

      {/* PROGRESS */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{answeredCount} / {total} ({progressPct}%)</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full">
          <div
            className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-500 shrink-0" />
          Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white/10 border border-white/20 shrink-0" />
          Not answered
        </span>
      </div>

      
      <div className="grid grid-cols-5 gap-1.5 overflow-y-auto flex-1 content-start pr-0.5">
        {questions.map((q, index) => {
          const isAnswered = answers[q._id] !== undefined;
          const isCurrent  = index === currentIndex;
          return (
            <button
              key={q._id}
              onClick={() => { onJump(index); onClose?.(); }}
              className={`w-full aspect-square rounded-lg text-xs sm:text-sm font-medium transition touch-manipulation
                ${isCurrent  ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-[#0f172a]" : ""}
                ${isAnswered ? "bg-green-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      
      <div className="hidden md:flex w-64 lg:w-72 bg-white/5 p-4 rounded-2xl border border-white/10 flex-col shrink-0 self-start sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden">
        {content}
      </div>

       
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
           
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div className="relative ml-auto w-72 h-full bg-[#0f172a] border-l border-white/10 p-4 flex flex-col shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}