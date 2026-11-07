import { useState } from "react";
import { IndianRupee, Banknote, Smartphone, ListFilter } from "lucide-react";
import { deletePayment } from "../../api";
import { ModeBadge, Pills, Stat, fmt, inr } from "../ui";

export default function TransactionsTab({ payments, reload }) {
  const [mode, setMode] = useState("all");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const shown = payments.filter((p) => {
    if (mode !== "all" && p.mode !== mode) return false;
    const t = q.trim().toLowerCase();
    return !t || p.student?.name.toLowerCase().includes(t) || p.student?.phone.includes(t) || (p.note || "").toLowerCase().includes(t);
  });
  const sum = (list) => list.reduce((t, p) => t + p.amount, 0);
  const off = payments.filter((p) => p.mode === "offline"), on = payments.filter((p) => p.mode === "online");

  const remove = async (p) => {
    if (!window.confirm(`Delete this ${inr(p.amount)} payment of ${p.student?.name || "student"}? Their due date will go back to ${fmt(p.periodFrom)}.`)) return;
    try { await deletePayment(p._id); setErr(""); await reload(); } catch (e) { setErr(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total collected" value={inr(sum(payments))} sub={`${payments.length} payments`} icon={IndianRupee} tone="primary" />
        <Stat label="Offline" value={inr(sum(off))} sub={`${off.length} payments`} icon={Banknote} tone="violet" />
        <Stat label="Online" value={inr(sum(on))} sub={`${on.length} payments`} icon={Smartphone} tone="info" />
        <Stat label="Shown in list" value={inr(sum(shown))} sub={`${shown.length} payments`} icon={ListFilter} tone="success" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills value={mode} onChange={setMode} items={[["all", "All"], ["offline", "Offline"], ["online", "Online"]]} />
        <input className="lb-input" style={{ maxWidth: "18rem" }} placeholder="Search student or note" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      </div>
      {err && <p className="lb-err">{err}</p>}

      <div className="lb-scroll">
        <table className="lb-tbl" style={{ minWidth: "860px" }}>
          <thead><tr>{["Date", "Student", "Fee period", "Mode", "Amount", "Note", ""].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p._id}>
                <td style={{ whiteSpace: "nowrap" }}>{fmt(p.paidOn)}</td>
                <td className="lb-heading">{p.student?.name || "Deleted student"}<span className="block text-sm lb-muted">{p.student?.seatNo ? `Seat ${p.student.seatNo}` : p.student?.phone}</span></td>
                <td style={{ whiteSpace: "nowrap" }}>{fmt(p.periodFrom)} to {fmt(p.periodTo)}<span className="block text-sm lb-muted">{p.months} month{p.months > 1 ? "s" : ""}</span></td>
                <td><ModeBadge mode={p.mode} /></td>
                <td className="font-semibold lb-heading">{inr(p.amount)}</td>
                <td className="lb-muted" style={{ maxWidth: "180px" }}>{p.note || "-"}</td>
                <td><button onClick={() => remove(p)} className="text-sm lb-err hover:underline">Delete</button></td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="7" className="text-center lb-muted" style={{ padding: "2.5rem" }}>No transactions yet.</td></tr>}
          </tbody>
          {shown.length > 0 && <tfoot><tr><td colSpan="4">Total of {shown.length} payments</td><td colSpan="3">{inr(sum(shown))}</td></tr></tfoot>}
        </table>
      </div>
    </div>
  );
}
