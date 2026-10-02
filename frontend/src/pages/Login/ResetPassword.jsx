import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import "./Login.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return alert("Please fill all fields.");
    if (password !== confirmPassword) return alert("Passwords do not match.");
    if (password.length < 8) return alert("Password must be at least 8 characters.");
    
    // Simulate API call
    setIsSuccess(true);
  };

  return (
    <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-light)' }}>
      <Card style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s ease-out' }}>
        <CardContent style={{ padding: '32px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", justifyContent: "center" }}>
            <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "140px", width: "auto" }} />
          </div>
          
          {!isSuccess ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-darker)' }}>Set New Password</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Create a new secure password for your account.</p>
              </div>

              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: "relative" }}>
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="New Password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: "60px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "36px", border: "none", background: "transparent", color: "var(--text-gray)", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div style={{ position: "relative" }}>
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingRight: "60px" }}
                  />
                </div>

                <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '8px' }}>
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: 'var(--text-darker)' }}>Password Reset Successful</h2>
              <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              
              <Button type="button" variant="primary" onClick={() => navigate("/login")} style={{ width: "100%", fontSize: "14px" }}>
                Continue to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
