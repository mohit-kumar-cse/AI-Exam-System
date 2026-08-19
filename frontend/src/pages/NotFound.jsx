// src/pages/NotFound.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  admin:    "/admin",
  examiner: "/examiner",
  student:  "/student",
};

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const home = user ? (ROLE_HOME[user.role] || "/") : "/";

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

         
        <div className="relative mb-8 select-none">
          <p className="text-[8rem] sm:text-[10rem] font-black text-white/5 leading-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              404
            </p>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Page not found
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl font-medium text-sm transition touch-manipulation"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate(home, { replace: true })}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium text-sm transition touch-manipulation"
          >
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}