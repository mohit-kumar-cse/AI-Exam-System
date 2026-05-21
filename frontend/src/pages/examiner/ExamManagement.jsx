// src/pages/examiner/ExamManagement.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// ── Pure helpers ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  green:  "bg-green-500/20 text-green-400 border-green-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  red:    "bg-red-500/20 text-red-400 border-red-500/30",
  blue:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

function getExamStatus(exam) {
  if (!exam.startTime || !exam.endTime) return { text: "Anytime", color: "blue" };
  const now = new Date(), start = new Date(exam.startTime), end = new Date(exam.endTime);
  if (now < start) return { text: "Upcoming", color: "orange" };
  if (now <= end)  return { text: "Live",     color: "green"  };
  return            { text: "Ended",    color: "red"    };
}

function formatDate(d) {
  return new Date(d).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

// ── Exam card ─────────────────────────────────────────────────────────────────
function ExamCard({ exam, onPublish, onDelete, onMonitor }) {
  const status = getExamStatus(exam);
  const completeness = Math.min((exam.questions?.length || 0) * 10, 100);

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition">
      <div className="flex justify-between gap-6">

        {/* LEFT */}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <h3 className="text-lg font-semibold">{exam.title}</h3>
            <span className={`px-3 py-1 text-xs rounded-full border ${
              exam.isPublished
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-gray-500/20 text-gray-300 border-gray-500/30"
            }`}>
              {exam.isPublished ? "Published" : "Draft"}
            </span>
            {exam.isPublished && (
              <span className={`px-3 py-1 text-xs rounded-full border flex items-center gap-1 ${STATUS_STYLES[status.color]}`}>
                {status.text === "Live" && (
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
                {status.text}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 mb-4">
            <p><span className="text-gray-500">Subject: </span>{exam.subject}</p>
            <p><span className="text-gray-500">Duration: </span>{exam.duration}m</p>
            <p><span className="text-gray-500">Marks: </span>{exam.totalMarks}</p>
            <p><span className="text-gray-500">Questions: </span>{exam.questions?.length || 0}</p>
          </div>

          {/* COMPLETENESS BAR */}
          <div className="mb-4">
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${completeness}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Exam completeness</p>
          </div>

          {exam.startTime && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-3 text-xs text-blue-300 space-y-1">
              <p>Start: {formatDate(exam.startTime)}</p>
              <p>End:   {formatDate(exam.endTime)}</p>
            </div>
          )}

          <p className="text-xs text-gray-600">
            Created: {new Date(exam.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 min-w-[110px]">
          <button
            onClick={() => onPublish(exam._id, exam.isPublished)}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              exam.isPublished ? "bg-gray-700 hover:bg-gray-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {exam.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button onClick={() => onDelete(exam._id)} className="px-3 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 transition">
            Delete
          </button>
          <button onClick={onMonitor} className="px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 transition">
            Monitor
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExamManagement() {
  const { token }  = useAuth();
  const navigate   = useNavigate();

  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = useCallback(async () => {
    try {
      const { data } = await api.get("/examiner/exams");
      setExams(data);
    } catch (err) {
      console.error("Fetch exams error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) fetchExams(); }, [token, fetchExams]);

  const handlePublish = async (id, current) => {
    try {
      await api.patch(`/exams/${id}/publish`, { isPublished: !current });
      fetchExams();
    } catch {
      alert("Failed to update publish status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this exam? This cannot be undone.")) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Exam Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            {exams.length} exam{exams.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button onClick={() => navigate("/examiner/create")} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl transition shadow text-sm font-medium">
          + Create Exam
        </button>
      </div>

      {/* EMPTY STATE */}
      {exams.length === 0 ? (
        <div className="text-center py-16 border border-gray-800 rounded-2xl bg-[#0f172a]">
          <p className="text-4xl mb-3">📄</p>
          <h3 className="text-lg font-semibold mb-1">No exams yet</h3>
          <p className="text-gray-400 text-sm mb-4">Start by creating your first exam</p>
          <button onClick={() => navigate("/examiner/create")} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
            Create Exam
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {exams.map((exam) => (
            <ExamCard
              key={exam._id}
              exam={exam}
              onPublish={handlePublish}
              onDelete={handleDelete}
              onMonitor={() => navigate("/examiner/monitor")}
            />
          ))}
        </div>
      )}
    </div>
  );
}