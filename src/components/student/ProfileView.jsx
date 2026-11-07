import { Armchair, Wallet, CalendarDays, Clock, Mail, Phone, Library, Lock, Calendar, CreditCard, BookOpen, Timer, Info, Camera, LogIn, LogOut } from "lucide-react";
import { Stat, InfoRow, FeeBadge, Avatar, fmt, fmtTime, fmtDur, minutesOf, inr, slotTime, fullTime, SLOT, useNow } from "../ui";
import PhotoButton from "../PhotoButton";
import DirectorCard from "./DirectorCard";

export default function ProfileView({ s, fee, timing, director, att, clockBusy, onIn, onOut, onPhoto }) {
  useNow(30000);
  const half = s.plan === "Half day";
  const when = half && s.shift ? `${SLOT[s.shift]} · ${slotTime(timing, s.shift)}` : !half ? fullTime(timing) : "";
  const daysSince = Math.max(0, Math.floor((Date.now() - new Date(s.registrationDate)) / 86400000));
  const hasLocker = s.lockerFee !== undefined && s.lockerFee !== null;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const t = att?.today;

  const status = !att ? "" : t && !t.clockOut ? `Clocked in at ${fmtTime(t.clockIn)} · ${fmtDur(minutesOf(t))} so far`
    : t ? `Clocked out at ${fmtTime(t.clockOut)}${t.autoClockOut ? " (automatic)" : ""} · ${fmtDur(minutesOf(t))} studied today` : (att.reason || "You have not clocked in yet");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: profile card */}
        <div className="lg:col-span-1">
          <div className="lb-card overflow-hidden lg:sticky lg:top-24">
            <div className="lb-hero p-6 text-center">
              <div className="relative inline-block">
                <Avatar name={s.name} photo={s.photo} size={112} className="shadow-lg" />
                <div className="absolute -bottom-1 -right-1">
                  <PhotoButton onUrl={onPhoto} className="lb-btn lb-btn-primary" style={{ width: 36, height: 36, padding: 0, borderRadius: 9999 }} title="Upload your picture"><Camera size={16} /></PhotoButton>
                </div>
              </div>
              <h3 className="text-xl font-bold lb-heading mt-4">{s.name}</h3>
              <p className="text-sm lb-muted mt-1">Student • {s.seatNo ? `Seat ${s.seatNo}` : "Seat not assigned"}</p>
              <p className="text-xs lb-muted mt-2">{s.plan}{half && s.shift ? ` • ${SLOT[s.shift]}` : ""}</p>
              <p className="text-[11px] lb-muted mt-3">You can change your picture. Other details can only be changed by the library desk.</p>
            </div>

            <div className="p-5">
              <h4 className="text-sm font-semibold lb-heading mb-1 flex items-center gap-2"><Mail size={16} />Contact Information</h4>
              <InfoRow label="Email Address" value={s.email} icon={Mail} />
              <InfoRow label="Phone Number" value={s.phone} icon={Phone} />
            </div>

            <div className="p-5" style={{ borderTop: "1px solid var(--color-border)" }}>
              <h4 className="text-sm font-semibold lb-heading mb-1 flex items-center gap-2"><BookOpen size={16} />Library Details</h4>
              <InfoRow label="Seat Number" value={s.seatNo ? String(s.seatNo) : "Not assigned"} icon={Armchair} />
              <InfoRow label="Study Timing" value={when} icon={Clock} />
              <InfoRow label="Locker" value={hasLocker ? `Yes, above your seat (${inr(s.lockerFee)} / month)` : "No locker"} icon={Lock} />
              <InfoRow label="Joined On" value={fmt(s.registrationDate)} icon={Calendar} />
              <InfoRow label="Fees Mode" value={s.feeMode ? s.feeMode[0].toUpperCase() + s.feeMode.slice(1) : ""} icon={CreditCard} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="lb-gradient lb-hero-card p-6 sm:p-7">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
              <div className="min-w-0">
                <p className="text-sm opacity-80">{greet}</p>
                <h3 className="text-2xl sm:text-3xl font-bold mt-0.5 truncate">{s.name.split(" ")[0]}</h3>
                <p className="text-sm opacity-90 mt-2 flex items-center gap-1.5"><Library size={14} />{s.seatNo ? `Seat ${s.seatNo}` : "No seat yet"} · {s.plan}{when ? ` · ${when}` : ""}</p>
                <p className="mt-3 text-sm flex items-center gap-2">{t && !t.clockOut && <span className="lb-live" />}{status}</p>
              </div>
              {att && (t && !t.clockOut
                ? <button disabled={clockBusy} onClick={onOut} className="lb-btn lb-btn-light lb-btn-lg"><LogOut size={18} />Clock out</button>
                : !t && <button disabled={clockBusy || !att.canClockIn} onClick={onIn} className="lb-btn lb-btn-light lb-btn-lg"><LogIn size={18} />Clock in</button>)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Your Seat" value={s.seatNo || "-"} sub={s.plan} icon={Armchair} tone="primary" />
            <Stat label="Monthly Fee" value={inr(s.monthlyFee)} sub={hasLocker ? "incl. locker" : ""} icon={Wallet} tone="success" />
            <Stat label="Next Fee Due" value={fmt(fee?.dueDate)} icon={CalendarDays} tone="info" />
            <Stat label="Days With Us" value={daysSince} icon={Timer} tone="violet" />
          </div>

          {fee && (
            <div className={`lb-alert ${["overdue", "due_today"].includes(fee.status) ? "lb-a-error" : fee.status === "due_soon" ? "lb-a-warn" : "lb-a-ok"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold lb-heading">Next fee due on {fmt(fee.dueDate)}</p>
                <FeeBadge fee={fee} />
              </div>
              {fee.pendingAmount > 0 && <p className="mt-2 text-sm lb-txt">Pending: {inr(fee.pendingAmount)} ({fee.pendingMonths} month{fee.pendingMonths > 1 ? "s" : ""}). Please pay at the library desk. Online payment is coming soon.</p>}
              {fee.status === "due_soon" && <p className="mt-2 text-sm lb-txt">Your monthly fee is due soon.</p>}
            </div>
          )}

          <DirectorCard director={director} />

          <div className="lb-card p-6">
            <h3 className="text-lg font-semibold lb-heading mb-4 flex items-center gap-2"><Wallet size={20} className="lb-accent" />Fee Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="lb-muted">{s.plan} seat fee</span><span className="lb-heading font-medium">{inr(s.planFee ?? s.monthlyFee - (s.lockerFee || 0))}</span></div>
              {hasLocker && <div className="flex justify-between"><span className="lb-muted">Locker above seat</span><span className="lb-heading font-medium">{inr(s.lockerFee)}</span></div>}
              <div className="flex justify-between pt-3" style={{ borderTop: "1px solid var(--color-border)" }}><span className="font-semibold lb-heading">Total per month</span><span className="text-lg font-bold lb-accent">{inr(s.monthlyFee)}</span></div>
            </div>
          </div>

          <div className="lb-card p-6 flex items-start gap-3" style={{ background: "color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-card))" }}>
            <div className="lb-iconsoft"><Info size={16} /></div>
            <div>
              <h4 className="font-semibold lb-heading mb-1">Need Help?</h4>
              <p className="text-sm lb-muted">Report a problem in the Help & Issues tab, we fix it within 24 hours. For anything about your details or password, contact the library desk.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
