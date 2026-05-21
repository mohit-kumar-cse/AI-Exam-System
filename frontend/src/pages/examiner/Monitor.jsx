// src/pages/examiner/Monitor.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

// ── Portal dropdown (reused from Users.jsx pattern) ───────────────────────────
function Dropdown({ value, options, onChange, placeholder }) {
  const [open,     setOpen]     = useState(false);
  const [position, setPosition] = useState({});
  const ref         = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div ref={ref} onClick={() => setOpen(!open)}
        className="bg-[#1e293b] text-white px-4 py-2 rounded-xl cursor-pointer border border-gray-600 flex justify-between items-center hover:border-blue-500 transition select-none">
        <span>{value || placeholder}</span>
        <span className="text-gray-400">▾</span>
      </div>
      {open && createPortal(
        <div ref={dropdownRef}
          style={{ position: "absolute", top: position.top, left: position.left, width: position.width, zIndex: 9999 }}
          className="bg-[#0f172a] border border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {options.map((opt) => (
            <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-600 transition ${value === opt.label ? "bg-blue-500 text-white" : "text-gray-300"}`}>
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Student row ───────────────────────────────────────────────────────────────
function StudentRow({ s }) {
  const pct = s.totalQuestions > 0
    ? Math.round((s.answeredQuestions / s.totalQuestions) * 100)
    : 0;

  return (
    <tr className="border-b border-gray-800 hover:bg-[#1e293b] transition">
      <td className="p-3">
        <p className="font-medium">{s.name}</p>
        <p className="text-xs text-gray-400">{s.email}</p>
      </td>
      <td className="p-3 w-56">
        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400">{pct}% ({s.answeredQuestions}/{s.totalQuestions})</p>
      </td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs ${
          s.status === "completed"
            ? "bg-green-500/20 text-green-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}>
          {s.status}
        </span>
      </td>
      <td className="p-3 text-xs text-gray-400">
        {s.submittedAt ? new Date(s.submittedAt).toLocaleString("en-IN") : "—"}
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Monitor() {
  const { token } = useAuth();

  const [exams,        setExams]        = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [monitorData,  setMonitorData]  = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState(null);

  const fetchExams = useCallback(async () => {
    try {
      const { data } = await api.get("/examiner/exams");
      setExams(data);
    } catch (err) {
      console.error("Fetch exams error:", err);
    }
  }, []);

  const fetchMonitorData = useCallback(async () => {
    if (!selectedExam) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/examiner/monitor/${selectedExam}`);
      setMonitorData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Monitor fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedExam]);

  useEffect(() => { if (token) fetchExams(); }, [token, fetchExams]);

  useEffect(() => {
    if (!selectedExam) return;
    fetchMonitorData();
    const interval = setInterval(fetchMonitorData, 5000);
    return () => clearInterval(interval);
  }, [selectedExam, fetchMonitorData]);

  const examOptions = exams.map((e) => ({ label: e.title, value: e._id }));
  const selectedLabel = examOptions.find((e) => e.value === selectedExam)?.label;

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Exam Monitor</h2>
        {lastUpdated && (
          <span className="text-sm text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* SELECT EXAM */}
      <NeuCard className="max-w-md">
        <p className="text-gray-400 text-sm mb-2">Select Exam to Monitor</p>
        <Dropdown
          value={selectedLabel}
          options={examOptions}
          onChange={setSelectedExam}
          placeholder="Choose an exam"
        />
      </NeuCard>

      {/* MONITOR DATA */}
      {monitorData && (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <NeuCard>
              <p className="text-gray-400 text-sm">Students Appeared</p>
              <p className="text-3xl font-bold mt-1">{monitorData.totalStudents}</p>
            </NeuCard>
            <NeuCard>
              <p className="text-gray-400 text-sm">Status</p>
              <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            </NeuCard>
            <NeuCard>
              <p className="text-gray-400 text-sm">Auto Refresh</p>
              <p className="text-blue-400 mt-1 text-sm">Every 5 seconds</p>
            </NeuCard>
          </div>

          <NeuCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Student Activity</h3>
              {loading && <span className="text-sm text-gray-400 animate-pulse">Refreshing...</span>}
            </div>

            {monitorData.studentsData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                🚫 No students started this exam yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-left">
                      <th className="p-3">Student</th>
                      <th className="p-3">Progress</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitorData.studentsData.map((s) => (
                      <StudentRow key={s.studentId} s={s} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </NeuCard>
        </>
      )}
    </div>
  );
}