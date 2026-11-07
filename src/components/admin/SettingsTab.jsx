// import { useState } from "react";
// import { saveSettings } from "../../api";
// import { fullTime, slotTime } from "../ui";

// export default function SettingsTab({ settings, reload }) {
//   const [f, setF] = useState({
//     fs: settings.firstHalf.start, fe: settings.firstHalf.end, ss: settings.secondHalf.start, se: settings.secondHalf.end,
//     full: settings.fullDayFee, half: settings.halfDayFee, locker: settings.lockerFee,
//   });
//   const [busy, setBusy] = useState(false);
//   const [msg, setMsg] = useState("");
//   const [err, setErr] = useState("");
//   const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
//   const preview = { firstHalf: { start: f.fs, end: f.fe }, secondHalf: { start: f.ss, end: f.se } };

//   const save = async (e) => {
//     e.preventDefault(); setBusy(true); setErr(""); setMsg("");
//     try {
//       await saveSettings({ firstHalf: { start: f.fs, end: f.fe }, secondHalf: { start: f.ss, end: f.se }, fullDayFee: Number(f.full), halfDayFee: Number(f.half), lockerFee: Number(f.locker) });
//       await reload(); setMsg("Settings saved.");
//     } catch (x) { setErr(x.message); }
//     setBusy(false);
//   };

//   const time = (label, k) => <label><span className="lb-label">{label}</span><input type="time" required className="lb-input" value={f[k]} onChange={set(k)} /></label>;
//   const money = (label, k) => <label><span className="lb-label">{label}</span><input type="number" min="0" required className="lb-input" value={f[k]} onChange={set(k)} /></label>;

//   return (
//     <form onSubmit={save} className="space-y-6 max-w-3xl">
//       {!settings.configured && (
//         <div className="lb-alert lb-a-warn lb-heading">Set the timings and prices first, then add students. You can change them later; changing a price here does not change students who are already added.</div>
//       )}
//       <section className="lb-card p-5">
//         <h2 className="font-bold lb-heading">Half day timings</h2>
//         <p className="lb-muted text-sm">One seat can be shared by two half day students, one in each shift. A full day student takes the whole seat.</p>
//         <div className="mt-4 grid sm:grid-cols-2 gap-5">
//           <div><p className="font-semibold lb-heading mb-2">First half</p><div className="grid grid-cols-2 gap-3">{time("From", "fs")}{time("To", "fe")}</div></div>
//           <div><p className="font-semibold lb-heading mb-2">Second half</p><div className="grid grid-cols-2 gap-3">{time("From", "ss")}{time("To", "se")}</div></div>
//         </div>
//         <p className="mt-4 text-sm lb-muted">First half {slotTime(preview, "first")} · Second half {slotTime(preview, "second")} · Full day {fullTime(preview)}</p>
//       </section>
//       <section className="lb-card p-5">
//         <h2 className="font-bold lb-heading">Prices per month</h2>
//         <p className="lb-muted text-sm">Starting prices. For every student you can still decide a different fee when adding or editing them. The locker price is added automatically when a student gets a seat that has a locker.</p>
//         <div className="mt-4 grid sm:grid-cols-3 gap-4">{money("Full day (₹)", "full")}{money("Half day (₹)", "half")}{money("Locker above seat (₹)", "locker")}</div>
//       </section>
//       {err && <p className="lb-err">{err}</p>}
//       {msg && <p className="lb-ok">{msg}</p>}
//       <button disabled={busy} className="lb-btn lb-btn-primary">{busy ? "Saving" : "Save settings"}</button>
//     </form>
//   );
// }




import { useState } from "react";
import { Camera } from "lucide-react";
import { saveSettings, saveDirectorPhoto } from "../../api";
import { fullTime, slotTime, thumb } from "../ui";
import PhotoButton from "../PhotoButton";
import PasswordCard from "../PasswordCard";

