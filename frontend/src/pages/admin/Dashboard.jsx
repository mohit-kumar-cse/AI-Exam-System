// src/pages/admin/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

// ── Outside component — pure helpers ─────────────────────────────────────────
function StatCard({ label, value, icon }) {
  return (
    <NeuCard>
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-400 text-sm">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <h2 className="text-3xl font-bold text-white">{value}</h2>
    </NeuCard>
  );
}

function formatLogTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric", month: "short",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { token } = useAuth();

  const [stats, setStats] = useState({
    totalStudents:  0,
    totalExams:     0,
    totalExaminers: 0,
    totalQuestions: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/logs"),
      ]);
      setStats(statsRes.data);
      setRecentLogs(logsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) fetchAll(); }, [token, fetchAll]);

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
    <div className="space-y-6 p-6">

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students"  value={stats.totalStudents}  icon="👨‍🎓" />
        <StatCard label="Total Exams"     value={stats.totalExams}     icon="📋" />
        <StatCard label="Total Examiners" value={stats.totalExaminers} icon="👨‍🏫" />
        <StatCard label="Total Questions" value={stats.totalQuestions} icon="❓" />
      </div>

      {/* INTEGRITY + FAIRNESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NeuCard>
          <h3 className="text-lg font-semibold mb-4 text-white">🔐 System Integrity</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>✅ Secure JWT authentication enabled</p>
            <p>✅ Role-based access control (RBAC)</p>
            <p>✅ Activity logging enabled</p>
            <p>✅ API route protection active</p>
          </div>
        </NeuCard>

        <NeuCard>
          <h3 className="text-lg font-semibold mb-4 text-white">🛡️ Fair Exam System</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>🚫 No duplicate exam attempts</p>
            <p>📊 Real-time monitoring via logs</p>
            <p>👨‍🏫 Examiner assignment tracking</p>
            <p>⚠️ Tamper-proof result verification</p>
          </div>
        </NeuCard>
      </div>

      {/* RECENT ACTIVITY */}
      <NeuCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <span className="text-xs text-gray-500">Latest 5 events</span>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log, index) => (
              <div
                key={log._id || index}
                className="flex justify-between items-start border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-white">{log.message}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {log.user?.name || "System"}
                    {log.user?.email ? ` • ${log.user.email}` : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-4">
                  {formatLogTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </NeuCard>

    </div>
  );
}