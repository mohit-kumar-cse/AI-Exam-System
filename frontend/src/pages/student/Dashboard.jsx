// src/pages/student/Dashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

function formatExamDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Dashboard() {
  const { token, user } = useAuth();

  const [data, setData] = useState({
    totalAttempted: 0,
    totalPassed: 0,
    upcomingExam: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await api.get("/student/dashboard");
      setData(res);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = (user?.name || "S").charAt(0).toUpperCase();

  const StatBlock = ({ label, children }) => (
    <NeuCard>
      <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
        {label}
      </h3>
      {children}
    </NeuCard>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

      {/* STUDENT INFO */}
      <NeuCard className="sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shrink-0">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {avatarLetter}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider mb-0.5">
              Student
            </p>
            <p className="text-base sm:text-lg font-semibold text-white truncate">
              {user?.name || "N/A"}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 truncate">
              {user?.email || "No email"}
            </p>
          </div>
        </div>
      </NeuCard>

       
      <StatBlock label="Upcoming Exam">
        {data.upcomingExam ? (
          <>
            <p className="text-white font-medium text-sm sm:text-base truncate">
              {data.upcomingExam.title}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {formatExamDate(data.upcomingExam.startTime) || "Time TBA"}
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-sm">No upcoming exam</p>
        )}
      </StatBlock>

      
      <StatBlock label="Exam Performance">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {data.totalAttempted}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Attempted</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              {data.totalPassed}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Passed</p>
          </div>
        </div>
      </StatBlock>

    </div>
  );
}