export default function SettingsTab({ settings, reload }) {
  const d0 = settings.director || {};
  const [f, setF] = useState({
    fs: settings.firstHalf.start, fe: settings.firstHalf.end, ss: settings.secondHalf.start, se: settings.secondHalf.end,
    full: settings.fullDayFee, half: settings.halfDayFee, locker: settings.lockerFee,
    dName: d0.name || "", dTitle: d0.title || "", dPhone: d0.phone || "", dEmail: d0.email || "", dMsg: d0.message || "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const preview = { firstHalf: { start: f.fs, end: f.fe }, secondHalf: { start: f.ss, end: f.se } };

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr(""); setMsg("");
    try {
      await saveSettings({
        firstHalf: { start: f.fs, end: f.fe }, secondHalf: { start: f.ss, end: f.se },
        fullDayFee: Number(f.full), halfDayFee: Number(f.half), lockerFee: Number(f.locker),
        director: { name: f.dName, title: f.dTitle, phone: f.dPhone, email: f.dEmail, message: f.dMsg },
      });
      await reload(); setMsg("Settings saved.");
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  const time = (label, k) => <label><span className="lb-label">{label}</span><input type="time" required className="lb-input" value={f[k]} onChange={set(k)} /></label>;
  const money = (label, k) => <label><span className="lb-label">{label}</span><input type="number" min="0" required className="lb-input" value={f[k]} onChange={set(k)} /></label>;

  return (
    <div className="space-y-6 ">
      <form onSubmit={save} className="space-y-6">
        {!settings.configured && (
          <div className="lb-alert lb-a-warn lb-heading">Set the timings and prices first, then add students. You can change them later; changing a price here does not change students who are already added.</div>
        )}
        <section className="lb-card p-5">
          <h2 className="font-bold lb-heading">Half day timings</h2>
          <p className="lb-muted text-sm">One seat can be shared by two half day students, one in each shift. A full day student takes the whole seat. Students who forget to clock out are clocked out automatically at the end of their shift.</p>
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

        <section className="lb-card p-5">
          <h2 className="font-bold lb-heading">Director details</h2>
          <p className="lb-muted text-sm">Shown to every student in their panel.</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {settings.director?.photo
              ? <img src={thumb(settings.director.photo, 200)} alt="Director" className="w-24 h-24 rounded-2xl object-cover" />
              : <div className="lb-avatar w-24 h-24 rounded-2xl text-3xl">{(f.dName || "D")[0]}</div>}
            <div>
              <PhotoButton onUrl={async (url) => { await saveDirectorPhoto(url); await reload(); }} className="lb-btn lb-btn-outline"><Camera size={16} />Upload director picture</PhotoButton>
              <p className="text-xs lb-muted mt-2">JPG, PNG or WEBP, up to 5 MB. A square picture looks best.</p>
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <label><span className="lb-label">Name</span><input className="lb-input" value={f.dName} onChange={set("dName")} maxLength={80} placeholder="Director's full name" /></label>
            <label><span className="lb-label">Designation</span><input className="lb-input" value={f.dTitle} onChange={set("dTitle")} maxLength={80} placeholder="Founder and Director" /></label>
            <label><span className="lb-label">Phone</span><input className="lb-input" value={f.dPhone} onChange={set("dPhone")} maxLength={20} /></label>
            <label><span className="lb-label">Email</span><input className="lb-input" type="email" value={f.dEmail} onChange={set("dEmail")} maxLength={80} /></label>
            <label className="sm:col-span-2"><span className="lb-label">Message to students</span><textarea className="lb-input" rows={3} maxLength={600} value={f.dMsg} onChange={set("dMsg")} placeholder="A short welcome message" /></label>
          </div>
        </section>

        {err && <p className="lb-err">{err}</p>}
        {msg && <p className="lb-ok">{msg}</p>}
        <button disabled={busy} className="lb-btn lb-btn-primary">{busy ? "Saving" : "Save settings"}</button>
      </form>

      <section>
        <h2 className="font-bold lb-heading mb-3">My account</h2>
        <PasswordCard minLength={8} />
      </section>
    </div>
  );
}
