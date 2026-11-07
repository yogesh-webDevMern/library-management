// import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { LayoutDashboard, Users, Armchair, Wallet, Receipt, Settings } from "lucide-react";
// import { fetchStudents, fetchSeats, fetchSettings, fetchFeeSummary, fetchTransactions, getUser, logout } from "../api";
// import PanelLayout from "../components/PanelLayout";
// import OverviewTab from "../components/admin/OverviewTab";
// import StudentsTab from "../components/admin/StudentsTab";
// import SeatsTab from "../components/admin/SeatsTab";
// import FeesTab from "../components/admin/FeesTab";
// import TransactionsTab from "../components/admin/TransactionsTab";
// import SettingsTab from "../components/admin/SettingsTab";
// import RecordPaymentModal from "../components/admin/RecordPaymentModal";
// import AddStudentForm from "../components/admin/AddStudentForm";

// const NAV = [
//   { key: "overview", label: "Overview", icon: LayoutDashboard },
//   { key: "students", label: "Students", icon: Users },
//   { key: "seats", label: "Seats", icon: Armchair },
//   { key: "fees", label: "Fees", icon: Wallet },
//   { key: "transactions", label: "Transactions", icon: Receipt },
//   { key: "settings", label: "Settings", icon: Settings },
// ];

// export default function AdminDashboard() {
//   const nav = useNavigate();
//   const user = getUser();
//   const [tab, setTab] = useState("overview");
//   const [students, setStudents] = useState([]);
//   const [seats, setSeats] = useState([]);
//   const [settings, setSettings] = useState(null);
//   const [summary, setSummary] = useState(null);
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [adding, setAdding] = useState(false);
//   const [collecting, setCollecting] = useState(null);

//   const exit = useCallback(() => { logout(); nav("/"); }, [nav]);

//   const reload = useCallback(async () => {
//     try {
//       const [st, se, cfg, sm, pay] = await Promise.all([fetchStudents(), fetchSeats(), fetchSettings(), fetchFeeSummary(), fetchTransactions()]);
//       setStudents(st); setSeats(se); setSettings(cfg); setSummary(sm); setPayments(pay); setErr("");
//     } catch (e) {
//   console.error("Dashboard loading error:", e);
//   setErr(e.message);
// }
// finally {
//   setLoading(false);
// }
//     setLoading(false);
//   }, [exit]);

//   useEffect(() => { reload(); }, [reload]);

//   return (
//     <PanelLayout nav={NAV} tab={tab} setTab={setTab} user={user} roleLabel="Librarian" onLogout={exit}>
//       {err && <p className="lb-alert lb-a-error mb-4">{err}</p>}
//       {loading || !settings ? <p className="lb-muted">Loading</p> : (
//         <>
//           {tab === "overview" && <OverviewTab students={students} seats={seats} settings={settings} summary={summary} payments={payments} setTab={setTab} onCollect={setCollecting} />}
//           {tab === "students" && <StudentsTab students={students} seats={seats} settings={settings} reload={reload} onAdd={() => setAdding(true)} />}
//           {tab === "seats" && <SeatsTab students={students} seats={seats} settings={settings} reload={reload} />}
//           {tab === "fees" && <FeesTab students={students} onCollect={setCollecting} />}
//           {tab === "transactions" && <TransactionsTab payments={payments} reload={reload} />}
//           {tab === "settings" && <SettingsTab settings={settings} reload={reload} />}
//         </>
//       )}
//       {adding && settings && <AddStudentForm seats={seats} settings={settings} onClose={() => setAdding(false)} onCreated={async () => { await reload(); setAdding(false); setTab("students"); }} />}
//       {collecting && <RecordPaymentModal student={collecting} onClose={() => setCollecting(null)} onDone={async () => { await reload(); setCollecting(null); }} />}
//     </PanelLayout>
//   );
// }
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Armchair, Clock, Wallet, Receipt, LifeBuoy, Settings } from "lucide-react";
import { fetchStudents, fetchSeats, fetchSettings, fetchFeeSummary, fetchTransactions, fetchAttendance, fetchComplaints, getUser, logout } from "../api";
import PanelLayout from "../components/PanelLayout";
import OverviewTab from "../components/admin/OverviewTab";
import StudentsTab from "../components/admin/StudentsTab";
import SeatsTab from "../components/admin/SeatsTab";
import AttendanceTab from "../components/admin/AttendanceTab";
import FeesTab from "../components/admin/FeesTab";
import TransactionsTab from "../components/admin/TransactionsTab";
import IssuesTab from "../components/admin/IssuesTab";
import SettingsTab from "../components/admin/SettingsTab";
import RecordPaymentModal from "../components/admin/RecordPaymentModal";
import AddStudentForm from "../components/admin/AddStudentForm";

export default function AdminDashboard() {
  const nav = useNavigate();
  const user = getUser();
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState([]);
  const [settings, setSettings] = useState(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [collecting, setCollecting] = useState(null);

  const exit = useCallback(() => { logout(); nav("/"); }, [nav]);

  const reload = useCallback(async () => {
    try {
      const [st, se, cfg, sm, pay, att, cmp] = await Promise.all([fetchStudents(), fetchSeats(), fetchSettings(), fetchFeeSummary(), fetchTransactions(), fetchAttendance(), fetchComplaints()]);
      setStudents(st); setSeats(se); setSettings(cfg); setSummary(sm); setPayments(pay); setAttendance(att); setComplaints(cmp); setErr("");
    } catch (e) {
      setErr(e.message);
      if (/log in|expired|not found/i.test(e.message)) exit();
    }
    setLoading(false);
  }, [exit]);

  useEffect(() => { reload(); }, [reload]);

  const NAV = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "students", label: "Students", icon: Users },
    { key: "seats", label: "Seats", icon: Armchair },
    { key: "attendance", label: "Attendance", icon: Clock },
    { key: "fees", label: "Fees", icon: Wallet },
    { key: "transactions", label: "Transactions", icon: Receipt },
    { key: "issues", label: "Issues", icon: LifeBuoy, badge: complaints.filter((c) => c.status !== "resolved").length },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <PanelLayout nav={NAV} tab={tab} setTab={setTab} user={user} roleLabel="Librarian" onLogout={exit}>
      {err && <p className="lb-alert lb-a-error mb-4">{err}</p>}
      {loading || !settings ? <p className="lb-muted">Loading</p> : (
        <>
          {tab === "overview" && <OverviewTab students={students} seats={seats} settings={settings} summary={summary} payments={payments} attendance={attendance} complaints={complaints} setTab={setTab} onCollect={setCollecting} />}
          {tab === "students" && <StudentsTab students={students} seats={seats} settings={settings} reload={reload} onAdd={() => setAdding(true)} />}
          {tab === "seats" && <SeatsTab students={students} seats={seats} settings={settings} reload={reload} />}
          {tab === "attendance" && <AttendanceTab students={students} />}
          {tab === "fees" && <FeesTab students={students} onCollect={setCollecting} />}
          {tab === "transactions" && <TransactionsTab payments={payments} reload={reload} />}
          {tab === "issues" && <IssuesTab complaints={complaints} reload={reload} />}
          {tab === "settings" && <SettingsTab settings={settings} reload={reload} />}
        </>
      )}
      {adding && settings && <AddStudentForm seats={seats} settings={settings} onClose={() => setAdding(false)} onCreated={async () => { await reload(); setAdding(false); setTab("students"); }} />}
      {collecting && <RecordPaymentModal student={collecting} onClose={() => setCollecting(null)} onDone={async () => { await reload(); setCollecting(null); }} />}
    </PanelLayout>
  );
}
