const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("token");
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};
export const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); };

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Used by AuthModal: returns { role, name }
export async function loginApi(role, email, password) {
  const backendRole = role === "admin" ? "librarian" : role;

  const d = await request("/auth/login", {
    method: "POST",
    body: {
      role: backendRole,
      email: email.trim().toLowerCase(),
      password,
    },
  });

  localStorage.setItem("token", d.token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      role: d.role,
      name: d.name,
    })
  );

  return { role: d.role, name: d.name };
}

export const fetchMe = () => request("/auth/me");
export const fetchStudents = () => request("/students");
export const addStudent = (data) => request("/students", { method: "POST", body: data });

// ---- seats and student status ----
export const fetchSeats = () => request("/seats");
export const createSeats = (from, to, hasLocker) => request("/seats", { method: "POST", body: { from, to, hasLocker } });
export const assignSeat = (number, studentId, shift, lockerFee) => request(`/seats/${number}/assign`, { method: "PUT", body: { studentId, shift, lockerFee } });
export const releaseSeat = (number, slot) => request(`/seats/${number}/release`, { method: "PUT", body: { slot } });
export const deleteSeat = (number) => request(`/seats/${number}`, { method: "DELETE" });
export const setStudentStatus = (id, isActive) => request(`/students/${id}/status`, { method: "PUT", body: { isActive } });

// ---- fees ----
export const fetchFeeSummary = () => request("/fees/summary");
export const fetchTransactions = () => request("/fees/transactions");
export const recordPayment = (data) => request("/fees/payments", { method: "POST", body: data });
export const deletePayment = (id) => request(`/fees/payments/${id}`, { method: "DELETE" });

// ---- settings, seat lockers, per-student fees ----
export const fetchSettings = () => request("/settings");
export const saveSettings = (data) => request("/settings", { method: "PUT", body: data });
export const setSeatLocker = (from, to, hasLocker) => request("/seats/locker", { method: "PUT", body: { from, to, hasLocker } });
export const updateFees = (id, data) => request(`/students/${id}/fees`, { method: "PUT", body: data });
export const fetchMyPayments = () => request("/fees/mine");

// ---- attendance, issues, passwords, pictures ----
export const clockIn = () => request("/attendance/clock-in", { method: "POST" });
export const clockOut = () => request("/attendance/clock-out", { method: "POST" });
export const fetchMyAttendance = (month) => request(`/attendance/me${month ? `?month=${month}` : ""}`);
export const fetchAttendance = (date) => request(`/attendance${date ? `?date=${date}` : ""}`);
export const fetchStudentAttendance = (id, month) => request(`/attendance/student/${id}${month ? `?month=${month}` : ""}`);

export const createComplaint = (data) => request("/complaints", { method: "POST", body: data });
export const fetchMyComplaints = () => request("/complaints/mine");
export const fetchComplaints = () => request("/complaints");
export const updateComplaint = (id, data) => request(`/complaints/${id}`, { method: "PUT", body: data });

export const updateStudent = (id, data) => request(`/students/${id}`, { method: "PUT", body: data });
export const resetStudentPassword = (id, newPassword) => request(`/students/${id}/password`, { method: "PUT", body: { newPassword } });
export async function changePassword(currentPassword, newPassword) {
  const d = await request("/auth/password", { method: "PUT", body: { currentPassword, newPassword } });
  if (d.token) localStorage.setItem("token", d.token); // other devices are logged out, this one stays logged in
  return d;
}

export const saveMyPhoto = (url) =>
  request("/auth/photo", {
    method: "PUT",
    body: { url },
  });
export const saveDirectorPhoto = (url) =>
  request("/settings/director-photo", {
    method: "PUT",
    body: { photo: url }
  });

// Picture goes from the browser straight to Cloudinary. Our server only signs the upload (and fixes the file name),
// so a student can only ever replace their own picture. Returns the picture url.
export async function uploadImage(file) {
  const sign = await request("/uploads/sign", { method: "POST" });
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", sign.timestamp);
  fd.append("signature", sign.signature);
  fd.append("public_id", sign.public_id);
  fd.append("overwrite", sign.overwrite);
  fd.append("invalidate", sign.invalidate);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: fd });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error?.message || "Upload failed");
  return d.secure_url;
}
