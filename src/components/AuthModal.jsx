import { useState, useEffect, useRef } from "react";

/* ========= DEMO ONLY =========
   These logins work only for testing the design. Anyone can read this file in the browser,
   so never keep real passwords here. Replace demoLogin with a call to your server
   (see the `onLogin` prop). */
const DEMO = {
  student: { id: "9999999999", pass: "student123", name: "Rahul" },
  admin: { id: "admin", pass: "admin123", name: "Yash" },
};
const demoLogin = (role, id, pass) =>
  new Promise((ok, no) =>
    setTimeout(() => {
      const u = DEMO[role];
      u && id.trim().toLowerCase() === u.id && pass === u.pass ? ok({ role, name: u.name }) : no(new Error("Wrong ID or password"));
    }, 900)
  );

const THEME = {
  student: { a: "#FBBF24", b: "#2DD4BF", label: "Student", idLabel: "Mobile number", idHint: "10-digit mobile number", title: "Welcome back, reader", sub: "Check your seat, plan and study streak." },
  admin: { a: "#A78BFA", b: "#F472B6", label: "Admin", idLabel: "Admin ID", idHint: "Your admin ID", title: "Library control room", sub: "Manage seats, members and payments." },
};

const REQUESTS = [["Aman Sharma", "Full day"], ["Pooja Verma", "Half day"], ["Karan Singh", "Full day"]];

