import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Login.css";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!role) {
      setErrorMessage("Please select a user role.");
      return;
    }
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const userRole = data.user?.user_metadata?.role || role;
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        throw new Error("No session token returned from Supabase.");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("role", userRole);

      alert(`Login Successful as ${userRole.toUpperCase()}!`);
      navigate(`/${userRole}`);
    } catch (error) {
      const message = error?.message || "Invalid Supabase credentials for the selected role.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "32px", width: "auto" }} />
          <div>
            <h2 className="title">Internship Portal</h2>
            <p className="subtitle">Welcome back! Please login</p>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: "#FEE2E2",
            color: "#EF4444",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "16px",
            textAlign: "center"
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <select 
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
            <option value="intern">Intern</option>
          </select>

          <input 
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "45px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                border: "none",
                background: "transparent",
                color: "#6B7280",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="login-footer">
            <label>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
            <button 
              type="button"
              onClick={() => {
                alert("Password reset instructions have been simulated & sent to your email!");
              }}
              style={{ color: "#2563EB", fontWeight: "600", border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: "13px" }}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}