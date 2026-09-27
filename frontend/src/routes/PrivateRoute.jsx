import { Navigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { authToken } = useAuth();
  const token = localStorage.getItem("token") || localStorage.getItem("authToken") || authToken;
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
