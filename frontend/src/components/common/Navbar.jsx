// src/components/common/Navbar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NeuButton from "../ui/NeuButton";

export default function Navbar({ title }) {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { logout, user } = useAuth();

  // hide logout/user info when student is inside an active exam
  const isInExam =
    location.pathname.includes("/exams/") &&
    location.pathname.split("/").length > 3;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // first letter of each word for avatar
  const avatarLetters = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">

      {/* LEFT — page title */}
      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          {title}
        </h2>
        {!isInExam && (
          <p className="text-sm text-gray-400 mt-0.5">Welcome back 👋</p>
        )}
      </div>

      {/* RIGHT — user info + logout */}
      {!isInExam && (
        <div className="flex items-center gap-4">

          {/* USER DETAILS */}
          {user && (
            <div className="flex items-center gap-3">
              {/* AVATAR */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {avatarLetters}
              </div>
              {/* NAME + ROLE */}
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

          {/* LOGOUT */}
          <NeuButton
            variant="danger"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm"
          >
            Logout
          </NeuButton>

        </div>
      )}
    </header>
  );
}