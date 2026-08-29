import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../services/apiClient";
import "../Dashboard/Dashboard.css"; 

export default function LandingPage() {
  const [role, setRole] = useState("intern");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Left Side - Brand & Info */}
      <div style={{ 
        flex: 1, 
        backgroundColor: "#2563EB", // Vibrant blue theme
        color: "#ffffff",
        padding: "60px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "60px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "#ffffff", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "#2563EB", fontWeight: "bold", fontSize: "24px" }}>
              P
            </div>
            <span style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px" }}>Proeduvate</span>
          </div>

          <h1 style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1.1, marginBottom: "24px" }}>
            Internship & Evaluation Platform
          </h1>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.9)", lineHeight: 1.5, marginBottom: "40px" }}>
            A modern platform for managing internships. Track progress, assign tasks, and monitor intern performance with AI evaluations and mentor guidance.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "rgba(255,255,255,0.9)" }}>
              <span style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", fontSize: "12px" }}>✓</span>
              Create and assign Tasks easily
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "rgba(255,255,255,0.9)" }}>
              <span style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", fontSize: "12px" }}>✓</span>
              Track intern progress and scores
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", color: "rgba(255,255,255,0.9)" }}>
              <span style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "24px", height: "24px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", fontSize: "12px" }}>✓</span>
              Comprehensive analytics for mentors
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{ 
        flex: 1, 
        backgroundColor: "#ffffff",
        padding: "60px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Welcome back</h2>
          <p style={{ color: "#6b7280", marginBottom: "32px" }}>Sign in to access your dashboard</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {errorMessage && (
              <div style={{ padding: "12px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "14px", fontWeight: 500 }}>
                {errorMessage}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Select Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "15px", boxSizing: "border-box", backgroundColor: "#fff" }}
              >
                <option value="" disabled>Select your role</option>
                <option value="admin">Admin</option>
                <option value="mentor">Mentor</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "15px", boxSizing: "border-box" }} 
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" 
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none", fontSize: "15px", boxSizing: "border-box" }} 
              />
            </div>

            <button type="submit" style={{ width: "100%", padding: "14px", backgroundColor: "#2563EB", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "16px", cursor: "pointer", marginTop: "8px" }}>
              Sign in →
            </button>
          </form>
          
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 12px 0" }}>Don't have an account?</p>
            <button 
              type="button" 
              onClick={() => navigate("/onboarding/apply")}
              style={{ width: "100%", padding: "14px", backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: 600, fontSize: "16px", cursor: "pointer" }}
            >
              Register for an Internship
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
