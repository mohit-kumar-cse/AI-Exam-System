// src/App.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentLayout from "./layouts/StudentLayout";
import ExaminerLayout from "./layouts/ExaminerLayout";
import AdminLayout from "./layouts/AdminLayout";

import StudentDashboard from "./pages/student/Dashboard";
import Exams from "./pages/student/Exams";
import Results from "./pages/student/results/Results";
import Profile from "./pages/student/Profile";
import ExamAttempt from "./pages/student/examAttempt/ExamAttempt";

import ExaminerDashboard from "./pages/examiner/Dashboard";
import CreateExam from "./pages/examiner/CreateExam";
import UploadAnswerKey from "./pages/examiner/UploadAnswerKey";
import Monitor from "./pages/examiner/Monitor";
import ExamManagement from "./pages/examiner/ExamManagement";

import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import AssignExaminer from "./pages/admin/AssignExaminer";
import QuestionManager from "./pages/admin/QuestionManager";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student/exams/:examId"
          element={
            <ProtectedRoute role="student">
              <ExamAttempt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<Exams />} />
          <Route path="results" element={<Results />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/examiner"
          element={
            <ProtectedRoute role="examiner">
              <ExaminerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ExaminerDashboard />} />
          <Route path="manage" element={<ExamManagement />} />
          <Route path="create" element={<CreateExam />} />
          <Route path="upload" element={<UploadAnswerKey />} />
          <Route path="monitor" element={<Monitor />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="assign" element={<AssignExaminer />} />
          <Route path="questions" element={<QuestionManager />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
