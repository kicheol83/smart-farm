import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("smart-farm-theme");
  if (stored === "dark" || stored === "light") return stored;

  // Tizim afzalligi (prefers-color-scheme)
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),

      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyThemeClass(next);
        set({ theme: next });
      },

      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },
    }),
    {
      name: "smart-farm-theme",
      onRehydrateStorage: () => (state) => {
        // Sahifa qayta yuklanganda <html> ga class qo'yiladi
        if (state) applyThemeClass(state.theme);
      },
    },
  ),
);

/**
 * main.tsx da ilova ishga tushishidan oldin chaqiring —
 * flicker (oq/qora ko'zga tashlanib ketishi) oldini oladi.
 */
export function initTheme() {
  applyThemeClass(getInitialTheme());
}
