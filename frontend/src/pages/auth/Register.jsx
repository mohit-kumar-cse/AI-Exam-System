// src/pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import NeuCard from "../../components/ui/NeuCard";
import { register as registerAPI } from "../../services/authService";

// ── Pure helper — outside component ──────────────────────────────────────────
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6)                score++;
  if (password.length >= 10)               score++;
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password))      score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

// ── Component ─────────────────────────────────────────────────────────────────
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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!form.name.trim())          return setError("Please enter your full name");
    if (!form.email.trim())         return setError("Please enter your email");
    if (form.password.length < 6)   return setError("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword)
                                    return setError("Passwords do not match");

    setLoading(true);
    try {
      // role not sent — backend defaults to "student"
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
    bg-[var(--bg-hover)]
    border border-[var(--border)]
    text-[var(--text-primary)]
    placeholder:text-[var(--text-secondary)]
    focus:outline-none focus:ring-2 focus:ring-blue-500
    disabled:opacity-50 transition
  `;

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <NeuCard className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">Create Account</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Register to access your exams
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Full Name</label>
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
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Email Address</label>
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
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Password</label>
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
            {/* PASSWORD STRENGTH */}
            {form.password.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      strength >= level ? STRENGTH_COLORS[strength] : "bg-[var(--border)]"
                    }`}
                  />
                ))}
                <span className="text-xs text-[var(--text-secondary)] ml-2 w-10 shrink-0">
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Confirm Password</label>
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
            {/* MATCH INDICATOR */}
            {form.confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 ${
                form.password === form.confirmPassword ? "text-green-400" : "text-red-400"
              }`}>
                {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition font-medium">
            Login here
          </Link>
        </p>

      </NeuCard>
    </div>
  );
}