import { useEffect } from "react";

export type ThemeMode = "dark";

export function useTheme() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("saastascholar_theme", "dark");
        localStorage.setItem("nimswallah_theme", "dark");
      } catch (e) {}
    }
  }, []);

  return {
    theme: "dark" as const,
    isDark: true,
    toggleTheme: () => {},
    setTheme: () => {},
  };
}
