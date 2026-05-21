// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import NeuCard from "../../components/ui/NeuCard";
import { useAuth } from "../../context/AuthContext";
import { login as loginAPI } from "../../services/authService";

const ROLE_ROUTES = {
  student:  "/student",
  examiner: "/examiner",
  admin:    "/admin",
};

export default function Login() {
  const navigate    = useNavigate();
  const { login }   = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await loginAPI(email, password);
      login({ token: data.token, user: data.user });
      const route = ROLE_ROUTES[data.user.role] || "/student";
      navigate(route, { replace: true });
    } catch (err) {
      setError(typeof err === "string" ? err : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full px-4 py-3 rounded-lg
    bg-[var(--bg-hover)]
    border border-[var(--border)]
    text-[var(--text-primary)]
    placeholder:text-[var(--text-secondary)]
    focus:outline-none focus:ring-2 focus:ring-blue-500
    disabled:opacity-50 transition
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <NeuCard className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Login to your account
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* FORM — wrapping in form enables Enter key submit */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
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
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
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
            className="mt-2 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* REGISTER LINK */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition font-medium">
            Register here
          </Link>
        </p>

      </NeuCard>
    </div>
  );
}