import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function ProtectedRoute({ children, roles = [] }) {
  const [sessionReady, setSessionReady] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      const nextToken = session?.access_token || localStorage.getItem("token");
      const nextRole = session?.user?.user_metadata?.role || localStorage.getItem("role");

      setToken(nextToken);
      setRole(nextRole);
      setSessionReady(true);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextToken = session?.access_token || localStorage.getItem("token");
      const nextRole = session?.user?.user_metadata?.role || localStorage.getItem("role");

      setToken(nextToken);
      setRole(nextRole);
      setSessionReady(true);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (!sessionReady) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
