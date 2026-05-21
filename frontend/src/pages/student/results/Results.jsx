// C:\AI-Exam-System\frontend\src\pages\student\results\Results.jsx
import { useAuth } from "../../../context/AuthContext";
import { useResults } from "./hooks/useResults";

import ResultCard      from "./components/ResultCard";
import DetailHeader    from "./components/DetailHeader";
import AIInsights      from "./components/AIInsights";
import ChartsCard      from "./components/ChartsCard";
import TimeChart       from "./components/TimeChart";
import QuestionPalette from "./components/QuestionPalette";
import NeuCard         from "../../../components/ui/NeuCard";

export default function Results() {
  const { token, user } = useAuth();

  const {
    results,
    loading,
    detailed,
    verification,
    verifying,
    downloading,
    copied,
    selectedQ,
    fetchDetailed,
    verifyResult,
    downloadPDF,
    copySubmissionId,
    toggleQuestion,
  } = useResults(token);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">

      {/* PAGE HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">My Results</h2>
        {user?.name && (
          <p className="text-gray-400 mt-1 text-sm">
            Logged in as{" "}
            <span className="text-white font-medium">{user.name}</span>
          </p>
        )}
      </div>

      {/* RESULTS LIST */}
      {results.length === 0 ? (
        <NeuCard>
          <div className="py-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-300 font-medium">No results yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Complete an exam to see your results here.
            </p>
          </div>
        </NeuCard>
      ) : (
        <div className="grid gap-4">
          {results.map((r) => (
            <ResultCard
              key={r._id}
              result={r}
              onClick={() => fetchDetailed(r._id)}
            />
          ))}
        </div>
      )}

      {/* DETAILED ANALYSIS */}
      {detailed && (
        <div className="mt-10 space-y-6">
          <DetailHeader
            detailed={detailed}
            verification={verification}
            verifying={verifying}
            downloading={downloading}
            copied={copied}
            onVerify={verifyResult}
            onDownload={downloadPDF}
            onCopy={copySubmissionId}
          />
          <AIInsights      detailed={detailed} />
          <ChartsCard      detailed={detailed} />
          <TimeChart       questionResults={detailed.questionResults} />
          <QuestionPalette
            detailed={detailed}
            selectedQ={selectedQ}
            onToggleQuestion={toggleQuestion}
          />
        </div>
      )}

    </div>
  );
}