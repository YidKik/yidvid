import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

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
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  });

  const isDark = mode === "dark";


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
    setMode((prev) => (prev === "light" ? "dark" : "light"));
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
