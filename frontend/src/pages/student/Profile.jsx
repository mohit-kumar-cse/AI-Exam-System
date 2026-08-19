// src/pages/student/Profile.jsx
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { Mail, User, Calendar, Shield, TrendingUp } from "lucide-react";
import api from "../../services/api";

function ProfileItem({ icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:bg-white/10 transition">
      <div className="text-blue-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-400">{label}</p>
        <p className={`text-white text-sm sm:text-base ${mono ? "font-mono break-all" : ""}`}>
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-center hover:scale-105 transition">
      <p className="text-gray-400 text-xs sm:text-sm mb-1">{label}</p>
      <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function Profile() {
  const { user, token } = useAuth();

  const [stats,   setStats]   = useState({ exams: 0, passed: 0, failed: 0, avg: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data }  = await api.get("/results/my-results");
      const results   = Array.isArray(data) ? data : [];
      const exams     = results.length;
      const passed    = results.filter((r) => (r.percentage ?? 0) >= 40).length;
      const avg       = exams > 0
        ? (results.reduce((sum, r) => sum + Number(r.percentage || 0), 0) / exams).toFixed(1)
        : 0;
      setStats({ exams, passed, failed: exams - passed, avg });
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) fetchStats(); }, [token, fetchStats]);

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "N/A";
    
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";
   
  const hasProfilePic = Boolean(user?.profilePicture);

  return (
    <div className="flex items-start justify-center py-4 sm:py-8">
      <div className="w-full max-w-4xl">

        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-white">
          My Profile
        </h2>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8 shadow-xl">

           
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-center sm:text-left">
            
             
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full shadow-lg shrink-0 overflow-hidden bg-white/10 flex items-center justify-center">
              {hasProfilePic ? (
                <img 
                  src={user.profilePicture} 
                  alt={user?.name || "Profile"} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"  
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {avatarLetter}
                </div>
              )}
            </div>

            <div className="min-w-0 max-w-full">
              
              <h3 className="text-xl sm:text-2xl font-bold text-white break-words">
                {user?.name || "N/A"}
              </h3>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-2 flex-wrap">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize">
                  {user?.role || "student"}
                </span>
                <span className="text-green-400 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mb-5 sm:mb-6" />

          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <ProfileItem icon={<User    size={16} />} label="Full Name"     value={user?.name} />
            <ProfileItem icon={<Mail    size={16} />} label="Email Address" value={user?.email} />
            <ProfileItem icon={<Shield  size={16} />} label="User ID"       value={user?._id || user?.id} mono />
            <ProfileItem icon={<Calendar size={16} />} label="Joined On"     value={joined} />
          </div>

          <div className="border-t border-white/10 mb-5 sm:mb-6" />

          
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp size={15} className="text-blue-400" />
              <p className="text-xs text-gray-400 uppercase tracking-widest">Exam Statistics</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Total Exams" value={loading ? "…" : stats.exams} />
              <StatCard label="Passed"      value={loading ? "…" : stats.passed} color="text-green-400" />
              <StatCard label="Failed"      value={loading ? "…" : stats.failed} color="text-red-400" />
              <StatCard label="Avg Score"   value={loading ? "…" : `${stats.avg}%`} color="text-blue-400" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}