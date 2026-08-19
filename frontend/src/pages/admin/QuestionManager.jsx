// src/pages/admin/QuestionManager.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Listbox } from "@headlessui/react";
import api from "../../services/api";

function QuestionModal({ show, editing, formData, setFormData, onSave, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#0f172a] p-4 sm:p-6 rounded-t-2xl sm:rounded-xl w-full sm:w-[500px] border border-white/10 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-base sm:text-lg font-semibold text-white">
          {editing ? "Edit" : "Add"} Question
        </h3>

        <textarea
          rows={3}
          value={formData.questionText}
          onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
          placeholder="Question text..."
          className="w-full mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white resize-none text-sm"
        />

        <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">
          Options
        </p>
        {formData.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input
              value={opt}
              onChange={(e) => {
                const newOpts = [...formData.options];
                newOpts[i] = e.target.value;
                setFormData({ ...formData, options: newOpts });
              }}
              placeholder={`Option ${i + 1}`}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm min-w-0"
            />
          </div>
        ))}

        <p className="text-xs text-blue-400/80 mb-2">
          ℹ️ Set the correct answer from the "Upload Answer Key" page after adding questions.
        </p>

        <div className="flex gap-3 mt-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Marks</label>
            <input
              type="number" min={0}
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Negative Marks</label>
            <input
              type="number" min={0}
              value={formData.negativeMarks}
              onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition text-sm touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition text-sm touch-manipulation"
          >
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  questionText: "", options: ["", "", "", ""],
  marks: 1, negativeMarks: 0,
};

export default function QuestionManager() {
  const { token, loading: authLoading } = useAuth();

  const [exams,           setExams]           = useState([]);
  const [selectedExam,    setSelectedExam]    = useState(null);
  const [search,          setSearch]          = useState("");
  const [loading,         setLoading]         = useState(true);
  const [showModal,       setShowModal]       = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData,        setFormData]        = useState(EMPTY_FORM);

  const fetchExams = useCallback(async () => {
    try {
      const { data } = await api.get("/exams");
      setExams(data);
    } catch (err) {
      console.error("Fetch exams error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && token) fetchExams();
  }, [token, authLoading, fetchExams]);

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (questionId) => {
    if (!confirm("Delete this question?")) return;
    try {
      await api.delete(`/exams/${selectedExam._id}/question/${questionId}`);
      await fetchExams();
      setSelectedExam(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedExam)                return alert("Select an exam first");
    if (!formData.questionText.trim()) return alert("Question text is required");
    if (formData.options.some((o) => !o.trim())) return alert("All 4 options are required");
    try {
      if (editingQuestion) {
        await api.put(`/exams/${selectedExam._id}/question/${editingQuestion._id}`, formData);
      } else {
        await api.post(`/exams/${selectedExam._id}/question`, formData);
      }
      setShowModal(false);
      await fetchExams();
      setSelectedExam(null);
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Question Manager</h2>

      <div className="max-w-md mb-4 sm:mb-6 space-y-2">
        <input
          placeholder="Search exam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
        />
        <Listbox value={selectedExam} onChange={setSelectedExam}>
          <div className="relative">
            <Listbox.Button className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-left text-white text-sm hover:border-white/20 transition">
              {selectedExam ? selectedExam.title : "Select Exam"}
            </Listbox.Button>
            <Listbox.Options className="absolute w-full mt-2 bg-[#0f172a] border border-white/10 rounded-xl max-h-52 overflow-y-auto z-50 shadow-xl">
              {filteredExams.length === 0 ? (
                <p className="px-4 py-3 text-gray-500 text-sm">No exams match</p>
              ) : filteredExams.map((exam) => (
                <Listbox.Option
                  key={exam._id}
                  value={exam}
                  className={({ active }) =>
                    `px-4 py-3 cursor-pointer text-sm transition ${active ? "bg-blue-600 text-white" : "text-gray-300"}`
                  }
                >
                  {exam.title}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {selectedExam && (
        <>
          <div className="flex justify-between items-center mb-4 sm:mb-5 gap-3">
            <p className="text-gray-400 text-xs sm:text-sm">
              {selectedExam.questions.length} question{selectedExam.questions.length !== 1 ? "s" : ""} in{" "}
              <span className="text-white font-medium">{selectedExam.title}</span>
            </p>
            <button
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition shrink-0 touch-manipulation"
            >
              + Add Question
            </button>
          </div>

          {selectedExam.questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No questions yet. Click "Add Question" to start.
            </div>
          ) : selectedExam.questions.map((q, i) => (
            <div
              key={q._id}
              className="p-4 sm:p-5 mb-3 sm:mb-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition"
            >
              <p className="font-medium text-white mb-3 text-sm sm:text-base">
                Q{i + 1}. {q.questionText}
              </p>
              <ul className="space-y-1 mb-3">
                {q.options.map((opt, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-gray-400">
                    • {opt}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 text-xs text-gray-500 mb-3">
                <span>Marks: {q.marks}</span>
                <span>Negative: {q.negativeMarks}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(q)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition touch-manipulation"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition touch-manipulation"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <QuestionModal
        show={showModal}
        editing={editingQuestion}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}