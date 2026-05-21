// src/pages/student/results/components/AIInsights.jsx
import NeuCard from "../../../../components/ui/NeuCard";
import { generateAIInsights } from "../utils/insights";

export default function AIInsights({ detailed }) {
  const insights = generateAIInsights(detailed);
  if (insights.length === 0) return null;

  return (
    <NeuCard>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🤖</span>
        <h4 className="font-bold text-base">AI Performance Insights</h4>
        <span className="text-xs text-gray-500 ml-auto">
          Based on your submission data
        </span>
      </div>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5"
          >
            <span className="text-lg shrink-0">{ins.icon}</span>
            <p className={`text-sm ${ins.color}`}>{ins.text}</p>
          </div>
        ))}
      </div>
    </NeuCard>
  );
}