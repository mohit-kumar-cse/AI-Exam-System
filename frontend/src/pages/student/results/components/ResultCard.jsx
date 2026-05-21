// src/pages/student/results/components/ResultCard.jsx
import NeuCard from "../../../../components/ui/NeuCard";
import { getPassFail } from "../utils/chartHelpers";

function Stat({ label, value, highlight }) {
  return (
    <div className={`p-4 rounded-xl text-center border ${
      highlight ? "bg-blue-500/10 border-blue-500/40" : "bg-white/5 border-white/10"
    }`}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-blue-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

export default function ResultCard({ result, onClick }) {
  const pf = result.evaluated ? getPassFail(result.percentage) : null;

  return (
    <NeuCard onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{result.examTitle}</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {new Date(result.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pf && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${pf.cls}`}>
              {pf.label}
            </span>
          )}
          {!result.evaluated && (
            <span className="text-xs font-medium px-3 py-1 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-center">
        <Stat label="Score"  value={result.obtainedMarks ?? "—"} />
        <Stat label="Total"  value={result.totalMarks ?? "—"} />
        <Stat label="%"      value={result.evaluated ? `${result.percentage}%` : "—"} highlight={result.evaluated} />
        <Stat label="Rank"   value={result.rank ? `#${result.rank}` : "N/A"} />
        <Stat label="Status" value={result.evaluated ? "Evaluated" : "Pending"} />
      </div>

      <p className="text-right text-xs text-gray-600 mt-3">
        Click to view detailed analysis →
      </p>
    </NeuCard>
  );
}