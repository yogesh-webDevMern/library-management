import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../api";

export default function ProtectedRoute({ role, children }) {
  const user = getUser();
  if (!getToken() || !user || user.role !== role) return <Navigate to="/" replace />;
  return children;
}
