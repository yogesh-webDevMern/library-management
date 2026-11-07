import { LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { fmtDur, minutesOf, useNow } from "./ui";

// The Clock in / Clock out button that stays visible in the student's top bar.
export default function ClockButton({ att, busy, onIn, onOut }) {
  useNow(30000); // refreshes the running time
  if (!att) return null;
  const t = att.today;

  if (t && !t.clockOut) {
    return (
      <button onClick={onOut} disabled={busy} className="lb-btn lb-btn-danger lb-btn-sm" title="Clock out">
        <span className="lb-live" />
        <span className="hidden sm:inline">{fmtDur(minutesOf(t))} ·</span><LogOut size={14} />Clock out
      </button>
    );
  }
  if (t && t.clockOut) {
    return <span className="lb-badge lb-b-success" style={{ textTransform: "none" }} title={att.reason}><CheckCircle2 size={13} /><span className="hidden sm:inline">Done today</span><span className="sm:hidden">Done</span></span>;
  }
  return (
    <button onClick={onIn} disabled={busy || !att.canClockIn} className="lb-btn lb-btn-primary lb-btn-sm" title={att.canClockIn ? "Clock in" : att.reason}>
      <LogIn size={14} />Clock in
    </button>
  );
}
