// src/pages/student/results/components/QuestionPalette.jsx
import NeuCard from "../../../../components/ui/NeuCard";

function statusStyle(status) {
  if (status === "correct")
    return "bg-green-500/20 border-green-500 text-green-300";
  if (status === "wrong")
    return "bg-red-500/20 border-red-500 text-red-300";
  return "bg-gray-500/20 border-gray-600 text-gray-400";
}

function OptionItem({ opt, index, correctOption, selectedOption }) {
  const isCorrect  = index === correctOption;
  const isSelected = index === selectedOption;

  return (
    <div className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
      isCorrect
        ? "bg-green-500/20 border-green-500 text-green-200"
        : isSelected && !isCorrect
          ? "bg-red-500/20 border-red-500 text-red-200"
          : "border-white/10 text-gray-300"
    }`}>
      <span>{opt}</span>
      <span className="text-xs shrink-0 ml-2">
        {isCorrect && "✓ Correct answer"}
        {isSelected && !isCorrect && "✗ Your answer"}
      </span>
    </div>
  );
}

export default function QuestionPalette({ detailed, selectedQ, onToggleQuestion }) {
  if (!detailed.evaluated || !detailed.questionResults?.length) return null;

  return (
    <NeuCard>
      <h4 className="font-bold text-base mb-2">Question Review</h4>
      <p className="text-gray-500 text-xs mb-5">
        Click any question to see detailed answer breakdown
      </p>

      {/* LEGEND */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500 inline-block" />
          Correct
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500 inline-block" />
          Wrong
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-500/30 border border-gray-600 inline-block" />
          Skipped
        </span>
      </div>

      {/* QUESTION GRID */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
        {detailed.questionResults.map((q, i) => (
          <button
            key={i}
            onClick={() => onToggleQuestion(q)}
            className={`p-2 rounded-lg text-center text-xs font-medium border transition-all
              ${statusStyle(q.status)}
              ${selectedQ?.questionNumber === q.questionNumber ? "ring-2 ring-white/30" : ""}
            `}
          >
            Q{q.questionNumber || i + 1}
          </button>
        ))}
      </div>

      {/* SELECTED QUESTION DETAIL */}
      {selectedQ && (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-bold text-base">
              Question {selectedQ.questionNumber}
            </h5>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>⏱ {selectedQ.timeTaken || 0}s spent</span>
              <span className={`px-2 py-0.5 rounded-full border font-medium ${
                selectedQ.status === "correct"
                  ? "border-green-500 text-green-400 bg-green-500/10"
                  : selectedQ.status === "wrong"
                    ? "border-red-500 text-red-400 bg-red-500/10"
                    : "border-gray-600 text-gray-400 bg-gray-500/10"
              }`}>
                {selectedQ.status === "correct" ? "✓ Correct"
                  : selectedQ.status === "wrong"  ? "✗ Wrong"
                  : "— Skipped"}
              </span>
            </div>
          </div>

          {selectedQ.questionText && (
            <p className="text-gray-200 mb-5 leading-relaxed">
              {selectedQ.questionText}
            </p>
          )}

          {selectedQ.options?.length > 0 && (
            <div className="grid gap-2">
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
      )}
    </NeuCard>
  );
}