// src/hooks/usePageTitle.js
import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — AI Exam System` : "AI Exam System";
    return () => { document.title = prev; };
  }, [title]);
}