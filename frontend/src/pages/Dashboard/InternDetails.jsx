import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, FileText, ArrowLeft, ThumbsUp, AlertCircle, Calendar, CheckCircle, Star, Clock, TrendingUp, Award, Lock, Target, Zap, Users, Activity, FileCode, Database, Image, Folder, ExternalLink, Download, Copy, X } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { PageContainer } from "../../components/layout/PageContainer";
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
    if (ext === 'py' || ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx' || ext === 'html' || ext === 'css') return <FileCode size={16} color="#3b82f6" />;
    if (ext === 'sql' || ext === 'json' || ext === 'csv') return <Database size={16} color="#10b981" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'svg') return <Image size={16} color="#8b5cf6" />;
    if (ext === 'zip' || ext === 'rar' || ext === 'tar') return <Folder size={16} color="#f59e0b" />;
    return <FileText size={16} color="#64748b" />;
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
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "20px", borderBottom: "1px solid var(--border-color)", marginBottom: "24px" }}>
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
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>18 / 30</h3>
                    <span style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700 }}>{intern.progress}%</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>Days Completed</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "5px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${intern.progress}%`, background: "#2563eb", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              {/* Tasks Completed */}
              <div style={{ padding: "13px 14px", background: "var(--surface-blue, #EFF7FF)", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>16 / 24</h3>
                    <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700 }}>67%</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>Tasks Completed</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "5px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: "67%", background: "#16a34a", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              {/* Average Score */}
              <div style={{ padding: "13px 14px", background: "var(--surface-blue, #EFF7FF)", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Star size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>{intern.score}%</h3>
                    <span style={{ fontSize: "0.78rem", color: "#9333ea", fontWeight: 700 }}>Avg Score</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>Assessment Score</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "5px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${intern.score}%`, background: "#9333ea", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              {/* Attendance */}
              <div style={{ padding: "13px 14px", background: "var(--surface-blue, #EFF7FF)", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>{intern.attendance}%</h3>
                    <span style={{ fontSize: "0.78rem", color: "#ea580c", fontWeight: 700 }}>Excellent</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "6px" }}>Attendance Rate</span>
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
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Performance Trend</h3>
                    <p style={{ margin: "3px 0 0 0", fontSize: "0.78rem", color: "#64748b" }}>Weekly score trajectory</p>
                  </div>
                  <div style={{ padding: "4px 10px", background: "#f8fafc", borderRadius: "7px", border: "1px solid #e2e8f0", fontSize: "0.78rem", color: "#334155", fontWeight: 600 }}>Last 4 Weeks</div>
                </div>
                <ResponsiveContainer width="100%" height={155}>
                  <LineChart data={performanceData} margin={{ top: 5, right: 10, bottom: -5, left: -25 }}>
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} />
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[60, 100]} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Column 2: Skill Development */}
              <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Skill Development</h3>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.78rem", color: "#64748b" }}>Growth across key areas</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, justifyContent: "center" }}>
                  {[
                    { name: "Problem Solving", val: 84 },
                    { name: "Data Structures", val: 76 },
                    { name: "React / Frontend", val: 60 },
                    { name: "Async Operations", val: 55 },
                    { name: "CSS & Layouts", val: 48 },
                  ].map(skill => (
                    <div key={skill.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#334155" }}>{skill.name}</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>{skill.val}%</span>
                      </div>
                      <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${skill.val}%`, background: skill.val >= 75 ? "#16a34a" : skill.val >= 60 ? "#2563eb" : "#f59e0b", height: "100%", borderRadius: "3px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Performance Overview Donut */}
              <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Performance Overview</h3>
                <div style={{ position: "relative", width: "118px", height: "118px", margin: "0 auto 10px auto" }}>
                  <svg width="100%" height="100%" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="68" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                    <circle cx="80" cy="80" r="68" fill="none" stroke="#2563eb" strokeWidth="16"
                      strokeDasharray={`${(intern.score / 100) * 427} 427`}
                      strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 80 80)" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>{intern.score}%</span>
                    <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Overall</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }}></div><span style={{ color: "#475569", fontSize: "0.82rem" }}>MCQ Score</span></div>
                    <strong style={{ fontSize: "0.82rem" }}>85%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }}></div><span style={{ color: "#475569", fontSize: "0.82rem" }}>AI Evaluation</span></div>
                    <strong style={{ fontSize: "0.82rem" }}>88%</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></div><span style={{ color: "#475569", fontSize: "0.82rem" }}>Mentor Reviews</span></div>
                    <strong style={{ fontSize: "0.82rem" }}>79%</strong>
                  </div>
                </div>
                <div style={{ marginTop: "10px", padding: "7px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <TrendingUp size={14} color="#16a34a" />
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#166534" }}>Above average! Keep it up.</p>
                </div>
              </div>
            </div>

            {/* === ROW 3: Bottom Grid === */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>

              {/* Strengths & Weaknesses */}
              <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Strengths & Areas</h3>
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
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#92400e" }}>Review React To-Do App</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600 }}>Overdue by 1 day</span>
                      <button className="btn btn-primary" style={{ padding: "4px 11px", fontSize: "12px" }} onClick={() => setActiveTab("Task Submissions")}>Review</button>
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "9px 11px", borderRadius: "9px", border: "1px solid #fde68a" }}>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#92400e" }}>Schedule 1-on-1</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#b45309" }}>Discuss progress</span>
                      <button className="btn btn-secondary" style={{ padding: "4px 11px", fontSize: "12px", backgroundColor: "#fff", border: "1px solid #cbd5e1" }}>Schedule</button>
                    </div>
                  </div>
                  <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "9px 11px", borderRadius: "9px", border: "1px solid #fde68a" }}>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#92400e" }}>Current Goals</h4>
                    <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "12px", color: "#78350f", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <li>Improve state management</li>
                      <li>Contribute to team repo via PRs</li>
                      <li>Be more active in breakout sessions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Activity + Peer Score */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: "var(--surface-blue, #EFF7FF)", padding: "13px 14px", borderRadius: "14px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Recent Activity</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                    {[
                      { color: "#2563eb", text: "Submitted React To-Do App for review", time: "Today, 10:30 AM" },
                      { color: "#16a34a", text: "Attended Daily Standup meeting", time: "Yesterday, 4:15 PM" },
                      { color: "#8b5cf6", text: "Completed React Hooks Module", time: "Aug 25, 11:00 AM" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: "4px" }}></div>
                        <div>
                          <p style={{ margin: "0 0 2px 0", fontSize: "0.82rem", color: "#1e293b", fontWeight: 500 }}>{item.text}</p>
                          <span style={{ fontSize: "0.73rem", color: "#64748b" }}>{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#f0fdf4", border: "1px solid #dcfce3", padding: "13px 14px", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ fontSize: "0.88rem", margin: "0 0 6px 0", color: "#166534", fontWeight: 700 }}>Peer Review Score</h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "#15803d" }}>4.8</span>
                    <span style={{ fontSize: "13px", color: "#166534" }}>/ 5.0</span>
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11.5px", color: "#166534" }}>Based on 3 recent evaluations</p>
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
                            <ExternalLink size={12} /> GitHub Repo
                          </a>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                         {isSubmitted ? (
                           <div style={{ display: "flex", gap: "8px" }}>
                             <span className="file-pill" style={{ padding: "6px 12px", fontSize: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#475569", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                               <FileText size={14} color="#64748b" /> MCQ_{dayStr.replace(" ", "")}.pdf
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
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Folder size={18} color="#2563eb" /> Submitted Daily Task Files: {activeSubmission.task}
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
                    View on GitHub <ExternalLink size={12} />
                  </a>
                )}

                {/* Direct Download All Files Button */}
                <button
                  className="download-dropdown-btn"
                  onClick={() => handleDownloadFile(`all_${activeSubmission.task.toLowerCase().replace(/\s+/g, '_')}_files.zip`)}
                  title={`Click to download all ${activeSubmission.files.length} submitted files`}
                  style={{ background: "#2563eb", color: "#ffffff", padding: "6px 14px", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} /> Download All Files (.zip)
                </button>

                <button
                  onClick={() => setActiveSubmission(null)}
                  style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b", marginLeft: "4px" }}
                >
                  <X size={22} />
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
                            style={{ padding: "5px 10px", background: "#334155", border: "none", color: "#f8fafc", borderRadius: "4px", fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Copy size={12} /> Copy Code
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadFile(activeSubmission.files[activeFileIndex].name)}
                          style={{ padding: "5px 10px", background: "#2563eb", border: "none", color: "#ffffff", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Download size={12} /> Download
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

