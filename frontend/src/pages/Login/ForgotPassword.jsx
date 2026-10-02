import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSendLink = (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email address.");
    setIsSent(true);
  };

  return (
    <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-light)' }}>
      <Card style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s ease-out' }}>
        <CardContent style={{ padding: '32px' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", justifyContent: "center" }}>
            <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "140px", width: "auto" }} />
          </div>
          
          {!isSent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-darker)' }}>Forgot Password</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Enter your email to receive a password reset link.</p>
              </div>

              <form onSubmit={handleSendLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                
                <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '8px' }}>
                  Send Reset Link
                </Button>
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <button type="button" onClick={() => navigate("/login")} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: 'var(--text-darker)' }}>Check your email</h2>
              <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              
              <div style={{ padding: "16px", background: "#f1f5f9", borderRadius: "8px", border: "1px dashed #cbd5e1", marginBottom: "20px" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>Simulate Email Inbox:</p>
                <Button type="button" variant="primary" onClick={() => navigate("/reset-password")} style={{ width: "100%", fontSize: "14px" }}>
                  Click Reset Password Link
                </Button>
              </div>

              <button type="button" onClick={() => navigate("/login")} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
                Back to Login
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
