// src/pages/student/results/components/DetailHeader.jsx
import NeuCard from "../../../../components/ui/NeuCard";
import { getPassFail } from "../utils/chartHelpers";

function Stat({ label, value, highlight }) {
  return (
    <div className={`p-3 sm:p-4 rounded-xl text-center border ${
      highlight ? "bg-blue-500/10 border-blue-500/40" : "bg-white/5 border-white/10"
    }`}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-base sm:text-lg font-bold ${highlight ? "text-blue-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

export default function DetailHeader({
  detailed,
  verification,
  verifying,
  downloading,
  copied,
  onVerify,
  onDownload,
  onCopy,
}) {
  const passFail = detailed.evaluated ? getPassFail(detailed.percentage) : null;

  return (
    <NeuCard>
      {/* TITLE ROW */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            Detailed Analysis
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-white truncate">
            {detailed.examTitle}
          </h3>
          {detailed.rank && (
            <p className="text-gray-400 text-sm mt-1">
              Rank <span className="text-white font-semibold">#{detailed.rank}</span>
            </p>
          )}
        </div>

        
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={onVerify}
            disabled={verifying}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition touch-manipulation min-h-[40px]"
          >
            {verifying
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              : "🔍"}
            Verify
          </button>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition touch-manipulation min-h-[40px]"
          >
            {downloading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              : "📄"}
            PDF
          </button>
        </div>
      </div>

       
      {passFail && (
        <div className={`mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl border text-center font-bold text-base sm:text-lg tracking-widest ${passFail.cls}`}>
          {passFail.label === "PASS" ? "🎉 RESULT: PASS" : "❌ RESULT: FAIL"}
          {detailed.percentage !== undefined && (
            <span className="ml-2 sm:ml-3 font-normal text-sm sm:text-base">
              ({detailed.percentage}%)
            </span>
          )}
        </div>
      )}

      
      {!detailed.evaluated && (
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 text-center text-xs sm:text-sm">
          ⏳ Result pending — your answers are saved. Check back after the answer key is uploaded.
        </div>
      )}

      
      {verification && (
        <div className={`mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl border text-center font-medium text-xs sm:text-sm ${
          verification.valid
            ? "bg-green-500/10 border-green-500 text-green-400"
            : "bg-red-500/10 border-red-500 text-red-400"
        }`}>
          {verification.valid
            ? "✅ Result Verified — Tamper-Proof & Authentic"
            : "⚠️ Verification Failed — Result may be tampered"}
        </div>
      )}

       
      {detailed.submissionId && (
        <div className="mb-5 sm:mb-6 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Submission ID</p>
            <p className="text-xs sm:text-sm font-mono text-gray-300 truncate">
              {detailed.submissionId}
            </p>
          </div>
          <button
            onClick={onCopy}
            className="shrink-0 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 active:bg-white/20 transition touch-manipulation whitespace-nowrap"
          >
            {copied ? "✅ Copied" : "Copy"}
          </button>
        </div>
      )}

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Stat label="Score"      value={detailed.obtainedMarks ?? "—"} />
        <Stat label="Total"      value={detailed.totalMarks ?? "—"} />
        <Stat
          label="Percentage"
          value={detailed.evaluated ? `${detailed.percentage}%` : "—"}
          highlight={detailed.evaluated}
        />
        <Stat
          label="Time Spent"
          value={detailed.totalTimeSpent
            ? `${(detailed.totalTimeSpent / 60).toFixed(1)}m`
            : "—"}
        />
      </div>
    </NeuCard>
  );
}