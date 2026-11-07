import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, UserCheck, LogIn, Zap, UserX, CalendarCheck, Clock } from "lucide-react";
import { fetchAttendance, fetchStudentAttendance } from "../../api";
import { Avatar, Pills, Stat, fmt, fmtTime, fmtDur, minutesOf, todayStr } from "../ui";

const SHIFT = { full: "Full day", first: "First half", second: "Second half" };
const addDays = (s, n) => { const d = new Date(`${s}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const monthName = (m) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
const shiftMonth = (m, n) => { const d = new Date(`${m}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 7); };

const StatusBadge = ({ r }) => !r.clockOut
  ? <span className="lb-badge lb-b-success" style={{ textTransform: "none" }}><span className="lb-live" style={{ width: 7, height: 7 }} />Inside now</span>
  : r.autoClockOut ? <span className="lb-badge lb-b-warn" style={{ textTransform: "none" }}>Auto clocked out</span>
  : <span className="lb-badge lb-b-neutral" style={{ textTransform: "none" }}>Completed</span>;

function Daily() {
  const [date, setDate] = useState(todayStr());
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const isToday = date === todayStr();

  const load = useCallback(() => fetchAttendance(date).then((x) => { setD(x); setErr(""); }).catch((e) => setErr(e.message)), [date]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!isToday) return; const t = setInterval(load, 60000); return () => clearInterval(t); }, [isToday, load]);

  const c = d?.counts || {};
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button className="lb-iconbtn lb-card" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day"><ChevronLeft size={18} /></button>
        <input type="date" className="lb-input" style={{ width: "11rem" }} max={todayStr()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <button className="lb-iconbtn lb-card" disabled={isToday} onClick={() => setDate(addDays(date, 1))} aria-label="Next day"><ChevronRight size={18} /></button>
        {!isToday && <button className="lb-btn lb-btn-outline lb-btn-sm" onClick={() => setDate(todayStr())}>Today</button>}
        <span className="lb-muted text-sm ml-1">{d && fmt(d.date)}</span>
      </div>
      {err && <p className="lb-err">{err}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Present" value={c.present ?? "-"} icon={UserCheck} tone="success" />
        <Stat label="Inside now" value={isToday ? (c.inside ?? "-") : "-"} sub={isToday ? "live" : "today only"} icon={LogIn} tone="primary" />
        <Stat label="Auto clock-outs" value={c.auto ?? "-"} sub="forgot to clock out" icon={Zap} tone="warning" />
        <Stat label={isToday ? "Not clocked in yet" : "Absent"} value={c.absent ?? "-"} icon={UserX} tone="error" />
      </div>

      <div className="lb-scroll">
        <table className="lb-tbl" style={{ minWidth: "820px" }}>
          <thead><tr>{["Student", "Seat", "Shift", "Clock in", "Clock out", "Time", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {d?.records.map((r) => (
              <tr key={r._id}>
                <td><div className="flex items-center gap-3"><Avatar name={r.student?.name} photo={r.student?.photo} size={34} /><span className="lb-heading">{r.student?.name || "Deleted student"}<span className="block text-sm lb-muted">{r.student?.phone}</span></span></div></td>
                <td>{r.seatNo ?? "-"}</td>
                <td>{SHIFT[r.shift]}</td>
                <td>{fmtTime(r.clockIn)}</td>
                <td>{r.clockOut ? fmtTime(r.clockOut) : "-"}</td>
                <td>{fmtDur(minutesOf(r))}</td>
                <td><StatusBadge r={r} /></td>
              </tr>
            ))}
            {d && d.records.length === 0 && <tr><td colSpan="7" className="text-center lb-muted" style={{ padding: "2.5rem" }}>Nobody clocked in on this day.</td></tr>}
          </tbody>
        </table>
      </div>

      {d && d.absent.length > 0 && (
        <div className="lb-card p-5">
          <h3 className="font-bold lb-heading mb-3">{isToday ? "Not clocked in yet" : "Absent"} ({d.absent.length})</h3>
          <div className="flex flex-wrap gap-2.5">
            {d.absent.map((s) => (
              <span key={s._id} className="lb-soft flex items-center gap-2 pl-1.5 pr-3 py-1.5"><Avatar name={s.name} photo={s.photo} size={26} /><span className="text-sm lb-txt">{s.name}</span>
                <span className="text-xs lb-muted">{s.plan === "Full day" ? "Full day" : SHIFT[s.shift] || "Half day"}</span></span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ByStudent({ students }) {
  const active = students.filter((s) => s.isActive);
  const [id, setId] = useState("");
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) { setD(null); return; }
    fetchStudentAttendance(id, month).then((x) => { setD(x); setErr(""); }).catch((e) => setErr(e.message));
  }, [id, month]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select className="lb-input" style={{ maxWidth: "20rem" }} value={id} onChange={(e) => setId(e.target.value)} aria-label="Student">
          <option value="">Select a student</option>
          {active.map((s) => <option key={s._id} value={s._id}>{s.name} · {s.phone}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <button className="lb-iconbtn lb-card" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
          <span className="font-semibold lb-heading px-2 min-w-[8.5rem] text-center">{monthName(month)}</span>
          <button className="lb-iconbtn lb-card" disabled={month >= todayStr().slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
      </div>
      {err && <p className="lb-err">{err}</p>}
      {!id && <p className="lb-card p-10 text-center lb-muted">Choose a student to see their attendance for the month.</p>}

      {d && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat label="Days present" value={d.summary.daysPresent} sub={d.student.name} icon={CalendarCheck} tone="success" />
            <Stat label="Total study time" value={fmtDur(d.summary.totalMinutes)} icon={Clock} tone="primary" />
            <Stat label="Auto clock-outs" value={d.summary.autoClosed} icon={Zap} tone="warning" />
          </div>
          <div className="lb-scroll">
            <table className="lb-tbl" style={{ minWidth: "560px" }}>
              <thead><tr>{["Date", "Clock in", "Clock out", "Time", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {d.records.map((r) => (
                  <tr key={r._id}><td>{fmt(r.date)}</td><td>{fmtTime(r.clockIn)}</td><td>{r.clockOut ? fmtTime(r.clockOut) : "-"}</td><td>{fmtDur(minutesOf(r))}</td><td><StatusBadge r={r} /></td></tr>
                ))}
                {d.records.length === 0 && <tr><td colSpan="5" className="text-center lb-muted" style={{ padding: "2rem" }}>No attendance this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function AttendanceTab({ students }) {
  const [view, setView] = useState("daily");
  return (
    <div className="space-y-6">
      <Pills value={view} onChange={setView} items={[["daily", "Daily attendance"], ["student", "By student"]]} />
      {view === "daily" ? <Daily /> : <ByStudent students={students} />}
    </div>
  );
}
