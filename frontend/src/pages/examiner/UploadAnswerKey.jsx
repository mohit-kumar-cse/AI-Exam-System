// src/pages/examiner/UploadAnswerKey.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";
import NeuButton from "../../components/ui/NeuButton";
import api from "../../services/api";

function QuestionRow({ question, index, selectedAnswer, onAnswer }) {
  return (
    <div className={`border p-3 sm:p-4 rounded-xl transition ${
      selectedAnswer !== undefined
        ? "border-green-500/40 bg-green-500/5"
        : "border-white/10 bg-white/5"
    }`}>
      <div className="flex items-start justify-between mb-3 gap-2">
        <p className="font-medium text-white text-sm sm:text-base">
          Q{index + 1}. {question.questionText}
        </p>
        {selectedAnswer !== undefined && (
          <span className="text-green-400 text-xs shrink-0">✓ Set</span>
        )}
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === i;
          return (
            <label
              key={i}
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer border transition touch-manipulation ${
                isSelected
                  ? "bg-blue-600/20 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name={`question-${question._id}`}
                checked={isSelected}
                onChange={() => onAnswer(question._id, i)}
                className="accent-blue-500 shrink-0"
              />
              <span className="text-xs sm:text-sm">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function UploadAnswerKey() {
  const { token } = useAuth();

  const [exams,        setExams]        = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [answers,      setAnswers]      = useState({});
  const [loading,      setLoading]      = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMsg,   setSuccessMsg]   = useState("");

  const fetchExams = useCallback(async () => {
    try {
      const { data } = await api.get("/examiner/exams");
      setExams(data.filter((e) => !e.resultReleased));
    } catch (err) {
      console.error("Fetch exams error:", err);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => { if (token) fetchExams(); }, [token, fetchExams]);

  const handleExamSelect = (examId) => {
    
    const exam = exams.find((e) => e._id === examId);
    setSelectedExam(exam || null);
    setAnswers({});
    setSuccessMsg("");
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleUpload = async () => {
    if (!selectedExam) return alert("Please select an exam");

    const total    = selectedExam.questions.length;
    const answered = Object.keys(answers).length;

    if (answered < total) {
      alert(`Please answer all questions (${answered}/${total} answered)`);
      return;
    }

    if (!confirm("Upload answer key? This action cannot be undone — results will be auto-evaluated.")) return;

    setLoading(true);
    setSuccessMsg("");
    try {
      await api.post(`/exams/${selectedExam._id}/answer-key`, { answers });
      setSuccessMsg(`✅ Answer key uploaded for "${selectedExam.title}" — results evaluated!`);
      setSelectedExam(null);
      setAnswers({});
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload answer key");
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount    = selectedExam?.questions?.length || 0;
  const allAnswered   = totalCount > 0 && answeredCount === totalCount;
  const progressPct   = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-4 sm:space-y-6">

      {successMsg && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs sm:text-sm">
          {successMsg}
        </div>
      )}

      <NeuCard>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-white">Upload Answer Key</h2>

        {/* SELECT EXAM */}
        <div className="mb-5 sm:mb-6">
          <label className="block text-xs sm:text-sm text-gray-400 mb-2">Select Exam</label>
          <select
            onChange={(e) => handleExamSelect(e.target.value)}
            value={selectedExam?._id || ""}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="" className="bg-[#0f172a]">Choose an exam...</option>
            {exams.length === 0 ? (
              <option disabled className="bg-[#0f172a]">No exams available</option>
            ) : exams.map((exam) => (
              <option key={exam._id} value={exam._id} className="bg-[#0f172a]">
                {exam.title} ({exam.questions?.length || 0} questions)
              </option>
            ))}
          </select>
          {exams.length === 0 && (
            <p className="text-orange-400 text-xs mt-2">
              ⚠️ No exams pending answer key upload.
            </p>
          )}
        </div>

        
        {selectedExam && (
          <>
            
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-gray-400">Answer Key Progress</span>
                <span className={`text-xs sm:text-sm font-medium ${allAnswered ? "text-green-400" : "text-gray-300"}`}>
                  {answeredCount} / {totalCount}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${allAnswered ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            
            <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
              {selectedExam.questions.map((q, index) => (
                <QuestionRow
                  key={q._id}
                  question={q}
                  index={index}
                  selectedAnswer={answers[q._id]}
                  onAnswer={handleAnswer}
                />
              ))}
            </div>

             
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <NeuButton
                onClick={handleUpload}
                disabled={loading || !allAnswered}
                className="w-full sm:w-auto justify-center"
              >
                {loading ? "Uploading..." : "Upload Answer Key"}
              </NeuButton>
              <p className="text-xs text-red-400 sm:max-w-xs">
                ⚠️ Once uploaded, results are auto-evaluated and the key cannot be changed.
              </p>
            </div>
          </>
        )}
      </NeuCard>
    </div>
  );
}