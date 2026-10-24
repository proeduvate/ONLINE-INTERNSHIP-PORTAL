import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, FileText, ArrowLeft, ThumbsUp, AlertCircle, Calendar, CheckCircle, Star, Clock, TrendingUp, Award, Lock, Target, Zap, Users, Activity, FileCode, Database, Image, Folder, ExternalLink, Download, Copy, X } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { PageContainer } from "../../components/layout/PageContainer";
import api from "../../api/axios";
import "../../styles/Dashboard.css";

export default function InternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic intern data from backend API
  const [internData, setInternData] = useState({
    id: id || "INT001",
    name: "Loading...",
    domain: "AIML",
    batch: "Batch A",
    progress: 0,
    attendance: 100,
    score: 0,
    weakAreas: "None identified",
    strengths: "Good task completion",
    completedDays: 0,
    totalDays: 30,
    completedTasks: 0,
    totalTasks: 30,
  });

  const [performanceData, setPerformanceData] = useState([
    { week: 'Week 1', score: 50 },
    { week: 'Week 2', score: 60 },
    { week: 'Week 3', score: 70 },
    { week: 'Week 4', score: 80 },
  ]);

  const [submissions, setSubmissions] = useState([]);

  // File preview modal states
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchInternDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/v1/mentor/interns/${id}`);
        if (res.data) {
          if (res.data.intern) setInternData(res.data.intern);
          if (res.data.performanceData) setPerformanceData(res.data.performanceData);
          if (res.data.submissions) setSubmissions(res.data.submissions);
        }
      } catch (err) {
        console.error("Error fetching intern details:", err);
        setError("Failed to load intern details. Please check the network connection.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchInternDetails();
    }
  }, [id]);

  const intern = internData;

  const getFileIcon = (fileName, type) => {
    if (!fileName) return <FileText size={16} color="var(--text-muted, #64748b)" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'py' || ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx' || ext === 'html' || ext === 'css') return <FileCode size={16} color="#3b82f6" />;
    if (ext === 'sql' || ext === 'json' || ext === 'csv') return <Database size={16} color="#10b981" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'svg') return <Image size={16} color="#8b5cf6" />;
    if (ext === 'zip' || ext === 'rar' || ext === 'tar') return <Folder size={16} color="#f59e0b" />;
    return <FileText size={16} color="var(--text-muted, #64748b)" />;
  };

  const handleOpenFileViewer = (sub, fileIdx = 0) => {
    setActiveSubmission(sub);
    setActiveFileIndex(fileIdx);
    setCopyStatus("");
    setIsDownloadMenuOpen(false);
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopyStatus("Copied code to clipboard!");
    setTimeout(() => setCopyStatus(""), 3000);
  };

  const handleDownloadFile = (fileName) => {
    setCopyStatus(`Downloading ${fileName}...`);
    setTimeout(() => setCopyStatus(""), 3000);
  };

  const submittedList = submissions.filter(s => s.isSubmitted);
  const recentActivities = submittedList.length > 0 
    ? submittedList.slice(0, 3).map(s => ({
        color: "#2563eb",
        text: `Submitted ${s.task}`,
        time: s.submittedAt
      }))
    : [{ color: "#64748b", text: "No recent activity recorded yet", time: "Just now" }];

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3b82f6", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }}></div>
          <span style={{ marginLeft: "12px", fontSize: "16px", fontWeight: 600, color: "#475569" }}>Loading Intern Details...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid var(--border-color)", marginBottom: "24px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>Intern Details: {intern.name}</h2>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
                ID: <b>{intern.id}</b> | Domain: <b>{intern.domain}</b> | Batch: <b>{intern.batch}</b>
              </span>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
              <button
                onClick={() => setActiveTab("Overview")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "Overview" ? "#fff" : "transparent",
                  boxShadow: activeTab === "Overview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  color: activeTab === "Overview" ? "#3b82f6" : "var(--text-muted, #64748b)",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <LayoutDashboard size={16} /> Overview
              </button>
              <button
                onClick={() => setActiveTab("Task Submissions")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "Task Submissions" ? "#fff" : "transparent",
                  boxShadow: activeTab === "Task Submissions" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  color: activeTab === "Task Submissions" ? "#3b82f6" : "var(--text-muted, #64748b)",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <FileText size={16} /> Task Submissions
              </button>
            </div>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate("/mentor")}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        {activeTab === "Overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "hidden", height: "calc(100vh - 140px)" }}>

            {/* === ROW 1: 4 Metric Cards === */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {/* Days Completed */}
              <div style={{ padding: "13px 14px", background: "var(--surface-blue, #EFF7FF)", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{intern.completedDays || 0} / {intern.totalDays || 30}</h3>
                    <span style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700 }}>{intern.progress}%</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Days Completed</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "5px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${Math.min(100, intern.progress)}%`, background: "#2563eb", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              {/* Tasks Completed */}
              <div style={{ padding: "13px 14px", background: "var(--surface-blue, #EFF7FF)", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{intern.completedTasks || 0} / {intern.totalTasks || 30}</h3>
                    <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700 }}>{Math.round(((intern.completedTasks || 0) / (intern.totalTasks || 30)) * 100)}%</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Tasks Completed</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "5px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${Math.round(((intern.completedTasks || 0) / (intern.totalTasks || 30)) * 100)}%`, background: "#16a34a", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              {/* Average Score */}
              <div style={{ padding: "13px 14px", background: "var(--surface-blue, #EFF7FF)", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Star size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{intern.score} pts</h3>
                    <span style={{ fontSize: "0.78rem", color: "#9333ea", fontWeight: 700 }}>Avg Score</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Assessment Score</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "5px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${Math.min(100, intern.score)}%`, background: "#9333ea", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              {/* Attendance */}
              <div style={{ padding: "13px 14px", background: "var(--surface-blue, #EFF7FF)", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)" }}>{intern.attendance}%</h3>
                    <span style={{ fontSize: "0.78rem", color: "#ea580c", fontWeight: 700 }}>{intern.attendance >= 85 ? "Excellent" : "Regular"}</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Attendance Rate</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "5px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${intern.attendance}%`, background: "#ea580c", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>
            </div>

            {/* === ROW 2: 3-Column Grid === */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>

              {/* Column 1: Performance Trend Chart */}
              <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Performance Trend</h3>
                    <p style={{ margin: "3px 0 0 0", fontSize: "0.78rem", color: "var(--text-muted, #64748b)" }}>Weekly score trajectory</p>
                  </div>
                  <div style={{ padding: "4px 10px", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "7px", border: "1px solid #e2e8f0", fontSize: "0.78rem", color: "#334155", fontWeight: 600 }}>Last 4 Weeks</div>
                </div>
                <ResponsiveContainer width="100%" height={155}>
                  <LineChart data={performanceData} margin={{ top: 5, right: 10, bottom: -5, left: -25 }}>
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} />
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-muted, #64748b)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted, #64748b)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Column 2: Skill Development */}
              <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Skill Development</h3>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.78rem", color: "var(--text-muted, #64748b)" }}>Domain: {intern.domain}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
                  {[
                    { name: "Core Domain Proficiency", val: Math.min(100, Math.max(20, intern.progress * 3)) },
                    { name: "Task Execution", val: Math.min(100, Math.max(15, intern.score)) },
                    { name: "Assessment Accuracy", val: Math.min(100, Math.max(10, intern.score)) },
                    { name: "Learning Consistency", val: intern.attendance || 90 },
                  ].map(skill => (
                    <div key={skill.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#334155" }}>{skill.name}</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>{skill.val}%</span>
                      </div>
                      <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${skill.val}%`, background: skill.val >= 75 ? "#16a34a" : skill.val >= 50 ? "#2563eb" : "#f59e0b", height: "100%", borderRadius: "3px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Performance Overview Donut */}
              <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Performance Overview</h3>
                <div style={{ position: "relative", width: "118px", height: "118px", margin: "0 auto 10px auto" }}>
                  <svg width="100%" height="100%" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="68" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                    <circle cx="80" cy="80" r="68" fill="none" stroke="#2563eb" strokeWidth="16"
                      strokeDasharray={`${(Math.min(100, intern.score || intern.progress) / 100) * 427} 427`}
                      strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 80 80)" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>{intern.score}%</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Overall</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }}></div><span style={{ color: "#475569", fontSize: "0.82rem" }}>MCQ Score</span></div>
                    <strong style={{ fontSize: "0.82rem" }}>{intern.score}%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }}></div><span style={{ color: "#475569", fontSize: "0.82rem" }}>AI Evaluation</span></div>
                    <strong style={{ fontSize: "0.82rem" }}>{Math.min(100, intern.score + 5)}%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div><span style={{ color: "#475569", fontSize: "0.82rem" }}>Mentor Reviews</span></div>
                    <strong style={{ fontSize: "0.82rem" }}>{Math.min(100, intern.score)}%</strong>
                  </div>
                </div>
                <div style={{ marginTop: "10px", padding: "7px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <TrendingUp size={14} color="#16a34a" />
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#166534" }}>Progress updating correctly.</p>
                </div>
              </div>
            </div>

            {/* === ROW 3: Bottom Grid === */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>

              {/* Strengths & Weaknesses */}
              <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Strengths & Areas</h3>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
                    <ThumbsUp size={13} color="#16a34a" />
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#16a34a" }}>Strengths</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {intern.strengths.split(", ").map((s, i) => (
                      <span key={i} style={{ fontSize: "12px", padding: "4px 10px", background: "#f0fdf4", color: "#166534", borderRadius: "20px", border: "1px solid #bbf7d0", fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
                    <AlertCircle size={13} color="#ef4444" />
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ef4444" }}>Improvement Areas</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {intern.weakAreas.split(", ").map((w, i) => (
                      <span key={i} style={{ fontSize: "12px", padding: "4px 10px", background: "#fef2f2", color: "#991b1b", borderRadius: "20px", border: "1px solid #fecaca", fontWeight: 600 }}>{w}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mentor Action Items */}
              <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "13px 14px", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "#b45309" }}>Mentor Action Items</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "9px 11px", borderRadius: "9px", border: "1px solid #fde68a" }}>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#92400e" }}>Review Pending Submissions</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#b45309", fontWeight: 600 }}>{intern.completedTasks} completed</span>
                      <button className="btn btn-primary" style={{ padding: "4px 11px", fontSize: "12px" }} onClick={() => setActiveTab("Task Submissions")}>View Tasks</button>
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "9px 11px", borderRadius: "9px", border: "1px solid #fde68a" }}>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#92400e" }}>Schedule 1-on-1 Review</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#b45309" }}>Discuss domain progress</span>
                      <button className="btn btn-secondary" style={{ padding: "4px 11px", fontSize: "12px", backgroundColor: "#fff", border: "1px solid #cbd5e1" }}>Schedule</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Recent Activity</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                    {recentActivities.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: "4px" }}></div>
                        <div>
                          <p style={{ margin: "0 0 2px 0", fontSize: "0.82rem", color: "var(--text-primary, #1e293b)", fontWeight: 500 }}>{item.text}</p>
                          <span style={{ fontSize: "0.73rem", color: "var(--text-muted, #64748b)" }}>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Task Submissions Card */}
        {activeTab === "Task Submissions" && (
          <div className="card" style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Task Submissions</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                View and inspect daily task files submitted by {intern.name}. Click on any file to open preview.
              </p>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "6px 12px", borderRadius: "20px" }}>
              Total Submissions: {submittedList.length}
            </span>
          </div>

          <div className="table-container">
            <table className="table" style={{ width: "100%", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "var(--bg-surface-elevated, #f8fafc)" }}>
                  <th style={{ width: "14%", padding: "12px 16px" }}>Date</th>
                  <th style={{ width: "24%", padding: "12px 16px" }}>Task Name</th>
                  <th style={{ width: "22%", padding: "12px 16px" }}>Submitted Files</th>
                  <th style={{ width: "10%", padding: "12px 16px" }}>Score</th>
                  <th style={{ width: "12%", padding: "12px 16px" }}>Status</th>
                  <th style={{ width: "18%", padding: "12px 16px" }}>Mentor Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const isSubmitted = sub.isSubmitted;
                  return (
                    <tr key={sub.day}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>{sub.date}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{sub.day}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: isSubmitted ? "#1f2937" : "#9ca3af", fontStyle: isSubmitted ? "normal" : "italic" }}>
                          {sub.task}
                        </div>
                        {isSubmitted && sub.githubUrl && (
                          <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                            <ExternalLink size={12} /> GitHub Repo
                          </a>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {isSubmitted && sub.files && sub.files.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {sub.files.map((file, fIdx) => (
                              <span
                                key={fIdx}
                                className="file-pill"
                                onClick={() => handleOpenFileViewer(sub, fIdx)}
                                style={{ padding: "6px 12px", fontSize: "12px", background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#2563eb", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 500 }}
                              >
                                {getFileIcon(file.name, file.type)} {file.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#d1d5db" }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontWeight: 600, color: isSubmitted ? "#1f2937" : "#d1d5db" }}>
                          {sub.mcqScore !== "-" ? sub.mcqScore : sub.aiScore}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {isSubmitted ? (
                          <span className={`badge ${sub.status === 'Approved' ? 'badge-success' : sub.status === 'Rejected' ? 'badge-danger' : 'badge-info'}`}>
                            {sub.status}
                          </span>
                        ) : (
                          <span className="badge badge-secondary" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>{sub.status}</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: isSubmitted ? "#4b5563" : "#d1d5db", lineHeight: "1.4" }}>
                        {sub.feedback}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Submitted Files Interactive Viewer Modal */}
      {activeSubmission && (
        <div className="modal-overlay" onClick={() => { setActiveSubmission(null); setIsDownloadMenuOpen(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary, #0f172a)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Folder size={18} color="#2563eb" /> Submitted Daily Task Files: {activeSubmission.task}
                  </h3>
                  <span className={`badge ${activeSubmission.status === 'Approved' ? 'badge-success' : activeSubmission.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {activeSubmission.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", marginTop: "4px" }}>
                  Submitted on: <b>{activeSubmission.submittedAt}</b> | AI Score: <b>{activeSubmission.aiScore}</b> | Intern: <b>{intern.name} ({intern.id})</b>
                </div>
              </div>

              {/* Right Side Header Controls (GitHub + Download Menu + Close) */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                {activeSubmission.githubUrl && (
                  <a
                    href={activeSubmission.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: "6px 14px", background: "var(--text-primary, #0f172a)", color: "var(--bg-surface, #ffffff)", borderRadius: "6px", fontSize: "12px", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    View on GitHub <ExternalLink size={12} />
                  </a>
                )}

                <button
                  className="download-dropdown-btn"
                  onClick={() => handleDownloadFile(`all_${activeSubmission.task.toLowerCase().replace(/\s+/g, '_')}_files.zip`)}
                  title={`Click to download all ${activeSubmission.files ? activeSubmission.files.length : 0} submitted files`}
                  style={{ background: "#2563eb", color: "var(--bg-surface, #ffffff)", padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} /> Download All Files (.zip)
                </button>

                <button
                  onClick={() => setActiveSubmission(null)}
                  style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--text-muted, #64748b)", marginLeft: "4px" }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Modal Toast / Notification banner */}
            {copyStatus && (
              <div style={{ background: "#3b82f6", color: "var(--bg-surface, #ffffff)", padding: "8px 16px", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
                {copyStatus}
              </div>
            )}

            {/* Modal Body */}
            <div className="modal-body">
              {/* File List Sidebar */}
              <div className="modal-sidebar">
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.5px" }}>
                  Submitted Files ({activeSubmission.files ? activeSubmission.files.length : 0})
                </div>
                {activeSubmission.files && activeSubmission.files.map((file, idx) => (
                  <div
                    key={idx}
                    className={`modal-sidebar-item ${activeFileIndex === idx ? "active" : ""}`}
                    onClick={() => {
                      setActiveFileIndex(idx);
                      setCopyStatus("");
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      <span>{getFileIcon(file.name, file.type)}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {file.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "10px", opacity: 0.8 }}>{file.size}</span>
                  </div>
                ))}
              </div>

              {/* Main File Preview Area */}
              <div className="modal-main">
                {activeSubmission.files && activeSubmission.files[activeFileIndex] && (
                  <>
                    {/* Header bar of active file */}
                    <div className="code-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px" }}>
                          {getFileIcon(
                            activeSubmission.files[activeFileIndex].name,
                            activeSubmission.files[activeFileIndex].type
                          )}
                        </span>
                        <div>
                          <b style={{ color: "var(--bg-surface-elevated, #f8fafc)" }}>{activeSubmission.files[activeFileIndex].name}</b>
                          <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "10px" }}>
                            Size: {activeSubmission.files[activeFileIndex].size} | Uploaded: {activeSubmission.files[activeFileIndex].uploadedAt}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {activeSubmission.files[activeFileIndex].type === "code" && (
                          <button
                            onClick={() => handleCopyCode(activeSubmission.files[activeFileIndex].content)}
                            style={{ padding: "5px 10px", background: "#334155", border: "none", color: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "4px", fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Copy size={12} /> Copy Code
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadFile(activeSubmission.files[activeFileIndex].name)}
                          style={{ padding: "5px 10px", background: "#2563eb", border: "none", color: "var(--bg-surface, #ffffff)", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Download size={12} /> Download
                        </button>
                      </div>
                    </div>

                    {/* Content Display */}
                    {activeSubmission.files[activeFileIndex].type === "code" ? (
                      <div className="code-viewer">
                        {(activeSubmission.files[activeFileIndex].content || '').split('\n').map((line, idx) => (
                          <div key={idx} style={{ display: "flex" }}>
                            <span style={{ width: "40px", color: "var(--text-muted, #64748b)", userSelect: "none", flexShrink: 0 }}>
                              {idx + 1}
                            </span>
                            <span style={{ flex: 1 }}>{line || ' '}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="doc-viewer">
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                          {getFileIcon(activeSubmission.files[activeFileIndex].name, activeSubmission.files[activeFileIndex].type)}
                        </div>
                        <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary, #0f172a)" }}>
                          {activeSubmission.files[activeFileIndex].name}
                        </h4>
                        <p style={{ color: "var(--text-muted, #64748b)", fontSize: "14px", margin: "0 0 20px 0" }}>
                          Binary / Document File ({activeSubmission.files[activeFileIndex].size})
                        </p>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDownloadFile(activeSubmission.files[activeFileIndex].name)}
                          style={{ padding: "10px 24px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                        >
                          <Download size={16} /> Download Submitted File
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
