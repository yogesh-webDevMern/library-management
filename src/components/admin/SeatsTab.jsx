import { useState } from "react";
import { Lock } from "lucide-react";
import { createSeats, setSeatLocker, assignSeat, releaseSeat, deleteSeat } from "../../api";
import { Modal, Pills, seatState, seatFits, slotTime, fullTime, inr, SLOT } from "../ui";

export default function SeatsTab({ seats, students, settings, reload }) {
  const [range, setRange] = useState({ from: 1, to: 200, locker: false });
  const [lrange, setLrange] = useState({ from: 1, to: 20 });
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [lockerFee, setLockerFee] = useState(String(settings.lockerFee));
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const seat = seats.find((s) => s.number === sel);
  const counts = { all: seats.length, free: 0, half: 0, full: 0, locker: seats.filter((s) => s.hasLocker).length };
  seats.forEach((s) => counts[seatState(s)]++);

  const shown = seats.filter((s) => {
    if (filter === "locker" ? !s.hasLocker : filter !== "all" && seatState(s) !== filter) return false;
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return String(s.number).startsWith(t) || [s.student, s.first, s.second].some((x) => x && x.name.toLowerCase().includes(t));
  });

  const run = async (fn) => {
    setBusy(true); setErr("");
    try { const r = await fn(); await reload(); return { r }; }
    catch (e) { setErr(e.message); return null; }
    finally { setBusy(false); }
  };
  const create = async (e) => {
    e.preventDefault(); setMsg("");
    const out = await run(() => createSeats(range.from, range.to, range.locker));
    if (out) setMsg(`${out.r.created} seats created${out.r.skipped ? `, ${out.r.skipped} already existed` : ""}.`);
  };
  const markLocker = async (has) => {
    setMsg("");
    const out = await run(() => setSeatLocker(lrange.from, lrange.to, has));
    if (out) setMsg(`${out.r.updated} seats ${has ? "now have" : "no longer have"} a locker${out.r.skipped ? `. ${out.r.skipped} skipped (missing or occupied)` : ""}.`);
  };
  const open = (n) => { setSel(n); setStudentId(""); setErr(""); setLockerFee(String(settings.lockerFee)); };
  const closeModal = () => { setSel(null); setStudentId(""); setErr(""); };
  const assign = async () => { if (studentId && (await run(() => assignSeat(sel, studentId, undefined, seat.hasLocker ? Number(lockerFee) : undefined)))) closeModal(); };
  const release = async (slot, name) => {
    if (!window.confirm(`Release ${name} from seat ${sel}? They stay active but will have no seat${seat.hasLocker ? " (locker price is removed from their fee)" : ""}.`)) return;
    await run(() => releaseSeat(sel, slot));
  };
  const remove = async () => {
    if (!window.confirm(`Delete seat ${sel} permanently?`)) return;
    if (await run(() => deleteSeat(sel))) closeModal();
  };

  const rows = seat
    ? seat.student
      ? [["student", "Full day", fullTime(settings), seat.student]]
      : [["first", SLOT.first, slotTime(settings, "first"), seat.first], ["second", SLOT.second, slotTime(settings, "second"), seat.second]]
    : [];
  const candidates = seat ? students.filter((s) => s.isActive && !s.seatNo && seatFits(seat, s.plan, s.shift)) : [];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        <form onSubmit={create} className="lb-card p-5">
          <h2 className="font-bold lb-heading">Create library seats</h2>
          <p className="lb-muted text-sm">Each seat has two shifts: one full day student, or two half day students.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label><span className="lb-label">From</span><input type="number" min="1" className="lb-input" style={{ width: "6.5rem" }} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
            <label><span className="lb-label">To</span><input type="number" min="1" className="lb-input" style={{ width: "6.5rem" }} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
            <button disabled={busy} className="lb-btn lb-btn-primary">Create seats</button>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm lb-txt"><input type="checkbox" className="lb-check" checked={range.locker} onChange={(e) => setRange({ ...range, locker: e.target.checked })} />These seats have a locker above them</label>
        </form>

        <div className="lb-card p-5">
          <h2 className="font-bold lb-heading">Seats with a locker</h2>
          <p className="lb-muted text-sm">Locker price {inr(settings.lockerFee)} per month is added to the fees of the student who gets that seat. Only free seats can be changed.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label><span className="lb-label">From</span><input type="number" min="1" className="lb-input" style={{ width: "6.5rem" }} value={lrange.from} onChange={(e) => setLrange({ ...lrange, from: e.target.value })} /></label>
            <label><span className="lb-label">To</span><input type="number" min="1" className="lb-input" style={{ width: "6.5rem" }} value={lrange.to} onChange={(e) => setLrange({ ...lrange, to: e.target.value })} /></label>
            <button disabled={busy} onClick={() => markLocker(true)} className="lb-btn lb-btn-primary">Add locker</button>
            <button disabled={busy} onClick={() => markLocker(false)} className="lb-btn lb-btn-outline">Remove locker</button>
          </div>
        </div>
      </div>
      {msg && <p className="lb-ok">{msg}</p>}
      {err && !sel && <p className="lb-err">{err}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills value={filter} onChange={setFilter} items={[["all", "All", counts.all], ["free", "Available", counts.free], ["half", "One shift free", counts.half], ["full", "Fully booked", counts.full], ["locker", "With locker", counts.locker]]} />
        <input className="lb-input" style={{ maxWidth: "18rem" }} placeholder="Search seat or student" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search seats" />
      </div>

      <div className="flex flex-wrap gap-5 text-sm lb-muted">
        <span className="flex items-center gap-2"><i className="lb-slot lb-s-free" style={{ width: "1.5rem", flex: "none" }} />Shift free</span>
        <span className="flex items-center gap-2"><i className="lb-slot lb-s-busy" style={{ width: "1.5rem", flex: "none" }} />Shift booked</span>
        <span className="flex items-center gap-1.5"><Lock size={13} style={{ color: "var(--color-violet)" }} />Locker above seat</span>
        <span>Left bar = first half, right bar = second half</span>
      </div>

      {seats.length === 0 ? (
        <p className="text-center lb-muted py-10">No seats yet. Create them above.</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10 gap-2">
          {shown.map((s) => {
            const who = s.student || s.first || s.second;
            return (
              <button key={s.number} onClick={() => open(s.number)} className="lb-tile">
                {s.hasLocker && <Lock size={11} className="lb-tile-lock" />}
                <span className="block text-lg font-bold lb-heading">{s.number}</span>
                <span className="block text-xs truncate lb-muted">{who ? who.name.split(" ")[0] : "Free"}</span>
                <span className="mt-1.5 flex gap-1">
                  <i className={`lb-slot ${s.student || s.first ? "lb-s-busy" : "lb-s-free"}`} />
                  <i className={`lb-slot ${s.student || s.second ? "lb-s-busy" : "lb-s-free"}`} />
                </span>
              </button>
            );
          })}
          {shown.length === 0 && <p className="col-span-full text-center lb-muted py-6">No seats match.</p>}
        </div>
      )}

      {seat && (
        <Modal title={`Seat ${seat.number}`} onClose={closeModal}>
          <p className="text-sm lb-muted flex items-center gap-1.5"><Lock size={14} style={{ color: seat.hasLocker ? "var(--color-violet)" : undefined }} />{seat.hasLocker ? `Locker above this seat · ${inr(settings.lockerFee)} per month` : "No locker on this seat"}</p>
          <div className="space-y-2 mt-3">
            {rows.map(([slot, label, time, who]) => (
              <div key={slot} className="lb-soft p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs lb-muted">{label} · {time}</p>
                  {who ? <p className="truncate lb-heading">{who.name}<span className="lb-muted"> · {who.phone}</span></p> : <p className="lb-ok font-medium">Free</p>}
                </div>
                {who && <button disabled={busy} onClick={() => release(slot, who.name)} className="lb-btn lb-btn-outline lb-btn-sm">Release</button>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs lb-muted">If the student has left, mark them Inactive in the Students tab so their fees stop. Release only takes the seat away.</p>

          {seatState(seat) !== "full" && (
            <div className="mt-4 space-y-3">
              <select className="lb-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} aria-label="Student">
                <option value="">{candidates.length ? "Select student for this seat" : "No matching student waiting"}</option>
                {candidates.map((s) => <option key={s._id} value={s._id}>{s.name} · {s.plan}{s.plan === "Half day" ? ` (${SLOT[s.shift]})` : ""}</option>)}
              </select>
              {seat.hasLocker && (
                <label className="block"><span className="lb-label">Locker price for this student (₹ per month, you can change it)</span>
                  <input type="number" min="0" className="lb-input" value={lockerFee} onChange={(e) => setLockerFee(e.target.value)} /></label>
              )}
              <button disabled={busy || !studentId} onClick={assign} className="lb-btn lb-btn-primary w-full">Assign seat</button>
            </div>
          )}
          {seatState(seat) === "free" && <button disabled={busy} onClick={remove} className="lb-btn lb-btn-danger w-full mt-3">Delete this seat</button>}
          <p role="alert" className="mt-3 min-h-[1.25rem] text-sm lb-err">{err}</p>
        </Modal>
      )}
    </div>
  );
}
