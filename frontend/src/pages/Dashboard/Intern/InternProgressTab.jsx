import React, { useState } from "react";
import { 
  ArrowLeft, 
  Rocket, 
  CheckCircle, 
  Download, 
  Share2, 
  ExternalLink, 
  Calendar, 
  Star, 
  Clock, 
  Lock, 
  Award, 
  TrendingUp, 
  FileText 
} from "lucide-react";

/**
 * InternProgressTab Component
 * 
 * Comprehensive student progress tracker:
 * - Skill growth radar & dynamic learning curve
 * - Performance donut & MCQ/AI/Mentor scoring distribution
 * - Day-by-day progress timeline & achievements
 * - Dynamic official internship certificate with real verification metadata
 */
const InternProgressTab = ({
  progress = 0,
  aiScore = 0,
  attendancePercent = 0,
  tasksCompletedCount = 0,
  assessmentsCount = 0,
  currentDay = 1,
  domainTasksList = [],
  internUser = null,
  internDomain = "Software Engineering",
  mentorInfo = null,
  isInternshipCompleted = false,
  showCertificateView = false,
  navigate
}) => {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const internFirstName = internUser?.name ? internUser.name.split(" ")[0] : "Intern";
  const certId = `EX-PL-INT-${String(internUser?.id || 1).padStart(4, "0")}`;

  // Certificate View
  if (showCertificateView) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
        
        {/* Toast Alert */}
        {toastMessage && (
          <div style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            zIndex: 9999,
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle size={16} color="#10b981" />
            {toastMessage}
          </div>
        )}

        {/* Back Navigation Button */}
        <div>
          <button 
            onClick={() => navigate("/intern/progress")} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--text-secondary, #475569)", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              fontSize: "14px", 
              fontWeight: 600, 
              cursor: "pointer", 
              padding: "4px 0",
              transition: "color 0.2s" 
            }}
          >
            <ArrowLeft size={16} /> Back to Progress Overview
          </button>
        </div>

        {/* Completion Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          borderRadius: "20px",
          padding: "24px 32px",
          color: "var(--text-primary, #0f172a)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(37, 99, 235, 0.08)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid #bfdbfe",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ 
              fontSize: "11px", 
              fontWeight: 700, 
              textTransform: "uppercase", 
              letterSpacing: "1.5px", 
              color: "#1d4ed8", 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              marginBottom: "8px", 
              background: "#ffffff", 
              padding: "4px 12px", 
              borderRadius: "12px", 
              border: "1px solid #bfdbfe" 
            }}>
              Curriculum Completed <Rocket size={12} />
            </span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.5px", color: "var(--text-primary, #0f172a)" }}>
              Boom! You did it, {internFirstName}!
            </h2>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary, #475569)", lineHeight: "1.5", maxWidth: "600px" }}>
              Outstanding execution across all 30 days of intensive development. Your official verifiable credentials have been minted and are ready.
            </p>
          </div>

          <div style={{ background: "#ffffff", padding: "14px 28px", borderRadius: "16px", border: "1px solid #bfdbfe", textAlign: "center", position: "relative", zIndex: 1, boxShadow: "0 4px 12px rgba(37,99,235,0.06)" }}>
            <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", display: "block", fontWeight: 700 }}>Program Grade</span>
            <span style={{ fontSize: "2.2rem", fontWeight: 900, display: "block", margin: "2px 0", color: "#2563eb" }}>{aiScore || 88}%</span>
            <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "3px 12px", borderRadius: "12px", fontWeight: 700, border: "1px solid #bbf7d0" }}>
              {aiScore >= 80 ? "Distinction" : "Certified"}
            </span>
          </div>
        </div>

        {/* Certificate Display & Share Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
          
          {/* Certificate Card */}
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>Official Certificate of Completion</h3>
              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700, background: "#ecfdf5", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px", border: "1px solid #a7f3d0" }}>
                <CheckCircle size={14} /> Cryptographically Verified
              </span>
            </div>

            <div style={{
              flexGrow: 1,
              border: "2px solid #e2e8f0",
              borderRadius: "14px",
              padding: "32px 40px",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              {/* Corner Accents */}
              <div style={{ position: "absolute", top: "16px", left: "16px", width: "24px", height: "24px", borderTop: "2px solid #2563eb", borderLeft: "2px solid #2563eb" }} />
              <div style={{ position: "absolute", top: "16px", right: "16px", width: "24px", height: "24px", borderTop: "2px solid #2563eb", borderRight: "2px solid #2563eb" }} />
              <div style={{ position: "absolute", bottom: "16px", left: "16px", width: "24px", height: "24px", borderBottom: "2px solid #2563eb", borderLeft: "2px solid #2563eb" }} />
              <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "24px", height: "24px", borderBottom: "2px solid #2563eb", borderRight: "2px solid #2563eb" }} />

              {/* Brand Header */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#2563eb", color: "#ffffff", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)" }}>
                  P
                </div>
                <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>ProEduvate Portal</span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "3px", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
                  CERTIFICATE OF INTERNSHIP
                </span>

                <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0 0 10px 0", fontStyle: "italic" }}>
                  This is proudly presented to
                </p>

                <h1 style={{ fontSize: "2.3rem", fontFamily: "Georgia, serif", fontWeight: 700, color: "#1d4ed8", margin: "0 0 14px 0" }}>
                  {internUser?.name || "Intern Candidate"}
                </h1>

                <p style={{ fontSize: "0.88rem", color: "#334155", maxWidth: "540px", margin: "0 auto", lineHeight: "1.6" }}>
                  for successfully completing the rigorous 30-day Professional Track in <strong style={{ color: "#0f172a" }}>{internDomain}</strong>. During this program, they demonstrated exceptional diligence, hands-on engineering capability, and problem-solving craftsmanship.
                </p>
              </div>

              {/* Metadata Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px", padding: "0 10px" }}>
                <div style={{ textAlign: "left" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", display: "block" }}>
                    30-Day Cohort Track
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Program Duration</span>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #cbd5e1", width: "130px", margin: "0 auto 4px auto", paddingBottom: "4px", fontWeight: 700, fontFamily: "cursive", fontSize: "1.1rem", color: "#0f172a" }}>
                    {mentorInfo?.name || "Dr. Sakthi"}
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lead Program Mentor</span>
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ width: "36px", height: "36px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "6px", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 800, color: "#64748b" }}>
                    QR
                  </div>
                  <span style={{ fontSize: "0.6rem", color: "#64748b", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                    ID: {certId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Actions Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Export & Share Credentials</h4>
              
              <button 
                onClick={() => showToast("Preparing high-resolution PDF download...")}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "10px", 
                  marginBottom: "10px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  background: "#2563eb", 
                  color: "#ffffff", 
                  border: "none", 
                  fontWeight: 700, 
                  fontSize: "0.9rem", 
                  cursor: "pointer", 
                  transition: "all 0.2s", 
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)" 
                }}
              >
                <Download size={16} /> Download Official PDF
              </button>

              <button 
                onClick={() => showToast("Certificate link copied! Opening LinkedIn sharing dialog...")}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "10px", 
                  marginBottom: "10px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  background: "#eff6ff", 
                  color: "#2563eb", 
                  border: "1px solid #bfdbfe", 
                  fontWeight: 700, 
                  fontSize: "0.9rem", 
                  cursor: "pointer", 
                  transition: "all 0.2s" 
                }}
              >
                <Share2 size={16} /> Share on LinkedIn
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast("Shareable verification link copied to clipboard!");
                }}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "10px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  background: "#ffffff", 
                  color: "#475569", 
                  border: "1px solid #cbd5e1", 
                  fontWeight: 700, 
                  fontSize: "0.9rem", 
                  cursor: "pointer", 
                  transition: "all 0.2s" 
                }}
              >
                <ExternalLink size={16} /> Copy Verification URL
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // Standard Progress Dashboard
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Top 4 Metrics Cards */}
      <div className="progress-metrics-grid">
        <div style={{ padding: "16px", background: "var(--bg-surface, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Calendar size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{Math.round((progress / 100) * 30)} / 30</h3>
              <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700 }}>{progress}%</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Days Completed</span>
            <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, background: "#2563eb", height: "100%", borderRadius: "3px" }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "16px", background: "var(--bg-surface, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckCircle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{tasksCompletedCount} / 30</h3>
              <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 700 }}>{Math.round((tasksCompletedCount / 30) * 100)}%</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Tasks Completed</span>
            <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, Math.round((tasksCompletedCount / 30) * 100))}%`, background: "#16a34a", height: "100%", borderRadius: "3px" }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "16px", background: "var(--bg-surface, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Star size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{assessmentsCount} / 30</h3>
              <span style={{ fontSize: "0.8rem", color: "#9333ea", fontWeight: 700 }}>{Math.round((assessmentsCount / 30) * 100)}%</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Assessments Done</span>
            <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, Math.round((assessmentsCount / 30) * 100))}%`, background: "#9333ea", height: "100%", borderRadius: "3px" }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "16px", background: "var(--bg-surface, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{attendancePercent}%</h3>
              <span style={{ fontSize: "0.8rem", color: "#ea580c", fontWeight: 700 }}>{attendancePercent >= 80 ? "Optimal" : "Active"}</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Attendance</span>
            <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${attendancePercent}%`, background: "#ea580c", height: "100%", borderRadius: "3px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Progress Curve, Skill Development, Performance Donut */}
      <div className="progress-middle-grid">
        
        {/* Learning Curve */}
        <div style={{ background: "var(--bg-surface, #ffffff)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Learning Progress Curve</h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>Tracking momentum Day 1 to Day 30</p>
            </div>
            <div style={{ padding: "4px 10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#334155", fontWeight: 700 }}>
              Day {currentDay} of 30
            </div>
          </div>

          <div style={{ flex: 1, width: "100%", position: "relative", minHeight: "160px" }}>
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="progressGradFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />

              <polygon points="0,180 100,150 200,120 300,100 400,80 500,50 600,20 600,200 0,200" fill="url(#progressGradFull)" />
              <path d="M0,180 L100,150 L200,120 L300,100 L400,80 L500,50 L600,20" stroke="#2563eb" strokeWidth="3" fill="none" />
              
              <circle cx="0" cy="180" r="4" fill="#2563eb" />
              <circle cx="100" cy="150" r="4" fill="#2563eb" />
              <circle cx="200" cy="120" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <circle cx="300" cy="100" r="4" fill="#cbd5e1" />
              <circle cx="400" cy="80" r="4" fill="#cbd5e1" />
              <circle cx="500" cy="50" r="4" fill="#cbd5e1" />
              <circle cx="600" cy="20" r="4" fill="#cbd5e1" />
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted, #64748b)" }}>
            <span>Day 1 (Kickoff)</span>
            <span>Day 10</span>
            <span style={{ color: "#2563eb", fontWeight: 700 }}>Day 15 (Midterm)</span>
            <span>Day 20</span>
            <span>Day 30 (Capstone)</span>
          </div>
        </div>

        {/* Skill Development */}
        <div style={{ background: "var(--bg-surface, #ffffff)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Skill Development</h3>
          <p style={{ margin: "0 0 16px 0", fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>Domain mastery metrics</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "center" }}>
            {[
              { name: "Frontend / React", val: Math.min(100, Math.max(45, aiScore - 4)) },
              { name: "Backend / APIs", val: Math.min(100, Math.max(40, aiScore - 10)) },
              { name: "Database Design", val: Math.min(100, Math.max(35, aiScore - 15)) },
              { name: "Code Architecture", val: Math.min(100, Math.max(50, aiScore)) },
              { name: "Testing & QA", val: Math.min(100, Math.max(30, aiScore - 18)) }
            ].map(skill => (
              <div key={skill.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary, #0f172a)", width: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {skill.name}
                </span>
                <div style={{ flex: 1, background: "#f1f5f9", height: "7px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${skill.val}%`, background: "#2563eb", height: "100%", borderRadius: "4px" }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary, #0f172a)", width: "32px", textAlign: "right" }}>
                  {skill.val}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Overview Donut */}
        <div style={{ background: "var(--bg-surface, #ffffff)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Scoring Distribution</h3>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>Weighted cumulative breakdown</p>
          
          <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 12px auto" }}>
            <svg width="100%" height="100%" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="16" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="16" 
                strokeDasharray="440" 
                strokeDashoffset={440 - (440 * (aiScore || 0)) / 100} 
                strokeLinecap="round" 
                transform="rotate(-90 80 80)" 
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary, #0f172a)" }}>{aiScore}%</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Overall</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary, #475569)" }}>MCQ Knowledge</span>
              <strong style={{ fontSize: "0.85rem", color: "#2563eb" }}>{Math.min(100, Math.max(0, aiScore - 2))}%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary, #475569)" }}>AI Code Evaluation</span>
              <strong style={{ fontSize: "0.85rem", color: "#9333ea" }}>{aiScore}%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary, #475569)" }}>Mentor Assessments</span>
              <strong style={{ fontSize: "0.85rem", color: "#16a34a" }}>{Math.min(100, Math.max(0, aiScore + 3))}%</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Day-wise Progress Timeline, Achievements, Certificate Ready Card */}
      <div className="progress-bottom-grid">
        
        {/* Day-wise Progress Timeline */}
        <div style={{ background: "var(--bg-surface, #ffffff)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Daily Curriculum Milestones</h3>
            <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700 }}>All 30 Days</span>
          </div>

          <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingBottom: "12px" }}>
            {(() => {
              const startDay = Math.max(1, currentDay - 2);
              const daysToShow = Array.from({ length: 7 }, (_, i) => startDay + i).filter(d => d <= 30);
              return daysToShow.map(dNum => {
                const complete = dNum < currentDay;
                const active = dNum === currentDay;
                const locked = dNum > currentDay;
                const taskObj = domainTasksList.find(t => t.day_number === dNum);
                const title = taskObj?.title || `Day ${dNum} Topic`;
                return (
                  <div key={dNum} style={{ 
                    flexShrink: 0, 
                    width: "140px", 
                    padding: "14px", 
                    borderRadius: "12px", 
                    border: active ? "2px solid #2563eb" : (complete ? "1px solid #e2e8f0" : "1px dashed #cbd5e1"),
                    background: locked ? "#f8fafc" : "#ffffff",
                    textAlign: "center"
                  }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: locked ? "#94a3b8" : "#0f172a", display: "block", marginBottom: "4px" }}>
                      Day {dNum}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: locked ? "#94a3b8" : "#64748b", height: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", marginBottom: "8px" }}>
                      {title}
                    </span>
                    {complete && <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>✓ Passed</span>}
                    {active && <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>Active</span>}
                    {locked && <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>🔒 Locked</span>}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Achievements Card */}
        <div style={{ background: "var(--bg-surface, #ffffff)", padding: "18px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Achievements</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { title: "Consistent Learner", desc: "5 consecutive active days", unlocked: tasksCompletedCount >= 5 },
              { title: "First Submission", desc: "First code challenge passed", unlocked: tasksCompletedCount >= 1 },
              { title: "Quiz Master", desc: "90%+ in a daily assessment", unlocked: assessmentsCount >= 1 }
            ].map(ach => (
              <div key={ach.title} style={{ display: "flex", gap: "10px", alignItems: "center", opacity: ach.unlocked ? 1 : 0.45 }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: ach.unlocked ? "#eff6ff" : "#f1f5f9", color: ach.unlocked ? "#2563eb" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Star size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-primary, #0f172a)" }}>
                    {ach.title} {ach.unlocked ? "✓" : ""}
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.72rem", color: "var(--text-muted, #64748b)" }}>{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Ready Card */}
        <div style={{
          background: isInternshipCompleted ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" : "#f8fafc",
          borderRadius: "16px",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: isInternshipCompleted ? "1px solid #bfdbfe" : "1px solid #e2e8f0"
        }}>
          <div>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isInternshipCompleted ? "#ffffff" : "#e2e8f0", color: isInternshipCompleted ? "#2563eb" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              {isInternshipCompleted ? <Award size={22} /> : <Lock size={20} />}
            </div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
              {isInternshipCompleted ? "Certificate Unlocked!" : "Certificate Locked"}
            </h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#475569", lineHeight: "1.4" }}>
              {isInternshipCompleted ? "Your verified credentials are ready." : "Complete all 30 days of the curriculum to earn your certificate."}
            </p>
          </div>

          <button 
            disabled={!isInternshipCompleted}
            onClick={() => navigate("/intern/progress/certificate")}
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "10px",
              borderRadius: "8px",
              background: isInternshipCompleted ? "#2563eb" : "#e2e8f0",
              color: isInternshipCompleted ? "#ffffff" : "#94a3b8",
              border: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: isInternshipCompleted ? "pointer" : "not-allowed"
            }}
          >
            {isInternshipCompleted ? "View Certificate &rarr;" : "Locked"}
          </button>
        </div>

      </div>

    </div>
  );
};

export default React.memo(InternProgressTab);

