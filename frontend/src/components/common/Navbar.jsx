// src/components/common/Navbar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NeuButton from "../ui/NeuButton";

export default function Navbar({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const isInExam =
    location.pathname.includes("/exams/") &&
    location.pathname.split("/").length > 3;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const avatarLetters = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">

      {/* LEFT — page title */}
      <div className="min-w-0 flex-1">
        <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight truncate">
          {title}
        </h2>
        {!isInExam && (
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Welcome back </p>
        )}
      </div>

      {/* RIGHT — user info + logout */}
      {!isInExam && (
        <div className="flex items-center gap-2 sm:gap-4 ml-3 shrink-0">

          {/* USER DETAILS */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* AVATAR — always visible */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
                {avatarLetters}
              </div>
              {/* NAME + ROLE — hidden on mobile, visible md+ */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white leading-tight">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          )}

          {/* LOGOUT — compact on mobile */}
          <NeuButton
            variant="danger"
            onClick={handleLogout}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap"
          >
            <span className="hidden xs:inline">Logout</span>
            {/* Icon fallback for very small screens */}
            <span className="xs:hidden" aria-label="Logout">↪</span>
          </NeuButton>

        </div>
      )}
    </header>
  );
}