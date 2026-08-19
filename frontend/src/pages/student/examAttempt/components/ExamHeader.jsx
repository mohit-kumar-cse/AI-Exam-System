// src/pages/student/examAttempt/components/ExamHeader.jsx
export default function ExamHeader({ title, timeLeft }) {
  const minutes  = Math.floor(timeLeft / 60);
  const seconds  = (timeLeft % 60).toString().padStart(2, "0");
  const isUrgent = timeLeft < 60;
  
  const isWarning = timeLeft < 300 && timeLeft >= 60;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
      
      <h2 className="text-base sm:text-xl font-semibold text-white truncate">
        {title}
      </h2>

      
      <div className="flex items-center gap-2 sm:text-right shrink-0">
        <p className="text-xs sm:text-sm text-gray-400">Time Remaining</p>
        <p className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
          isUrgent  ? "text-red-500 animate-pulse" :
          isWarning ? "text-orange-400"            :
                      "text-green-400"
        }`}>
          {minutes}:{seconds}
        </p>
      </div>
    </div>
  );
}