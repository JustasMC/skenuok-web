"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  THEME_STORAGE_KEY,
  parseTheme,
  type Theme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persistTheme(theme: Theme) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore quota / private mode */
  }
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    setThemeState(parseTheme(attr));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    persistTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      persistTheme(next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
