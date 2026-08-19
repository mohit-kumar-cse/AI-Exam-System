// src/pages/student/results/components/QuestionPalette.jsx
import NeuCard from "../../../../components/ui/NeuCard";

function statusStyle(status) {
  if (status === "correct") return "bg-green-500/20 border-green-500 text-green-300";
  if (status === "wrong")   return "bg-red-500/20 border-red-500 text-red-300";
  return "bg-gray-500/20 border-gray-600 text-gray-400";
}

function OptionItem({ opt, index, correctOption, selectedOption }) {
  const isCorrect  = index === correctOption;
  const isSelected = index === selectedOption;

  return (
    <div className={`p-3 rounded-lg border text-sm flex justify-between items-center gap-3 transition-colors ${
      isCorrect
        ? "bg-green-500/10 border-green-500/50 text-green-200"
        : isSelected && !isCorrect
          ? "bg-red-500/10 border-red-500/50 text-red-200"
          : "bg-white/5 border-white/10 text-gray-300"
    }`}>
      <span className="flex-1 leading-relaxed">{opt}</span>
      <span className="text-xs shrink-0 font-bold tracking-wide">
        {isCorrect              && "✓ CORRECT"}
        {isSelected && !isCorrect && "✗ YOURS"}
      </span>
    </div>
  );
}

export default function QuestionPalette({ detailed, selectedQ, onToggleQuestion }) {
  if (!detailed.evaluated || !detailed.questionResults?.length) return null;

  return (
    <NeuCard>
      <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8">
        
         
        <div className="flex-1 w-full order-2 lg:order-1">
          <h4 className="font-bold text-lg mb-4 text-white hidden lg:block">
            Question Review
          </h4>
          
          {selectedQ ? (
            <div className="bg-white/5 p-5 sm:p-6 rounded-xl border border-white/10 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
                <h5 className="font-bold text-base text-white">
                  Question {selectedQ.questionNumber}
                </h5>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="text-gray-400 bg-black/20 px-3 py-1 rounded-full">
                    ⏱ {selectedQ.timeTaken || 0}s spent
                  </span>
                  <span className={`px-3 py-1 rounded-full border ${
                    selectedQ.status === "correct"
                      ? "border-green-500/50 text-green-400 bg-green-500/10"
                      : selectedQ.status === "wrong"
                        ? "border-red-500/50 text-red-400 bg-red-500/10"
                        : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                  }`}>
                    {selectedQ.status === "correct" ? "✓ Correct"
                      : selectedQ.status === "wrong" ? "✗ Wrong"
                      : "— Skipped"}
                  </span>
                </div>
              </div>

              {selectedQ.questionText && (
                <p className="text-gray-100 text-base mb-6 leading-relaxed">
                  {selectedQ.questionText}
                </p>
              )}

              {selectedQ.options?.length > 0 && (
                <div className="grid gap-3">
                  {selectedQ.options.map((opt, i) => (
                    <OptionItem
                      key={i}
                      opt={opt}
                      index={i}
                      correctOption={selectedQ.correctOption}
                      selectedOption={selectedQ.selectedOption}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center justify-center min-h-[300px] text-gray-400 text-sm">
              Select a question from the palette to view its breakdown.
            </div>
          )}
        </div>

        
        <div className="w-full lg:w-80 shrink-0 order-1 lg:order-2 bg-[#1a1d2d] p-5 rounded-xl border border-white/10 shadow-lg">
          <h4 className="font-bold text-base mb-1 text-white lg:hidden">
            Question Review
          </h4>
          <h5 className="font-semibold text-sm text-gray-200 mb-1">
            Question Palette
          </h5>
          <p className="text-gray-500 text-xs mb-5">
            Tap any number to view details
          </p>

          {/* LEGEND */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500 shrink-0" />
              Correct
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500 shrink-0" />
              Wrong
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-500/30 border border-gray-600 shrink-0" />
              Skipped
            </span>
          </div>

          
          <div className="grid grid-cols-5 gap-2">
            {detailed.questionResults.map((q, i) => (
              <button
                key={i}
                onClick={() => onToggleQuestion(q)}
                className={`aspect-square rounded-lg text-center text-xs font-semibold border transition-all touch-manipulation
                  ${statusStyle(q.status)}
                  ${selectedQ?.questionNumber === q.questionNumber 
                    ? "ring-2 ring-indigo-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10" 
                    : "hover:scale-105 hover:bg-white/10"}
                `}
              >
                {q.questionNumber || i + 1}
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </NeuCard>
  );
}