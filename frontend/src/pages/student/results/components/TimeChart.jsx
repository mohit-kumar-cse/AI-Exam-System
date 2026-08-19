// src/pages/student/results/components/TimeChart.jsx
import NeuCard from "../../../../components/ui/NeuCard";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getTimeData } from "../utils/chartHelpers";

export default function TimeChart({ questionResults = [] }) {
  if (questionResults.length === 0) return null;

  const data = getTimeData(questionResults);

  return (
    <NeuCard>
      <h4 className="font-bold text-sm sm:text-base mb-4 sm:mb-6">Time Spent Per Question</h4>
       
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          barSize={data.length > 20 ? 8 : 16}  
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="q"
            stroke="#475569"
            tick={{ fontSize: 10 }}
            
            interval={data.length > 15 ? Math.ceil(data.length / 10) - 1 : 0}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 10 }}
            unit="s"
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(v) => [`${v}s`, "Time"]}
          />
          <Bar dataKey="time" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </NeuCard>
  );
}