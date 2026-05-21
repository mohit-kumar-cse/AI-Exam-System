// src/pages/student/Profile.jsx
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { Mail, User, Calendar, Shield, TrendingUp } from "lucide-react";
import api from "../../services/api";

// ── Sub-components — outside main component so they never re-mount ───────────

function ProfileItem({ icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition">
      <div className="text-blue-400 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-white ${mono ? "font-mono text-sm break-all" : "text-base"}`}>
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:scale-105 transition">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { user, token } = useAuth();

  const [stats,   setStats]   = useState({ exams: 0, passed: 0, failed: 0, avg: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/results/my-results");
      const results  = Array.isArray(data) ? data : [];
      const exams    = results.length;
      const passed   = results.filter((r) => (r.percentage ?? 0) >= 40).length;
      const failed   = exams - passed;
      const avg      = exams > 0
        ? (results.reduce((sum, r) => sum + Number(r.percentage || 0), 0) / exams).toFixed(1)
        : 0;
      setStats({ exams, passed, failed, avg });
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchStats();
  }, [token, fetchStats]);

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "N/A";

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">

        {/* PAGE TITLE */}
        <h2 className="text-3xl font-bold text-center mb-8 text-white tracking-tight">
          My Profile
        </h2>

        {/* MAIN CARD */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">

          {/* AVATAR + NAME */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shrink-0">
              {avatarLetter}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white">
                {user?.name || "N/A"}
              </h3>
              <div className="flex items-center gap-2 justify-center md:justify-start mt-2">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                  {user?.role || "student"}
                </span>
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mb-6" />

          {/* PROFILE DETAILS */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <ProfileItem icon={<User size={18} />}     label="Full Name"      value={user?.name} />
            <ProfileItem icon={<Mail size={18} />}     label="Email Address"  value={user?.email} />
            <ProfileItem icon={<Shield size={18} />}   label="User ID"        value={user?._id || user?.id} mono />
            <ProfileItem icon={<Calendar size={18} />} label="Joined On"      value={joined} />
          </div>

          <div className="border-t border-white/10 mb-6" />

          {/* STATS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-blue-400" />
              <p className="text-sm text-gray-400 uppercase tracking-widest">
                Exam Statistics
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Exams"
                value={loading ? "..." : stats.exams}
              />
              <StatCard
                label="Passed"
                value={loading ? "..." : stats.passed}
                color="text-green-400"
              />
              <StatCard
                label="Failed"
                value={loading ? "..." : stats.failed}
                color="text-red-400"
              />
              <StatCard
                label="Avg Score"
                value={loading ? "..." : `${stats.avg}%`}
                color="text-blue-400"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}