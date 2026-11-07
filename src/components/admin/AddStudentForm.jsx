import { useState } from "react";
import { Lock } from "lucide-react";
import { addStudent } from "../../api";
import { Modal, Toggle, fmt, inr, addMonths, todayStr, seatFits, slotTime, fullTime, SLOT } from "../ui";

export default function AddStudentForm({ seats = [], settings, onClose, onCreated }) {
  const [f, setF] = useState({
    name: "", email: "", phone: "", password: "",
    plan: "Full day", shift: "first", planFee: String(settings.fullDayFee),
    seatNo: "", lockerFee: String(settings.lockerFee),
    feeMode: "offline", registrationDate: todayStr(), firstFee: "paid", paidTill: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const half = f.plan === "Half day";

  const seatOptions = seats.filter((s) => seatFits(s, f.plan, half ? f.shift : undefined));
  const chosen = seats.find((s) => String(s.number) === String(f.seatNo));
  const total = (Number(f.planFee) || 0) + (chosen?.hasLocker ? Number(f.lockerFee) || 0 : 0);

  let nextDue = null;
  if (f.registrationDate) {
    const reg = new Date(f.registrationDate);
    if (f.firstFee === "paid") nextDue = addMonths(reg, 1);
    else if (f.firstFee === "unpaid") nextDue = reg;
    else if (f.firstFee === "paidToNow") {
      const t = new Date(todayStr());
      let n = 1, d = addMonths(reg, n);
      while (d <= t && n < 600) d = addMonths(reg, ++n);
      nextDue = d;
    } else if (f.paidTill) nextDue = new Date(f.paidTill);
  }

  const submit = async (e) => {
    e.preventDefault();
    if (f.phone.length < 10) return setErr("Enter a valid 10 digit mobile number.");
    setBusy(true); setErr("");
    try {
      onCreated(await addStudent({
        name: f.name, email: f.email, phone: f.phone, password: f.password,
        plan: f.plan, shift: half ? f.shift : undefined, planFee: Number(f.planFee),
        seatNo: f.seatNo, lockerFee: chosen?.hasLocker ? Number(f.lockerFee) : undefined,
        feeMode: f.feeMode, registrationDate: f.registrationDate, firstFee: f.firstFee, paidTill: f.paidTill,
      }));
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };

  const L = ({ t, children }) => <label className="block"><span className="lb-label">{t}</span>{children}</label>;

  return (
    <Modal title="Add student" onClose={onClose} size="lg">
      <form onSubmit={submit}>
        {!settings.configured && <p className="lb-alert lb-a-warn mb-4 text-sm lb-heading">Set timings and prices in Settings first, then add students.</p>}

        <div className="grid sm:grid-cols-2 gap-3">
          <input className="lb-input" placeholder="Full name" value={f.name} onChange={set("name")} required />
          <input className="lb-input" placeholder="Mobile number" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} required />
          <input className="lb-input sm:col-span-2" type="email" placeholder="Email (student login)" value={f.email} onChange={set("email")} required />
          <input className="lb-input sm:col-span-2" type="text" placeholder="Login password" value={f.password} onChange={set("password")} minLength={6} required />
        </div>

        <p className="mt-5 font-semibold lb-heading">Plan, seat and fees</p>
        <div className="mt-2 grid sm:grid-cols-2 gap-3">
          <L t="Plan">
            <select className="lb-input" value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value, seatNo: "", planFee: String(e.target.value === "Full day" ? settings.fullDayFee : settings.halfDayFee) })}>
              <option>Full day</option><option>Half day</option>
            </select>
          </L>
          {half ? (
            <L t="Shift">
              <select className="lb-input" value={f.shift} onChange={(e) => setF({ ...f, shift: e.target.value, seatNo: "" })}>
                {["first", "second"].map((k) => <option key={k} value={k}>{SLOT[k]} · {slotTime(settings, k)}</option>)}
              </select>
            </L>
          ) : <L t="Timing"><p className="lb-input lb-soft" style={{ border: 0 }}>{fullTime(settings)}</p></L>}
          <L t="Seat (optional)">
            <select className="lb-input" value={f.seatNo} onChange={set("seatNo")}>
              <option value="">{seatOptions.length ? "No seat for now" : "No free seat for this plan"}</option>
              {seatOptions.map((s) => <option key={s.number} value={s.number}>Seat {s.number}{s.hasLocker ? " · with locker" : ""}</option>)}
            </select>
          </L>
          <L t="Seat fee per month (₹)"><input className="lb-input" type="number" min="0" value={f.planFee} onChange={set("planFee")} required /></L>
          {chosen?.hasLocker && (
            <L t="Locker price per month (₹)"><input className="lb-input" type="number" min="0" value={f.lockerFee} onChange={set("lockerFee")} /></L>
          )}
        </div>
        <p className="mt-3 text-lg lb-heading">Monthly total: <b>{inr(total)}</b>
          {chosen?.hasLocker && <span className="text-sm lb-muted inline-flex items-center gap-1 ml-2"><Lock size={13} />seat {inr(f.planFee)} + locker {inr(f.lockerFee)}</span>}
        </p>

        <p className="mt-5 font-semibold lb-heading">Registration and first fee</p>
        <div className="mt-2 grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><L t="Registration date (choose an older date for previous students)">
            <input className="lb-input" type="date" max={todayStr()} value={f.registrationDate} onChange={set("registrationDate")} required />
          </L></div>
          <L t="First month fee">
            <select className="lb-input" value={f.firstFee} onChange={set("firstFee")}>
              <option value="paid">Received now (1 month paid)</option>
              <option value="unpaid">Not received yet</option>
              <option value="paidToNow">Previous student: all fees paid till today</option>
              <option value="paidTill">Previous student: paid till a specific date</option>
            </select>
          </L>
          {f.firstFee === "paidTill" && <L t="Paid till (next due date)"><input className="lb-input" type="date" min={f.registrationDate} value={f.paidTill} onChange={set("paidTill")} required /></L>}
        </div>
        {nextDue && <p className="mt-2 text-sm lb-muted">Next fee due on {fmt(nextDue)}.</p>}

        <p className="mt-4 lb-label">Fees mode (how this student pays, also used for the first fee)</p>
        <Toggle value={f.feeMode} onChange={(m) => setF({ ...f, feeMode: m })} options={["offline", "online"]} />

        <p role="alert" className="mt-4 min-h-[1.25rem] text-sm lb-err">{err}</p>
        <button disabled={busy || !settings.configured} className="lb-btn lb-btn-primary w-full">{busy ? "Saving" : "Create student"}</button>
      </form>
    </Modal>
  );
}
