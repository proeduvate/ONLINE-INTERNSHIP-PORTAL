import { useState } from "react";
import "../styles/Dashboard.css";

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  // State Mock Data
  const [assignedInterns] = useState([
    { id: "INT001", name: "John Doe", progress: "60%", attendance: "95%", score: "82%", weakAreas: "CSS layouts, Async operations" },
    { id: "INT002", name: "Raj Patel", progress: "80%", attendance: "90%", score: "88%", weakAreas: "Python pandas, Data visualization" },
    { id: "INT003", name: "Anu Sharma", progress: "75%", attendance: "88%", score: "79%", weakAreas: "Buffer overflow details" },
  ]);

  const [submissions, setSubmissions] = useState([
    { id: 1, intern: "John Doe", task: "React To-Do App", code: "const todoList = []; function add() { ... }", aiScore: "85%", aiFeedback: "Good structure. Suggestions: Use key attribute in list rendering.", status: "Pending", mentorFeedback: "", score: "" },
    { id: 2, intern: "Raj Patel", task: "Predictive Model Python", code: "import pandas as pd\nmodel.fit(X, y)", aiScore: "92%", aiFeedback: "Optimized hyperparameters. Suggestions: Include residual analysis plots.", status: "Pending", mentorFeedback: "", score: "" }
  ]);

  const [meetings, setMeetings] = useState([
    { id: 1, title: "Anu Weekly Review", time: "Today, 3:00 PM", status: "Upcoming" },
    { id: 2, title: "Raj Weekly Review", time: "Tomorrow, 10:00 AM", status: "Scheduled" }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { sender: "John Doe", text: "Hello mentor, when is my React code evaluation meeting?", time: "10:15 AM" },
    { sender: "You", text: "Hi John, I will schedule it for tomorrow at 2:00 PM.", time: "10:30 AM" }
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedInternForChat, setSelectedInternForChat] = useState("John Doe");

  // Weekly review state inputs
  const [weeklyIntern, setWeeklyIntern] = useState("John Doe");
  const [weeklyStrengths, setWeeklyStrengths] = useState("");
  const [weeklyWeaknesses, setWeeklyWeaknesses] = useState("");
  const [weeklyNotes, setWeeklyNotes] = useState("");

  const handleLogout = () => {
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    setChatMessages([...chatMessages, { sender: "You", text: currentMessage, time: "Just now" }]);
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
            {/* Top Row: Mentor Profile Card */}
            <div className="card" style={{ display: "flex", gap: "20px", alignItems: "center", padding: "16px 24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#10B981", color: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "bold" }}>
                M
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px" }}>Dr. Sakthi</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Senior AI & Web Systems Mentor | <b>Active</b></p>
              </div>
            </div>

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

            <div className="card">
              <h3>Cohort Performance Analytics</h3>
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: "13px" }}><b>Submission rate:</b> 96% | <b>Average Attendance:</b> 91%</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <span className="badge badge-success">Top Domain: Artificial Intelligence</span>
                  <span className="badge badge-warning">Needs work: Async CSS styling</span>
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
                      <th>ID</th><th>Name</th><th>Progress</th><th>Attendance</th><th>Avg Score</th><th>Weak Areas</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedInterns.map(i => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td><b>{i.name}</b></td>
                        <td>{i.progress}</td>
                        <td>{i.attendance}</td>
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

            {/* Row 3: Restricted Chat Messages */}
            <div className="card">
              <h3>Direct Messages (Restricted: Mentor ↔ Assigned Intern Only)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "20px", border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", minHeight: "300px" }}>
                <div style={{ background: "#f9fafb", borderRight: "1px solid #E5E7EB", padding: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280" }}>Select Cohort Member</span>
                  <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                    {assignedInterns.map(i => (
                      <li 
                        key={i.id}
                        onClick={() => setSelectedInternForChat(i.name)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          backgroundColor: selectedInternForChat === i.name ? "#2563EB" : "transparent",
                          color: selectedInternForChat === i.name ? "#FFFFFF" : "#1F2937",
                          fontSize: "13px",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        {i.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "300px" }}>
                  <div style={{ padding: "10px", borderBottom: "1px solid #E5E7EB", fontWeight: "700", fontSize: "14px" }}>
                    Chatting with {selectedInternForChat}
                  </div>
                  <div style={{ padding: "12px", overflowY: "auto", flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                        <span style={{ fontSize: "9px", color: "#6B7280" }}>{msg.sender} • {msg.time}</span>
                        <div style={{ background: msg.sender === "You" ? "#2563EB" : "#F3F4F6", color: msg.sender === "You" ? "#FFFFFF" : "#1F2937", padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendChatMessage} style={{ display: "flex", borderTop: "1px solid #E5E7EB" }}>
                    <input type="text" placeholder="Type message..." className="form-control" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} style={{ border: "none", borderRadius: 0 }} />
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: 0 }}>Send</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );

      case "Evaluations":
        return (
          <div>
            {/* Row 1: Submissions review & grading */}
            <div className="card">
              <h3>Submission Evaluations</h3>
              {submissions.filter(s => s.status === "Pending").length === 0 ? (
                <p><b>🎉 All submissions have been evaluated!</b></p>
              ) : (
                submissions.filter(s => s.status === "Pending").map(sub => {
                  let tempScore = "";
                  let tempFeedback = "";
                  return (
                    <div key={sub.id} className="card" style={{ border: "1px solid #E5E7EB", background: "#f9fafb", marginBottom: "16px" }}>
                      <h4><b>Intern:</b> {sub.intern} | <b>Task:</b> {sub.task}</h4>
                      <pre style={{ background: "#FFFFFF", padding: "10px", border: "1px solid #E5E7EB", borderRadius: "4px", fontSize: "12px", fontFamily: "monospace", margin: "10px 0" }}>{sub.code}</pre>
                      
                      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "10px", borderRadius: "4px", fontSize: "12px", color: "#1E3A8A", marginBottom: "12px" }}>
                        <b>🤖 AI Score: {sub.aiScore}</b> - {sub.aiFeedback}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginBottom: "12px" }}>
                        <input className="form-control" placeholder="Score (e.g. 85%)" onChange={(e) => { tempScore = e.target.value; }} />
                        <input className="form-control" placeholder="Feedback remarks..." onChange={(e) => { tempFeedback = e.target.value; }} />
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleReviewSubmission(sub.id, "Approve", tempScore || "80%", tempFeedback || "Approved")} className="btn btn-primary">Approve</button>
                        <button onClick={() => handleReviewSubmission(sub.id, "Reject", "0%", tempFeedback || "Needs rework")} className="btn btn-danger">Reject</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Row 2: Weekly standing reviews */}
            <div className="card">
              <h3>Weekly Review Logging</h3>
              <form onSubmit={handleWeeklySubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <select className="form-control" value={weeklyIntern} onChange={(e) => setWeeklyIntern(e.target.value)}>
                  {assignedInterns.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                </select>
                <input className="form-control" placeholder="Strengths..." value={weeklyStrengths} onChange={(e) => setWeeklyStrengths(e.target.value)} />
                <input className="form-control" placeholder="Weaknesses..." value={weeklyWeaknesses} onChange={(e) => setWeeklyWeaknesses(e.target.value)} />
                <textarea className="form-control" placeholder="Standup notes..." value={weeklyNotes} onChange={(e) => setWeeklyNotes(e.target.value)} style={{ gridColumn: "span 3" }} />
                <button type="submit" className="btn btn-primary" style={{ gridColumn: "span 3" }}>Log Weekly Standup</button>
              </form>
            </div>
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
              "Evaluations"
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
    </div>
  );
}