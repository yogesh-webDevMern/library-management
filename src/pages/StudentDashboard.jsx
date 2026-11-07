import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Clock, Wallet, LifeBuoy, KeyRound } from "lucide-react";
import { fetchMe, fetchMyPayments, fetchMyAttendance, fetchMyComplaints, clockIn, clockOut, saveMyPhoto, logout } from "../api";
import PanelLayout from "../components/PanelLayout";
import ClockButton from "../components/ClockButton";
import ProfileView from "../components/student/ProfileView";
import AttendanceView from "../components/student/AttendanceView";
import MyFeesView from "../components/student/MyFeesView";
import IssuesView from "../components/student/IssuesView";
import AccountView from "../components/student/AccountView";

export default function StudentDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("profile");
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [att, setAtt] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [err, setErr] = useState("");
  const [clockBusy, setClockBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const exit = useCallback(() => { logout(); nav("/"); }, [nav]);
  const say = (text, bad) => { setToast({ text, bad }); setTimeout(() => setToast(null), 3500); };

  const loadMe = useCallback(() => fetchMe().then(setData), []);
  const loadAtt = useCallback((month) => fetchMyAttendance(month).then(setAtt), []);
  const loadIssues = useCallback(() => fetchMyComplaints().then(setComplaints), []);

  useEffect(() => {
    Promise.all([fetchMe(), fetchMyPayments(), fetchMyAttendance(), fetchMyComplaints()])
      .then(([me, pay, a, c]) => { setData(me); setPayments(pay); setAtt(a); setComplaints(c); })
      .catch((e) => { setErr(e.message); exit(); });
  }, [exit]);

  const clock = async (fn, okText) => {
    setClockBusy(true);
    try { await fn(); await loadAtt(); say(okText); } catch (e) { say(e.message, true); }
    setClockBusy(false);
  };
  const onIn = () => clock(clockIn, "Clocked in. Happy studying!");
  const onOut = () => clock(clockOut, "Clocked out. See you next time!");
  const onPhoto = async (url) => { await saveMyPhoto(url); await loadMe(); say("Picture updated."); };

  const s = data?.user;
  const open = complaints.filter((c) => c.status !== "resolved").length;
  const NAV = [
    { key: "profile", label: "My Profile", icon: User },
    { key: "attendance", label: "Attendance", icon: Clock },
    { key: "fees", label: "My Fees", icon: Wallet },
    { key: "issues", label: "Help & Issues", icon: LifeBuoy, badge: open },
    { key: "password", label: "Change Password", icon: KeyRound },
  ];

  return (
    <PanelLayout nav={NAV} tab={tab} setTab={setTab} user={s} email={s?.email} photo={s?.photo} roleLabel="Student" onLogout={exit}
      navbarExtra={s && <ClockButton att={att} busy={clockBusy} onIn={onIn} onOut={onOut} />}>
      {err && <p className="lb-alert lb-a-error mb-4">{err}</p>}
      {toast && <div className={`fixed top-20 right-4 z-[60] lb-card px-4 py-3 lb-fade ${toast.bad ? "lb-err" : "lb-heading"}`} role="status">{toast.text}</div>}
      {!s && !err && <p className="lb-muted">Loading</p>}
      {s && tab === "profile" && <ProfileView s={s} fee={data.fee} timing={data.timing} director={data.director} att={att} clockBusy={clockBusy} onIn={onIn} onOut={onOut} onPhoto={onPhoto} />}
      {s && tab === "attendance" && <AttendanceView att={att} timing={data.timing} clockBusy={clockBusy} onIn={onIn} onOut={onOut} onMonth={loadAtt} />}
      {s && tab === "fees" && <MyFeesView s={s} fee={data.fee} payments={payments} />}
      {s && tab === "issues" && <IssuesView complaints={complaints} reload={loadIssues} />}
      {s && tab === "password" && <AccountView />}
    </PanelLayout>
  );
}
