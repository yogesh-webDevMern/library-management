import { useState } from "react";
import { saveSettings } from "../../api";
import { fullTime, slotTime } from "../ui";

export default function SettingsTab({ settings, reload }) {
  const [f, setF] = useState({
    fs: settings.firstHalf.start, fe: settings.firstHalf.end, ss: settings.secondHalf.start, se: settings.secondHalf.end,
    full: settings.fullDayFee, half: settings.halfDayFee, locker: settings.lockerFee,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const preview = { firstHalf: { start: f.fs, end: f.fe }, secondHalf: { start: f.ss, end: f.se } };

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(""); setMsg("");
    try {
      await saveSettings({ firstHalf: { start: f.fs, end: f.fe }, secondHalf: { start: f.ss, end: f.se }, fullDayFee: Number(f.full), halfDayFee: Number(f.half), lockerFee: Number(f.locker) });
      await reload(); setMsg("Settings saved.");
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  const time = (label, k) => <label><span className="lb-label">{label}</span><input type="time" required className="lb-input" value={f[k]} onChange={set(k)} /></label>;
  const money = (label, k) => <label><span className="lb-label">{label}</span><input type="number" min="0" required className="lb-input" value={f[k]} onChange={set(k)} /></label>;

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      {!settings.configured && (
        <div className="lb-alert lb-a-warn lb-heading">Set the timings and prices first, then add students. You can change them later; changing a price here does not change students who are already added.</div>
      )}
      <section className="lb-card p-5">
        <h2 className="font-bold lb-heading">Half day timings</h2>
        <p className="lb-muted text-sm">One seat can be shared by two half day students, one in each shift. A full day student takes the whole seat.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-5">
          <div><p className="font-semibold lb-heading mb-2">First half</p><div className="grid grid-cols-2 gap-3">{time("From", "fs")}{time("To", "fe")}</div></div>
          <div><p className="font-semibold lb-heading mb-2">Second half</p><div className="grid grid-cols-2 gap-3">{time("From", "ss")}{time("To", "se")}</div></div>
        </div>
        <p className="mt-4 text-sm lb-muted">First half {slotTime(preview, "first")} · Second half {slotTime(preview, "second")} · Full day {fullTime(preview)}</p>
      </section>
      <section className="lb-card p-5">
        <h2 className="font-bold lb-heading">Prices per month</h2>
        <p className="lb-muted text-sm">Starting prices. For every student you can still decide a different fee when adding or editing them. The locker price is added automatically when a student gets a seat that has a locker.</p>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">{money("Full day (₹)", "full")}{money("Half day (₹)", "half")}{money("Locker above seat (₹)", "locker")}</div>
      </section>
      {err && <p className="lb-err">{err}</p>}
      {msg && <p className="lb-ok">{msg}</p>}
      <button disabled={busy} className="lb-btn lb-btn-primary">{busy ? "Saving" : "Save settings"}</button>
    </form>
  );
}
