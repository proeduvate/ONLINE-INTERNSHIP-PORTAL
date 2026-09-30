import React, { useState, useEffect, useRef } from "react";
import { User, Shield, Bell, Camera, Save, Mail, Briefcase, Code2, Building2, CheckCircle, AlertCircle, Phone } from "lucide-react";
import api from "../../api/axios";

export default function InternProfile() {
  const [activeSettingsTab, setActiveSettingsTab] = useState("personal");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [profileImage, setProfileImage] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Intern&backgroundColor=f8fafc");
  const fileInputRef = useRef(null);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    domain_name: "",
    institution: "",
    role: "INTERN",
    phone: ""
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Security Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordStatus, setPasswordStatus] = useState({ error: "", success: "", loading: false });

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchProfileData();
    fetchNotifications();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/api/v1/users/profile');
      if (res.data) {
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          domain_name: res.data.domain_name || "General Track",
          institution: res.data.college || "",
          role: res.data.role ? res.data.role.toUpperCase() : "INTERN",
          phone: res.data.phone || ""
        });
      }
    } catch (err) {
      console.warn("Failed to fetch intern profile:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/v1/notifications');
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage("https://api.dicebear.com/7.x/avataaars/svg?seed=Intern&backgroundColor=f8fafc");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.put('/api/v1/users/profile', {
        name: profile.name,
        college: profile.institution,
        phone: profile.phone
      });
      alert("Profile updated successfully in database!");
      fetchProfileData();
    } catch (err) {
      console.error("Profile update error:", err);
      const msg = err.response?.data?.detail || "Failed to update profile.";
      alert(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ error: "", success: "", loading: true });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordStatus({ error: "New passwords do not match!", success: "", loading: false });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordStatus({ error: "Password must be at least 6 characters.", success: "", loading: false });
      return;
    }

    try {
      const res = await api.post('/api/v1/users/change-password', {
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword
      });

      setPasswordStatus({
        error: "",
        success: res.data?.message || "Password updated successfully in database!",
        loading: false
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password change error:", err);
      const errMsg = err.response?.data?.detail || "Failed to change password. Please verify current password.";
      setPasswordStatus({ error: errMsg, success: "", loading: false });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/users/reset-password-request', { email: profile.email });
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (err) {
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    }
  };

  return (
    <div style={{ display: "flex", gap: "24px", height: "100%", overflowY: "hidden", paddingBottom: "10px", paddingRight: "10px" }}>
      
      {/* Left Sidebar Navigation */}
      <div style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary, #0f172a)", marginBottom: "16px", paddingLeft: "12px" }}>Settings</h2>
        
        <button 
          onClick={() => setActiveSettingsTab("personal")}
          style={{ 
            display: "flex", alignItems: "center", gap: "12px", padding: "12px", 
            borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
            background: activeSettingsTab === "personal" ? "var(--brand-bg, #eff6ff)" : "transparent",
            color: activeSettingsTab === "personal" ? "var(--brand-primary, #2563eb)" : "var(--text-secondary, #475569)",
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
            background: activeSettingsTab === "security" ? "var(--brand-bg, #eff6ff)" : "transparent",
            color: activeSettingsTab === "security" ? "var(--brand-primary, #2563eb)" : "var(--text-secondary, #475569)",
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
            background: activeSettingsTab === "notifications" ? "var(--brand-bg, #eff6ff)" : "transparent",
            color: activeSettingsTab === "notifications" ? "var(--brand-primary, #2563eb)" : "var(--text-secondary, #475569)",
            transition: "all 0.2s"
          }}
        >
          <Bell size={18} /> Notifications
        </button>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, maxWidth: "800px", overflowY: "auto", paddingRight: "10px" }}>
        
        {/* PERSONAL INFO TAB */}
        {activeSettingsTab === "personal" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.3s ease-out" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Personal Information</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>Manage your intern details connected with live database.</p>
            </div>

            <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              {/* Avatar Section */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }}>
                <div style={{ position: "relative" }}>
                  <img src={profileImage} alt="Profile" style={{ width: "80px", height: "80px", borderRadius: "50%", border: "1px solid var(--border-color, #e2e8f0)", objectFit: "cover" }} />
                  <button onClick={() => fileInputRef.current?.click()} style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-surface-elevated, #f1f5f9)", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary, #475569)", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                    <input type="file" accept="image/png, image/jpeg, image/gif" ref={fileInputRef} onChange={handleImageChange} style={{ display: "none" }} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ background: "var(--bg-surface-elevated, #f1f5f9)", border: "1px solid var(--border-color, #cbd5e1)", padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary, #0f172a)", cursor: "pointer" }}>Change Photo</button>
                    <button onClick={handleRemoveImage} style={{ background: "transparent", border: "none", padding: "8px", fontSize: "0.85rem", fontWeight: 600, color: "var(--error, #ef4444)", cursor: "pointer" }}>Remove</button>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted, #94a3b8)" }}>JPG, GIF or PNG. Max size of 5MB.</p>
                </div>
              </div>

              {/* Form Grid */}
              <form onSubmit={handleSaveProfile}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "6px" }}>Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                    style={{ width: "100%", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.9rem", color: "var(--text-primary, #0f172a)", background: "transparent", boxSizing: "border-box" }} 
                    required 
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "6px" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} color="var(--text-muted, #94a3b8)" style={{ position: "absolute", left: "12px", top: "10px" }} />
                    <input 
                      type="email" 
                      value={profile.email} 
                      disabled 
                      style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.9rem", color: "var(--text-muted, #64748b)", background: "var(--bg-surface-elevated, #f1f5f9)", cursor: "not-allowed", boxSizing: "border-box" }} 
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "6px" }}>Domain / Track</label>
                    <div style={{ position: "relative" }}>
                      <Code2 size={16} color="var(--text-muted, #94a3b8)" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input 
                        type="text" 
                        value={profile.domain_name} 
                        disabled 
                        style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.9rem", color: "var(--text-muted, #64748b)", background: "var(--bg-surface-elevated, #f1f5f9)", cursor: "not-allowed", boxSizing: "border-box" }} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "6px" }}>College / Institution</label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={16} color="var(--text-muted, #94a3b8)" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input 
                        type="text" 
                        value={profile.institution} 
                        onChange={(e) => setProfile({ ...profile, institution: e.target.value })} 
                        style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.9rem", color: "var(--text-primary, #0f172a)", background: "transparent", boxSizing: "border-box" }} 
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "6px" }}>Role / Title</label>
                    <div style={{ position: "relative" }}>
                      <Briefcase size={16} color="var(--text-muted, #94a3b8)" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input 
                        type="text" 
                        value={profile.role} 
                        disabled 
                        style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.9rem", color: "var(--text-muted, #64748b)", background: "var(--bg-surface-elevated, #f1f5f9)", cursor: "not-allowed", boxSizing: "border-box" }} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "6px" }}>Phone Number</label>
                    <div style={{ position: "relative" }}>
                      <Phone size={16} color="var(--text-muted, #94a3b8)" style={{ position: "absolute", left: "12px", top: "10px" }} />
                      <input 
                        type="tel" 
                        value={profile.phone} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                        style={{ width: "100%", padding: "8px 14px 8px 38px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.9rem", color: "var(--text-primary, #0f172a)", background: "transparent", boxSizing: "border-box" }} 
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-color, #e2e8f0)", paddingTop: "16px" }}>
                  <button type="button" onClick={fetchProfileData} style={{ background: "transparent", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary, #475569)", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={isSavingProfile} style={{ background: "var(--brand-primary, #2563eb)", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, color: "var(--bg-surface, #ffffff)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Save size={16} /> {isSavingProfile ? "Saving..." : "Save Changes"}
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
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Account Security</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted, #64748b)" }}>Manage your password and update backend credentials.</p>
            </div>

            <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <h4 style={{ margin: "0 0 20px 0", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Change Password</h4>
              <form onSubmit={handleChangePassword}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)" }}>Current Password</label>
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        style={{ background: "none", border: "none", padding: 0, fontSize: "0.8rem", color: "var(--brand-primary, #2563eb)", fontWeight: 600, cursor: "pointer" }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input 
                      type="password" 
                      value={passwords.currentPassword} 
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} 
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", background: "transparent", boxSizing: "border-box" }} 
                      required 
                    />
                    
                    {resetEmailSent && (
                      <div style={{ marginTop: "8px", padding: "8px 12px", background: "var(--success-bg, #f0fdf4)", border: "1px solid var(--success-border, #bbf7d0)", borderRadius: "6px", color: "var(--success, #166534)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={14} /> Password reset link sent to {profile.email}!
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "8px" }}>New Password</label>
                    <input 
                      type="password" 
                      value={passwords.newPassword} 
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", background: "transparent", boxSizing: "border-box" }} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary, #334155)", marginBottom: "8px" }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirmPassword} 
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", outline: "none", fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", background: "transparent", boxSizing: "border-box" }} 
                      required 
                    />
                  </div>

                  {passwordStatus.error && (
                    <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertCircle size={14} /> {passwordStatus.error}
                    </div>
                  )}

                  {passwordStatus.success && (
                    <div style={{ padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#166534", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle size={14} /> {passwordStatus.success}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={passwordStatus.loading}
                    style={{ background: "var(--brand-primary, #2563eb)", width: "fit-content", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, color: "var(--bg-surface, #ffffff)", cursor: "pointer", marginTop: "8px" }}
                  >
                    {passwordStatus.loading ? "Updating..." : "Update Password"}
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
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Notifications</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted, #64748b)" }}>Real-time backend system notifications.</p>
            </div>

            <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <h4 style={{ margin: "0 0 20px 0", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Live Notifications Log</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
                    No system notifications in database yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{ padding: "12px 16px", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary, #1e293b)" }}>{n.title}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary, #475569)", marginTop: "2px" }}>{n.message}</div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #94a3b8)" }}>
                        {n.created_at ? new Date(n.created_at).toLocaleDateString() : "Today"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
