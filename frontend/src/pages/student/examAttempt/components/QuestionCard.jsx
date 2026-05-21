// src/pages/student/examAttempt/components/QuestionCard.jsx

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onOptionChange,
}) {
  return (
    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border)]">
      <p className="text-sm text-[var(--text-secondary)] mb-2">
        Question {questionNumber} of {totalQuestions}
      </p>

      <p className="text-lg font-medium mb-6">
        {question.questionText}
      </p>

      {/* OPTIONS */}
      {question.options.map((opt, i) => {
        const isSelected = selectedAnswer === i;
        return (
          <label
            key={i}
            className={`flex items-center p-3 mb-3 rounded-lg cursor-pointer border transition-colors ${
              isSelected
                ? "bg-blue-600/20 border-blue-500"
                : "bg-[var(--bg-hover)] border-[var(--border)] hover:border-blue-400"
            }`}
          >
            <input
              type="radio"
              checked={isSelected}
              onChange={() => onOptionChange(question._id, i)}
              className="mr-3"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}