// src/pages/student/results/Results.jsx
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useResults } from "./hooks/useResults";

import ResultCard      from "./components/ResultCard";
import DetailHeader    from "./components/DetailHeader";
import AIInsights      from "./components/AIInsights";
import ChartsCard      from "./components/ChartsCard";
import TimeChart       from "./components/TimeChart";
import QuestionPalette from "./components/QuestionPalette";
import NeuCard         from "../../../components/ui/NeuCard";
import api             from "../../../services/api";  

export default function Results() {
  const { token, user } = useAuth();
  
  
  const [lockedResultId, setLockedResultId] = useState(null);

  const {
    results, loading, detailed, verification,
    verifying, downloading, copied, selectedQ,
    fetchDetailed, verifyResult, downloadPDF,
    copySubmissionId, toggleQuestion,
  } = useResults(token);

   
  const handleFetchDetailed = async (id) => {
    setLockedResultId(null); // reset
    try {
      
      await fetchDetailed(id);
    } catch (err) {
      if (err.response?.status === 403) {
        setLockedResultId(id);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto text-white">

      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">My Results</h2>
        {user?.name && (
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Logged in as{" "}
            <span className="text-white font-medium">{user.name}</span>
          </p>
        )}
      </div>

      {results.length === 0 ? (
        <NeuCard>
          <div className="py-10 sm:py-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-300 font-medium">No results yet</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Complete an exam to see your results here.
            </p>
          </div>
        </NeuCard>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {results.map((r) => (
            <ResultCard
              key={r._id}
              result={r}
              onClick={() => handleFetchDetailed(r._id)}
            />
          ))}
        </div>
      )}

      
      {lockedResultId && (
        <div className="mt-8 sm:mt-10">
          <NeuCard>
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <span className="text-5xl sm:text-6xl mb-5 opacity-80">🔒</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Results Pending Release</h3>
              <p className="text-gray-400 max-w-md text-sm sm:text-base leading-relaxed">
                You have successfully submitted this exam! Your detailed score, breakdown, and AI insights will appear here automatically once your examiner releases the results.
              </p>
              <button 
                onClick={() => setLockedResultId(null)}
                className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 transition"
              >
                ← Back to List
              </button>
            </div>
          </NeuCard>
        </div>
      )}

      {/* DETAILED ANALYSIS */}
      {detailed && !lockedResultId && (
        <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="sm:hidden text-xs text-gray-500 flex items-center gap-1 touch-manipulation"
          >
            ↑ Back to list
          </button>

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