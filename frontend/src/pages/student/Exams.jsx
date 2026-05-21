// src/pages/student/Exams.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

const STATUS_COLORS = {
  gray:   "bg-gray-300/20 text-gray-400 border-gray-600",
  orange: "bg-orange-200/20 text-orange-400 border-orange-500/40",
  red:    "bg-red-200/20 text-red-400 border-red-500/40",
  green:  "bg-green-200/20 text-green-400 border-green-500/40",
};

function checkExamAvailability(exam) {
  if (!exam.isPublished)    return { canStart: false, reason: "Not Published", color: "gray" };
  if (exam.resultReleased)  return { canStart: false, reason: "Completed",     color: "green" };
  if (!exam.startTime || !exam.endTime) return { canStart: true, reason: "Available", color: "green" };

  const now = new Date(), start = new Date(exam.startTime), end = new Date(exam.endTime);
  if (now < start) {
    const mins = Math.ceil((start - now) / 60000);
    return { canStart: false, reason: mins < 60 ? `Starts in ${mins} min` : `Starts in ${Math.ceil(mins / 60)}h`, color: "orange" };
  }
  if (now > end) return { canStart: false, reason: "Ended", color: "red" };
  return { canStart: true, reason: `${Math.ceil((end - now) / 60000)} min left`, color: "green" };
}

function formatDateTime(d) {
  if (!d) return null;
  return new Date(d).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function Exams() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!token) return;
    api.get("/exams")
      .then(({ data }) => {
        if (Array.isArray(data))            setExams(data);
        else if (Array.isArray(data.exams)) setExams(data.exams);
        else                                setExams([]);
      })
      .catch(() => setError("Unable to load exams. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading exams...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="text-center"><p className="text-4xl mb-3">⚠️</p><p className="text-red-400">{error}</p></div>
    </div>
  );

  if (exams.length === 0) return (
    <div className="p-6">
      <NeuCard>
        <div className="py-12 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-300 font-medium">No exams available</p>
          <p className="text-gray-500 text-sm mt-1">Check back later for upcoming exams.</p>
        </div>
      </NeuCard>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Available Exams</h2>
        <p className="text-gray-400 text-sm mt-1">{exams.length} exam{exams.length !== 1 ? "s" : ""} listed</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => {
          const av  = checkExamAvailability(exam);
          const has = exam.startTime && exam.endTime;
          return (
            <NeuCard key={exam._id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-white">{exam.title}</h3>
                  <p className="text-sm text-gray-400">{exam.subject || "No subject"}</p>
                </div>
                {exam.resultReleased && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400">✓ Results Out</span>
                )}
              </div>
              <p className="text-sm text-gray-300 mb-3">
                ⏱ {exam.duration} mins
                {exam.totalMarks ? <span className="ml-4">📊 {exam.totalMarks} marks</span> : null}
              </p>
              {has && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm">
                  <p className="font-medium text-blue-400 mb-1">📅 Scheduled</p>
                  <p className="text-gray-300">{formatDateTime(exam.startTime)} — {formatDateTime(exam.endTime)}</p>
                </div>
              )}
              {av.canStart ? (
                <button onClick={() => navigate(`/student/exams/${exam._id}`)}
                  className="mt-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition">
                  Start Exam →
                </button>
              ) : (
                <button disabled
                  className={`mt-2 w-full px-4 py-2 rounded-xl font-semibold cursor-not-allowed border ${STATUS_COLORS[av.color]}`}>
                  {av.reason}
                </button>
              )}
            </NeuCard>
          );
        })}
      </div>
    </div>
  );
}