// src/pages/student/examAttempt/components/QuestionCard.jsx
export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onOptionChange,
}) {
  return (
    <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
      <p className="text-xs sm:text-sm text-gray-400 mb-2">
        Question {questionNumber} of {totalQuestions}
      </p>

      <p className="text-base sm:text-lg font-medium text-white mb-4 sm:mb-6 leading-relaxed">
        {question.questionText}
      </p>

      {/* OPTIONS */}
      <div className="space-y-2 sm:space-y-3">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          return (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-lg cursor-pointer border transition-colors touch-manipulation ${
                isSelected
                  ? "bg-blue-600/20 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-300 hover:border-blue-400/50 hover:bg-white/10"
              }`}
            >
              <input
                type="radio"
                checked={isSelected}
                onChange={() => onOptionChange(question._id, i)}
                className="accent-blue-500 w-4 h-4 shrink-0"
              />
              <span className="text-sm sm:text-base">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}