export default function AuthModal({ open, onClose, onLogin = demoLogin, libraryName = "Amaraya Library" }) {
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(0);
  const [user, setUser] = useState(null);
  const [reqs, setReqs] = useState(REQUESTS);
  const first = useRef(null);
  const T = THEME[role];

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    setTimeout(() => first.current?.focus(), 250);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  const switchRole = (r) => { setRole(r); setErr(""); setId(""); setPass(""); };
  const submit = async (e) => {
    e.preventDefault();
    if (!id.trim() || !pass) { setErr("Please fill in both fields."); setShake((s) => s + 1); return; }
    setBusy(true); setErr("");
    try { setUser(await onLogin(role, id, pass)); }
    catch (x) { setErr(x.message || "Could not sign in."); setShake((s) => s + 1); }
    setBusy(false);
  };
  const logout = () => { setUser(null); setId(""); setPass(""); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Login">
      <style>{`
        @keyframes amIn { from { opacity:0; transform: translateY(30px) scale(.96);} }
        @keyframes amShake { 20%,60% { transform: translateX(-9px);} 40%,80% { transform: translateX(9px);} }
        @keyframes amFloat { 50% { transform: translateY(-14px) rotate(2deg);} }
        @keyframes amSpin { to { transform: rotate(360deg);} }
        @keyframes amPop { 0% { transform: scale(0);} 70% { transform: scale(1.2);} 100% { transform: scale(1);} }
        @keyframes amDraw { to { stroke-dashoffset:0; } }
        .am-card { animation: amIn .6s cubic-bezier(.2,.9,.25,1) both; }
        .am-shake { animation: amShake .45s; }
        .am-fl { animation: amFloat 6s ease-in-out infinite; }
        .am-input { width:100%; background:rgba(255,255,255,.07); border:1.5px solid rgba(255,255,255,.18); border-radius:9999px; padding:15px 22px; font-size:18px; color:#fff; transition:border-color .25s, box-shadow .25s, background .25s; }
        .am-input::placeholder { color:rgba(255,255,255,.4); }
        .am-input:focus { outline:none; border-color:var(--a); box-shadow:0 0 0 4px color-mix(in srgb, var(--a) 25%, transparent); background:rgba(255,255,255,.1); }
        @media (prefers-reduced-motion: reduce){ .am-card,.am-fl,.am-shake { animation:none !important; } }
      `}</style>

      <div className="absolute inset-0 bg-[#04061a]/80 backdrop-blur-md" onClick={onClose} />

      <div className="am-card relative w-full max-w-4xl rounded-[2rem] overflow-hidden grid md:grid-cols-[1fr_1.05fr] border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,.7)]"
        style={{ "--a": T.a, "--b": T.b, background: "#0B1030", fontFamily: "'Newsreader', Georgia, serif", color: "#fff" }}>

        {/* Left visual panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 overflow-hidden transition-all duration-700"
          style={{ background: `radial-gradient(circle at 20% 15%, ${T.a}55, transparent 55%), radial-gradient(circle at 85% 90%, ${T.b}55, transparent 55%), #0B1030` }}>
          <p style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.04em" }} className="text-xl">{libraryName}</p>
          <div className="relative h-56" aria-hidden="true">
            {[["-rotate-12 left-2 top-8", "#34D399", "#065F46", "0s"], ["rotate-3 left-24 top-0", T.a, "#B45309", "1s"], ["rotate-12 left-48 top-10", T.b, "#4C1D95", "2s"]].map(([pos, c1, c2, d], i) => (
              <div key={i} className={`am-fl absolute w-28 h-40 rounded-r-xl rounded-l-sm ${pos}`}
                style={{ background: `linear-gradient(145deg, ${c1}, ${c2})`, animationDelay: d, boxShadow: "inset 8px 0 0 rgba(0,0,0,.25), 0 25px 40px rgba(0,0,0,.5)", transition: "background .7s" }} />
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.04em" }} className="text-2xl leading-snug">“It always seems impossible until it is done.”</p>
            <p className="mt-3 italic text-lg" style={{ color: T.a }}>Nelson Mandela</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="relative p-7 sm:p-10">
          <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 text-xl leading-none">×</button>

          {!user ? (
            <form onSubmit={submit} noValidate>
              <div className="relative grid grid-cols-2 p-1 rounded-full bg-white/10 max-w-xs" role="tablist">
                <span className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full transition-all duration-500"
                  style={{ transform: role === "admin" ? "translateX(100%)" : "none", background: `linear-gradient(90deg, ${T.a}, ${T.b})` }} />
                {["student", "admin"].map((r) => (
                  <button key={r} type="button" role="tab" aria-selected={role === r} onClick={() => switchRole(r)}
                    className={`relative py-2.5 text-base font-bold transition-colors ${role === r ? "text-[#0B1030]" : "text-white/70"}`}>{THEME[r].label}</button>
                ))}
              </div>

              <h2 key={role} className="mt-8 text-3xl sm:text-4xl leading-tight" style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.04em", animation: "amIn .5s both" }}>{T.title}</h2>
              <p className="mt-2 text-xl text-white/70">{T.sub}</p>

              <div key={shake} className={`mt-7 space-y-4 ${shake ? "am-shake" : ""}`}>
                <label className="block">
                  <span className="text-lg text-white/80 ml-2">{T.idLabel}</span>
                  <input ref={first} className="am-input mt-1" value={id} onChange={(e) => setId(role === "student" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value)}
                    placeholder={T.idHint} inputMode={role === "student" ? "numeric" : "text"} autoComplete="username" />
                </label>
                <label className="block">
                  <span className="text-lg text-white/80 ml-2">Password</span>
                  <div className="relative mt-1">
                    <input className="am-input pr-20" type={show ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: T.a }}>{show ? "Hide" : "Show"}</button>
                  </div>
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between text-lg">
                <label className="flex items-center gap-2 text-white/75"><input type="checkbox" className="w-4 h-4 accent-[#FBBF24]" /> Remember me</label>
                <a href="#book" onClick={onClose} className="underline underline-offset-4 text-white/75 hover:text-white">Forgot password?</a>
              </div>

              <p role="alert" className={`mt-4 text-lg text-[#FCA5A5] transition-opacity ${err ? "opacity-100" : "opacity-0"}`}>{err || "."}</p>

              <button disabled={busy} className="mt-2 w-full py-4 rounded-full text-[#0B1030] text-sm hover:scale-[1.02] active:scale-[.98] transition-transform disabled:opacity-80 flex items-center justify-center gap-3"
                style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800, background: `linear-gradient(90deg, ${T.a}, ${T.b})` }}>
                {busy && <span className="w-5 h-5 rounded-full border-[3px] border-[#0B1030]/30 border-t-[#0B1030]" style={{ animation: "amSpin .7s linear infinite" }} />}
                {busy ? "Signing in" : `Sign in as ${T.label}`}
              </button>
              <p className="mt-5 text-center text-white/50 text-base">New here? Reserve a seat first and we will create your login.</p>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-4">
                <svg width="64" height="64" viewBox="0 0 64 64" style={{ animation: "amPop .6s both" }}>
                  <circle cx="32" cy="32" r="30" fill={T.a} />
                  <path d="M19 33l9 9 17-19" fill="none" stroke="#0B1030" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation: "amDraw .6s .3s forwards" }} />
                </svg>
                <div>
                  <p className="text-lg text-white/70">{user.role === "admin" ? "Admin signed in" : "Student signed in"}</p>
                  <h2 className="text-3xl" style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.04em" }}>Hello, {user.name}</h2>
                </div>
              </div>

              {user.role === "student" ? (
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[["Your seat", "A-14"], ["Plan", "Full day"], ["Days left", "19"], ["Study streak", "12 days"]].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-white/[0.07] border border-white/10 p-4"><p className="text-white/60 text-base">{k}</p><p className="text-2xl mt-1" style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800 }}>{v}</p></div>
                  ))}
                  <div className="col-span-2 rounded-2xl bg-white/[0.07] border border-white/10 p-4">
                    <div className="flex justify-between text-base text-white/70"><span>Membership used</span><span>11 of 30 days</span></div>
                    <div className="h-3 mt-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: "37%", background: `linear-gradient(90deg, ${T.a}, ${T.b})` }} /></div>
                  </div>
                </div>
              ) : (
                <div className="mt-7">
                  <div className="grid grid-cols-3 gap-3">
                    {[["Seats filled", "42/60"], ["Today", "₹6,200"], ["Requests", String(reqs.length)]].map(([k, v]) => (
                      <div key={k} className="rounded-2xl bg-white/[0.07] border border-white/10 p-4"><p className="text-white/60 text-base">{k}</p><p className="text-xl mt-1" style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800 }}>{v}</p></div>
                    ))}
                  </div>
                  <p className="mt-6 text-lg text-white/70">Pending seat requests</p>
                  <ul className="mt-2 space-y-2">
                    {reqs.map(([n, p]) => (
                      <li key={n} className="flex items-center justify-between rounded-2xl bg-white/[0.07] border border-white/10 px-4 py-3">
                        <span className="text-lg">{n} <span className="text-white/55">· {p}</span></span>
                        <button onClick={() => setReqs(reqs.filter((r) => r[0] !== n))} className="px-4 py-1.5 rounded-full text-sm font-bold text-[#0B1030]" style={{ background: T.a }}>Approve</button>
                      </li>
                    ))}
                    {reqs.length === 0 && <li className="text-lg text-white/60 py-2">All caught up. No pending requests.</li>}
                  </ul>
                </div>
              )}
              <div className="mt-7 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3.5 rounded-full text-[#0B1030] text-sm" style={{ fontFamily: "'Unbounded', system-ui, sans-serif", fontWeight: 800, background: `linear-gradient(90deg, ${T.a}, ${T.b})` }}>Continue</button>
                <button onClick={logout} className="px-6 py-3.5 rounded-full border border-white/30 hover:bg-white/10 text-lg">Log out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
