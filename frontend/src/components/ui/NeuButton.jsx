// src/components/ui/NeuButton.jsx
export default function NeuButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  type = "button",       // ✅ default "button" prevents accidental form submit
}) {
  const base = "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200";

  const variants = {
    primary:   "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    success:   "bg-green-500 hover:bg-green-600 text-white",
    danger:    "bg-red-500 hover:bg-red-600 text-white",
    ghost:     "bg-transparent hover:bg-white/10 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base}
        ${variants[variant] ?? variants.primary}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}