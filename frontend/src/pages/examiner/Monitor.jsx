// src/pages/examiner/Monitor.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

function Dropdown({ value, selectedValue, options, onChange, placeholder }) {
  const [open,     setOpen]     = useState(false);
  const [position, setPosition] = useState({});
  const ref         = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top:   rect.bottom + window.scrollY,
        left:  rect.left   + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current         && !ref.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div
        ref={ref}
        onClick={() => setOpen(!open)}
        className="bg-[#1e293b] text-white px-4 py-2.5 rounded-xl cursor-pointer border border-gray-600 flex justify-between items-center hover:border-blue-500 transition select-none text-sm touch-manipulation"
      >
        <span className="truncate">{value || placeholder}</span>
        <span className="text-gray-400 shrink-0 ml-2">▾</span>
      </div>
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "absolute", top: position.top, left: position.left, width: position.width, zIndex: 9999 }}
          className="bg-[#0f172a] border border-gray-700 rounded-xl shadow-xl overflow-hidden"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-4 py-2.5 cursor-pointer hover:bg-blue-600 transition text-sm touch-manipulation ${
                selectedValue === opt.value ? "bg-blue-500 text-white" : "text-gray-300"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function StudentCard({ s }) {
  const pct = s.totalQuestions > 0
    ? Math.round((s.answeredQuestions / s.totalQuestions) * 100)
    : 0;

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-white">{s.name}</p>
          <p className="text-xs text-gray-400 truncate">{s.email}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${
          s.status === "completed"
            ? "bg-green-500/20 text-green-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}>
          {s.status}
        </span>
      </div>
      <div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400">
          {pct}% — {s.answeredQuestions}/{s.totalQuestions} answered
        </p>
      </div>
      {s.submittedAt && (
        <p className="text-xs text-gray-500">
          Submitted: {new Date(s.submittedAt).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

function StudentRow({ s }) {
  const pct = s.totalQuestions > 0
    ? Math.round((s.answeredQuestions / s.totalQuestions) * 100)
    : 0;

  return (
    <tr className="border-b border-gray-800 hover:bg-[#1e293b] transition">
      <td className="p-3">
        <p className="font-medium text-sm">{s.name}</p>
        <p className="text-xs text-gray-400">{s.email}</p>
      </td>
      <td className="p-3 w-52">
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

  const examOptions    = exams.map((e) => ({ label: e.title, value: e._id }));
  const selectedLabel  = examOptions.find((e) => e.value === selectedExam)?.label;

  return (
    <div className="space-y-4 sm:space-y-6 text-white">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Live Exam Monitor</h2>
        {lastUpdated && (
          <span className="text-xs sm:text-sm text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <NeuCard className="sm:max-w-md">
        <p className="text-gray-400 text-xs sm:text-sm mb-2">Select Exam to Monitor</p>
        <Dropdown
          value={selectedLabel}
          selectedValue={selectedExam}
          options={examOptions}
          onChange={setSelectedExam}
          placeholder="Choose an exam"
        />
      </NeuCard>

      {monitorData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <NeuCard>
              <p className="text-gray-400 text-xs sm:text-sm">Students Appeared</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{monitorData.totalStudents}</p>
            </NeuCard>
            <NeuCard>
              <p className="text-gray-400 text-xs sm:text-sm">Status</p>
              <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            </NeuCard>
            <NeuCard>
              <p className="text-gray-400 text-xs sm:text-sm">Auto Refresh</p>
              <p className="text-blue-400 mt-1 text-xs sm:text-sm">Every 5 seconds</p>
            </NeuCard>
          </div>

          <NeuCard>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Student Activity</h3>
              {loading && (
                <span className="text-xs sm:text-sm text-gray-400 animate-pulse">Refreshing...</span>
              )}
            </div>

            {monitorData.studentsData.length === 0 ? (
              <div className="text-center py-8 sm:py-10 text-gray-500 text-sm">
                🚫 No students started this exam yet
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {monitorData.studentsData.map((s) => (
                    <StudentCard key={s.studentId} s={s} />
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto">
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
              </>
            )}
          </NeuCard>
        </>
      )}
    </div>
  );
}