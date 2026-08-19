// src/components/ui/NeuButton.jsx
export default function NeuButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 min-h-[36px] touch-manipulation";

  const variants = {
    primary:   "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 active:scale-95",
    secondary: "bg-white/10 text-white hover:bg-white/20 active:scale-95",
    success:   "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white",
    danger:    "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
    ghost:     "bg-transparent hover:bg-white/10 active:bg-white/20 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${base}
        ${variants[variant] ?? variants.primary}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}