import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const getSystemPreference = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("yidvid-theme");
    return (saved as ThemeMode) || "light";
  });

  const isDark = mode === "dark" || (mode === "auto" && getSystemPreference());

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "auto") {
        // Force re-render by toggling state
        setMode("auto");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode]);

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  // Persist
  useEffect(() => {
    localStorage.setItem("yidvid-theme", mode);
  }, [mode]);

  const cycleTheme = () => {
    setMode((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "auto";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
