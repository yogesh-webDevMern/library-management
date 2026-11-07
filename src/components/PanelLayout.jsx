import { useState } from "react";
import { Library, LogOut } from "lucide-react";
import BaseNavbar from "./BaseNavbar";
import { Avatar } from "./ui";

// Shared shell for the admin panel and the student panel: sidebar + navbar + content + footer.
// nav = [{ key, label, icon, badge? }]    navbarExtra = optional element shown in the top bar
export default function PanelLayout({ nav, tab, setTab, user, email, photo, roleLabel, onLogout, navbarExtra, children }) {
  const [open, setOpen] = useState(false);
  const go = (k) => { setTab(k); setOpen(false); };
  const title = nav.find((n) => n.key === tab)?.label;

  const side = (
    <div className="flex h-full flex-col">
      <div className="h-[60px] px-5 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="lb-ibox lb-t-primary" style={{ width: "2rem", height: "2rem" }}><Library size={17} /></div>
        <p className="font-bold lb-heading">Amaraya Library</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => go(key)} aria-current={tab === key ? "page" : undefined} className={`lb-nav ${tab === key ? "lb-nav-on" : ""}`}>
            <Icon size={18} /><span className="flex-1">{label}</span>
            {badge > 0 && <span className="lb-badge lb-b-danger" style={{ padding: ".05rem .5rem" }}>{badge}</span>}
          </button>
        ))}
      </nav>
      <div className="p-3 space-y-2" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="lb-soft p-2.5 flex items-center gap-3">
          <Avatar name={user?.name || "U"} photo={photo} size={36} />
          <div className="min-w-0"><p className="text-sm font-semibold lb-heading truncate">{user?.name}</p><p className="text-xs lb-muted">{roleLabel}</p></div>
        </div>
        <button onClick={onLogout} className="lb-nav"><LogOut size={18} />Log out</button>
      </div>
    </div>
  );

  return (
    <div className="lb-page flex">
      <aside className="lb-side hidden lg:block w-64 shrink-0 sticky top-0 h-screen">{side}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="lb-back absolute inset-0" onClick={() => setOpen(false)} />
          <aside className="lb-side absolute left-0 top-0 h-full w-64">{side}</aside>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <BaseNavbar onMenuClick={() => setOpen(true)} title={title} name={user?.name} email={email} photo={photo} roleLabel={roleLabel} onLogout={onLogout} extra={navbarExtra} />
        <main key={tab} className="flex-1 p-4 sm:p-6 lg:p-8 lb-fade">{children}</main>
        <footer className="px-4 sm:px-8 py-4 text-sm lb-muted flex flex-wrap justify-between gap-2" style={{ borderTop: "1px solid var(--color-border)" }}>
          <span>© {new Date().getFullYear()} Amaraya Library. All rights reserved.</span>
          <span>{roleLabel} panel</span>
        </footer>
      </div>
    </div>
  );
}
