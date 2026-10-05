import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles = [] }) {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRoles = roles.map(r => r.toLowerCase());

  if (normalizedRoles.length > 0 && role && !normalizedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
