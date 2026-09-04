import { useState, useEffect, useRef } from "react";
import apiClient from "../services/apiClient";
import { adaptTaskFromApi, adaptTaskToApi } from "../utils/taskAdapters";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import "../styles/Dashboard.css";

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  // State Mock Data
  const [assignedInterns] = useState([
    { id: "INT001", name: "John Doe", progress: "60%", attendance: "95%", score: "82%", weakAreas: "CSS layouts, Async operations", batch: "Batch A" },
    { id: "INT002", name: "Raj Patel", progress: "80%", attendance: "90%", score: "88%", weakAreas: "Python pandas, Data visualization", batch: "Batch A" },
    { id: "INT003", name: "Anu Sharma", progress: "75%", attendance: "88%", score: "79%", weakAreas: "Buffer overflow details", batch: "Batch A" },
    { id: "INT004", name: "Sara Smith", progress: "90%", attendance: "98%", score: "94%", weakAreas: "None", batch: "Batch B" },
    { id: "INT005", name: "Mike Johnson", progress: "50%", attendance: "80%", score: "72%", weakAreas: "React Hooks", batch: "Batch B" },
  ]);

  const [selectedBatch, setSelectedBatch] = useState("Batch A");

  const [submissions, setSubmissions] = useState([
    { id: 1, intern: "John Doe", task: "React To-Do App", code: "const todoList = []; function add() { ... }", aiScore: "85%", aiFeedback: "Good structure. Suggestions: Use key attribute in list rendering.", status: "Pending", mentorFeedback: "", score: "" },
    { id: 2, intern: "Raj Patel", task: "Predictive Model Python", code: "import pandas as pd\nmodel.fit(X, y)", aiScore: "92%", aiFeedback: "Optimized hyperparameters. Suggestions: Include residual analysis plots.", status: "Pending", mentorFeedback: "", score: "" }
  ]);

  const [meetings, setMeetings] = useState([
    { id: 1, title: "Anu Weekly Review", time: "Today, 3:00 PM", status: "Upcoming" },
    { id: 2, title: "Raj Weekly Review", time: "Tomorrow, 10:00 AM", status: "Scheduled" }
  ]);

  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    apiClient.get("/api/auth/me")
      .then(res => setUserId(res.data.id))
      .catch(err => console.error("Could not fetch user ID:", err));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const baseUri = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
    const wsUri = baseUri.replace(/^http/, 'ws') + `/ws/chat/${userId}`;
    
    ws.current = new WebSocket(wsUri);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setChatMessages(prev => [...prev, {
        sender: "Intern", 
        text: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [userId]);


  const [selectedInternForChat, setSelectedInternForChat] = useState(null);

  // Weekly review state inputs
  const [weeklyIntern, setWeeklyIntern] = useState("John Doe");
  const [weeklyStrengths, setWeeklyStrengths] = useState("");
  const [weeklyWeaknesses, setWeeklyWeaknesses] = useState("");
  const [weeklyNotes, setWeeklyNotes] = useState("");

  const [mentorDomain] = useState("Artificial Intelligence");
  const [curriculumList] = useState([
    { day: "Day 1", topic: "Introduction to React", resources: "Video Link, Documentation PDF", domain: "Artificial Intelligence" },
    { day: "Day 2", topic: "State and Props", resources: "Github Repo, Slides PDF", domain: "Artificial Intelligence" },
  ]);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    domainId: 1,
    dayNumber: 1,
    title: "",
    description: "",
    notes: "",
    resources: "",
    deadlineDays: 1,
    mcqs: [],
    codingQuestion: null,
    testCases: [],
  });
  const [detailSubTab, setDetailSubTab] = useState("Curriculum");

  // Chart Data
  const backlogData = [
    { name: 'Week 1', Submitted: 40, Evaluated: 38 },
    { name: 'Week 2', Submitted: 45, Evaluated: 40 },
    { name: 'Week 3', Submitted: 50, Evaluated: 30 },
    { name: 'Week 4', Submitted: 60, Evaluated: 25 },
  ];

  const handleLogout = () => {
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  // Fetch tasks from backend on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const res = await apiClient.get("/api/tasks");
        setTasks(res.data.map(adaptTaskFromApi));
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setTasksError("Failed to load tasks. Please check your connection.");
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Create a new task via POST /api/tasks
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description) {
      alert("Task title and description are required.");
      return;
    }
    try {
      const payload = adaptTaskToApi(newTask);
      const res = await apiClient.post("/api/tasks", payload);
      const created = adaptTaskFromApi(res.data);
      setTasks((prev) => [...prev, created]);
      setShowCreateTask(false);
      setNewTask({
        domainId: 1, dayNumber: 1, title: "", description: "",
        notes: "", resources: "", deadlineDays: 1,
        mcqs: [], codingQuestion: null, testCases: [],
      });
      alert("Task created successfully!");
    } catch (err) {
      console.error("Failed to create task:", err);
      alert(err.response?.data?.detail || "Failed to create task.");
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    // Assume intern has ID 2 for this demo, or we can use selectedInternForChat
    const payload = {
      recipient_id: selectedInternForChat?.id || 2,
      message: currentMessage
    };
    
    ws.current.send(JSON.stringify(payload));
    setChatMessages(prev => [...prev, { sender: "You", text: currentMessage, time: "Just now" }]);
    setCurrentMessage("");
  };

  const handleReviewSubmission = (id, action, score, feedback) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id 
        ? { ...sub, status: action === "Approve" ? "Approved" : "Rejected", score: score, mentorFeedback: feedback } 
        : sub
    ));
    alert(`Submission has been ${action === "Approve" ? "Approved" : "Rejected"}!`);
  };

  const handleCreateMeeting = (title, time) => {
    if (!title || !time) return alert("Fill in title & time!");
    setMeetings([...meetings, { id: meetings.length + 1, title, time, status: "Scheduled" }]);
    alert("Meeting created!");
  };

  const handleWeeklySubmit = (e) => {
    e.preventDefault();
    alert(`Weekly Review Logged for ${weeklyIntern}!\nStrengths: ${weeklyStrengths}\nWeaknesses: ${weeklyWeaknesses}`);
    setWeeklyStrengths("");
    setWeeklyWeaknesses("");
    setWeeklyNotes("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>


            <div className="grid">
              <div className="stat-card">
                <span className="stat-title">Assigned Interns</span>
                <span className="stat-value">{assignedInterns.length}</span>
                <span className="stat-desc">Tracking active progression</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Pending Reviews</span>
                <span className="stat-value">{submissions.filter(s => s.status === "Pending").length}</span>
                <span className="stat-desc">Awaiting your feedback & score</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Meetings Today</span>
                <span className="stat-value">1</span>
                <span className="stat-desc">Review meeting at 3:00 PM</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Average Performance</span>
                <span className="stat-value">83%</span>
                <span className="stat-desc">Calculated score of assigned cohort</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="card" style={{ margin: 0, paddingBottom: 0 }}>
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Review Backlog Tracker</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={backlogData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dx={-10} />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Submitted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Evaluated" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>⚠️ At-Risk Interns</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700 }}>Mike Johnson</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Batch B</span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#475569" }}>Low progress (50%) and struggles with React Hooks.</p>
                    <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "#dc2626", borderColor: "#fca5a5", width: "100%", marginTop: "6px" }}>Schedule Intervention</button>
                  </div>
                  
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700 }}>Anu Sharma</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Batch A</span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#475569" }}>Missing assignments and attendance dropping.</p>
                    <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "#dc2626", borderColor: "#fca5a5", width: "100%", marginTop: "6px" }}>Send Message</button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
              <div className="card" style={{ marginBottom: 0 }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Upcoming Schedule</h3>
                <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#1f2937" }}>React Code Review</h4>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Today, 2:00 PM - 3:00 PM</span>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: "10px" }}>Meeting</span>
                  </div>
                  <div style={{ borderTop: "1px solid #e5e7eb" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#1f2937" }}>Final Project Submissions</h4>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Tomorrow, 11:59 PM</span>
                    </div>
                    <span className="badge badge-danger" style={{ fontSize: "10px" }}>Deadline</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Batch Leaderboard</h3>
                  <select 
                    value={selectedBatch} 
                    onChange={(e) => setSelectedBatch(e.target.value)} 
                    style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #e5e7eb", outline: "none", backgroundColor: "#f9fafb" }}
                  >
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                  </select>
                </div>
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="table" style={{ margin: 0, fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "8px 12px" }}>Rank</th>
                        <th style={{ padding: "8px 12px" }}>Intern Name</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...assignedInterns]
                        .filter(intern => intern.batch === selectedBatch)
                        .sort((a, b) => parseInt(b.score) - parseInt(a.score))
                        .map((intern, index) => (
                        <tr key={intern.id}>
                          <td style={{ padding: "8px 12px" }}>
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{intern.name}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right" }}><span className="badge badge-primary">{intern.score}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        );

      case "Cohort":
        return (
          <div>
            {/* Row 1: Interns List */}
            <div className="card">
              <h3>Assigned Interns Cohort</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Name</th><th>Progress</th><th>Avg Score</th><th>Weak Areas</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedInterns.map(i => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td><b>{i.name}</b></td>
                        <td>{i.progress}</td>
                        <td><b>{i.score}</b></td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{i.weakAreas}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => setSelectedInternForChat(i.name)} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "12px" }}>
                              Chat
                            </button>
                            <button onClick={() => handleCreateMeeting(`${i.name} - Code Review`, "Tomorrow, 2:00 PM")} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }}>
                              Review Meeting
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 2: Meetings Planner */}
            <div className="card">
              <h3>Review Meetings Planner</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Meeting Title</th><th>Scheduled Time</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {meetings.map((m, idx) => (
                      <tr key={idx}>
                        <td><b>{m.title}</b></td>
                        <td>{m.time}</td>
                        <td><span className="badge badge-success">{m.status}</span></td>
                        <td><button onClick={() => alert("Joining mock Zoom room...")} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }}>Join Room</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );

      case "Evaluations":
        return (
          <div>
            {/* Row 1: Submissions review & grading */}
            <div className="card">
              {submissions.filter(s => s.status === "Pending").length === 0 ? (
                <p><b>🎉 All submissions have been evaluated!</b></p>
              ) : (
                submissions.filter(s => s.status === "Pending").map(sub => {
                  let tempScore = "";
                  let tempFeedback = "";
                  return (
                    <div key={sub.id} className="card" style={{ border: "1px solid #E5E7EB", background: "#ffffff", marginBottom: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {/* Left Side: Intern Details & AI Analysis */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "16px" }}>
                              {sub.intern.split(" ")[0][0]}{sub.intern.split(" ")[1] ? sub.intern.split(" ")[1][0] : ""}
                            </div>
                            <div>
                              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>{sub.intern}</h4>
                              <div style={{ fontSize: "13px", color: "#6b7280" }}>Task: <span style={{ fontWeight: 600, color: "#374151" }}>{sub.task}</span></div>
                            </div>
                          </div>
                          
                          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#1E3A8A" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, marginBottom: "4px", fontSize: "13px" }}>
                              <span>🤖</span> AI Evaluation: {sub.aiScore}
                            </div>
                            <div style={{ lineHeight: "1.5" }}>{sub.aiFeedback}</div>
                          </div>
                        </div>

                        {/* Right Side: GitHub, Inputs & Actions */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div style={{ alignSelf: "flex-end" }}>
                            <a href="https://github.com/mock-intern/repo" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "#24292e", color: "#ffffff", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600", transition: "opacity 0.2s" }}>
                              <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true" fill="currentColor">
                                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                              </svg>
                              View on GitHub
                            </a>
                          </div>

                          <div style={{ marginTop: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px" }}>
                              <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4b5563", marginBottom: "4px" }}>Final Score</label>
                                <input className="form-control" placeholder="e.g. 85%" onChange={(e) => { tempScore = e.target.value; }} style={{ margin: 0 }} />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4b5563", marginBottom: "4px" }}>Mentor Feedback</label>
                                <input className="form-control" placeholder="Constructive remarks..." onChange={(e) => { tempFeedback = e.target.value; }} style={{ margin: 0 }} />
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleReviewSubmission(sub.id, "Reject", "0%", tempFeedback || "Needs rework")} className="btn btn-secondary" style={{ color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "#fef2f2", padding: "8px 24px" }}>Reject</button>
                              <button onClick={() => handleReviewSubmission(sub.id, "Approve", tempScore || "80%", tempFeedback || "Approved")} className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981", padding: "8px 24px" }}>Approve</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case "Programs":
        return (
          <div className="card">
            <h3 style={{ margin: "0 0 20px 0" }}>Program Details - {mentorDomain}</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button 
                className={`btn ${detailSubTab === "Curriculum" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setDetailSubTab("Curriculum")}
              >Curriculum</button>
              <button 
                className={`btn ${detailSubTab === "Tasks" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setDetailSubTab("Tasks")}
              >Tasks</button>
            </div>

            {detailSubTab === "Curriculum" && (
              <div className="table-container" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                <table className="table">
                  <thead>
                    <tr><th>Day</th><th>Topic / Focus</th><th>Tasks/Resources</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {curriculumList.map((cur, i) => (
                      <tr key={`custom-${i}`}>
                        <td style={{ width: "80px", fontWeight: "600", color: "#4b5563" }}>{cur.day}</td>
                        <td><b>{cur.topic}</b></td>
                        <td>{cur.resources}</td>
                        <td><span className="badge badge-success" style={{ fontSize: "10px" }}>Active</span></td>
                      </tr>
                    ))}
                    {[...Array(30 - curriculumList.length)].map((_, i) => (
                      <tr key={i}>
                        <td style={{ width: "80px", fontWeight: "600", color: "#4b5563" }}>Day {i + 1 + curriculumList.length}</td>
                        <td><b>{i + curriculumList.length === 14 ? "Mid-term Assessment" : `Advanced Concepts Part ${i}`}</b></td>
                        <td>Reading Materials, Lab Exercise</td>
                        <td><span className="badge badge-secondary" style={{ fontSize: "10px" }}>Upcoming</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailSubTab === "Tasks" && (
              <div>
                {/* Loading / Error States */}
                {tasksLoading && (
                  <p style={{ color: "#6b7280", padding: "16px" }}>⏳ Loading tasks from server...</p>
                )}
                {tasksError && (
                  <div style={{ padding: "12px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "16px" }}>
                    ⚠️ {tasksError}
                  </div>
                )}

                {/* Edit form */}
                {editingTask && !showCreateTask ? (
                  <div className="card" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <h4>Edit Task #{editingTask.id}</h4>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
                      setEditingTask(null);
                    }} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "500px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600 }}>Task Title *</label>
                        <input className="form-control" type="text" value={editingTask.title}
                          onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600 }}>Description</label>
                        <textarea className="form-control" rows="3" value={editingTask.description || ""}
                          onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: 600 }}>Day Number</label>
                          <input className="form-control" type="number" min="1" value={editingTask.dayNumber || 1}
                            onChange={(e) => setEditingTask({ ...editingTask, dayNumber: parseInt(e.target.value) })} />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: 600 }}>Deadline (days)</label>
                          <input className="form-control" type="number" min="1" value={editingTask.deadlineDays || 1}
                            onChange={(e) => setEditingTask({ ...editingTask, deadlineDays: parseInt(e.target.value) })} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button type="submit" className="btn btn-primary">Save (Local)</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingTask(null)}>Cancel</button>
                      </div>
                      <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                        ℹ️ Backend PUT endpoint is not yet implemented — changes are saved locally.
                      </p>
                    </form>
                  </div>

                ) : showCreateTask ? (
                  /* Create Task Form */
                  <div className="card" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <h4 style={{ margin: "0 0 16px 0", color: "#166534" }}>➕ Create New Task</h4>
                    <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600 }}>Task Title *</label>
                        <input className="form-control" type="text" placeholder="e.g. Build a Neural Network"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600 }}>Description *</label>
                        <textarea className="form-control" rows="3" placeholder="Describe the task objective..."
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: 600 }}>Domain ID</label>
                          <input className="form-control" type="number" min="1" value={newTask.domainId}
                            onChange={(e) => setNewTask({ ...newTask, domainId: parseInt(e.target.value) })} />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: 600 }}>Day Number</label>
                          <input className="form-control" type="number" min="1" value={newTask.dayNumber}
                            onChange={(e) => setNewTask({ ...newTask, dayNumber: parseInt(e.target.value) })} />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", fontWeight: 600 }}>Deadline (days)</label>
                          <input className="form-control" type="number" min="1" value={newTask.deadlineDays}
                            onChange={(e) => setNewTask({ ...newTask, deadlineDays: parseInt(e.target.value) })} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600 }}>Notes / Resources (optional)</label>
                        <input className="form-control" type="text" placeholder="PDF links, GitHub repos..."
                          value={newTask.resources}
                          onChange={(e) => setNewTask({ ...newTask, resources: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: 600 }}>Coding Prompt (optional)</label>
                        <textarea className="form-control" rows="2" placeholder="e.g. Write a function that returns..."
                          value={newTask.codingQuestion?.prompt || ""}
                          onChange={(e) => setNewTask({ ...newTask, codingQuestion: { prompt: e.target.value } })} />
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}>
                          Create Task
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTask(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>

                ) : (
                  /* Task List Table */
                  <div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                      <button className="btn btn-primary" style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                        onClick={() => setShowCreateTask(true)}>
                        ➕ Create New Task
                      </button>
                    </div>
                    {!tasksLoading && tasks.length === 0 && !tasksError && (
                      <p style={{ color: "#9ca3af", textAlign: "center", padding: "24px" }}>
                        No tasks found. Create your first task above.
                      </p>
                    )}
                    {tasks.length > 0 && (
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Task Title</th>
                              <th>Day</th>
                              <th>Deadline (days)</th>
                              <th>MCQs</th>
                              <th>Coding</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tasks.map((t) => (
                              <tr key={t.id}>
                                <td style={{ color: "#6b7280", fontSize: "12px" }}>#{t.id}</td>
                                <td><b>{t.title}</b></td>
                                <td>Day {t.dayNumber}</td>
                                <td>{t.deadlineDays}d</td>
                                <td>
                                  <span className={`badge ${t.mcqs?.length > 0 ? "badge-success" : "badge-secondary"}`}>
                                    {t.mcqs?.length > 0 ? `${t.mcqs.length} Qs` : "None"}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${t.codingQuestion ? "badge-primary" : "badge-secondary"}`}>
                                    {t.codingQuestion ? "Yes" : "No"}
                                  </span>
                                </td>
                                <td>
                                  <button className="btn btn-secondary"
                                    style={{ padding: "4px 8px", fontSize: "12px" }}
                                    onClick={() => setEditingTask(t)}>
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div>
          <h2>Mentor Panel</h2>
          <ul>
            {[
              "Overview",
              "Cohort",
              "Evaluations",
              "Programs"
            ].map((tab) => (
              <li
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main">
        <div className="header">
          <h2>{activeTab}</h2>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
            Role: <b>Mentor</b>
          </span>
        </div>

        {renderContent()}
      </div>

      {/* Floating Side Chat Popup */}
      {selectedInternForChat && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "320px",
          height: "450px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          {/* Chat Header */}
          <div style={{ padding: "12px 16px", backgroundColor: "#1e293b", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", backgroundColor: "#10b981", borderRadius: "50%" }}></div>
              Chat with {selectedInternForChat}
            </div>
            <button onClick={() => setSelectedInternForChat(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "4px" }}>✖</button>
          </div>

          {/* Chat Messages */}
          <div style={{ flexGrow: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc" }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8", display: "block", marginBottom: "4px", textAlign: msg.sender === "You" ? "right" : "left" }}>
                  {msg.sender === "You" ? "" : `${msg.sender} • `}{msg.time}
                </span>
                <div style={{ 
                  backgroundColor: msg.sender === "You" ? "#3b82f6" : "#ffffff", 
                  color: msg.sender === "You" ? "#ffffff" : "#1e293b", 
                  padding: "8px 12px", 
                  borderRadius: msg.sender === "You" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", 
                  border: msg.sender !== "You" ? "1px solid #e2e8f0" : "none",
                  fontSize: "13px",
                  lineHeight: "1.4"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} style={{ display: "flex", padding: "12px", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={currentMessage} 
              onChange={(e) => setCurrentMessage(e.target.value)} 
              style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "20px", padding: "8px 16px", fontSize: "13px", outline: "none", backgroundColor: "#f8fafc" }} 
            />
            <button type="submit" style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "600", cursor: "pointer", marginLeft: "12px" }}>Send</button>
          </form>
        </div>
      )}

    </div>
  );
}