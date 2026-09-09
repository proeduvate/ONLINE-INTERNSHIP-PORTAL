import React, { useState } from "react";
import { User, Shield, Bell, Camera, Key, Lock, Save, Trash2, Mail, MapPin, Briefcase, Code2, Building2 } from "lucide-react";

export default function InternProfile() {
  const [activeSettingsTab, setActiveSettingsTab] = useState("personal");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Simulate sending reset email
    setResetEmailSent(true);
    setTimeout(() => setResetEmailSent(false), 5000);
  };

  return (
    <div style={{ display: "flex", gap: "24px", height: "100%", overflowY: "hidden", paddingBottom: "10px", paddingRight: "10px" }}>
      
      {/* Left Sidebar Navigation */}
      <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px", paddingLeft: "12px" }}>Settings</h2>
        
        <button 
          onClick={() => setActiveSettingsTab("personal")}
          style={{ 
            display: "flex", alignItems: "center", gap: "12px", padding: "12px", 
            borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
            background: activeSettingsTab === "personal" ? "#eff6ff" : "transparent",
            color: activeSettingsTab === "personal" ? "#2563eb" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <User size={18} /> Personal Info
        </button>

        <button 
          onClick={() => setActiveSettingsTab("security")}
          style={{ 
            display: "flex", alignItems: "center", gap: "12px", padding: "12px", 
            borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
            background: activeSettingsTab === "security" ? "#eff6ff" : "transparent",
            color: activeSettingsTab === "security" ? "#2563eb" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Shield size={18} /> Account Security
        </button>

        <button 
          onClick={() => setActiveSettingsTab("notifications")}
          style={{ 
            display: "flex", alignItems: "center", gap: "12px", padding: "12px", 
            borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
            background: activeSettingsTab === "notifications" ? "#eff6ff" : "transparent",
            color: activeSettingsTab === "notifications" ? "#2563eb" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Bell size={18} /> Notifications
        </button>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, maxWidth: "800px" }}>
        
        {/* PERSONAL INFO TAB */}
        {activeSettingsTab === "personal" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.3s ease-out" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Personal Information</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Manage your personal details and how they appear on your profile.</p>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              {/* Avatar Section */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }}>
                <div style={{ position: "relative" }}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dhanush&backgroundColor=f8fafc" alt="Profile" style={{ width: "80px", height: "80px", borderRadius: "50%", border: "1px solid #e2e8f0", objectFit: "cover" }} />
                  <button style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "28px", height: "28px", borderRadius: "50%", background: "#ffffff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                    <button style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, color: "#0f172a", cursor: "pointer" }}>Change Photo</button>
                    <button style={{ background: "transparent", border: "none", padding: "8px", fontSize: "0.85rem", fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>Remove</button>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>JPG, GIF or PNG. Max size of 5MB.</p>
                </div>
              </div>

              {/* Form Grid */}
              <form onSubmit={(e) => { e.preventDefault(); alert("Profile saved"); }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>First Name</label>
                    <input type="text" defaultValue="Dhanush" disabled style={{ width: "100%", padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#64748b", background: "#f1f5f9", cursor: "not-allowed" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Last Name</label>
                    <input type="text" defaultValue="Kumar" disabled style={{ width: "100%", padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#64748b", background: "#f1f5f9", cursor: "not-allowed" }} />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
                    <input type="email" defaultValue="dhanush@example.com" disabled style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#64748b", background: "#f1f5f9", cursor: "not-allowed" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>GitHub ID</label>
                    <div style={{ position: "relative" }}>
                      <Code2 size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input type="text" defaultValue="dhanush-dev" style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#0f172a" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Institution</label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input type="text" defaultValue="Tech University" style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#0f172a" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Role / Title</label>
                    <div style={{ position: "relative" }}>
                      <Briefcase size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input type="text" defaultValue="Software Engineering Intern" style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#0f172a" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Location</label>
                    <div style={{ position: "relative" }}>
                      <MapPin size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input type="text" defaultValue="San Francisco, CA" style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#0f172a" }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Bio</label>
                  <textarea rows="2" defaultValue="Passionate software engineering intern excited to learn full-stack development and build scalable applications." style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.9rem", color: "#0f172a", fontFamily: "inherit", resize: "none" }}></textarea>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
                  <button type="button" style={{ background: "transparent", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ background: "#2563eb", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeSettingsTab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.3s ease-out" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Account Security</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>Manage your password and secure your account.</p>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <h4 style={{ margin: "0 0 20px 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Change Password</h4>
              <form onSubmit={(e) => { e.preventDefault(); alert("Password updated"); }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Current Password</label>
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        style={{ background: "none", border: "none", padding: 0, fontSize: "0.8rem", color: "#2563eb", fontWeight: 600, cursor: "pointer" }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input type="password" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} required />
                    
                    {resetEmailSent && (
                      <div style={{ marginTop: "8px", padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#166534", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={14} /> Password reset link sent to your email!
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>New Password</label>
                    <input type="password" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>Confirm New Password</label>
                    <input type="password" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }} required />
                  </div>
                  <button type="submit" style={{ background: "#2563eb", width: "fit-content", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, color: "#ffffff", cursor: "pointer", marginTop: "8px" }}>
                    Update Password
                  </button>
                </div>
              </form>
            </div>


          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeSettingsTab === "notifications" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.3s ease-out" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Notifications</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>Choose how you receive updates and alerts.</p>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <h4 style={{ margin: "0 0 20px 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>Email Notifications</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#0f172a" }}>Weekly Summary</h5>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Receive a weekly email summarizing your progress.</p>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#0f172a" }}>Mentor Messages</h5>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Get notified when a mentor replies to your ticket.</p>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#0f172a" }}>New Airdrops</h5>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Alerts when a new bonus challenge is available.</p>
                  </div>
                  <input type="checkbox" style={{ width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
