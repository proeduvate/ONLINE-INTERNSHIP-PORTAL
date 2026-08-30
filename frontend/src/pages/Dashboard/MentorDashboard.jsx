import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import AnalyticsChart from "../../components/ui/AnalyticsChart";
import CreateAirdropModal from "../../components/ui/CreateAirdropModal";
import { API_BASE } from "../../services/apiClient";
import "./Dashboard.css";

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

  const [chatMessages, setChatMessages] = useState([
    { sender: "John Doe", text: "Hello mentor, when is my React code evaluation meeting?", time: "10:15 AM" },
    { sender: "You", text: "Hi John, I will schedule it for tomorrow at 2:00 PM.", time: "10:30 AM" }
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedInternForChat, setSelectedInternForChat] = useState(null);

  // Weekly review state inputs
  const [weeklyIntern, setWeeklyIntern] = useState("John Doe");
  const [weeklyStrengths, setWeeklyStrengths] = useState("");
  const [weeklyWeaknesses, setWeeklyWeaknesses] = useState("");
  const [weeklyNotes, setWeeklyNotes] = useState("");

  const [airdropsList, setAirdropsList] = useState([]);
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [newAirdrop, setNewAirdrop] = useState({
    title: "",
    description: "",
    task_type: "mcq",
    task_config: { question: "", options: ["", "", "", ""], correct_answer: "" },
    start_mode: "fixed",
    time_limit: 60,
    start_time: "",
    bonus_points: 100,
    winner_count: 3
  });

  const handleTaskTypeChange = (type) => {
    let config = {};
    if (type === "mcq") config = { question: "", options: ["", "", "", ""], correct_answer: "" };
    if (type === "pattern") config = { question: "", correct_answer: "" };
    if (type === "true_false") config = { statement: "", correct_answer: true };
    if (type === "fill_blank") config = { question: "", correct_answer: "" };
    if (type === "match") config = { pairs: { "Key 1": "Value 1" } };
    if (type === "arrange") config = { items: ["Item 1", "Item 2"], correct_order: ["Item 1", "Item 2"] };
    if (type === "code_output_mcq") config = { language: "python", code: "", options: ["", "", "", ""], correct_answer: "" };
    
    setNewAirdrop({ ...newAirdrop, task_type: type, task_config: config });
  };

  const [mentorLeaderboard, setMentorLeaderboard] = useState([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all");
  const [internsList, setInternsList] = useState([]);
  const [analyticsSelectedUser, setAnalyticsSelectedUser] = useState("");
  const [ticketsList, setTicketsList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");

  useEffect(() => {
    const fetchMentorData = async () => {
      const token = localStorage.getItem("token");
      try {
        const airdropsRes = await fetch("http://localhost:8000/bonus-airdrops", { headers: { "Authorization": `Bearer ${token}` } });
        if (airdropsRes.ok) {
          const data = await airdropsRes.json();
          setAirdropsList(data);
        }

        const leaderboardRes = await fetch(`http://localhost:8000/leaderboard?period=${leaderboardPeriod}`, { headers: { "Authorization": `Bearer ${token}` } });
        if (leaderboardRes.ok) {
          const lbData = await leaderboardRes.json();
          setMentorLeaderboard(lbData);
        }

        const usersRes = await fetch(`http://localhost:8000/users?role=intern`, { headers: { "Authorization": `Bearer ${token}` } });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setInternsList(usersData);
        }

        const ticketsRes = await fetch(`http://localhost:8000/tickets`, { headers: { "Authorization": `Bearer ${token}` } });
        if (ticketsRes.ok) {
          const tData = await ticketsRes.json();
          setTicketsList(tData);
        }
      } catch(e) {}
    }
    fetchMentorData();
  }, [leaderboardPeriod]);

  const handleCreateAirdrop = async (formData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/bonus-airdrops`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const created = await res.json();
        setAirdropsList([created, ...airdropsList]);
        setShowAirdropModal(false);
        alert("Airdrop created successfully and is pending approval!");
      } else {
        const errorText = await res.text();
        console.error("Failed response:", errorText);
        alert("Failed to create airdrop");
      }
    } catch (err) {
      console.error("Error creating airdrop:", err);
      alert("Error creating airdrop: " + err.message);
    }
  };

  const handleTicketAction = async (action, payload = {}) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
      });
      if (res.ok) {
        const updatedT = await res.json();
        setSelectedTicket(updatedT);
        setTicketsList(ticketsList.map(t => t.id === updatedT.id ? updatedT : t));
        if (action === "resolve") alert("Ticket marked as resolved!");
      } else {
        const err = await res.json();
        alert(`Failed: ${err.detail || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error performing action.");
    }
  };

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
      case "Tickets":
        if (selectedTicket) {
          return (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Back to Tickets</button>
                  <h3 style={{ margin: 0 }}>Ticket {selectedTicket.id}</h3>
                  <span className={`badge ${['resolved', 'closed'].includes(selectedTicket.status.toLowerCase()) ? 'badge-success' : ['in_progress', 'assigned'].includes(selectedTicket.status.toLowerCase()) ? 'badge-warning' : 'badge-primary'}`} style={{ backgroundColor: ['resolved', 'closed'].includes(selectedTicket.status.toLowerCase()) ? '#d1fae5' : ['in_progress', 'assigned'].includes(selectedTicket.status.toLowerCase()) ? '#fef3c7' : '#fee2e2', color: ['resolved', 'closed'].includes(selectedTicket.status.toLowerCase()) ? '#065f46' : ['in_progress', 'assigned'].includes(selectedTicket.status.toLowerCase()) ? '#92400e' : '#991b1b', textTransform: 'capitalize' }}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {['open', 'assigned', 'in_progress'].includes(selectedTicket.status.toLowerCase()) && (
                    <button className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }} onClick={() => {
                      const res = prompt("Enter resolution message (optional):");
                      if (res !== null) handleTicketAction("resolve", { resolution: res });
                    }}>Mark as Resolved</button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>User</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.creator_name || 'Unknown'}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Domain</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.domain}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Assigned To</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.assignee_name || 'Unassigned'}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Filed On</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{new Date(selectedTicket.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#1f2937" }}>{selectedTicket.title}</h4>
                <div style={{ padding: "16px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>
                  {selectedTicket.description}
                </div>
              </div>

              <div>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Comments & Updates</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                    <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>No comments yet.</p>
                  ) : (
                    selectedTicket.messages.map((comment, idx) => (
                      <div key={idx} style={{ padding: "12px", backgroundColor: comment.sender_name === "Admin" ? "#eff6ff" : "#f3f4f6", borderRadius: "8px", border: `1px solid ${comment.sender_name === "Admin" ? "#bfdbfe" : "#e5e7eb"}` }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: comment.sender_name === "Admin" ? "#1d4ed8" : "#374151", marginBottom: "4px" }}>{comment.sender_name || "User"}</div>
                        <div style={{ fontSize: "13px", color: "#1f2937" }}>{comment.message}</div>
                      </div>
                    ))
                  )}
                </div>
                {['open', 'assigned', 'in_progress'].includes(selectedTicket.status.toLowerCase()) && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (ticketReply.trim()) {
                      handleTicketAction("message", { message: ticketReply });
                      setTicketReply("");
                    }
                  }} style={{ display: "flex", gap: "10px" }}>
                    <input type="text" className="form-control" placeholder="Write a reply or update..." value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
                    <button type="submit" className="btn btn-primary">Send Reply</button>
                  </form>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="card">
            <h3>Support Tickets</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Manage issues assigned to you.</p>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>User</th>
                    <th>Issue Title</th>
                    <th>Status</th>
                    <th>Date Filed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsList.map((ticket) => (
                    <tr key={ticket.id}>
                      <td><span style={{ fontWeight: 600, color: "#1f2937" }}>{ticket.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ticket.creator_name || 'Unknown'}</div>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>{ticket.domain}</div>
                      </td>
                      <td><span style={{ color: "#4b5563" }}>{ticket.title}</span></td>
                      <td>
                        <span className={`badge ${['resolved', 'closed'].includes(ticket.status.toLowerCase()) ? 'badge-success' : ['in_progress', 'assigned'].includes(ticket.status.toLowerCase()) ? 'badge-warning' : 'badge-primary'}`} style={{ backgroundColor: ['resolved', 'closed'].includes(ticket.status.toLowerCase()) ? '#d1fae5' : ['in_progress', 'assigned'].includes(ticket.status.toLowerCase()) ? '#fef3c7' : '#fee2e2', color: ['resolved', 'closed'].includes(ticket.status.toLowerCase()) ? '#065f46' : ['in_progress', 'assigned'].includes(ticket.status.toLowerCase()) ? '#92400e' : '#991b1b', textTransform: 'capitalize' }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td><span style={{ fontSize: "12px", color: "#6b7280" }}>{new Date(ticket.created_at).toLocaleDateString()}</span></td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => setSelectedTicket(ticket)}>View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

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

            <div className="card">
              <h3>Cohort Performance Analytics</h3>
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: "13px", margin: "0 0 12px 0" }}><b>Submission rate:</b> 96% | <b>Average Attendance:</b> 91%</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span className="badge badge-success">Top Domain: Artificial Intelligence</span>
                  <span className="badge badge-warning">Needs work: Async CSS styling</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0 }}>Global Leaderboard</h3>
                <div style={{ display: "flex", backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "4px" }}>
                  {["weekly", "monthly", "all"].map(period => (
                    <button
                      key={period}
                      onClick={() => setLeaderboardPeriod(period)}
                      style={{
                        padding: "6px 16px",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 600,
                        backgroundColor: leaderboardPeriod === period ? "#ffffff" : "transparent",
                        color: leaderboardPeriod === period ? "#4f46e5" : "#6b7280",
                        boxShadow: leaderboardPeriod === period ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: "all 0.2s"
                      }}
                    >
                      {period === "all" ? "All-Time" : period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Intern</th>
                      <th>Batch</th>
                      <th>Domain</th>
                      <th>Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorLeaderboard.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No data available for this period.</td></tr>
                    ) : (
                      mentorLeaderboard.map((entry, idx) => (
                        <tr key={entry.user_id}>
                          <td>
                            {idx === 0 ? "🥇 1st" : idx === 1 ? "🥈 2nd" : idx === 2 ? "🥉 3rd" : `#${idx + 1}`}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "#111827" }}>{entry.user_name}</div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>ID: {entry.user_id}</div>
                          </td>
                          <td><span className="badge badge-secondary">{entry.batch || "N/A"}</span></td>
                          <td>{entry.domain || "N/A"}</td>
                          <td><span style={{ fontWeight: "bold", color: "#10b981" }}>{entry.total_points}</span> pts</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                      <th>ID</th><th>Name</th><th>Progress</th><th>Avg Score</th><th>Simulation State</th><th>Weak Areas</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedInterns.map(i => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td><b>{i.name}</b></td>
                        <td>{i.progress}</td>
                        <td><b>{i.score}</b></td>
                        <td style={{ fontSize: "12px", color: "#3b82f6" }}>{i.simState || "N/A"}</td>
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

                        {/* Right Side: Submitted File & Review Actions */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div style={{ alignSelf: "flex-end", width: "100%", background: "#1e293b", color: "#f8fafc", padding: "12px", borderRadius: "8px", overflowX: "auto", boxSizing: "border-box" }}>
                            <div style={{ fontSize: "13px", color: "#60a5fa", marginBottom: "8px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                              📄 day{sub.id}.{sub.id === 2 ? 'py' : 'js'}
                            </div>
                            <pre style={{ margin: 0, fontSize: "12px", fontFamily: "monospace", whiteSpace: "pre-wrap", borderTop: "1px solid #334155", paddingTop: "8px" }}>{sub.code || "No code submitted."}</pre>
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

      
      case "Bonus Airdrops":
        return (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0" }}>Bonus Airdrops</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Create pop-quizzes and bonus point airdrops for interns.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAirdropModal(true)}>
                + Create Airdrop
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Points</th>
                    <th>Status</th>
                    <th>Timing Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {airdropsList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>No airdrops found.</td>
                    </tr>
                  ) : airdropsList.map((airdrop) => (
                    <React.Fragment key={airdrop.id}>
                      <tr>
                        <td><span style={{ fontWeight: 600, color: "#1f2937" }}>{airdrop.id}</span></td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{airdrop.title || "Untitled Airdrop"}</div>
                        </td>
                        <td><span style={{ color: "#9d174d", fontWeight: "bold" }}>{airdrop.points_distribution ? airdrop.points_distribution + " pts" : "+" + airdrop.bonus_points + " pts"}</span></td>
                        <td>
                          <span className={`badge ${
                            airdrop.status === "PENDING_APPROVAL" ? "badge-warning" : 
                            (airdrop.status === "APPROVED" || airdrop.status === "PUBLISHED") ? "badge-success" : 
                            "badge-secondary"
                          }`}>
                            {airdrop.status ? airdrop.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : "Unknown"}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {airdrop.start_mode === 'fixed' 
                              ? (
                                <div>
                                  <div style={{ color: "#4f46e5", fontWeight: "500" }}>Fixed Schedule</div>
                                  <div>{airdrop.start_time ? new Date(airdrop.start_time + (airdrop.start_time.endsWith('Z') ? '' : 'Z')).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "N/A"}</div>
                                </div>
                              )
                              : (
                                <div>
                                  <div style={{ color: "#10b981", fontWeight: "500" }}>Flexible Window</div>
                                  <div>{airdrop.time_limit}s limit</div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Analytics":
        return (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Intern Performance Analytics</h3>
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                Select Intern to View
              </label>
              <select 
                className="form-control" 
                style={{ maxWidth: "300px" }}
                value={analyticsSelectedUser}
                onChange={(e) => setAnalyticsSelectedUser(e.target.value)}
              >
                <option value="">-- Choose an Intern --</option>
                {internsList.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>

            {analyticsSelectedUser && (
              <AnalyticsChart internId={analyticsSelectedUser} />
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
              "Bonus Airdrops",
              "Tickets",
              "Analytics"
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

      
      {/* Airdrop Modal */}
      {showAirdropModal && (
        <CreateAirdropModal 
          onClose={() => setShowAirdropModal(false)}
          onSave={handleCreateAirdrop}
        />
      )}

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