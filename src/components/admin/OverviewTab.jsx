import { Armchair, CheckCircle2, Clock, Ban, UserCheck, UserX, Lock, KeyRound, Wallet, IndianRupee, TrendingUp, ArrowLeftRight } from "lucide-react";
import { Stat, FeeBadge, ModeBadge, fmt, inr, seatState, slotsUsed, slotTime, fullTime } from "../ui";

export default function OverviewTab({ students, seats, settings, summary, payments, setTab, onCollect }) {
  const total = seats.length;
  const full = seats.filter((s) => seatState(s) === "full").length;
  const half = seats.filter((s) => seatState(s) === "half").length;
  const free = total - full - half;
  const used = seats.reduce((t, s) => t + slotsUsed(s), 0);
  const pct = total ? Math.round((used / (total * 2)) * 100) : 0;
  const active = students.filter((s) => s.isActive).length;
  const lockerSeats = seats.filter((s) => s.hasLocker);
  const lockerOpen = lockerSeats.filter((s) => seatState(s) !== "full").length;
  const sm = summary || {};

  const due = students
    .filter((s) => ["overdue", "due_today", "left_due"].includes(s.fee?.status))
    .sort((a, b) => b.fee.overdueDays - a.fee.overdueDays)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {settings && !settings.configured && (
        <div className="lb-alert lb-a-warn flex flex-wrap items-center justify-between gap-3">
          <p className="lb-heading">First set the half day timings and prices.</p>
          <button onClick={() => setTab("settings")} className="lb-btn lb-btn-primary lb-btn-sm">Open settings</button>
        </div>
      )}
      {total === 0 && (
        <div className="lb-alert lb-a-warn flex flex-wrap items-center justify-between gap-3">
          <p className="lb-heading">No seats yet. Create your library seats (for example 1 to 200).</p>
          <button onClick={() => setTab("seats")} className="lb-btn lb-btn-primary lb-btn-sm">Create seats</button>
        </div>
      )}

      <section>
        <h2 className="text-lg font-bold lb-heading">Seats</h2>
        {settings && <p className="lb-muted text-sm mb-3">First half {slotTime(settings, "first")} · Second half {slotTime(settings, "second")} · Full day {fullTime(settings)}</p>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total seats" value={total} sub={`${half + full} reserved`} icon={Armchair} tone="primary" />
          <Stat label="Available seats" value={free} sub="both shifts free" icon={CheckCircle2} tone="success" />
          <Stat label="One shift free" value={half} sub="half day can join" icon={Clock} tone="info" />
          <Stat label="Fully booked" value={full} icon={Ban} tone="warning" />
        </div>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Active students" value={active} icon={UserCheck} tone="success" />
          <Stat label="Inactive students" value={students.length - active} icon={UserX} tone="error" />
          <Stat label="Seats with locker" value={lockerSeats.length} sub={`${inr(settings?.lockerFee)} / month`} icon={Lock} tone="violet" />
          <Stat label="Locker seats open" value={lockerOpen} sub="at least one shift free" icon={KeyRound} tone="orange" />
        </div>
        <div className="lb-card p-5 mt-4">
          <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold lb-heading">Seat occupancy</span><span className="lb-muted text-sm">{used} of {total * 2} shifts booked · {pct}%</span></div>
          <div className="lb-track mt-3"><div className="lb-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold lb-heading mb-3">Fees</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Fees pending" value={inr(sm.pendingAmount)} sub={`${sm.pendingStudents || 0} students${sm.leftDuesStudents ? `, ${sm.leftDuesStudents} left` : ""}`} icon={Wallet} tone="error" />
          <Stat label="Collected this month" value={inr(sm.thisMonthCollected)} icon={TrendingUp} tone="success" />
          <Stat label="Total collected" value={inr(sm.totalCollected)} sub={`${sm.paymentsCount || 0} payments`} icon={IndianRupee} tone="primary" />
          <Stat label="Offline / Online" value={`${inr(sm.offlineCollected)} / ${inr(sm.onlineCollected)}`} icon={ArrowLeftRight} tone="violet" />
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="lb-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold lb-heading">Fees due</h2>
            <button onClick={() => setTab("fees")} className="lb-link text-sm">View all</button>
          </div>
          <ul className="mt-3 lb-divide">
            {due.map((s) => (
              <li key={s._id} className="py-3 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate lb-heading">{s.name}<span className="block text-sm lb-muted">{inr(s.fee.pendingAmount)} · due {fmt(s.fee.dueDate)}{s.isActive ? "" : " · Left"}</span></span>
                <span className="flex items-center gap-2 shrink-0">
                  <FeeBadge fee={s.fee} />
                  <button onClick={() => onCollect(s)} className="lb-btn lb-btn-primary lb-btn-sm">Collect</button>
                </span>
              </li>
            ))}
            {due.length === 0 && <li className="py-6 text-center lb-muted">No pending fees.</li>}
          </ul>
        </div>

        <div className="lb-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold lb-heading">Recent transactions</h2>
            <button onClick={() => setTab("transactions")} className="lb-link text-sm">View all</button>
          </div>
          <ul className="mt-3 lb-divide">
            {payments.slice(0, 6).map((p) => (
              <li key={p._id} className="py-3 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate lb-heading">{p.student?.name || "Deleted student"}<span className="block text-sm lb-muted">{fmt(p.paidOn)}</span></span>
                <span className="flex items-center gap-3 shrink-0"><ModeBadge mode={p.mode} /><span className="font-semibold lb-heading">{inr(p.amount)}</span></span>
              </li>
            ))}
            {payments.length === 0 && <li className="py-6 text-center lb-muted">No payments recorded yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
