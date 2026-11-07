import { useState } from "react";
import { CircleDot, Wrench, AlarmClock, CheckCircle2, Phone } from "lucide-react";
import { updateComplaint } from "../../api";
import { Avatar, Modal, Pills, Stat, CATS, catOf, STATUS, slaOf, fmt, fmtTime, useNow } from "../ui";

function ResolveDialog({ c, onClose, onDone }) {
  const [note, setNote] = useState(c.adminNote || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const save = async () => {
    setBusy(true); setErr("");
    try { await updateComplaint(c._id, { status: "resolved", adminNote: note }); await onDone(); } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal title="Mark as resolved" onClose={onClose}>
      <p className="text-sm lb-muted">{catOf(c.category).label} · {c.student?.name}</p>
      <textarea className="lb-input mt-3" rows={3} maxLength={300} placeholder="Note for the student (optional), for example: the bulb was replaced" value={note} onChange={(e) => setNote(e.target.value)} />
      <p role="alert" className="mt-2 min-h-[1.25rem] text-sm lb-err">{err}</p>
      <button disabled={busy} onClick={save} className="lb-btn lb-btn-primary w-full">{busy ? "Saving" : "Resolve issue"}</button>
    </Modal>
  );
}

export default function IssuesTab({ complaints, reload }) {
  const now = useNow(60000);
  const [filter, setFilter] = useState("active");
  const [cat, setCat] = useState("all");
  const [dlg, setDlg] = useState(null);
  const [err, setErr] = useState("");

  const unresolved = complaints.filter((c) => c.status !== "resolved");
  const overdue = unresolved.filter((c) => new Date(c.dueAt) < now);
  const resolved = complaints.filter((c) => c.status === "resolved");
  const inTime = resolved.filter((c) => new Date(c.resolvedAt) <= new Date(c.dueAt)).length;
  const pct = resolved.length ? Math.round((inTime / resolved.length) * 100) : 100;

  const list = (filter === "active" ? unresolved : filter === "overdue" ? overdue : filter === "resolved" ? resolved : complaints)
    .filter((c) => cat === "all" || c.category === cat)
    .sort((a, b) => (filter === "resolved" ? new Date(b.resolvedAt) - new Date(a.resolvedAt) : new Date(a.dueAt) - new Date(b.dueAt)));

  const setStatus = async (c, status) => { try { await updateComplaint(c._id, { status }); setErr(""); await reload(); } catch (e) { setErr(e.message); } };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Open" value={complaints.filter((c) => c.status === "open").length} icon={CircleDot} tone="warning" />
        <Stat label="In progress" value={complaints.filter((c) => c.status === "in_progress").length} icon={Wrench} tone="info" />
        <Stat label="Overdue (over 24 hours)" value={overdue.length} icon={AlarmClock} tone="error" />
        <Stat label="Resolved on time" value={`${pct}%`} sub={`${resolved.length} resolved`} icon={CheckCircle2} tone="success" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Pills value={filter} onChange={setFilter} items={[["active", "To do", unresolved.length], ["overdue", "Overdue", overdue.length], ["resolved", "Resolved", resolved.length], ["all", "All", complaints.length]]} />
        <select className="lb-input" style={{ maxWidth: "13rem" }} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      {err && <p className="lb-err">{err}</p>}

      <div className="space-y-3">
        {list.map((c) => {
          const { icon: Icon, label } = catOf(c.category), sla = slaOf(c, now), [cls, st] = STATUS[c.status];
          return (
            <div key={c._id} className="lb-card p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="lb-iconsoft shrink-0" style={{ width: "2.6rem", height: "2.6rem" }}><Icon size={19} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold lb-heading">{label}</p>
                    <span className="flex flex-wrap gap-2"><span className={`lb-badge ${cls}`}>{st}</span><span className={`lb-badge ${sla.tone}`} style={{ textTransform: "none" }}>{sla.text}</span></span>
                  </div>
                  <p className="text-sm lb-txt mt-1.5 break-words">{c.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm lb-muted">
                    <span className="flex items-center gap-2"><Avatar name={c.student?.name} photo={c.student?.photo} size={24} />{c.student?.name || "Deleted student"}</span>
                    {c.seatNo && <span>Seat {c.seatNo}</span>}
                    {c.student?.phone && <a href={`tel:${c.student.phone}`} className="inline-flex items-center gap-1"><Phone size={13} />{c.student.phone}</a>}
                    <span>Sent {fmt(c.createdAt)}, {fmtTime(c.createdAt)}</span>
                  </div>
                  {c.adminNote && <p className="text-sm mt-3 lb-soft p-2.5"><b className="lb-heading">Note:</b> <span className="lb-txt">{c.adminNote}</span></p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.status === "open" && <button onClick={() => setStatus(c, "in_progress")} className="lb-btn lb-btn-outline lb-btn-sm"><Wrench size={14} />Start work</button>}
                    {c.status !== "resolved" && <button onClick={() => setDlg(c)} className="lb-btn lb-btn-primary lb-btn-sm"><CheckCircle2 size={14} />Resolve</button>}
                    {c.status === "resolved" && <button onClick={() => setStatus(c, "open")} className="lb-btn lb-btn-outline lb-btn-sm">Reopen</button>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="lb-card p-10 text-center lb-muted">{filter === "active" ? "No pending issues. Everything is fixed." : "Nothing here."}</p>}
      </div>

      {dlg && <ResolveDialog c={dlg} onClose={() => setDlg(null)} onDone={async () => { await reload(); setDlg(null); }} />}
    </div>
  );
}
