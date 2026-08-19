// src/pages/student/results/components/ChartsCard.jsx
import NeuCard from "../../../../components/ui/NeuCard";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { getPieData, calcAccuracy } from "../utils/chartHelpers";

const COLORS = ["#22c55e", "#ef4444", "#6b7280"];

export default function ChartsCard({ detailed }) {
  if (!detailed.evaluated) return null;

  const pieData  = getPieData(detailed.statistics);
  const accuracy = calcAccuracy(detailed.statistics);
  const stats    = detailed.statistics ?? {};

  const summaryRows = [
    { label: "Correct",  value: stats.correctAnswers   ?? 0, color: "text-green-400" },
    { label: "Wrong",    value: stats.wrongAnswers      ?? 0, color: "text-red-400"   },
    { label: "Skipped",  value: stats.skippedQuestions ?? 0, color: "text-gray-400"  },
    { label: "Accuracy", value: accuracy,                     color: "text-blue-400"  },
  ];

  
  return (
    <NeuCard>
      <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6">Performance Breakdown</h4>

      <div className="flex flex-col items-center gap-6 sm:gap-8">

        {/* PIE CHART — fluid width */}
        <div className="w-full text-center">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
            Answer Distribution
          </p>
          
          <div className="w-full max-w-[280px] mx-auto">
            <ResponsiveContainer width="100%" aspect={1}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius="45%"
                  innerRadius="25%"
                  label={({ name, value }) => value > 0 ? `${name} ${value}` : ""}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 sm:gap-4 mt-2 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />Wrong
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />Skipped
            </span>
          </div>
        </div>

        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
          {summaryRows.map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/5 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-white/5 gap-0.5 sm:gap-0"
            >
              <span className="text-gray-400 text-xs">{item.label}</span>
              <span className={`font-bold text-sm sm:text-base ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </NeuCard>
  );
}