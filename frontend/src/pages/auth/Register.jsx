// src/pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import NeuCard from "../../components/ui/NeuCard";
import { register as registerAPI } from "../../services/authService";

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6)                              score++;
  if (password.length >= 10)                             score++;
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password))                    score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim())
      return setError("Please enter your full name");
    if (!form.email.trim())
      return setError("Please enter your email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Please enter a valid email address");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");

    setLoading(true);
    try {
      await registerAPI(
        form.name.trim(),
        form.email.trim().toLowerCase(),
        form.password
      );
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err) {
      setError(typeof err === "string" ? err : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-8">
      <div className="w-full max-w-md">
        <NeuCard>

          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 sm:mb-4 text-2xl">
              ✏️
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Create Account</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Register to access your exams
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/40 text-green-400 rounded-lg text-xs sm:text-sm flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                className={inputClass}
              />
              {form.password.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength >= level ? STRENGTH_COLORS[strength] : "bg-white/10"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-2 w-10 shrink-0">
                    {STRENGTH_LABELS[strength]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                className={inputClass}
              />
              {form.confirmPassword.length > 0 && form.password.length > 0 && (
                <p className={`text-xs mt-1.5 ${
                  form.password === form.confirmPassword ? "text-green-400" : "text-red-400"
                }`}>
                  {form.password === form.confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[48px]"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-xs sm:text-sm text-gray-400 mt-5 sm:mt-6">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 transition font-medium underline-offset-2 hover:underline"
            >
              Login here
            </Link>
          </p>

        </NeuCard>
      </div>
    </div>
  );
}