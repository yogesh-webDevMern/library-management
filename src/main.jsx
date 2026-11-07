import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./theme.css";
import { ThemeProvider } from "./context/ThemeContext";
import YashLibrary from "./pages/YashLibrary"; // your existing landing page
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<YashLibrary />} />
        <Route path="/admin" element={<ProtectedRoute role="librarian"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);
