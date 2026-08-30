import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import "../../styles/Dashboard.css";

export default function InternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // File preview modal states
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  // Mock specific intern data based on the id
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
    {
      id: 1,
      day: "Day 10",
      task: "React To-Do App",
      date: "2026-08-10",
      submittedAt: "2026-08-10 17:42",
      aiScore: "85%",
      status: "Approved",
      feedback: "Good structure. Minor UI issues.",
      githubUrl: "https://github.com/johndoe/react-todo-app",
      files: [
        {
          name: "App.js",
          type: "code",
          language: "javascript",
          size: "2.4 KB",
          uploadedAt: "2026-08-10 17:40",
          content: `import React, { useState } from 'react';
import './App.css';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Complete Day 10 Task', completed: true },
    { id: 2, text: 'Review Code with Mentor', completed: false },
    { id: 3, text: 'Push changes to GitHub', completed: true }
  ]);
  const [inputText, setInputText] = useState('');

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setTodos([...todos, { id: Date.now(), text: inputText, completed: false }]);
    setInputText('');
  };

  const handleToggle = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="todo-app-container">
      <header className="app-header">
        <h1>Daily Task 10: React To-Do Application</h1>
      </header>
      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input 
          type="text" 
          placeholder="What needs to be done?" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      <TodoList todos={todos} onToggle={handleToggle} />
    </div>
  );
}

export default App;`
        },
        {
          name: "TodoList.jsx",
          type: "code",
          language: "javascript",
          size: "1.6 KB",
          uploadedAt: "2026-08-10 17:41",
          content: `import React from 'react';

export default function TodoList({ todos, onToggle }) {
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <li 
          key={todo.id} 
          className={todo.completed ? 'completed' : ''}
          onClick={() => onToggle(todo.id)}
        >
          <input type="checkbox" checked={todo.completed} readOnly />
          <span>{todo.text}</span>
        </li>
      ))}
    </ul>
  );
}`
        },
        {
          name: "styles.css",
          type: "code",
          language: "css",
          size: "1.1 KB",
          uploadedAt: "2026-08-10 17:41",
          content: `.todo-app-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.add-todo-form {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
}`
        },
        {
          name: "Daily_Report_Day10.pdf",
          type: "document",
          size: "520 KB",
          uploadedAt: "2026-08-10 17:42"
        }
      ]
    },
    {
      id: 2,
      day: "Day 15",
      task: "Predictive Model Python",
      date: "2026-08-15",
      submittedAt: "2026-08-15 19:15",
      aiScore: "92%",
      status: "Pending",
      feedback: "Waiting for mentor review.",
      githubUrl: "https://github.com/johndoe/python-predictive-model",
      files: [
        {
          name: "predictive_model.py",
          type: "code",
          language: "python",
          size: "3.8 KB",
          uploadedAt: "2026-08-15 19:10",
          content: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Step 1: Load dataset
print("Loading daily task dataset...")
df = pd.read_csv('dataset_clean.csv')

# Step 2: Data preprocessing & Feature Engineering
X = df.drop(columns=['target_score', 'user_id'])
y = df['target_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 3: Model Training
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# Step 4: Evaluation
predictions = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, predictions))
r2 = r2_score(y_test, predictions)

print(f"Model RMSE: {rmse:.4f}")
print(f"R2 Score: {r2:.4f}")`
        },
        {
          name: "dataset_clean.csv",
          type: "code",
          language: "csv",
          size: "14.2 KB",
          uploadedAt: "2026-08-15 19:12",
          content: `user_id,study_hours,practice_score,attendance_rate,target_score
INT001,4.5,88,95,85.2
INT002,6.0,92,98,91.0
INT003,3.0,70,85,72.4
INT004,5.5,95,96,89.8
INT005,2.5,65,80,68.0`
        },
        {
          name: "metrics_summary.json",
          type: "code",
          language: "json",
          size: "850 B",
          uploadedAt: "2026-08-15 19:14",
          content: `{
  "experiment_id": "EXP-2026-0815",
  "model_type": "RandomForestRegressor",
  "n_estimators": 100,
  "metrics": {
    "rmse": 2.415,
    "r2_score": 0.924,
    "accuracy_pct": "92%"
  },
  "status": "PASSED"
}`
        },
        {
          name: "Model_Analysis_Report.pdf",
          type: "document",
          size: "1.4 MB",
          uploadedAt: "2026-08-15 19:15"
        }
      ]
    },
    {
      id: 3,
      day: "Day 20",
      task: "Database Schema Design",
      date: "2026-08-20",
      submittedAt: "2026-08-20 16:30",
      aiScore: "78%",
      status: "Rejected",
      feedback: "Lacks normalization.",
      githubUrl: "https://github.com/johndoe/db-schema-design",
      files: [
        {
          name: "schema_v2.sql",
          type: "code",
          language: "sql",
          size: "2.9 KB",
          uploadedAt: "2026-08-20 16:25",
          content: `-- Database Schema Creation Script
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_submissions (
    id SERIAL PRIMARY KEY,
    intern_id INT REFERENCES users(id),
    task_name VARCHAR(150) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending'
);

CREATE TABLE submission_files (
    id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES daily_submissions(id),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL
);`
        },
        {
          name: "erd_architecture.png",
          type: "image",
          size: "680 KB",
          uploadedAt: "2026-08-20 16:28"
        },
        {
          name: "Database_Documentation.pdf",
          type: "document",
          size: "980 KB",
          uploadedAt: "2026-08-20 16:30"
        }
      ]
    }
  ];

  const getFileIcon = (fileName, type) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'py') return '🐍';
    if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') return '📄';
    if (ext === 'html' || ext === 'css') return '🎨';
    if (ext === 'sql') return '🗄️';
    if (ext === 'json' || ext === 'csv') return '📊';
    if (ext === 'pdf') return '📑';
    if (ext === 'zip' || ext === 'rar' || ext === 'tar') return '📦';
    if (ext === 'png' || ext === 'jpg' || ext === 'svg') return '🖼️';
    return '📄';
  };

  const getPillClass = (type) => {
    if (type === 'code') return 'file-pill-code';
    if (type === 'document') return 'file-pill-doc';
    if (type === 'archive') return 'file-pill-archive';
    if (type === 'image') return 'file-pill-image';
    return '';
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

        {/* Task Submissions Card */}
        <div className="card" style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Task Submissions</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                View and inspect daily task files submitted by {intern.name}. Click on any file to open preview.
              </p>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "6px 12px", borderRadius: "20px" }}>
              Total Submissions: {submissions.length}
            </span>
          </div>

          <div className="table-container">
            <table className="table" style={{ width: "100%", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ width: "14%", padding: "12px 16px" }}>Date</th>
                  <th style={{ width: "24%", padding: "12px 16px" }}>Task Name</th>
                  <th style={{ width: "18%", padding: "12px 16px" }}>Submitted Files</th>
                  <th style={{ width: "12%", padding: "12px 16px" }}>AI Score</th>
                  <th style={{ width: "12%", padding: "12px 16px" }}>Status</th>
                  <th style={{ width: "20%", padding: "12px 16px" }}>Mentor Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>{sub.date}</div>
                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>{sub.day}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>{sub.task}</div>
                      {sub.githubUrl && (
                        <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                          🔗 GitHub Repo
                        </a>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        className="file-pill file-pill-code"
                        style={{ padding: "6px 12px", fontSize: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", color: "#1d4ed8", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                        onClick={() => handleOpenFileViewer(sub, 0)}
                        title="Click to view & inspect submitted files"
                      >
                        <span>📁</span>
                        <span>{sub.files.length} Files</span>
                        <span style={{ fontSize: "10px", color: "#60a5fa" }}>▶</span>
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontWeight: 600, color: "#1f2937" }}>{sub.aiScore}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={`badge ${sub.status === 'Approved' ? 'badge-success' : sub.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#4b5563", lineHeight: "1.4" }}>
                      {sub.feedback}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submitted Files Interactive Viewer Modal */}
      {activeSubmission && (
        <div className="modal-overlay" onClick={() => { setActiveSubmission(null); setIsDownloadMenuOpen(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                    📁 Submitted Daily Task Files: {activeSubmission.task}
                  </h3>
                  <span className={`badge ${activeSubmission.status === 'Approved' ? 'badge-success' : activeSubmission.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {activeSubmission.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
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
                    style={{ padding: "6px 14px", background: "#0f172a", color: "#ffffff", borderRadius: "6px", fontSize: "12px", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    View on GitHub ↗
                  </a>
                )}

                {/* Direct Download All Files Button */}
                <button
                  className="download-dropdown-btn"
                  onClick={() => handleDownloadFile(`all_${activeSubmission.task.toLowerCase().replace(/\s+/g, '_')}_files.zip`)}
                  title={`Click to download all ${activeSubmission.files.length} submitted files`}
                  style={{ background: "#2563eb", color: "#ffffff", padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>⬇️ Download All Files (.zip)</span>
                </button>

                <button
                  onClick={() => setActiveSubmission(null)}
                  style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b", marginLeft: "4px" }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Toast / Notification banner */}
            {copyStatus && (
              <div style={{ background: "#3b82f6", color: "#ffffff", padding: "8px 16px", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
                {copyStatus}
              </div>
            )}

            {/* Modal Body */}
            <div className="modal-body">
              {/* File List Sidebar */}
              <div className="modal-sidebar">
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.5px" }}>
                  Submitted Files ({activeSubmission.files.length})
                </div>
                {activeSubmission.files.map((file, idx) => (
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
                {activeSubmission.files[activeFileIndex] && (
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
                          <b style={{ color: "#f8fafc" }}>{activeSubmission.files[activeFileIndex].name}</b>
                          <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "10px" }}>
                            Size: {activeSubmission.files[activeFileIndex].size} | Uploaded: {activeSubmission.files[activeFileIndex].uploadedAt}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {activeSubmission.files[activeFileIndex].type === "code" && (
                          <button
                            onClick={() => handleCopyCode(activeSubmission.files[activeFileIndex].content)}
                            style={{ padding: "5px 10px", background: "#334155", border: "none", color: "#f8fafc", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
                          >
                            📋 Copy Code
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadFile(activeSubmission.files[activeFileIndex].name)}
                          style={{ padding: "5px 10px", background: "#2563eb", border: "none", color: "#ffffff", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    </div>

                    {/* Content Display */}
                    {activeSubmission.files[activeFileIndex].type === "code" ? (
                      <div className="code-viewer">
                        {activeSubmission.files[activeFileIndex].content.split('\n').map((line, idx) => (
                          <div key={idx} style={{ display: "flex" }}>
                            <span style={{ width: "40px", color: "#64748b", userSelect: "none", flexShrink: 0 }}>
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
                        <h4 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>
                          {activeSubmission.files[activeFileIndex].name}
                        </h4>
                        <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
                          Binary / Document File ({activeSubmission.files[activeFileIndex].size})
                        </p>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDownloadFile(activeSubmission.files[activeFileIndex].name)}
                          style={{ padding: "10px 24px", fontSize: "14px" }}
                        >
                          ⬇️ Download Submitted File
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
    </div>
  );
}

