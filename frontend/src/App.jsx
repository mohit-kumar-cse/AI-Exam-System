// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

/* Auth Pages */
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* Layouts */
import StudentLayout  from "./layouts/StudentLayout";
import ExaminerLayout from "./layouts/ExaminerLayout";
import AdminLayout    from "./layouts/AdminLayout";

/* Student Pages */
import StudentDashboard from "./pages/student/Dashboard";
import Exams            from "./pages/student/Exams";
import Results          from "./pages/student/results/Results";
import Profile          from "./pages/student/Profile";
import ExamAttempt      from "./pages/student/examAttempt/ExamAttempt";

/* Examiner Pages */
import ExaminerDashboard from "./pages/examiner/Dashboard";
import CreateExam        from "./pages/examiner/CreateExam";
import UploadAnswerKey   from "./pages/examiner/UploadAnswerKey";
import Monitor           from "./pages/examiner/Monitor";
import ExamManagement    from "./pages/examiner/ExamManagement";

/* Admin Pages */
import AdminDashboard  from "./pages/admin/Dashboard";
import Users           from "./pages/admin/Users";
import AssignExaminer  from "./pages/admin/AssignExaminer";
import SystemLogs      from "./pages/admin/SystemLogs";
import QuestionManager from "./pages/admin/QuestionManager";

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <Routes>

        {/* PUBLIC — no auth needed */}
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* EXAM ATTEMPT — fullscreen, outside StudentLayout */}
        <Route
          path="/student/exams/:examId"
          element={
            <ProtectedRoute role="student">
              <ExamAttempt />
            </ProtectedRoute>
          }
        />

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index          element={<StudentDashboard />} />
          <Route path="exams"   element={<Exams />} />
          <Route path="results" element={<Results />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* EXAMINER */}
        <Route
          path="/examiner"
          element={
            <ProtectedRoute role="examiner">
              <ExaminerLayout />
            </ProtectedRoute>
          }
        >
          <Route index          element={<ExaminerDashboard />} />
          <Route path="manage"  element={<ExamManagement />} />
          <Route path="create"  element={<CreateExam />} />
          <Route path="upload"  element={<UploadAnswerKey />} />
          <Route path="monitor" element={<Monitor />} />
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index            element={<AdminDashboard />} />
          <Route path="users"     element={<Users />} />
          <Route path="assign"    element={<AssignExaminer />} />
          <Route path="logs"      element={<SystemLogs />} />
          <Route path="questions" element={<QuestionManager />} />
        </Route>

      </Routes>
    </div>
  );
}
