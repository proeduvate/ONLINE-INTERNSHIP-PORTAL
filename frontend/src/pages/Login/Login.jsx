import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
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
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id);
        navigate(`/${data.role}`);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || "Invalid email or password.");
      }
    } catch (err) {
      setErrorMessage("Server error. Please try again later.");
      console.error(err);
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

      </div>
    </div>
  );
}