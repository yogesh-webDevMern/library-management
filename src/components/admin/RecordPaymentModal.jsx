import { useState } from "react";
import { recordPayment } from "../../api";
import { Modal, Toggle, fmt, inr, addMonths, todayStr } from "../ui";

export default function RecordPaymentModal({ student, onClose, onDone }) {
  const fee = student.fee;
  const start = Math.max(1, fee.pendingMonths || 1);
  const maxMonths = student.isActive ? 12 : Math.max(1, fee.pendingMonths);
  const [months, setMonths] = useState(start);
  const [amount, setAmount] = useState(String(start * student.monthlyFee));
  const [mode, setMode] = useState(student.feeMode || "offline");
  const [paidOn, setPaidOn] = useState(todayStr());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const from = new Date(fee.dueDate);
  const to = addMonths(from, months, student.billingDay);
  const pickMonths = (e) => { const m = Number(e.target.value); setMonths(m); setAmount(String(m * student.monthlyFee)); };

  const save = async () => {
    setBusy(true); setErr("");
    try { await recordPayment({ studentId: student._id, months, amount: Number(amount), mode, paidOn, note }); await onDone(); }
    catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <Modal title="Collect fees" onClose={onClose}>
      <div className="lb-soft p-4">
        <p className="font-bold lb-heading">{student.name}</p>
        <p className="lb-muted text-sm">{student.plan} · {inr(student.monthlyFee)} per month{student.seatNo ? ` · Seat ${student.seatNo}` : ""}</p>
        {!student.isActive && <p className="text-sm lb-muted mt-1">Left on {fmt(student.leftOn)}. No fees are charged after this date.</p>}
        {fee.pendingMonths > 0
          ? <p className="mt-1 lb-err text-sm">Pending: {inr(fee.pendingAmount)} ({fee.pendingMonths} month{fee.pendingMonths > 1 ? "s" : ""}, {fee.overdueDays} days overdue{student.isActive ? "" : " when they left"})</p>
          : <p className="mt-1 lb-ok text-sm">Fees are paid. This will be an advance payment.</p>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label><span className="lb-label">Months</span>
          <select className="lb-input" value={months} onChange={pickMonths}>
            {Array.from({ length: maxMonths }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>)}
          </select></label>
        <label><span className="lb-label">Amount (₹)</span><input type="number" min="1" className="lb-input" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
      </div>
      <p className="mt-2 text-xs lb-muted">Covers {fmt(from)} to {fmt(to)}.{student.isActive ? ` Next due date: ${fmt(to)}.` : ""}</p>

      <p className="lb-label mt-4">Received by</p>
      <Toggle value={mode} onChange={setMode} options={["offline", "online"]} />

      <label className="block mt-4"><span className="lb-label">Payment date</span><input type="date" max={todayStr()} className="lb-input" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} /></label>
      <input className="lb-input mt-3" placeholder="Note (optional, e.g. cash, UPI ref)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />

      <p role="alert" className="mt-3 min-h-[1.25rem] text-sm lb-err">{err}</p>
      <button disabled={busy || !paidOn || !(Number(amount) > 0)} onClick={save} className="lb-btn lb-btn-primary w-full">{busy ? "Saving" : `Save ${inr(amount)} payment`}</button>
    </Modal>
  );
}
