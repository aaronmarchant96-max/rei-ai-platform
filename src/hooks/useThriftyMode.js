import { useState, useCallback } from "react";

const STORAGE_KEY = "rei_thrifty_mode";

export function useThriftyMode() {
  const [thriftyMode, setThriftyMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const toggleThriftyMode = useCallback(() => {
    setThriftyMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  return { thriftyMode, toggleThriftyMode };
}
