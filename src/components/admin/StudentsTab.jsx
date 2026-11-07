import { useEffect, useRef, useState } from "react";
import { Lock, Plus, MoreVertical, Pencil, Wallet, KeyRound, UserX, UserCheck, Copy, Wand2 } from "lucide-react";
import { assignSeat, setStudentStatus, updateFees, updateStudent, resetStudentPassword } from "../../api";
import { Avatar, Badge, FeeBadge, Modal, Pills, Toggle, fmt, inr, seatFits, slotTime, SLOT } from "../ui";

/* ---------- row menu (opens over the table, never clipped) ---------- */
function RowMenu({ items }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (!pos) return;
    const close = (e) => { if (e.type === "mousedown" && ref.current?.contains(e.target)) return; setPos(null); };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("mousedown", close); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [pos]);
  return (
    <div ref={ref} className="inline-block">
      <button className="lb-iconbtn" aria-label="More actions" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos(pos ? null : { top: r.bottom + 4, left: Math.max(8, r.right - 200) }); }}><MoreVertical size={18} /></button>
      {pos && (
        <div className="lb-menu" style={{ position: "fixed", top: pos.top, left: pos.left, width: 200, right: "auto", margin: 0 }}>
          <div className="p-1.5">
            {items.filter(Boolean).map(({ label, icon: Icon, onClick, danger }) => (
              <button key={label} className="lb-mitem" style={danger ? { color: "var(--color-error)" } : undefined} onClick={() => { setPos(null); onClick(); }}><Icon size={15} />{label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- dialogs ---------- */
function SeatDialog({ s, seats, settings, onClose, onDone }) {
  const half = s.plan === "Half day";
  const [shift, setShift] = useState(s.shift || "first");
  const [seatNo, setSeatNo] = useState("");
  const [lockerFee, setLockerFee] = useState(String(settings.lockerFee));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const options = seats.filter((x) => seatFits(x, s.plan, half ? shift : undefined));
  const chosen = seats.find((x) => String(x.number) === String(seatNo));
  const give = async () => {
    setBusy(true); setErr("");
    try { await assignSeat(seatNo, s._id, half ? shift : undefined, chosen?.hasLocker ? Number(lockerFee) : undefined); await onDone(); }
    catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal title={`${s.seatNo ? "Change" : "Assign"} seat`} onClose={onClose}>
      <p className="lb-muted">{s.name} · {s.plan}{s.seatNo ? ` · now seat ${s.seatNo}` : ""}</p>
      {half && (
        <select className="lb-input mt-4" value={shift} onChange={(e) => { setShift(e.target.value); setSeatNo(""); }} aria-label="Shift">
          {["first", "second"].map((k) => <option key={k} value={k}>{SLOT[k]} · {slotTime(settings, k)}</option>)}
        </select>
      )}
      <select className="lb-input mt-3" value={seatNo} onChange={(e) => setSeatNo(e.target.value)} aria-label="Seat">
        <option value="">{options.length ? "Select seat" : "No seat free for this plan"}</option>
        {options.map((x) => <option key={x.number} value={x.number}>Seat {x.number}{x.hasLocker ? " · with locker" : ""}</option>)}
      </select>
      {chosen?.hasLocker && (
        <label className="block mt-3"><span className="lb-label">Locker price (₹ per month, added to the fee. You can change it)</span>
          <input type="number" min="0" className="lb-input" value={lockerFee} onChange={(e) => setLockerFee(e.target.value)} /></label>
      )}
      <p role="alert" className="mt-3 min-h-[1.25rem] text-sm lb-err">{err}</p>
      <button disabled={busy || !seatNo} onClick={give} className="lb-btn lb-btn-primary w-full">Confirm</button>
    </Modal>
  );
}

function FeesDialog({ s, onClose, onDone }) {
  const hasLocker = s.lockerFee !== undefined && s.lockerFee !== null;
  const [plan, setPlan] = useState(String(s.planFee ?? s.monthlyFee - (s.lockerFee || 0)));
  const [locker, setLocker] = useState(String(s.lockerFee ?? 0));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const total = (Number(plan) || 0) + (hasLocker ? Number(locker) || 0 : 0);
  const save = async () => {
    setBusy(true); setErr("");
    try { await updateFees(s._id, { planFee: Number(plan), lockerFee: hasLocker ? Number(locker) : undefined }); await onDone(); }
    catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal title="Edit fees" onClose={onClose}>
      <p className="lb-muted">{s.name} · {s.plan}{s.plan === "Half day" && s.shift ? ` (${SLOT[s.shift]})` : ""}</p>
      <label className="block mt-4"><span className="lb-label">Seat fee per month (₹)</span>
        <input type="number" min="0" className="lb-input" value={plan} onChange={(e) => setPlan(e.target.value)} /></label>
      {hasLocker && <label className="block mt-3"><span className="lb-label">Locker price per month (₹)</span>
        <input type="number" min="0" className="lb-input" value={locker} onChange={(e) => setLocker(e.target.value)} /></label>}
      <p className="mt-4 text-lg lb-heading">Monthly total: <b>{inr(total)}</b></p>
      <p className="text-xs lb-muted">The new fee is used from now on for pending fees and the next payment.</p>
      <p role="alert" className="mt-3 min-h-[1.25rem] text-sm lb-err">{err}</p>
      <button disabled={busy} onClick={save} className="lb-btn lb-btn-primary w-full">Save fees</button>
    </Modal>
  );
}

function InfoDialog({ s, onClose, onDone }) {
  const [f, setF] = useState({ name: s.name, email: s.email, phone: s.phone, feeMode: s.feeMode || "offline" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await updateStudent(s._id, f); await onDone(); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <Modal title="Edit student details" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <label className="block"><span className="lb-label">Full name</span><input className="lb-input" value={f.name} onChange={set("name")} required /></label>
        <label className="block"><span className="lb-label">Mobile number</span><input className="lb-input" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} required /></label>
        <label className="block"><span className="lb-label">Email (the student logs in with this)</span><input className="lb-input" type="email" value={f.email} onChange={set("email")} required /></label>
        <div><span className="lb-label">Fees mode</span><Toggle value={f.feeMode} onChange={(m) => setF({ ...f, feeMode: m })} options={["offline", "online"]} /></div>
        <p role="alert" className="min-h-[1.25rem] text-sm lb-err">{err}</p>
        <button disabled={busy} className="lb-btn lb-btn-primary w-full">{busy ? "Saving" : "Save details"}</button>
      </form>
    </Modal>
  );
}

const makePassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(rnd, (n) => chars[n % chars.length]).join("");
};

function PasswordDialog({ s, onClose }) {
  const [pw, setPw] = useState(makePassword());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const save = async () => {
    setBusy(true); setErr("");
    try { await resetStudentPassword(s._id, pw); setDone(true); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(pw); setCopied(true); } catch { /* clipboard blocked */ } };
  return (
    <Modal title="Reset student password" onClose={onClose}>
      <p className="lb-muted text-sm">Passwords are stored in a scrambled form, so nobody can read the old one. Set a new password and tell it to {s.name}. They can change it from their panel afterwards.</p>
      {!done ? (
        <>
          <div className="mt-4 flex gap-2">
            <input className="lb-input" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} />
            <button type="button" className="lb-btn lb-btn-outline" onClick={() => setPw(makePassword())} title="Generate a new one"><Wand2 size={16} /></button>
          </div>
          <p className="mt-2 text-xs lb-muted">{s.name} will be logged out on all devices.</p>
          <p role="alert" className="mt-3 min-h-[1.25rem] text-sm lb-err">{err}</p>
          <button disabled={busy || pw.length < 6} onClick={save} className="lb-btn lb-btn-primary w-full">{busy ? "Saving" : "Set new password"}</button>
        </>
      ) : (
        <div className="mt-4">
          <div className="lb-alert lb-a-ok">
            <p className="font-semibold lb-heading">Password updated</p>
            <p className="text-sm lb-muted mt-1">Tell this to {s.name} now. It is not shown again.</p>
            <div className="mt-3 flex items-center justify-between gap-3 lb-soft p-3"><code className="text-lg font-bold lb-heading tracking-wider">{pw}</code>
              <button className="lb-btn lb-btn-outline lb-btn-sm" onClick={copy}><Copy size={14} />{copied ? "Copied" : "Copy"}</button></div>
          </div>
          <button onClick={onClose} className="lb-btn lb-btn-primary w-full mt-4">Done</button>
        </div>
      )}
    </Modal>
  );
}

/* ---------- tab ---------- */
export default function StudentsTab({ students, seats, settings, reload, onAdd }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [dlg, setDlg] = useState(null); // { type: "seat" | "fees" | "info" | "password", s }
  const [err, setErr] = useState("");

  const counts = { all: students.length, active: students.filter((s) => s.isActive).length, inactive: students.filter((s) => !s.isActive).length };
  const shown = students.filter((s) => {
    if (filter === "active" && !s.isActive) return false;
    if (filter === "inactive" && s.isActive) return false;
    const t = q.trim().toLowerCase();
    return !t || s.name.toLowerCase().includes(t) || s.phone.includes(t) || s.email.includes(t) || String(s.seatNo || "") === t;
  });

  const toggle = async (s) => {
    const next = !s.isActive;
    const text = next
      ? `Mark ${s.name} active again? They can log in, but will need a new seat. The days they were away are not charged.`
      : `Mark ${s.name} inactive? ${s.seatNo ? `Seat ${s.seatNo} ` : ""}will be freed for others. Fees stop from today (dues till today stay pending). They will not be able to log in.`;
    if (!window.confirm(text)) return;
    try { await setStudentStatus(s._id, next); await reload(); } catch (e) { setErr(e.message); }
  };
  const done = async () => { await reload(); setDlg(null); };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills value={filter} onChange={setFilter} items={[["all", "All", counts.all], ["active", "Active", counts.active], ["inactive", "Inactive", counts.inactive]]} />
        <div className="flex flex-wrap gap-3">
          <input className="lb-input" style={{ maxWidth: "18rem" }} placeholder="Search name, phone, seat" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
          <button onClick={onAdd} className="lb-btn lb-btn-primary"><Plus size={16} />Add student</button>
        </div>
      </div>
      {err && <p className="lb-err">{err}</p>}

      <div className="lb-scroll">
        <table className="lb-tbl" style={{ minWidth: "1050px" }}>
          <thead><tr>{["Student", "Phone", "Seat", "Plan and fee", "Fees mode", "Registered", "Fees", "Status", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {shown.map((s) => {
              const hasLocker = s.lockerFee !== undefined && s.lockerFee !== null;
              return (
                <tr key={s._id}>
                  <td><div className="flex items-center gap-3"><Avatar name={s.name} photo={s.photo} size={38} /><span className="lb-heading">{s.name}<span className="block text-sm lb-muted">{s.email}</span></span></div></td>
                  <td>{s.phone}</td>
                  <td>{s.seatNo ?? "-"}
                    {hasLocker && <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-violet)" }}><Lock size={11} />locker</span>}
                    {!s.isActive && s.lastSeatNo ? <span className="block text-xs lb-muted">was {s.lastSeatNo}</span> : null}</td>
                  <td>{s.plan}{s.plan === "Half day" && s.shift ? <span className="lb-muted"> · {SLOT[s.shift]}</span> : null}
                    <span className="block text-sm lb-muted">{inr(s.monthlyFee)} / month{hasLocker ? ` (seat ${inr(s.planFee ?? s.monthlyFee - s.lockerFee)} + locker ${inr(s.lockerFee)})` : ""}</span></td>
                  <td className="capitalize">{s.feeMode}</td>
                  <td>{fmt(s.registrationDate)}{s.leftOn && <span className="block text-xs lb-err">Left {fmt(s.leftOn)}</span>}</td>
                  <td><FeeBadge fee={s.fee} /></td>
                  <td><Badge active={s.isActive} /></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {s.isActive && <button onClick={() => setDlg({ type: "seat", s })} className="lb-btn lb-btn-outline lb-btn-sm">{s.seatNo ? "Change seat" : "Assign seat"}</button>}
                      <RowMenu items={[
                        { label: "Edit details", icon: Pencil, onClick: () => setDlg({ type: "info", s }) },
                        s.isActive && { label: "Edit fees", icon: Wallet, onClick: () => setDlg({ type: "fees", s }) },
                        s.isActive && { label: "Reset password", icon: KeyRound, onClick: () => setDlg({ type: "password", s }) },
                        { label: s.isActive ? "Make inactive" : "Make active", icon: s.isActive ? UserX : UserCheck, danger: s.isActive, onClick: () => toggle(s) },
                      ]} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && <tr><td colSpan="9" className="text-center lb-muted" style={{ padding: "2.5rem" }}>No students found.</td></tr>}
          </tbody>
        </table>
      </div>

      {dlg?.type === "seat" && <SeatDialog s={dlg.s} seats={seats} settings={settings} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.type === "fees" && <FeesDialog s={dlg.s} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.type === "info" && <InfoDialog s={dlg.s} onClose={() => setDlg(null)} onDone={done} />}
      {dlg?.type === "password" && <PasswordDialog s={dlg.s} onClose={() => setDlg(null)} />}
    </div>
  );
}
