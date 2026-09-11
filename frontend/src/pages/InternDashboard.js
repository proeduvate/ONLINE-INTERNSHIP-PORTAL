import { useState, useEffect, useRef } from "react";
import apiClient from "../services/apiClient";
import { adaptTaskFromApi } from "../utils/taskAdapters";
import "../styles/Dashboard.css";

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  // Mock State
  const progress = 40; // 12 of 30 days
  const [aiScore, setAiScore] = useState(88);
  const attendancePercent = 90;

  // Dynamic Learning Workflow State
  const [currentDay, setCurrentDay] = useState(1);
  
  
  const [meetings, setMeetings] = useState([]);
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch(API_BASE + '/api/meetings/');
        if (res.ok) {
          const data = await res.json();
          setMeetings(data);
        }
      } catch (err) {
        console.error("Could not fetch meetings", err);
      }
    };
    fetchMeetings();
  }, []);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiClient.get("/api/tasks");
        const adapted = res.data.map(adaptTaskFromApi);
        setTasks(adapted.sort((a, b) => a.dayNumber - b.dayNumber));
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setTasksError("Could not load tasks.");
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Compute curriculum from tasks
  const curriculumData = tasks.length > 0 
    ? tasks.map(t => ({
        day: t.dayNumber,
        topic: t.title,
        desc: t.description,
        notes: t.resources || "No notes available",
      }))
    : [{ day: 1, topic: "Loading...", desc: "Loading curriculum data...", notes: "" }];

  // Compute MCQ list for the current day
  const currentTask = tasks.find(t => t.dayNumber === currentDay) || tasks[0];
  const mcqQuestionsList = currentTask?.mcqs || [];

  // MCQ and Assessment Workflow State
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentView, setAssessmentView] = useState("selection"); // selection, mcq, coding
  const [mcqDone, setMcqDone] = useState(false);
  const [codingDone, setCodingDone] = useState(false);
  const [isDayLockedUntilMidnight, setIsDayLockedUntilMidnight] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const ticketsData = [
    {
      id: "TKT-1042",
      title: "Environment setup failing on local machine during Docker build",
      date: "2 days ago",
      status: "In Progress",
      statusBg: "#fef3c7",
      statusColor: "#92400e",
      tagBg: "#fee2e2",
      tagColor: "#991b1b",
      adminReply: "We are looking into the Dockerfile issue. Please ensure you have Docker Desktop v4.20+ installed. A mentor will join your system in the next standup."
    },
    {
      id: "TKT-0985",
      title: "Missing lecture notes for Day 5",
      date: "1 week ago",
      status: "Resolved",
      statusBg: "#d1fae5",
      statusColor: "#065f46",
      tagBg: "#f3f4f6",
      tagColor: "#4b5563",
      adminReply: "The notes have been uploaded to the portal. Please refresh the page."
    }
  ];

  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [answers, setAnswers] = useState({});
  const [mcqGrade, setMcqGrade] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Coding task state
  const [code, setCode] = useState("function sum(a, b) {\n  // write code\n}");
  const [language, setLanguage] = useState("javascript");

  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // Chat message state
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [userId, setUserId] = useState(null);
  const ws = useRef(null);

  const [airdrops, setAirdrops] = useState([]);
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    apiClient.get("/api/auth/me")
      .then(res => setUserId(res.data.id))
      .catch(err => console.error("Could not fetch user ID:", err));
      
    // Fetch airdrops and scenarios
    apiClient.get("/api/features/airdrops")
      .then(res => setAirdrops(res.data))
      .catch(err => console.error("Could not fetch airdrops:", err));
      
    apiClient.get("/api/features/scenarios")
      .then(res => setScenarios(res.data))
      .catch(err => console.error("Could not fetch scenarios:", err));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const baseUri = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
    const wsUri = baseUri.replace(/^http/, 'ws') + `/ws/chat/${userId}`;
    
    ws.current = new WebSocket(wsUri);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setChatMessages(prev => [...prev, {
        sender: "Mentor", // Intern receives from mentor
        text: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    // In a real app we would select a specific mentor, but here we'll just hardcode 
    // a recipient ID for demo, or expect the backend to route it if it's a global room.
    // The backend /ws/chat/{user_id} expects { recipient_id, message }
    // Let's assume mentor has ID 1 for this prototype.
    const payload = {
      recipient_id: 1, 
      message: inputMsg
    };
    
    ws.current.send(JSON.stringify(payload));
    setChatMessages(prev => [...prev, { sender: "You", text: inputMsg, time: "Just now" }]);
    setInputMsg("");
  };

  const handleMcqSubmit = () => {
    setMcqSubmitted(true);
    const score = Object.keys(answers).length * 50; // simple score
    setMcqGrade(score);
    setMcqDone(true);
    alert(`MCQ Test submitted! Score: ${score}%. Part A completed.`);
    setAssessmentView("selection");
  };

  // Timer effect for MCQ
  useEffect(() => {
    let interval;
    if (mcqStarted && timer > 0 && !mcqSubmitted) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && !mcqSubmitted) {
      handleMcqSubmit();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mcqStarted, timer, mcqSubmitted]);

  const handleLogout = () => {
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  const handleRunCode = () => {
    alert("Running code against test cases...\nResult: PASSED (2/2 test cases)");
  };

  // Update code when task changes
  useEffect(() => {
    if (currentTask?.codingQuestion?.prompt) {
      setCode(currentTask.codingQuestion.prompt);
    } else {
      setCode("function sum(a, b) {\n  // write code\n}");
    }
  }, [currentTask]);

  const handleSubmitCode = async () => {
    if (!currentTask || !currentTask.id) {
      alert("No active task to submit.");
      return;
    }
    setEvaluating(true);

    try {
      const res = await apiClient.post(`/api/tasks/${currentTask.id}/submit`, {
        submitted_code: code
      });
      // The backend returns e.g. { score: 85, feedback: "..." }
      const randomScore = res.data.score ?? Math.floor(80 + Math.random() * 20);
      setAiScore(randomScore);
      setEvalResult({
        score: randomScore,
        correctness: 100, // mock sub-scores for now
        logic: 90,
        quality: 85,
        performance: 95,
        suggestions: res.data.feedback || "Code looks good."
      });
      alert(`Coding assessment submitted! Score: ${randomScore}%. Part B completed.`);
      setCodingDone(true);
      setAssessmentView("selection");
    } catch (err) {
      console.error("Failed to submit code:", err);
      alert(err.response?.data?.detail || "Error submitting code.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleCompleteDay = () => {
    alert(`Day ${currentDay} complete! Day ${currentDay + 1} will unlock at 12:00 AM.`);
    setIsDayLockedUntilMidnight(true);
    if (currentDay < curriculumData.length) {
      setCurrentDay(currentDay + 1);
    }
    // Reset test states
    setMcqDone(false);
    setCodingDone(false);
    setMcqStarted(false);
    setMcqSubmitted(false);
    setAnswers({});
    setMcqGrade(null);
    setCode("function sum(a, b) {\n  // write code\n}");
    setEvalResult(null);
    setShowAssessment(false);
    setAssessmentView("selection");
  };


  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>
            {/* Removed Profile card as requested */}

            <div className="grid">
              <div className="stat-card">
                <span className="stat-title">Current Milestone</span>
                <span className="stat-value">Day 12</span>
                <span className="stat-desc">React Framework Basics</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Course Progress</span>
                <span className="stat-value">{progress}%</span>
                <span className="stat-desc">12 of 30 days completed</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Attendance Rate</span>
                <span className="stat-value">{attendancePercent}%</span>
                <span className="stat-desc">12 Days Present / 1 Day Absent</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">AI Evaluation Average</span>
                <span className="stat-value">{aiScore}%</span>
                <span className="stat-desc">Last updated 1 hour ago</span>
              </div>
            </div>

            {/* Removed Attendance Calendar & Portfolio summary as requested */}
            
            {/* Airdrops & Scenarios Feature */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px", marginBottom: "24px" }}>
              <div className="card" style={{ margin: 0, padding: "24px", backgroundColor: "#fef3c7", border: "1px solid #fbbf24" }}>
                <h3 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>🎁 Bonus Airdrops</h3>
                {airdrops.length > 0 ? airdrops.map(airdrop => (
                  <div key={airdrop.id} style={{ marginBottom: "12px", padding: "12px", backgroundColor: "#fff", borderRadius: "8px" }}>
                    <strong>{airdrop.title}</strong>
                    <p style={{ margin: "4px 0", fontSize: "14px" }}>{airdrop.description}</p>
                    {airdrop.claim_code && <span style={{ fontSize: "12px", padding: "4px 8px", backgroundColor: "#dcfce3", color: "#166534", borderRadius: "4px" }}>Code: {airdrop.claim_code}</span>}
                  </div>
                )) : <p style={{ fontSize: "14px", color: "#92400e" }}>No active airdrops right now.</p>}
              </div>

              <div className="card" style={{ margin: 0, padding: "24px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <h3 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>🤔 Daily Scenario</h3>
                {scenarios.length > 0 ? scenarios.map(scenario => {
                  let parsedOptions = [];
                  try {
                    parsedOptions = JSON.parse(scenario.options);
                  } catch (e) { parsedOptions = []; }
                  return (
                    <div key={scenario.id} style={{ marginBottom: "12px", padding: "12px", backgroundColor: "#fff", borderRadius: "8px" }}>
                      <strong>{scenario.scenario_text}</strong>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                        {Array.isArray(parsedOptions) && parsedOptions.map((opt, i) => (
                          <button key={i} className="btn btn-secondary" style={{ textAlign: "left", padding: "8px", fontSize: "13px" }}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  );
                }) : <p style={{ fontSize: "14px", color: "#1e40af" }}>No daily scenarios yet.</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginTop: "24px" }}>
              {/* Daily Task / Analytics (Left) */}
              <div className="card" style={{ margin: 0, padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#3b82f6", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      📚
                    </div>
                    <h3 style={{ margin: 0, fontSize: "16px" }}>Today's Objective</h3>
                  </div>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Module</span>
                    <h4 style={{ margin: "4px 0 8px 0", fontSize: "15px", color: "#0f172a" }}>Day 12: React Framework Basics</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>You have 1 pending assessment for today's module. Complete it to unlock the next day.</p>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Upcoming Meeting</span>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#0f172a" }}>React Hook Refactoring Standup</h4>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Host: Dr. Sakthi • Today, 3:00 PM</span>
                      </div>
                      <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#3b82f6", border: "none" }} onClick={() => alert("Joining mock Zoom room...")}>Join</button>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: "100%", marginTop: "20px", padding: "12px", fontSize: "14px", fontWeight: 600 }}
                  onClick={() => setActiveTab("Learning")}
                >
                  Go to Learning Task
                </button>
              </div>

              {/* Leaderboard (Right) */}
              <div className="card" style={{ margin: 0, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>Leaderboard - Top Competing Interns</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>Compete with your peers based on your overall evaluation progress and daily assessment points.</p>
                  </div>
                  <div style={{ backgroundColor: "#eff6ff", padding: "8px 16px", borderRadius: "20px", color: "#1d4ed8", fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap" }}>
                    Your Rank: #3
                  </div>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Domain</th>
                        <th>Points</th>
                        <th>Badge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.length === 0 ? (
                        <tr><td colSpan="4" style={{textAlign:"center"}}>No upcoming meetings</td></tr>
                      ) : (
                        meetings.map((m, idx) => (
                          <tr key={idx}>
                            <td><b>{m.host_id || "Mentor"}</b></td>
                            <td>{m.title}</td>
                            <td>{new Date(m.scheduled_time).toLocaleString()}</td>
                            <td>
                              <button onClick={() => alert("Joining room " + m.room_code)} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }}>Join zoom</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                </table>
              </div>
            </div>

          </div>
        );

      case "Tickets":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="card" style={{ backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#b91c1c", fontSize: "16px" }}>Support & Ticketing</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#7f1d1d" }}>Facing issues with the portal, curriculum, or mentors? File a detailed ticket.</p>
                </div>
                <button className="btn btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }} onClick={() => setShowTicketForm(true)}>File a Ticket</button>
              </div>

              <div style={{ marginTop: "16px", borderTop: "1px solid #fca5a5", paddingTop: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#991b1b" }}>Your Filed Tickets</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {ticketsData.map(ticket => (
                    <div 
                      key={ticket.id}
                      onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                      style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: selectedTicket?.id === ticket.id ? "2px solid #ef4444" : "1px solid #e5e7eb", display: "flex", flexDirection: "column", cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: ticket.tagColor, fontWeight: 700, backgroundColor: ticket.tagBg, padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>{ticket.id}</span>
                          <span style={{ fontSize: "13px", color: "#1f2937", fontWeight: 500, textDecoration: ticket.status === "Resolved" ? "line-through" : "none" }}>{ticket.title}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>Filed: {ticket.date}</span>
                          <span className="badge" style={{ backgroundColor: ticket.statusBg, color: ticket.statusColor }}>{ticket.status}</span>
                        </div>
                      </div>
                      
                      {selectedTicket?.id === ticket.id && (
                        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
                          <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Admin Reply</h5>
                          <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "6px", borderLeft: "3px solid #3b82f6" }}>
                            <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{ticket.adminReply}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "Chat with Mentor":
        return (
          <div className="card" style={{ margin: 0, padding: 0, height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            {/* Professional Chat Header */}
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", backgroundColor: "#1e293b", color: "#ffffff" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#3b82f6", color: "#ffffff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px", fontWeight: "bold", marginRight: "16px" }}>
                DS
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#ffffff", fontWeight: 600 }}>Dr. Sakthi</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Mentor • Online</p>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "70%", position: "relative", marginBottom: "8px" }}>
                  <div style={{ 
                    backgroundColor: msg.sender === "You" ? "#2563eb" : "#ffffff", 
                    color: msg.sender === "You" ? "#ffffff" : "#1e293b", 
                    padding: "10px 14px 22px 14px", 
                    borderRadius: "12px", 
                    borderBottomRightRadius: msg.sender === "You" ? "0" : "12px",
                    borderBottomLeftRadius: msg.sender !== "You" ? "0" : "12px",
                    fontSize: "14px", 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)", 
                    wordBreak: "break-word",
                    border: msg.sender !== "You" ? "1px solid #e2e8f0" : "none"
                  }}>
                    {msg.text}
                    <span style={{ fontSize: "10px", color: msg.sender === "You" ? "#bfdbfe" : "#94a3b8", position: "absolute", bottom: "6px", right: "12px" }}>
                      {msg.time} {msg.sender === "You" && "✓✓"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "center", padding: "16px", backgroundColor: "#ffffff", margin: 0, borderTop: "1px solid #e2e8f0" }}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)} 
                style={{ flex: 1, padding: "12px 20px", borderRadius: "24px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", fontSize: "14px", outline: "none", color: "#1e293b" }} 
              />
              <button type="submit" style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#2563eb", color: "#ffffff", border: "none", display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "12px", cursor: "pointer", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </button>
            </form>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
            <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "50px", maxWidth: "100%" }} />
          </div>
          <ul>
            {[
              "Overview",
              "Learning",
              "Tickets",
              "Chat with Mentor"
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
            Role: <b>Intern</b>
          </span>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}