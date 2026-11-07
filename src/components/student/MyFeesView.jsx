import { Wallet, CalendarDays, CheckCircle2 } from "lucide-react";
import { Stat, FeeBadge, ModeBadge, fmt, inr } from "../ui";

export default function MyFeesView({ s, fee, payments }) {
  const hasLocker = s.lockerFee !== undefined && s.lockerFee !== null;
  const paid = payments.reduce((t, p) => t + p.amount, 0);
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Monthly fee" value={inr(s.monthlyFee)} sub={hasLocker ? "incl. locker" : ""} icon={Wallet} tone="primary" />
        <Stat label="Next fee due" value={fmt(fee?.dueDate)} icon={CalendarDays} tone="info" />
        <Stat label="Total paid" value={inr(paid)} sub={`${payments.length} payments`} icon={CheckCircle2} tone="success" />
      </div>

      {fee && (
        <div className={`lb-alert ${["overdue", "due_today"].includes(fee.status) ? "lb-a-error" : fee.status === "due_soon" ? "lb-a-warn" : "lb-a-ok"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold lb-heading">Fee status</p><FeeBadge fee={fee} />
          </div>
          <p className="mt-2 text-sm lb-txt">
            {fee.pendingAmount > 0 ? `Pending: ${inr(fee.pendingAmount)} (${fee.pendingMonths} month${fee.pendingMonths > 1 ? "s" : ""}). Please pay at the library desk. Online payment is coming soon.` : "Your fees are up to date."}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold lb-heading mb-3">Payment history</h3>
        <div className="lb-scroll">
          <table className="lb-tbl" style={{ minWidth: "560px" }}>
            <thead><tr>{["Date", "Fee period", "Mode", "Amount"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmt(p.paidOn)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{fmt(p.periodFrom)} to {fmt(p.periodTo)}<span className="block text-sm lb-muted">{p.months} month{p.months > 1 ? "s" : ""}</span></td>
                  <td><ModeBadge mode={p.mode} /></td>
                  <td className="font-semibold lb-heading">{inr(p.amount)}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan="4" className="text-center lb-muted" style={{ padding: "2.5rem" }}>No payments recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
