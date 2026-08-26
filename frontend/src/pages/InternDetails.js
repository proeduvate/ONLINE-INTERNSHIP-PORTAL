import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import "../styles/Dashboard.css";

export default function InternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock specific intern data based on the id (we use generic mock data for demonstration)
  const intern = {
    id: id || "INT001",
    name: "John Doe",
    domain: "Artificial Intelligence",
    batch: "Batch A",
    progress: 60,
    attendance: 95,
    score: 82,
    weakAreas: "CSS layouts, Async operations",
    strengths: "Problem solving, Data structures",
  };

  const performanceData = [
    { week: 'Week 1', score: 70 },
    { week: 'Week 2', score: 75 },
    { week: 'Week 3', score: 80 },
    { week: 'Week 4', score: 82 },
  ];

  const submissions = [
    { id: 1, task: "React To-Do App", date: "2026-08-10", aiScore: "85%", status: "Approved", feedback: "Good structure. Minor UI issues." },
    { id: 2, task: "Predictive Model Python", date: "2026-08-15", aiScore: "92%", status: "Pending", feedback: "Waiting for mentor review." },
    { id: 3, task: "Database Schema Design", date: "2026-08-20", aiScore: "78%", status: "Rejected", feedback: "Lacks normalization." }
  ];

  return (
    <div className="container">
      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', gap: '10px', marginBottom: '30px' }}>
            {isSidebarOpen && <h2>Mentor Panel</h2>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>☰</button>
          </div>
          <ul>
            <li onClick={() => navigate("/mentor")} title={!isSidebarOpen ? "Back" : ""}>
              <span>⬅️</span>
              {isSidebarOpen && <span className="sidebar-text" style={{ marginLeft: "12px" }}>Back to Dashboard</span>}
            </li>
          </ul>
        </div>
        <button className="sidebar-logout" onClick={() => navigate("/login")}>
          {isSidebarOpen ? "Logout" : "🚪"}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main" style={{ overflowY: "auto" }}>
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>☰</button>}
            <div>
              <h2 style={{ margin: 0 }}>Intern Details: {intern.name}</h2>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
                ID: <b>{intern.id}</b> | Batch: <b>{intern.batch}</b>
              </span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/mentor")}>Back</button>
        </div>

        <div className="grid">
          <div className="stat-card">
            <span className="stat-title">Overall Progress</span>
            <span className="stat-value">{intern.progress}%</span>
            <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', marginTop: '8px' }}>
              <div style={{ width: `${intern.progress}%`, backgroundColor: '#3b82f6', height: '100%', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-title">Average Score</span>
            <span className="stat-value">{intern.score}%</span>
            <span className="stat-desc">Top 10% in {intern.batch}</span>
          </div>
          <div className="stat-card">
            <span className="stat-title">Attendance</span>
            <span className="stat-value">{intern.attendance}%</span>
            <span className="stat-desc">Consistent</span>
          </div>
          <div className="stat-card">
            <span className="stat-title">Domain</span>
            <span className="stat-value" style={{ fontSize: "20px", marginTop: "10px" }}>{intern.domain}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div className="card" style={{ margin: 0 }}>
            <h3>Performance Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ margin: 0, backgroundColor: "#f8fafc" }}>
            <h3>Strengths & Weaknesses</h3>
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ color: "#10b981", margin: "0 0 8px 0" }}>👍 Strengths</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {intern.strengths.split(", ").map((s, i) => (
                  <span key={i} className="badge badge-success">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: "#ef4444", margin: "0 0 8px 0" }}>⚠️ Areas for Improvement</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {intern.weakAreas.split(", ").map((w, i) => (
                  <span key={i} className="badge badge-danger" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>{w}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "24px" }}>
          <h3>Task Submissions</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Task Name</th>
                  <th>AI Score</th>
                  <th>Status</th>
                  <th>Mentor Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.date}</td>
                    <td><b>{sub.task}</b></td>
                    <td>{sub.aiScore}</td>
                    <td>
                      <span className={`badge ${sub.status === 'Approved' ? 'badge-success' : sub.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#6b7280" }}>{sub.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
