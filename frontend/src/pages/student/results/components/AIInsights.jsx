// src/pages/student/results/components/AIInsights.jsx
import { useState, useEffect } from "react";
import NeuCard from "../../../../components/ui/NeuCard";
import {
  getAIInsights,
  generateAIInsights as generateAIInsightsAPI,
} from "../../../../services/resultService";

const LEVEL_STYLES = {
  excellent: { color: "text-green-400", icon: "🏆" },
  good: { color: "text-blue-400", icon: "👍" },
  average: { color: "text-yellow-400", icon: "📊" },
  "needs-improvement": { color: "text-red-400", icon: "📉" },
};

export default function AIInsights({ detailed }) {
  const [analysis, setAnalysis]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    if (!detailed?._id || !detailed.evaluated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    setAnalysis(null);

    (async () => {
      try {
        const data = await getAIInsights(detailed._id);
        if (!cancelled) setAnalysis(data.aiAnalysis);
      } catch (err) {
        
        if (!cancelled && err.response?.status !== 404) {
          setError("Failed to load AI insights");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [detailed?._id, detailed?.evaluated]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const data = await generateAIInsightsAPI(detailed._id);
      setAnalysis(data.aiAnalysis);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate AI insights"
      );
    } finally {
      setGenerating(false);
    }
  };

  if (!detailed?.evaluated) return null;

  if (loading) {
    return (
      <NeuCard>
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
          Checking AI insights...
        </div>
      </NeuCard>
    );
  }

  if (!analysis) {
    return (
      <NeuCard>
        <div className="flex flex-col items-center text-center py-4 sm:py-6 gap-3">
          <span className="text-2xl sm:text-3xl">🤖</span>
          <p className="text-sm sm:text-base font-medium text-white">
            AI Performance Insights
          </p>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
            Get a personalized breakdown of your strengths, weaknesses, and
            what to study next — powered by Gemini.
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-1 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition touch-manipulation min-h-[40px]"
          >
            {generating && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {generating ? "Generating..." : "Generate AI Insights"}
          </button>
        </div>
      </NeuCard>
    );
  }

  const levelStyle =
    LEVEL_STYLES[analysis.performanceLevel] || LEVEL_STYLES.average;

  return (
    <NeuCard>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-base sm:text-lg shrink-0">🤖</span>
        <h4 className="font-bold text-sm sm:text-base">AI Performance Insights</h4>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border sm:ml-auto ${levelStyle.color} border-current/30 bg-white/5`}
        >
          {levelStyle.icon} {analysis.performanceLevel}
        </span>
      </div>

      {analysis.summary && (
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 bg-white/5 border border-white/5 rounded-xl px-3 sm:px-4 py-3">
          {analysis.summary}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {analysis.strengths?.length > 0 && (
          <div>
            <p className="text-xs text-green-400 font-semibold mb-2 uppercase tracking-widest">
              Strengths
            </p>
            <ul className="space-y-1.5">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-xs sm:text-sm text-gray-300 flex gap-2">
                  <span className="text-green-400 shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.weaknesses?.length > 0 && (
          <div>
            <p className="text-xs text-red-400 font-semibold mb-2 uppercase tracking-widest">
              Weaknesses
            </p>
            <ul className="space-y-1.5">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="text-xs sm:text-sm text-gray-300 flex gap-2">
                  <span className="text-red-400 shrink-0">✗</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {analysis.recommendations?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-widest">
            Recommendations
          </p>
          <ul className="space-y-1.5">
            {analysis.recommendations.map((r, i) => (
              <li key={i} className="text-xs sm:text-sm text-gray-300 flex gap-2">
                <span className="text-blue-400 shrink-0">→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.recommendedTopics?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {analysis.recommendedTopics.map((t, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

       
      {analysis.topicAnalysis?.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-xs text-purple-400 font-semibold mb-3 uppercase tracking-widest">
            Topic-by-Topic Breakdown
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.topicAnalysis.map((item, i) => {
              const perfStyle = LEVEL_STYLES[item.performance] || LEVEL_STYLES.average;
              
              return (
                <div 
                  key={i} 
                  className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-200 truncate pr-2">
                      {item.topic}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border border-current/20 bg-white/5 shrink-0 ${perfStyle.color}`}>
                      {item.percentage}%
                    </span>
                  </div>
                  
                  {item.feedback && (
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </NeuCard>
  );
}