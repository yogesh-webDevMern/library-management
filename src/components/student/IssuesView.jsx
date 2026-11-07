import { useState } from "react";
import { Timer, Send } from "lucide-react";
import { createComplaint } from "../../api";
import { CATS, catOf, STATUS, slaOf, fmt, fmtTime, useNow } from "../ui";

export default function IssuesView({ complaints, reload }) {
  const now = useNow(60000);
  const [cat, setCat] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setMsg("");
    if (!cat) return setErr("Choose what the problem is about.");
    setBusy(true);
    try { await createComplaint({ category: cat, description: text }); setText(""); setCat(""); setMsg("Your issue was sent to the library. We will fix it within 24 hours."); await reload(); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="lb-alert lb-a-ok flex items-start gap-3">
        <Timer size={20} className="lb-ok shrink-0 mt-0.5" />
        <div><p className="font-semibold lb-heading">We resolve every issue within 24 hours</p><p className="text-sm lb-muted">Room freshener, chair repair, lights, drinking water, washroom and more. Tell us and the librarian will take care of it.</p></div>
      </div>

      <form onSubmit={submit} className="lb-card p-5 sm:p-6">
        <h3 className="font-bold lb-heading mb-3">Report a problem</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATS.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} onClick={() => setCat(id)} className={`lb-chip ${cat === id ? "lb-chip-on" : ""}`}><Icon size={22} />{label}</button>
          ))}
        </div>
        <textarea className="lb-input mt-4" rows={3} maxLength={500} placeholder="Describe the problem (for example: the light above seat 14 is not working)" value={text} onChange={(e) => setText(e.target.value)} required />
        <div className="flex items-center justify-between mt-1 text-xs lb-muted"><span>{text.length}/500</span></div>
        <p role="alert" className="mt-2 min-h-[1.25rem] text-sm lb-err">{err}</p>
        {msg && <p className="text-sm lb-ok mb-2">{msg}</p>}
        <button disabled={busy} className="lb-btn lb-btn-primary"><Send size={16} />{busy ? "Sending" : "Submit issue"}</button>
      </form>

      <div>
        <h3 className="font-bold lb-heading mb-3">My issues</h3>
        <div className="space-y-3">
          {complaints.map((c) => {
            const { icon: Icon, label } = catOf(c.category), sla = slaOf(c, now), [cls, st] = STATUS[c.status];
            return (
              <div key={c._id} className="lb-card p-4 flex gap-3">
                <div className="lb-iconsoft shrink-0" style={{ width: "2.4rem", height: "2.4rem" }}><Icon size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <p className="font-semibold lb-heading">{label}</p>
                    <span className="flex gap-2"><span className={`lb-badge ${cls}`}>{st}</span><span className={`lb-badge ${sla.tone}`} style={{ textTransform: "none" }}>{sla.text}</span></span>
                  </div>
                  <p className="text-sm lb-txt mt-1 break-words">{c.description}</p>
                  <p className="text-xs lb-muted mt-1.5">Sent {fmt(c.createdAt)}, {fmtTime(c.createdAt)}</p>
                  {c.adminNote && <p className="text-sm mt-2 lb-soft p-2.5"><b className="lb-heading">Librarian:</b> <span className="lb-txt">{c.adminNote}</span></p>}
                </div>
              </div>
            );
          })}
          {complaints.length === 0 && <p className="lb-card p-8 text-center lb-muted">You have not reported any issue.</p>}
        </div>
      </div>
    </div>
  );
}
