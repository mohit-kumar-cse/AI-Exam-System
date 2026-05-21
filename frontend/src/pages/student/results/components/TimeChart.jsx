// src/pages/student/results/components/TimeChart.jsx
import NeuCard from "../../../../components/ui/NeuCard";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getTimeData } from "../utils/chartHelpers";

export default function TimeChart({ questionResults = [] }) {
  if (questionResults.length === 0) return null;

  return (
    <NeuCard>
      <h4 className="font-bold text-base mb-6">Time Spent Per Question</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={getTimeData(questionResults)} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="q" stroke="#475569" tick={{ fontSize: 11 }} />
          <YAxis stroke="#475569" tick={{ fontSize: 11 }} unit="s" />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
            }}
            formatter={(v) => [`${v}s`, "Time"]}
          />
          <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </NeuCard>
  );
}