// src/components/ui/NeuCard.jsx
export default function NeuCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative z-10
        bg-white/5
        border border-white/10
        rounded-xl sm:rounded-2xl
        p-4 sm:p-6
        shadow-lg
        hover:shadow-xl
        transition-all duration-300
        ${onClick ? "cursor-pointer active:scale-[0.99] touch-manipulation" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}