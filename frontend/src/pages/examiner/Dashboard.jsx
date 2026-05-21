// src/pages/examiner/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

// ── Outside component ─────────────────────────────────────────────────────────
function StatCard({ title, value, color, icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-[#0f172a] border border-gray-800 hover:border-gray-600 transition">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${color}`} />
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-1 text-white">{value}</h2>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function InsightCard({ label, value, color }) {
  return (
    <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { token } = useAuth();

  const [stats, setStats] = useState({
    examsCreated: 0, activeExams: 0, pendingKeys: 0,
  });
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/examiner/dashboard");
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) fetchStats(); }, [token, fetchStats]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Examiner Dashboard</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchStats} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Exams Created" value={stats.examsCreated} color="bg-blue-500"   icon="📘" />
        <StatCard title="Active Exams"  value={stats.activeExams}  color="bg-green-500"  icon="🟢" />
        <StatCard title="Pending Keys"  value={stats.pendingKeys}  color="bg-orange-500" icon="⏳" />
      </div>

      {/* INSIGHTS */}
      <NeuCard>
        <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <InsightCard label="System Health"   value="All systems operational"                                                  color="text-green-400"  />
          <InsightCard label="Exam Activity"   value={stats.activeExams > 0 ? `${stats.activeExams} exams running` : "No active exams"} color="text-blue-400"   />
          <InsightCard label="Pending Reviews" value={`${stats.pendingKeys} awaiting action`}                                   color="text-orange-400" />
        </div>
      </NeuCard>

    </div>
  );
}