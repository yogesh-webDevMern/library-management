import {
  X,
  Lightbulb,
  Armchair,
  Droplets,
  Bath,
  Wind,
  Wrench,
  CircleHelp,
} from "lucide-react";
import { useState, useEffect } from "react";

// ---------- formatting ----------
// Dates from the server are calendar days stored at UTC midnight, so show them in UTC
export const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "-");
export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
// today's date in India as yyyy-mm-dd (for date inputs)
export const todayStr = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

// same rule as the server: keeps the billing day, clamps to the end of short months
export function addMonths(date, n, anchor) {
  const d = new Date(date);
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + n;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(anchor || d.getUTCDate(), last)));
}

// ---------- timings and seats ----------
export const t12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export const SLOT = { first: "First half", second: "Second half" };
export const slotTime = (st, shift) => {
  const s = shift === "first" ? st?.firstHalf : st?.secondHalf;
  return s ? `${t12(s.start)} – ${t12(s.end)}` : "";
};
export const fullTime = (st) => (st ? `${t12(st.firstHalf.start)} – ${t12(st.secondHalf.end)}` : "");

// A seat is held by one full day student (seat.student) or by up to two half day students (seat.first, seat.second)
export const seatState = (s) => (s.student || (s.first && s.second) ? "full" : s.first || s.second ? "half" : "free");
export const slotsUsed = (s) => (s.student ? 2 : (s.first ? 1 : 0) + (s.second ? 1 : 0));
export function seatFits(s, plan, shift) {
  if (plan === "Full day") return !s.student && !s.first && !s.second;
  if (shift === "first") return !s.student && !s.first;
  if (shift === "second") return !s.student && !s.second;
  return false;
}

// ---------- small components ----------
export function Stat({ label, value, sub, icon: Icon, tone = "primary" }) {
  return (
    <div className="lb-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`lb-ibox lb-t-${tone}`}>{Icon && <Icon size={18} />}</div>
        {sub && <span className="text-xs lb-muted text-right">{sub}</span>}
      </div>
      <p className="text-2xl font-bold lb-heading break-words">{value}</p>
      <p className="text-sm lb-muted mt-1">{label}</p>
    </div>
  );
}
// ---------- attendance helpers ----------
// ---------- image thumbnail helper ----------
export function thumb(url, width = 400) {
  if (!url) return "";

  // Cloudinary image URL
  if (url.includes("res.cloudinary.com")) {
    return url.replace("/upload/", `/upload/w_${width},c_limit/`);
  }

  // Other image URLs: use original image
  return url;
}
export function Avatar({ name, photo, size = 34 }) {
  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center lb-soft font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name || "Student"}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

export const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

export const fmtDur = (minutes = 0) => {
  const total = Math.max(0, Number(minutes) || 0);
  const h = Math.floor(total / 60);
  const m = total % 60;

  return h ? `${h}h ${m}m` : `${m}m`;
};

export const minutesOf = (r) => {
  const start = new Date(r.clockIn).getTime();
  const end = r.clockOut
    ? new Date(r.clockOut).getTime()
    : Date.now();

  return Math.max(0, Math.floor((end - start) / 60000));
};

export function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-3 lb-rowb">
      <div className="lb-iconsoft"><Icon size={16} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs lb-muted">{label}</p>
        <p className="text-sm font-medium lb-heading mt-0.5 break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

export function Badge({ active }) {
  return <span className={`lb-badge ${active ? "lb-b-success" : "lb-b-danger"}`}><i className="lb-dot" />{active ? "Active" : "Inactive"}</span>;
}

export function FeeBadge({ fee }) {
  if (!fee || fee.status === "inactive") return <span className="lb-muted">-</span>;
  const map = {
    paid: ["lb-b-success", `Paid · ${fee.daysLeft} days left`],
    due_soon: ["lb-b-warn", `Due in ${fee.daysLeft} day${fee.daysLeft === 1 ? "" : "s"}`],
    due_today: ["lb-b-orange", "Due today"],
    overdue: ["lb-b-danger", `${fee.overdueDays} day${fee.overdueDays === 1 ? "" : "s"} overdue`],
    left_due: ["lb-b-neutral", "Left · dues pending"],
  };
  const [cls, text] = map[fee.status];
  return <span className={`lb-badge ${cls}`} style={{ textTransform: "none" }}>{text}</span>;
}

export const ModeBadge = ({ mode }) => <span className={`lb-badge ${mode === "online" ? "lb-b-info" : "lb-b-violet"}`}>{mode}</span>;

// items: [[key, label, count], ...]
export function Pills({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([k, label, n]) => (
        <button key={k} onClick={() => onChange(k)} className={`lb-pill ${value === k ? "lb-pill-on" : ""}`}>{label}{n !== undefined ? ` (${n})` : ""}</button>
      ))}
    </div>
  );
}

// options: ["offline", "online"]
export function Toggle({ value, onChange, options }) {
  return (
    <div className="lb-seg" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => <button key={o} type="button" className={value === o ? "on" : ""} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  );
}

export function Modal({ title, onClose, children, size = "md" }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <div className="lb-back fixed inset-0" onClick={onClose} />
      <div className="relative min-h-full flex items-center justify-center p-4 pointer-events-none">
        <div className={`pointer-events-auto w-full ${size === "lg" ? "max-w-2xl" : "max-w-md"} lb-card p-5 sm:p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold lb-heading">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="lb-iconbtn"><X size={18} /></button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}


// ---------- complaint helpers ----------

export const CATS = [
  { id: "cleanliness", label: "Cleanliness", icon: Wind },
  { id: "chair", label: "Chair / Furniture", icon: Armchair },
  { id: "lighting", label: "Lights / Fan", icon: Lightbulb },
  { id: "water", label: "Drinking Water", icon: Droplets },
  { id: "washroom", label: "Washroom", icon: Bath },
  { id: "other", label: "Other", icon: CircleHelp },
];

export function catOf(category) {
  return CATS.find((c) => c.id === category) || CATS[CATS.length - 1];
}

export const STATUS = {
  open: ["lb-b-warn", "Open"],
  in_progress: ["lb-b-info", "In progress"],
  resolved: ["lb-b-success", "Resolved"],
};

export function slaOf(c, now = new Date()) {
  if (c.status === "resolved") {
    return { tone: "lb-b-success", text: "Resolved" };
  }

  const due = new Date(c.dueAt);
  const remaining = due - now;

  if (remaining < 0) {
    return { tone: "lb-b-danger", text: "Overdue" };
  }

  const hours = Math.ceil(remaining / 3600000);

  return {
    tone: "lb-b-warn",
    text: `${hours}h remaining`,
  };
}

export function useNow(interval = 60000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
  }, [interval]);

  return now;
}