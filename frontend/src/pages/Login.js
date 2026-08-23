import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import "../styles/login.css";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Dummy Users
  const users = {
    admin: { email: "admin@gmail.com", password: "admin123" },
    mentor: { email: "mentor@gmail.com", password: "mentor123" },
    intern: { email: "intern@gmail.com", password: "intern123" },
  };

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

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        
        // Ensure they logged in with the role they selected (optional but good practice)
        if (data.role !== role) {
          setErrorMessage(`You are registered as a ${data.role}, not ${role}.`);
          return;
        }

        navigate(`/${data.role}`);
      } else {
        const errData = await response.json();
        setErrorMessage(errData.detail || "Invalid credentials for the selected role.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Failed to connect to the server.");
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

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="demo-credentials">
          <p><b>Demo Credentials:</b></p>
          <p>Admin: <code>admin@gmail.com</code> / <code>admin123</code></p>
          <p>Mentor: <code>mentor@gmail.com</code> / <code>mentor123</code></p>
          <p>Intern: <code>intern@gmail.com</code> / <code>intern123</code></p>
        </div>
      </div>
    </div>
  );
}