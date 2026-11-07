import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Add or edit accent colours here. "primary" is the main colour, "dark" its hover shade, "on" the text colour used on top of it.
export const COLOR_THEMES = [
  { id: "blue", label: "Blue", primary: "#2563eb", dark: "#1d4ed8", on: "#ffffff" },
  { id: "indigo", label: "Indigo", primary: "#4f46e5", dark: "#4338ca", on: "#ffffff" },
  { id: "violet", label: "Violet", primary: "#7c3aed", dark: "#6d28d9", on: "#ffffff" },
  { id: "pink", label: "Pink", primary: "#db2777", dark: "#be185d", on: "#ffffff" },
  { id: "rose", label: "Rose", primary: "#e11d48", dark: "#be123c", on: "#ffffff" },
  { id: "orange", label: "Orange", primary: "#ea580c", dark: "#c2410c", on: "#ffffff" },
  { id: "amber", label: "Amber", primary: "#f59e0b", dark: "#d97706", on: "#1f2937" },
  { id: "emerald", label: "Emerald", primary: "#059669", dark: "#047857", on: "#ffffff" },
  { id: "teal", label: "Teal", primary: "#0d9488", dark: "#0f766e", on: "#ffffff" },
  { id: "slate", label: "Slate", primary: "#475569", dark: "#334155", on: "#ffffff" },
];

const Ctx = createContext(null);
const read = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => read("lib-theme-id", "blue"));
  const [themeMode, setThemeMode] = useState(() => read("lib-theme-mode", "system")); // light | dark | system
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const isDark = themeMode === "dark" || (themeMode === "system" && systemDark);

  useEffect(() => {
    const t = COLOR_THEMES.find((x) => x.id === themeId) || COLOR_THEMES[0];
    const root = document.documentElement;
    root.style.setProperty("--color-primary", t.primary);
    root.style.setProperty("--color-primary-dark", t.dark);
    root.style.setProperty("--color-on-primary", t.on);
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    write("lib-theme-id", themeId);
    write("lib-theme-mode", themeMode);
  }, [themeId, themeMode, isDark]);

  const value = useMemo(() => ({ themeId, setThemeId, themeMode, setThemeMode, isDark, COLOR_THEMES }), [themeId, themeMode, isDark]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
