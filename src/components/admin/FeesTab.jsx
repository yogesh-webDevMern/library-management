import { useState } from "react";
import { Wallet, UserX, AlertCircle, Clock } from "lucide-react";
import { FeeBadge, Pills, Stat, fmt, inr } from "../ui";

export default function FeesTab({ students, onCollect }) {
  const [filter, setFilter] = useState("pending");
  const [q, setQ] = useState("");

  const live = students.filter((s) => s.isActive);
  const left = students.filter((s) => !s.isActive && s.fee.status === "left_due"); // left, but still owe money
  const isPending = (s) => ["overdue", "due_today"].includes(s.fee.status);
  const isPaid = (s) => ["paid", "due_soon"].includes(s.fee.status);

  const counts = {
    pending: live.filter(isPending).length, left: left.length,
    soon: live.filter((s) => s.fee.status === "due_soon").length, paid: live.filter(isPaid).length, all: live.length + left.length,
  };
  const leftAmount = left.reduce((t, s) => t + s.fee.pendingAmount, 0);
  const pendingAmount = leftAmount + live.reduce((t, s) => t + s.fee.pendingAmount, 0);

  const pool = filter === "pending" ? live.filter(isPending) : filter === "left" ? left
    : filter === "soon" ? live.filter((s) => s.fee.status === "due_soon") : filter === "paid" ? live.filter(isPaid) : [...live, ...left];

  const rows = pool
    .filter((s) => { const t = q.trim().toLowerCase(); return !t || s.name.toLowerCase().includes(t) || s.phone.includes(t) || String(s.seatNo || "") === t; })
    .sort((a, b) => b.fee.overdueDays - a.fee.overdueDays || new Date(a.fee.dueDate) - new Date(b.fee.dueDate));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total fees pending" value={inr(pendingAmount)} sub="active + left" icon={Wallet} tone="error" />
        <Stat label="Active with dues" value={counts.pending} icon={AlertCircle} tone="orange" />
        <Stat label="Left, dues pending" value={counts.left} sub={inr(leftAmount)} icon={UserX} tone="info" />
        <Stat label="Due in next 3 days" value={counts.soon} icon={Clock} tone="warning" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills value={filter} onChange={setFilter} items={[["pending", "Pending", counts.pending], ["left", "Left, dues", counts.left], ["soon", "Due soon", counts.soon], ["paid", "Paid", counts.paid], ["all", "All", counts.all]]} />
        <input className="lb-input" style={{ maxWidth: "18rem" }} placeholder="Search name, phone, seat" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      </div>

      <div className="lb-scroll">
        <table className="lb-tbl" style={{ minWidth: "860px" }}>
          <thead><tr>{["Student", "Seat", "Plan", "Due date", "Status", "Pending amount", "Action"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s._id}>
                <td className="lb-heading">{s.name}<span className="block text-sm lb-muted">{s.isActive ? s.phone : `Left ${fmt(s.leftOn)} · ${s.phone}`}</span></td>
                <td>{s.isActive ? (s.seatNo ?? "-") : (s.lastSeatNo ? `was ${s.lastSeatNo}` : "-")}</td>
                <td>{s.plan}<span className="block text-sm lb-muted">{inr(s.monthlyFee)} / month</span></td>
                <td>{fmt(s.fee.dueDate)}</td>
                <td><FeeBadge fee={s.fee} /></td>
                <td>{s.fee.pendingAmount ? <>{inr(s.fee.pendingAmount)}<span className="block text-sm lb-muted">{s.fee.pendingMonths} month{s.fee.pendingMonths > 1 ? "s" : ""}</span></> : "-"}</td>
                <td><button onClick={() => onCollect(s)} className="lb-btn lb-btn-primary lb-btn-sm">Collect fees</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="7" className="text-center lb-muted" style={{ padding: "2.5rem" }}>{filter === "pending" ? "No pending fees. Everyone is up to date." : "No students found."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
