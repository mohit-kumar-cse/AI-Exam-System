// src/pages/student/results/components/ResultCard.jsx

import NeuCard from "../../../../components/ui/NeuCard";
import { getPassFail } from "../utils/chartHelpers";

function Stat({ label, value, highlight }) {
  return (
    <div
      className={`p-2.5 sm:p-4 rounded-xl text-center border ${
        highlight
          ? "bg-blue-500/10 border-blue-500/40"
          : "bg-white/5 border-white/10"
      }`}
    >
      <p className="text-gray-400 text-xs mb-0.5 sm:mb-1">
        {label}
      </p>

      <p
        className={`text-sm sm:text-lg font-bold ${
          highlight ? "text-blue-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ResultCard({ result, onClick }) {
 

  const isReleased =
    result.exam?.resultReleased === true ||
    result.isReleased === true;

  const isEvaluated = result.evaluated === true;

  
  const pf =
    isReleased && isEvaluated
      ? getPassFail(result.percentage)
      : null;

  return (
    <NeuCard onClick={onClick}>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">

        <div className="min-w-0">

          <h3 className="text-base sm:text-lg font-semibold text-white truncate">
            {result.examTitle ||
              result.exam?.title ||
              "Exam Result"}
          </h3>

          <p className="text-gray-500 text-xs mt-0.5">
            {result.createdAt
              ? new Date(result.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "Date unavailable"}
          </p>

        </div>

        {/* STATUS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">

          {/* PASS / FAIL */}
          {pf && (
            <span
              className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full border ${pf.cls}`}
            >
              {pf.label}
            </span>
          )}

          {/* RESULT LOCKED */}
          {!isReleased && (
            <span className="text-xs font-medium px-2 sm:px-3 py-1 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
              🔒 Pending Release
            </span>
          )}

           
          {isReleased && !isEvaluated && (
            <span className="text-xs font-medium px-2 sm:px-3 py-1 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
              Pending Evaluation
            </span>
          )}

        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">

        <Stat
          label="Score"
          value={
            isReleased
              ? result.obtainedMarks ?? "—"
              : "🔒"
          }
        />

        <Stat
          label="Total"
          value={
            isReleased
              ? result.totalMarks ?? "—"
              : "🔒"
          }
        />

        <Stat
          label="%"
          value={
            isReleased
              ? isEvaluated
                ? `${result.percentage}%`
                : "—"
              : "🔒"
          }
          highlight={isReleased && isEvaluated}
        />

        
        <div className="hidden md:block">
          <Stat
            label="Rank"
            value={
              isReleased && result.rank
                ? `#${result.rank}`
                : "N/A"
            }
          />
        </div>

        
        <div className="hidden md:block">
          <Stat
            label="Status"
            value={
              !isReleased
                ? "Locked"
                : isEvaluated
                ? "Evaluated"
                : "Pending"
            }
          />
        </div>

      </div>

       
      <div className="flex md:hidden items-center justify-between mt-2 text-xs text-gray-500">

        <span>
          Rank:{" "}
          {isReleased && result.rank
            ? `#${result.rank}`
            : "N/A"}
        </span>

        <span
          className={
            isReleased
              ? "text-green-400"
              : "text-yellow-400"
          }
        >
          {!isReleased
            ? "🔒 Results Hidden"
            : isEvaluated
            ? "✓ Evaluated"
            : "⏳ Pending"}
        </span>

      </div>

       
      <p className="text-right text-xs text-gray-600 mt-3">
        {isReleased
          ? "Tap for detailed analysis →"
          : "Tap to view status →"}
      </p>

    </NeuCard>
  );
}