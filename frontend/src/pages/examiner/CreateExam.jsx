// src/pages/examiner/CreateExam.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import NeuInput from "../../components/ui/NeuInput";
import NeuButton from "../../components/ui/NeuButton";
import api from "../../services/api";
import * as XLSX from "xlsx";
import { AlertCircle, CheckCircle2, UploadCloud, FileSpreadsheet } from "lucide-react";  

const EMPTY_FORM = {
  title: "",
  subject: "",
  duration: "",
  totalMarks: "",
  startTime: "",
  endTime: "",
};

 
function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        const formattedQuestions = data.map((row) => ({
          questionText: String(row.questionText || row.question || "").trim(),
          
          options: [
            String(row.option1 || "").trim(),
            String(row.option2 || "").trim(),
            String(row.option3 || "").trim(),
            String(row.option4 || "").trim(),
          ],
          marks: parseInt(row.marks) || 1,
          negativeMarks: parseFloat(row.negativeMarks) || 0,
        }));
        
        resolve(formattedQuestions);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

function downloadTemplate() {
  const ws = XLSX.utils.json_to_sheet([
    {
      questionText: "Which memory management technique avoids external fragmentation?",
      option1: "Paging",
      option2: "Segmentation",
      option3: "Contiguous Allocation",
      option4: "Swapping",
      marks: 1,
      negativeMarks: 0.25,
    },
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Questions");
  XLSX.writeFile(wb, "exam_template.xlsx");
}

export default function CreateExam() {
  const { token } = useAuth(); 
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useSchedule, setUseSchedule] = useState(false);
  
   
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fileLabel, setFileLabel] = useState(""); 

  const handleChange = (e) => {
    setErrorMsg("");  
    setSuccessMsg("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = async (e) => {
    setErrorMsg("");
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const parsed = await parseExcel(file);
      
      
      const valid = parsed.filter((q) => 
        q.questionText && q.options.every(opt => opt.length > 0)
      );

      if (valid.length === 0) {
        setErrorMsg("No valid questions found. Ensure all questions have 4 options.");
        return;
      }
      
      setQuestions(valid);
      setFileLabel(file.name);
    } catch {
      setErrorMsg("Failed to parse Excel file. Please use the exact template format.");
    }
    e.target.value = ""; 
  };

  const handleCreate = async () => {
    setErrorMsg("");
    setSuccessMsg("");

     
    if (!formData.title.trim()) return setErrorMsg("Exam title is required.");
    if (!formData.subject.trim()) return setErrorMsg("Subject is required.");
    if (!formData.duration || Number(formData.duration) <= 0) return setErrorMsg("Enter a valid duration in minutes.");
    if (!formData.totalMarks || Number(formData.totalMarks) <= 0) return setErrorMsg("Enter valid total marks.");
    
    if (useSchedule) {
      if (!formData.startTime || !formData.endTime) return setErrorMsg("Please select both start and end times.");
      
      const start = new Date(formData.startTime).getTime();
      const end = new Date(formData.endTime).getTime();
      const now = Date.now();
      
      if (start >= end) return setErrorMsg("End time must be after the start time.");
       
      if (start < now - 5 * 60000) return setErrorMsg("Start time cannot be in the past."); 
    }
    
    if (questions.length === 0) return setErrorMsg("Please upload an Excel file with questions.");

    setLoading(true);
    try {
      const { data } = await api.post("/exams", {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        ...(useSchedule && {
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      const exam = data.exam || data;

      if (!exam?._id) throw new Error("Exam ID not returned from server.");

      await api.post(`/exams/${exam._id}/questions`, {
        questions,
      });

      setSuccessMsg(`Successfully created "${exam.title}" with ${questions.length} questions!`);
      setFormData(EMPTY_FORM);
      setQuestions([]);
      setUseSchedule(false);
      setFileLabel("");
      
      
      setTimeout(() => setSuccessMsg(""), 5000);
      
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "An error occurred while creating the exam.");
    } finally {
      setLoading(false);
    }
  };

  const dateInputClass =
    "w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition";

  return (
    <div className="w-full max-w-3xl mx-auto text-white space-y-4 sm:space-y-6 pb-10">
      
       
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} className="shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      
        <NeuCard className="h-fit">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">
            Exam Details
          </h2>
          <div className="space-y-4">
            <NeuInput
              placeholder="Exam Title (e.g. Midterm OS)"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            <NeuInput
              placeholder="Subject (e.g. Operating Systems)"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            />

            <div className="grid grid-cols-2 gap-3">
              <NeuInput
                type="number"
                placeholder="Duration (mins)"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              />
              <NeuInput
                type="number"
                placeholder="Total Marks"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer touch-manipulation select-none">
                <input
                  type="checkbox"
                  checked={useSchedule}
                  onChange={(e) => {
                    setErrorMsg("");
                    setUseSchedule(e.target.checked);
                  }}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300 text-sm font-medium">
                  Set specific date & time window
                </span>
              </label>
            </div>

            {useSchedule && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 animate-in fade-in">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={dateInputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block uppercase tracking-wider font-medium">
                    Ends At
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={dateInputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </NeuCard>

        
        <div className="space-y-4 sm:space-y-6">
          <NeuCard>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Questions Setup</h3>
              <button
                onClick={downloadTemplate}
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
                title="Download Excel Template"
              >
                <FileSpreadsheet size={14} /> Template
              </button>
            </div>

            {/* Drag & Drop style area */}
            <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-white/10 group">
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <UploadCloud size={28} className="text-gray-400 group-hover:text-blue-400 transition" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[250px]">
                  {fileLabel || "Excel files (.xlsx, .xls) only"}
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

             
            {questions.length > 0 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} /> 
                  {questions.length} questions ready
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  e.g., "{questions[0].questionText}"
                </p>
              </div>
            )}
          </NeuCard>

          <NeuButton
            onClick={handleCreate}
            disabled={loading}
            className="w-full justify-center py-3.5 text-base shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Finalize & Create Exam"
            )}
          </NeuButton>
        </div>
      </div>
    </div>
  );
}