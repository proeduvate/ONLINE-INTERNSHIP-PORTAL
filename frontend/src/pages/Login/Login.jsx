import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import "./Login.css";export default function Login() {
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

  const handleLogin = (e) => {
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

    let foundRole = null;
    for (const [key, u] of Object.entries(users)) {
      if (u.email === email && u.password === password) {
        foundRole = key;
        break;
      }
    }

    if (foundRole) {
      localStorage.setItem("token", "dummy-token-123");
      localStorage.setItem("role", foundRole);
      navigate(`/${foundRole}`);
    } else {
      setErrorMessage("Invalid email or password.");
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-light)' }}>
      <Card style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s ease-out' }}>
        <CardContent style={{ padding: '32px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", justifyContent: "center" }}>
            <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "40px", width: "auto" }} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-darker)' }}>Welcome Back</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Sign in to continue to Proeduvate</p>
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: "#FEE2E2",
              color: "#EF4444",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input 
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div style={{ position: "relative" }}>
              <Input 
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "60px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "36px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-gray)",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-color)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Remember me
              </label>
              <button 
                type="button"
                onClick={() => {
                  alert("Password reset instructions have been simulated & sent to your email!");
                }}
                style={{ color: "var(--primary-color)", fontWeight: "600", border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: "14px" }}
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}