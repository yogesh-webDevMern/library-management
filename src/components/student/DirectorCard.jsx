import { Phone, Mail, Quote } from "lucide-react";
import { thumb } from "../ui";

export default function DirectorCard({ director }) {
  const d = director || {};
  if (!d.name) {
    return (
      <div className="lb-card p-6">
        <h3 className="text-lg font-semibold lb-heading mb-1">Library Director</h3>
        <p className="text-sm lb-muted">The director's details will appear here soon.</p>
      </div>
    );
  }
  return (
    <div className="lb-card overflow-hidden">
      <div className="grid sm:grid-cols-[200px_1fr]">
        <div className="lb-hero flex items-center justify-center p-5">
          {d.photo
            ? <img src={thumb(d.photo, 400)} alt={d.name} className="w-40 h-40 sm:w-full sm:h-auto sm:aspect-square object-cover rounded-2xl" style={{ boxShadow: "0 10px 28px color-mix(in srgb, var(--color-primary) 25%, transparent)" }} />
            : <div className="lb-avatar w-40 h-40 rounded-2xl text-5xl">{d.name[0]}</div>}
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider lb-accent">Library Director</p>
          <h3 className="text-xl font-bold lb-heading mt-1">{d.name}</h3>
          {d.title && <p className="text-sm lb-muted">{d.title}</p>}
          {d.message && <p className="lb-quote text-sm mt-4"><Quote size={14} className="inline mr-1 lb-accent" />{d.message}</p>}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm lb-txt">
            {d.phone && <a href={`tel:${d.phone}`} className="inline-flex items-center gap-2"><Phone size={14} className="lb-accent" />{d.phone}</a>}
            {d.email && <a href={`mailto:${d.email}`} className="inline-flex items-center gap-2"><Mail size={14} className="lb-accent" />{d.email}</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
