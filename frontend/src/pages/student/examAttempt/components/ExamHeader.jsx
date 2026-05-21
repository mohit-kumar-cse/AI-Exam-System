// src/pages/student/examAttempt/components/ExamHeader.jsx

export default function ExamHeader({ title, timeLeft }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const isUrgent = timeLeft < 60;

  return (
    <div className="flex justify-between items-center mb-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-right">
        <p className="text-sm text-[var(--text-secondary)]">Time Remaining</p>
        <p className={`text-lg font-bold ${isUrgent ? "text-red-500 animate-pulse" : "text-red-400"}`}>
          {minutes}:{seconds}
        </p>
      </div>
    </div>
  );
}