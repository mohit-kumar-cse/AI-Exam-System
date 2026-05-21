// src/pages/student/results/components/ChartsCard.jsx
import NeuCard from "../../../../components/ui/NeuCard";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import { getPieData, calcAccuracy } from "../utils/chartHelpers";

const COLORS = ["#22c55e", "#ef4444", "#6b7280"];

export default function ChartsCard({ detailed }) {
  if (!detailed.evaluated) return null;

  const pieData  = getPieData(detailed.statistics);
  const accuracy = calcAccuracy(detailed.statistics);
  const stats    = detailed.statistics ?? {};

  const summaryRows = [
    { label: "Correct Answers", value: stats.correctAnswers ?? 0,  color: "text-green-400" },
    { label: "Wrong Answers",   value: stats.wrongAnswers ?? 0,    color: "text-red-400"   },
    { label: "Skipped",         value: stats.skippedQuestions ?? 0, color: "text-gray-400" },
    { label: "Accuracy",        value: accuracy,                    color: "text-blue-400"  },
  ];

  return (
    <NeuCard>
      <h4 className="font-bold text-base mb-6">Performance Breakdown</h4>
      <div className="flex flex-col md:flex-row items-center gap-8 justify-center">

        {/* PIE CHART */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
            Answer Distribution
          </p>
          <PieChart width={240} height={240}>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
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
              }}
            />
          </PieChart>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Wrong
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />Skipped
            </span>
          </div>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
          {summaryRows.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3 border border-white/5"
            >
              <span className="text-gray-400 text-sm">{item.label}</span>
              <span className={`font-bold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </NeuCard>
  );
}