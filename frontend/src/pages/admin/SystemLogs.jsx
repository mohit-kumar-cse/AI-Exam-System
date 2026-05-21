// src/pages/admin/SystemLogs.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

// ── Pure helpers — outside component ─────────────────────────────────────────
const LOG_COLORS = {
  auth:    "text-blue-400",
  exam:    "text-green-400",
  admin:   "text-yellow-400",
  error:   "text-red-400",
  default: "text-gray-400",
};

const LOG_BADGES = {
  auth:    "bg-blue-500/10 border-blue-500/30 text-blue-400",
  exam:    "bg-green-500/10 border-green-500/30 text-green-400",
  admin:   "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  error:   "bg-red-500/10 border-red-500/30 text-red-400",
  default: "bg-gray-500/10 border-gray-500/30 text-gray-400",
};

function getColor(type)  { return LOG_COLORS[type]  || LOG_COLORS.default;  }
function getBadge(type)  { return LOG_BADGES[type]  || LOG_BADGES.default;  }

function formatTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SystemLogs() {
  const { token } = useAuth();

  const [logs,    setLogs]    = useState([]);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await api.get("/logs");
      setLogs(data);
    } catch (err) {
      console.error("Logs fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) fetchLogs(); }, [token, fetchLogs]);

  // ── Derived filter — no extra state ──────────────────────────────────────
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || log.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">System Logs</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {filteredLogs.length} of {logs.length} log{logs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition text-gray-400"
        >
          ↻ Refresh
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by message or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          <option value="all">All Types</option>
          <option value="auth">Auth</option>
          <option value="exam">Exam</option>
          <option value="admin">Admin</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* LOG LIST */}
      {filteredLogs.length === 0 ? (
        <NeuCard>
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">No logs match your search</p>
          </div>
        </NeuCard>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <NeuCard key={log._id}>
              <div className="flex justify-between items-start gap-4">

                {/* LEFT */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {log.type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${getBadge(log.type)}`}>
                        {log.type}
                      </span>
                    )}
                    <p className={`font-medium text-sm ${getColor(log.type)}`}>
                      {log.message}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {log.user?.name || "System"}
                    {log.user?.email ? ` • ${log.user.email}` : ""}
                  </p>
                </div>

                {/* RIGHT */}
                <span className="text-xs text-gray-500 shrink-0">
                  {formatTime(log.createdAt)}
                </span>

              </div>
            </NeuCard>
          ))}
        </div>
      )}
    </div>
  );
}