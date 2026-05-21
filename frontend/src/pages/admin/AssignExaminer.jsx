// src/pages/admin/AssignExaminer.jsx
import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import NeuCard from "../../components/ui/NeuCard";
import NeuButton from "../../components/ui/NeuButton";
import api from "../../services/api";

export default function AssignExaminer() {
  const [exams,            setExams]            = useState([]);
  const [examiners,        setExaminers]        = useState([]);
  const [selectedExam,     setSelectedExam]     = useState(null);
  const [selectedExaminer, setSelectedExaminer] = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [fetchLoading,     setFetchLoading]     = useState(true);
  const [successMsg,       setSuccessMsg]       = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [examsRes, usersRes] = await Promise.all([
        api.get("/exams"),
        api.get("/admin/users"),
      ]);
      setExams(examsRes.data);
      setExaminers(usersRes.data.filter((u) => u.role === "examiner"));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedExam || !selectedExaminer) {
      alert("Please select both exam and examiner");
      return;
    }
    setLoading(true);
    setSuccessMsg("");
    try {
      await api.post("/admin/assign-examiner", {
        examId:     selectedExam._id,
        examinerId: selectedExaminer._id,
      });
      setSuccessMsg(`✅ ${selectedExaminer.name} assigned to "${selectedExam.title}"`);
      setSelectedExam(null);
      setSelectedExaminer(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign examiner");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <NeuCard className="max-w-xl">
        <h2 className="text-xl font-semibold text-white mb-6">
          Assign Examiner to Exam
        </h2>

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            {successMsg}
          </div>
        )}

        <div className="space-y-6">

          {/* EXAM DROPDOWN */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Exam</label>
            <Listbox value={selectedExam} onChange={setSelectedExam}>
              <div className="relative">
                <Listbox.Button className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-white hover:border-white/20 transition">
                  {selectedExam ? selectedExam.title : "Choose exam..."}
                </Listbox.Button>
                <Listbox.Options className="absolute mt-2 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                  {exams.length === 0 ? (
                    <p className="px-4 py-3 text-gray-500 text-sm">No exams found</p>
                  ) : exams.map((exam) => (
                    <Listbox.Option
                      key={exam._id}
                      value={exam}
                      className={({ active }) =>
                        `px-4 py-3 cursor-pointer transition ${active ? "bg-blue-600 text-white" : "text-gray-300"}`
                      }
                    >
                      {exam.title}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* EXAMINER DROPDOWN */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Examiner</label>
            <Listbox value={selectedExaminer} onChange={setSelectedExaminer}>
              <div className="relative">
                <Listbox.Button className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-white hover:border-white/20 transition">
                  {selectedExaminer
                    ? `${selectedExaminer.name} (${selectedExaminer.email})`
                    : "Choose examiner..."}
                </Listbox.Button>
                <Listbox.Options className="absolute mt-2 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                  {examiners.length === 0 ? (
                    <p className="px-4 py-3 text-gray-500 text-sm">No examiners found</p>
                  ) : examiners.map((examiner) => (
                    <Listbox.Option
                      key={examiner._id}
                      value={examiner}
                      className={({ active }) =>
                        `px-4 py-3 cursor-pointer transition ${active ? "bg-indigo-600 text-white" : "text-gray-300"}`
                      }
                    >
                      {examiner.name}
                      <span className="text-gray-500 ml-2 text-xs">({examiner.email})</span>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
            {examiners.length === 0 && (
              <p className="text-sm text-orange-400 mt-2">
                ⚠️ No examiners found. Create examiner accounts first.
              </p>
            )}
          </div>

          <NeuButton onClick={handleAssign} disabled={loading} className="w-full">
            {loading ? "Assigning..." : "Assign Examiner"}
          </NeuButton>

        </div>
      </NeuCard>
    </div>
  );
}