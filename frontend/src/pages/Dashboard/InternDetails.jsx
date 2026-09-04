import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, FileText, ArrowLeft, LogOut } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import "../../styles/Dashboard.css";

export default function InternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

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
      {/* Main Content Area */}
      <div className="main" style={{ overflowY: "auto", width: "100%", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0", marginBottom: "24px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>Intern Details: {intern.name}</h2>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
                ID: <b>{intern.id}</b> | Batch: <b>{intern.batch}</b>
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
                  color: activeTab === "Overview" ? "#3b82f6" : "#64748b",
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
                  color: activeTab === "Task Submissions" ? "#3b82f6" : "#64748b",
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
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "20px", alignItems: "start" }}>
              {/* Left Column: Stats & Profile */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="card" style={{ margin: 0, padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 16px 0", color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Intern Profile <span className="badge badge-success" style={{ fontSize: "12px" }}>Active</span>
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Domain</span>
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>{intern.domain}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Batch</span>
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>{intern.batch}</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ margin: 0, padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 20px 0", color: "#1e293b" }}>Core Metrics</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                        <span style={{ color: "#475569" }}>Overall Progress</span>
                        <span style={{ fontWeight: 700, color: "#3b82f6" }}>{intern.progress}%</span>
                      </div>
                      <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px" }}><div style={{ width: `${intern.progress}%`, backgroundColor: "#3b82f6", height: "100%", borderRadius: "4px" }}></div></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                        <span style={{ color: "#475569" }}>Average Score</span>
                        <span style={{ fontWeight: 700, color: "#10b981" }}>{intern.score}%</span>
                      </div>
                      <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px" }}><div style={{ width: `${intern.score}%`, backgroundColor: "#10b981", height: "100%", borderRadius: "4px" }}></div></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                        <span style={{ color: "#475569" }}>Attendance</span>
                        <span style={{ fontWeight: 700, color: "#f59e0b" }}>{intern.attendance}%</span>
                      </div>
                      <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px" }}><div style={{ width: `${intern.attendance}%`, backgroundColor: "#f59e0b", height: "100%", borderRadius: "4px" }}></div></div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ margin: 0, padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 16px 0", color: "#1e293b" }}>Strengths & Weaknesses</h3>
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ color: "#10b981", margin: "0 0 8px 0", fontSize: "14px" }}>👍 Strengths</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {intern.strengths.split(", ").map((s, i) => <span key={i} className="badge badge-success" style={{ fontSize: "12px", padding: "4px 8px" }}>{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ color: "#ef4444", margin: "0 0 8px 0", fontSize: "14px" }}>⚠️ Areas for Improvement</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {intern.weakAreas.split(", ").map((w, i) => <span key={i} className="badge badge-danger" style={{ backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "12px", padding: "4px 8px" }}>{w}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Chart & Activity */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="card" style={{ margin: 0, padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 20px 0", color: "#1e293b" }}>Performance Trend</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={performanceData} margin={{ top: 5, right: 10, bottom: -5, left: -25 }}>
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: "14px" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="card" style={{ margin: 0, padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 20px 0", color: "#1e293b" }}>Recent Activity</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#3b82f6", zIndex: 1 }}></div>
                        <div style={{ width: "2px", height: "100%", backgroundColor: "#e2e8f0", marginTop: "4px" }}></div>
                      </div>
                      <div style={{ paddingBottom: "16px" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#1e293b", fontWeight: 500 }}>Submitted <b>React To-Do App</b> for review.</p>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>Today, 10:30 AM</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#10b981", zIndex: 1 }}></div>
                        <div style={{ width: "2px", height: "100%", backgroundColor: "#e2e8f0", marginTop: "4px" }}></div>
                      </div>
                      <div style={{ paddingBottom: "16px" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#1e293b", fontWeight: 500 }}>Attended <b>Daily Standup</b> meeting.</p>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>Yesterday, 04:15 PM</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#8b5cf6", zIndex: 1 }}></div>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#1e293b", fontWeight: 500 }}>Completed <b>React Hooks Module</b>.</p>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>Aug 25, 11:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Goals */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="card" style={{ margin: 0, padding: "20px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 16px 0", color: "#b45309" }}>Mentor Action Items</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "#92400e" }}>Review React To-Do App</h4>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: 600 }}>Overdue by 1 day</span>
                        <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => setActiveTab("Task Submissions")}>Review</button>
                      </div>
                    </div>
                    <div style={{ backgroundColor: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "#92400e" }}>Schedule 1-on-1</h4>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#b45309" }}>Discuss progress</span>
                        <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px", backgroundColor: "#fff", border: "1px solid #cbd5e1" }}>Schedule</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ margin: 0, padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 16px 0", color: "#1e293b" }}>Current Goals</h3>
                  <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#475569", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <li>Improve state management understanding and use of context.</li>
                    <li>Contribute to the team's main repository via PRs.</li>
                    <li>Participate more actively in breakout sessions.</li>
                  </ul>
                </div>

                <div className="card" style={{ margin: 0, padding: "20px", backgroundColor: "#f0fdf4", border: "1px solid #dcfce3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <h3 style={{ fontSize: "16px", margin: "0 0 12px 0", color: "#166534" }}>Peer Review Score</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontSize: "36px", fontWeight: 700, color: "#15803d" }}>4.8</span>
                    <span style={{ fontSize: "16px", color: "#166534" }}>/ 5.0</span>
                  </div>
                  <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#166534" }}>Based on 3 recent peer evaluations</p>
                </div>
              </div>
            </div>
          </>
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
              Total Submissions: 24
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
                {Array.from({length: 30}, (_, i) => {
                  const dayStr = `Day ${i + 1}`;
                  // Simulate 24 submitted tasks
                  const isSubmitted = i < 24;
                  
                  const dateStr = `2026-08-${String(i + 1).padStart(2, '0')}`;
                  const taskName = isSubmitted ? `Daily Task ${i + 1}` : "No Task Scheduled";
                  const score = isSubmitted ? `${80 + (i % 15)}%` : "-";
                  const status = isSubmitted ? "Approved" : "Not Submitted";
                  const feedback = isSubmitted ? "Good implementation. Minor UI issues." : "-";
                  const githubUrl = isSubmitted ? `https://github.com/johndoe/task-${i+1}` : null;

                  return (
                    <tr key={dayStr}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>{isSubmitted ? dateStr : "-"}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{dayStr}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: isSubmitted ? "#1f2937" : "#9ca3af", fontStyle: isSubmitted ? "normal" : "italic" }}>{taskName}</div>
                        {isSubmitted && githubUrl && (
                          <a href={githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                            🔗 GitHub Repo
                          </a>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                         {isSubmitted ? (
                           <div style={{ display: "flex", gap: "8px" }}>
                             <span className="file-pill" style={{ padding: "6px 12px", fontSize: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#475569", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                               📄 MCQ_{dayStr.replace(" ", "")}.pdf
                             </span>
                           </div>
                         ) : (
                           <span style={{ color: "#d1d5db" }}>-</span>
                         )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontWeight: 600, color: isSubmitted ? "#1f2937" : "#d1d5db" }}>{score}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {isSubmitted ? (
                           <span className={`badge badge-success`}>{status}</span>
                        ) : (
                           <span className="badge badge-secondary" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>{status}</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: isSubmitted ? "#4b5563" : "#d1d5db", lineHeight: "1.4" }}>
                        {feedback}
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

