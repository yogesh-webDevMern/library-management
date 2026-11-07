import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { changePassword } from "../api";

// Used by the admin (Settings) and by the student (Change password).
export default function PasswordCard({ minLength = 6 }) {
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setMsg(""); setErr("");
    if (f.next.length < minLength) return setErr(`New password must be at least ${minLength} characters.`);
    if (f.next !== f.again) return setErr("The two new passwords do not match.");
    setBusy(true);
    try { await changePassword(f.current, f.next); setMsg("Password changed. Other devices have been logged out."); setF({ current: "", next: "", again: "" }); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };

  const type = show ? "text" : "password";
  return (
    <form onSubmit={submit} className="lb-card p-5 sm:p-6 max-w-lg">
      <div className="flex items-center gap-3">
        <div className="lb-iconsoft"><KeyRound size={16} /></div>
        <div><h3 className="font-bold lb-heading">Change password</h3><p className="text-xs lb-muted">Use at least {minLength} characters.</p></div>
      </div>
      <div className="mt-4 space-y-3">
        <label className="block"><span className="lb-label">Current password</span><input className="lb-input" type={type} value={f.current} onChange={set("current")} autoComplete="current-password" required /></label>
        <label className="block"><span className="lb-label">New password</span><input className="lb-input" type={type} value={f.next} onChange={set("next")} autoComplete="new-password" required /></label>
        <label className="block"><span className="lb-label">Repeat new password</span><input className="lb-input" type={type} value={f.again} onChange={set("again")} autoComplete="new-password" required /></label>
      </div>
      <button type="button" onClick={() => setShow(!show)} className="mt-3 text-sm lb-muted inline-flex items-center gap-1.5">{show ? <EyeOff size={14} /> : <Eye size={14} />}{show ? "Hide" : "Show"} passwords</button>
      <p role="alert" className="mt-3 min-h-[1.25rem] text-sm lb-err">{err}</p>
      {msg && <p className="text-sm lb-ok mb-2">{msg}</p>}
      <button disabled={busy} className="lb-btn lb-btn-primary w-full">{busy ? "Saving" : "Change password"}</button>
    </form>
  );
}
