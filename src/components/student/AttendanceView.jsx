import { ChevronLeft, ChevronRight, CalendarCheck, Clock, Zap, LogIn, LogOut } from "lucide-react";
import { Stat, fmt, fmtTime, fmtDur, minutesOf, slotTime, fullTime, SLOT, todayStr, useNow } from "../ui";

const shiftLabel = (shift, timing) => (shift === "full" ? `Full day · ${fullTime(timing)}` : shift ? `${SLOT[shift]} · ${slotTime(timing, shift)}` : "Shift not set");
const monthName = (m) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
const shiftMonth = (m, n) => { const d = new Date(`${m}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 7); };

function MonthStrip({ month, records }) {
  const first = new Date(`${month}-01T00:00:00Z`);
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const byDay = Object.fromEntries(records.map((r) => [r.date.slice(0, 10), r]));
  const today = todayStr();
  const cells = [...Array(first.getUTCDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-[11px] lb-muted">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const key = `${month}-${String(d).padStart(2, "0")}`;
          const r = byDay[key];
          const cls = r ? (r.autoClockOut ? "lb-day-a" : "lb-day-p") : key > today ? "lb-day-f" : key < today ? "lb-day-m" : "";
          return <span key={i} className={`lb-day ${cls} ${key === today ? "lb-day-t" : ""}`} title={r ? `${fmtTime(r.clockIn)} to ${fmtTime(r.clockOut)}` : ""}>{d}</span>;
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-xs lb-muted">
        <span className="flex items-center gap-1.5"><i className="lb-day lb-day-p" style={{ width: 14, height: 14 }} />Present</span>
        <span className="flex items-center gap-1.5"><i className="lb-day lb-day-a" style={{ width: 14, height: 14 }} />Clocked out automatically</span>
        <span className="flex items-center gap-1.5"><i className="lb-day lb-day-m" style={{ width: 14, height: 14 }} />No attendance</span>
      </div>
    </div>
  );
}

export default function AttendanceView({ att, timing, clockBusy, onIn, onOut, onMonth }) {
  useNow(30000);
  if (!att) return <p className="lb-muted">Loading</p>;
  const t = att.today;
  const open = t && !t.clockOut;
  const cur = todayStr().slice(0, 7);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="lb-gradient lb-hero-card p-6 sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm opacity-80">Today · {shiftLabel(att.shift, timing)}</p>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1 flex items-center gap-2.5">
              {open && <span className="lb-live" />}{open ? "You are studying" : t ? "Session completed" : "Not clocked in"}
            </h3>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <span>Clock in <b className="block text-lg">{t ? fmtTime(t.clockIn) : "-"}</b></span>
              <span>Clock out <b className="block text-lg">{t?.clockOut ? fmtTime(t.clockOut) : open ? "Still inside" : "-"}</b></span>
              <span>Time <b className="block text-lg">{t ? fmtDur(minutesOf(t)) : "-"}</b></span>
            </div>
            {t?.autoClockOut && <p className="mt-3 text-sm opacity-90">You forgot to clock out, so you were clocked out automatically at the end of your shift.</p>}
            {!t && att.reason && <p className="mt-3 text-sm opacity-90">{att.reason}</p>}
            {open && att.window && <p className="mt-3 text-sm opacity-90">If you forget, you are clocked out automatically at {fmtTime(att.window.end)}.</p>}
          </div>
          {open
            ? <button disabled={clockBusy} onClick={onOut} className="lb-btn lb-btn-light lb-btn-lg"><LogOut size={18} />Clock out</button>
            : !t && <button disabled={clockBusy || !att.canClockIn} onClick={onIn} className="lb-btn lb-btn-light lb-btn-lg"><LogIn size={18} />Clock in</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Days present" value={att.summary.daysPresent} sub={monthName(att.month)} icon={CalendarCheck} tone="success" />
        <Stat label="Total study time" value={fmtDur(att.summary.totalMinutes)} icon={Clock} tone="primary" />
        <Stat label="Automatic clock-outs" value={att.summary.autoClosed} sub="forgot to clock out" icon={Zap} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="lb-card p-5">
          <div className="flex items-center justify-between mb-4">
            <button className="lb-iconbtn" onClick={() => onMonth(shiftMonth(att.month, -1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
            <h3 className="font-bold lb-heading">{monthName(att.month)}</h3>
            <button className="lb-iconbtn" disabled={att.month >= cur} onClick={() => onMonth(shiftMonth(att.month, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
          </div>
          <MonthStrip month={att.month} records={att.records} />
        </div>

        <div className="lb-card p-5">
          <h3 className="font-bold lb-heading mb-3">History</h3>
          <div className="lb-scroll" style={{ maxHeight: 360, overflowY: "auto" }}>
            <table className="lb-tbl">
              <thead><tr>{["Date", "In", "Out", "Time"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {att.records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ whiteSpace: "nowrap" }}>{fmt(r.date)}</td>
                    <td>{fmtTime(r.clockIn)}</td>
                    <td>{r.clockOut ? fmtTime(r.clockOut) : "Inside"}{r.autoClockOut && <span className="lb-badge lb-b-warn ml-1.5" style={{ textTransform: "none" }}>auto</span>}</td>
                    <td>{fmtDur(minutesOf(r))}</td>
                  </tr>
                ))}
                {att.records.length === 0 && <tr><td colSpan="4" className="text-center lb-muted" style={{ padding: "2rem" }}>No attendance this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
