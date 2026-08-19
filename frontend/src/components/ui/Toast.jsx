// src/components/ui/Toast.jsx
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

const ToastContext = createContext(null);

 
function ToastItem({ id, type, message, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // mount → slide in
    const t1 = setTimeout(() => setVisible(true), 10);
    // auto-dismiss after 3.5s
    const t2 = setTimeout(() => dismiss(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 300);
  };

  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
  const styles = {
    success: "border-green-500/40 bg-green-500/10 text-green-300",
    error:   "border-red-500/40   bg-red-500/10   text-red-300",
    warning: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    info:    "border-blue-500/40  bg-blue-500/10  text-blue-300",
  };
  const iconStyles = {
    success: "bg-green-500/20 text-green-400",
    error:   "bg-red-500/20   text-red-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    info:    "bg-blue-500/20  text-blue-400",
  };

  return (
    <div
      onClick={dismiss}
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl cursor-pointer
        backdrop-blur-sm max-w-sm w-full
        transition-all duration-300
        ${styles[type] || styles.info}
        ${visible && !leaving
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8"}
      `}
    >
      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${iconStyles[type]}`}>
        {icons[type]}
      </span>
      <p className="text-sm leading-snug flex-1">{message}</p>
      <button className="shrink-0 text-xs opacity-50 hover:opacity-100 transition mt-0.5">✕</button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const add = useCallback((message, type = "info") => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    warning: (msg) => add(msg, "warning"),
    info:    (msg) => add(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container — fixed top-right on desktop, top-center on mobile */}
      <div className="fixed top-4 right-4 sm:right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem
              id={t.id}
              type={t.type}
              message={t.message}
              onRemove={remove}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}