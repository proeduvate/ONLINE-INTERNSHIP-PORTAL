import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles = [], user }) {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  const storedRole = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = user?.role ? String(user.role).toLowerCase() : storedRole;

  if (roles.length > 0 && effectiveRole && !roles.map(r => r.toLowerCase()).includes(effectiveRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
