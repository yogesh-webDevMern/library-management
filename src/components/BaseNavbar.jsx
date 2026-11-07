import { useEffect, useRef, useState } from "react";
import { Menu, Sun, Moon, Laptop, Palette, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Top bar used by BOTH the admin panel and the student panel.
export default function BaseNavbar({ onMenuClick, title, name, email, roleLabel, onLogout }) {
  const { themeId, setThemeId, isDark, COLOR_THEMES, themeMode, setThemeMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const paletteRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) setShowPalette(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const initials = (name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const modes = [["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Laptop]];
  const active = COLOR_THEMES.find((t) => t.id === themeId);

  return (
    <header className={`lb-header ${scrolled ? "lb-header-scrolled" : ""}`}>
      <div className="flex items-center gap-3 px-4 sm:px-6 h-[60px]">
        <button onClick={onMenuClick} className="lb-iconbtn lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
        <h1 className="text-lg font-bold lb-heading truncate flex-1">{title}</h1>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button className="lb-iconbtn" onClick={() => setThemeMode(isDark ? "light" : "dark")} title={isDark ? "Light mode" : "Dark mode"} aria-label="Toggle dark mode">
            {isDark ? <Sun size={18} style={{ color: "var(--color-warning)" }} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={paletteRef}>
            <button className="lb-iconbtn" onClick={() => { setShowPalette(!showPalette); setShowProfile(false); }} title="Theme colour" aria-label="Theme colour">
              <span className="relative"><Palette size={18} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "var(--color-primary)", border: "2px solid var(--color-surface-header)" }} />
              </span>
            </button>
            {showPalette && (
              <div className="lb-menu w-[272px]">
                <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider lb-muted">Accent colour</span>
                  <span className="lb-badge lb-b-info" style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>{active?.label}</span>
                </div>
                <div className="p-3 grid grid-cols-5 gap-1.5">
                  {COLOR_THEMES.map((t) => (
                    <button key={t.id} onClick={() => setThemeId(t.id)} title={t.label} className={`lb-swatch ${themeId === t.id ? "lb-swatch-on" : ""}`}>
                      <span className="w-[22px] h-[22px] rounded-full" style={{ background: t.primary }} />
                      <span className="text-[9px] lb-muted leading-none">{t.label}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 p-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                  {modes.map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setThemeMode(id)} className="flex flex-col items-center gap-1 p-2.5 rounded-xl"
                      style={{
                        border: `1px solid ${themeMode === id ? "var(--color-primary)" : "var(--color-border)"}`,
                        color: themeMode === id ? "var(--color-primary)" : "var(--color-text-secondary)",
                        background: themeMode === id ? "color-mix(in srgb, var(--color-primary) 10%, transparent)" : "transparent",
                      }}>
                      <Icon size={18} /><span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative ml-1" ref={profileRef}>
            <button onClick={() => { setShowProfile(!showProfile); setShowPalette(false); }} aria-label="User menu"
              className="lb-avatar w-9 h-9 rounded-xl text-xs"
              style={{ boxShadow: showProfile ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent)" : "none", border: 0, cursor: "pointer" }}>
              {initials}
            </button>
            {showProfile && (
              <div className="lb-menu w-[280px]">
                <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="lb-avatar h-11 w-11 rounded-xl text-base shrink-0">{initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold lb-heading truncate">{name}</p>
                    {email && <p className="text-[11px] lb-muted truncate">{email}</p>}
                    <span className="lb-badge mt-1" style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)" }}>{roleLabel}</span>
                  </div>
                </div>
                <div className="p-2">
                  <button className="lb-mitem" onClick={onLogout} style={{ color: "var(--color-error)" }}><LogOut size={16} />Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
