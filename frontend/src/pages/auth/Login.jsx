// src/pages/auth/Login.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import NeuCard from "../../components/ui/NeuCard";
import { useAuth } from "../../context/AuthContext";
import { login as loginAPI, googleLogin as googleLoginAPI } from "../../services/authService";

const ROLE_ROUTES = {
  student:  "/student",
  examiner: "/examiner",
  admin:    "/admin",
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleBtnRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await loginAPI(email.trim().toLowerCase(), password);
      login({ token: data.token, user: data.user });
      const route = ROLE_ROUTES[data.user?.role] || "/student";
      navigate(route, { replace: true });
    } catch (err) {
      setError(typeof err === "string" ? err : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (response) => {
    setError("");
    setGoogleLoading(true);
    try {
      const data = await googleLoginAPI(response.credential);
      login({ token: data.token, user: data.user });
      const route = ROLE_ROUTES[data.user?.role] || "/student";
      navigate(route, { replace: true });
    } catch (err) {
      setError(typeof err === "string" ? err : "Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set — Google login button will not render");
      return;
    }

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "filled_black",
        size: "large",
        width: 360,
        text: "continue_with",
        shape: "pill",
      });
    };

    if (window.google) {
      initGoogle();
      return;
    }

    const existingScript = document.getElementById("google-identity-script");

    if (existingScript) {
      existingScript.addEventListener("load", initGoogle);
      return () => existingScript.removeEventListener("load", initGoogle);
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
     
  }, []);

  const inputClass = `
    w-full px-4 py-3 rounded-lg
    bg-white/5
    border border-white/10
    text-white
    placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition text-sm sm:text-base
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-8">
      <div className="w-full max-w-md">
        <NeuCard>

          {/* HEADER */}
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-3 sm:mb-4 text-2xl">
              🎓
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Login to your account
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* GOOGLE SIGN-IN */}
          <div className="flex flex-col items-center mb-5">
            <div ref={googleBtnRef} className={googleLoading ? "opacity-50 pointer-events-none" : ""} />
            {googleLoading && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin shrink-0" />
                Signing in with Google...
              </p>
            )}
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-500">or continue with email</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[48px]"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* REGISTER LINK */}
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-5 sm:mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 transition font-medium underline-offset-2 hover:underline"
            >
              Register here
            </Link>
          </p>

        </NeuCard>
      </div>
    </div>
  );
}