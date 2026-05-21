// src/pages/examiner/CreateExam.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import NeuInput from "../../components/ui/NeuInput";
import NeuButton from "../../components/ui/NeuButton";
import api from "../../services/api";
import * as XLSX from "xlsx";

const EMPTY_FORM = {
  title: "", subject: "", duration: "",
  totalMarks: "", startTime: "", endTime: "",
};

// ── Parse uploaded Excel file ─────────────────────────────────────────────────
function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: "binary" });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        resolve(
          data.map((row) => ({
            questionText:  row.questionText || row.question || "",
            options:       [row.option1 || "", row.option2 || "", row.option3 || "", row.option4 || ""],
            marks:         parseInt(row.marks)         || 1,
            negativeMarks: parseFloat(row.negativeMarks) || 0,
          }))
        );
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

// ── Download blank template ───────────────────────────────────────────────────
function downloadTemplate() {
  const ws = XLSX.utils.json_to_sheet([{
    questionText: "Sample Question?",
    option1: "A", option2: "B", option3: "C", option4: "D",
    marks: 1, negativeMarks: 0.25,
  }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Questions");
  XLSX.writeFile(wb, "exam_template.xlsx");
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CreateExam() {
  const { token } = useAuth();

  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [questions,    setQuestions]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [useSchedule,  setUseSchedule]  = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsed = await parseExcel(file);
      setQuestions(parsed);
    } catch {
      alert("Failed to parse Excel file. Please use the template.");
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim())   return alert("Enter exam title");
    if (!formData.subject.trim()) return alert("Enter subject");
    if (!formData.duration)       return alert("Enter duration");
    if (!formData.totalMarks)     return alert("Enter total marks");
    if (useSchedule) {
      if (!formData.startTime || !formData.endTime) return alert("Select start & end time");
      if (new Date(formData.startTime) >= new Date(formData.endTime))
        return alert("End time must be after start time");
    }
    if (questions.length === 0) return alert("Upload questions first");

    setLoading(true);
    setSuccessMsg("");
    try {
      const { data: exam } = await api.post("/exams", {
        title:      formData.title,
        subject:    formData.subject,
        duration:   Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        ...(useSchedule && { startTime: formData.startTime, endTime: formData.endTime }),
      });

      await api.post(`/exams/${exam._id}/questions`, { questions });

      setSuccessMsg(`✅ "${exam.title}" created with ${questions.length} questions`);
      setFormData(EMPTY_FORM);
      setQuestions([]);
      setUseSchedule(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl text-white space-y-6">

      {successMsg && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {/* EXAM DETAILS */}
      <NeuCard>
        <h2 className="text-xl font-semibold mb-5">Create Exam</h2>
        <div className="space-y-3">
          <NeuInput placeholder="Exam Title"   name="title"      value={formData.title}      onChange={handleChange} />
          <NeuInput placeholder="Subject"      name="subject"    value={formData.subject}    onChange={handleChange} />
          <div className="grid grid-cols-2 gap-3">
            <NeuInput type="number" placeholder="Duration (mins)" name="duration"   value={formData.duration}   onChange={handleChange} />
            <NeuInput type="number" placeholder="Total Marks"     name="totalMarks" value={formData.totalMarks} onChange={handleChange} />
          </div>

          {/* SCHEDULE TOGGLE */}
          <label className="flex items-center gap-3 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useSchedule}
              onChange={(e) => setUseSchedule(e.target.checked)}
              className="w-5 h-5 accent-blue-500"
            />
            <span className="text-gray-300">Schedule Exam (optional)</span>
          </label>

          {useSchedule && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <p className="text-xs text-blue-400">Exam available only within this window</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                  <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                  <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-white text-sm" />
                </div>
              </div>
            </div>
          )}
        </div>
      </NeuCard>

      {/* UPLOAD QUESTIONS */}
      <NeuCard>
        <h3 className="text-lg font-semibold mb-4">Upload Questions</h3>

        <button onClick={downloadTemplate} className="text-blue-400 hover:text-blue-300 text-sm underline mb-4 block transition">
          ↓ Download Excel Template
        </button>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="block w-full bg-white/5 border border-white/10 p-2 rounded-lg text-sm text-gray-300 mb-4"
        />

        {questions.length > 0 && (
          <p className="text-green-400 text-sm mb-4">
            ✅ {questions.length} question{questions.length !== 1 ? "s" : ""} loaded
          </p>
        )}

        <NeuButton onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create Exam"}
        </NeuButton>
      </NeuCard>
    </div>
  );
}