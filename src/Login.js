import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { API_BASE } from "./api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill all fields");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Invalid Credentials!");
      }

      const data = await response.json();
      
      // Save details to localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);

      // Route based on role returned from server
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "mentor") {
        navigate("/mentor");
      } else if (data.role === "intern") {
        navigate("/intern");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title">Online Internship Portal</h2>
        <p className="subtitle">AI Internship Learning & Evaluation</p>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="demo-credentials">
          <p><b>Demo Accounts:</b></p>
          <div className="credential-row">
            <span>Admin:</span>
            <code>admin@gmail.com / admin123</code>
          </div>
          <div className="credential-row">
            <span>Mentor:</span>
            <code>mentor@gmail.com / mentor123</code>
          </div>
          <div className="credential-row">
            <span>Intern:</span>
            <code>intern@gmail.com / intern123</code>
          </div>
        </div>
      </div>
    </div>
  );
}