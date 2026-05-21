// frontend/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  admin:    "/admin",
  examiner: "/examiner",
  student:  "/student",
};

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // ── Wait for localStorage auth to load ───────────────────────────────────
  // Without this check, on refresh: loading=true briefly shows user=null
  // and incorrectly redirects to login before auth is restored
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in → go to login ───────────────────────────────────────────
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ── Wrong role → redirect to their correct portal ─────────────────────────
  // e.g. student trying to access /admin → sent to /student
  if (role && user.role !== role) {
    const home = ROLE_HOME[user.role] || "/";
    return <Navigate to={home} replace />;
  }

  // ── Correct — render children (layout with Outlet) or direct child ────────
  return children ?? <Outlet />;
}