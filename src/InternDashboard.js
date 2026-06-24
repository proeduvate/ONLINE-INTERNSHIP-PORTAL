import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE = "http://127.0.0.1:8000";

export default function InternDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // MCQ state
  const [mcqAnswers, setMcqAnswers] = useState({});

  // Coding state
  const [code, setCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");

  // Meeting state
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [joinedMeeting, setJoinedMeeting] = useState(null);
  const [meetMic, setMeetMic] = useState(true);
  const [meetCam, setMeetCam] = useState(true);
  const [meetScreen, setMeetScreen] = useState(false);
  const [meetMessages, setMeetMessages] = useState([]);
  const [meetText, setMeetText] = useState("");

  // Whiteboard drawing state
  const [whiteboardText, setWhiteboardText] = useState("");

  // Certificate state
  const [certData, setCertData] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const internName = localStorage.getItem("name") || "Intern";
  const mentorId = 2; // Default mentor ID from seeder

  // Video streams ref for mock/real webcam
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/intern`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        // Find next unlocked not-submitted task for selected view
        const nextTask = data.find(t => t.unlocked && t.status === "Not started");
        if (nextTask && !selectedTask) {
          setSelectedTask(nextTask);
          setCode(nextTask.coding_prompt || "");
        } else if (data.length > 0 && !selectedTask) {
          setSelectedTask(data[0]);
          setCode(data[0].coding_prompt || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [token, selectedTask]);

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveMeetings(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/messages?contact_id=${mentorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token, mentorId]);

  const fetchCertificate = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/certificate/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertData(data);
      }
    } catch (e) {
      console.log("Certificate not generated yet.");
    }
  }, [token]);

  useEffect(() => {
    // Auth Validation
    if (!token || localStorage.getItem("role") !== "intern") {
      navigate("/");
      return;
    }

    fetchAnalytics();
    fetchTasks();
    fetchMeetings();
    fetchCertificate();
  }, [token, active, navigate, fetchAnalytics, fetchTasks, fetchMeetings, fetchCertificate]);

  // Periodic polling for chat and meetings
  useEffect(() => {
    if (active === "Mentor") {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [active, fetchMessages]);

  // Handle webcam stream when meeting is joined
  useEffect(() => {
    if (joinedMeeting && meetCam) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [joinedMeeting, meetCam]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn("Camera access denied or unavailable. Falling back to avatar simulation.", e);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSelectTask = (t) => {
    setSelectedTask(t);
    setCode(t.coding_prompt || "");
    setMcqAnswers({});
    setEvalResult(null);
    if (t.ai_feedback) {
      try {
        setEvalResult(JSON.parse(t.ai_feedback));
      } catch (e) {
        setEvalResult({ summary: t.ai_feedback });
      }
    }
  };

  const handleMCQChange = (qId, option) => {
    setMcqAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleRunAI = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    setEvaluating(true);
    setEvalResult(null);

    // Simulate standard 1.5 second compiler build spin animation
    await new Promise(r => setTimeout(r, 1500));

    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          task_id: selectedTask.id,
          code_submission: code,
          mcq_answers: JSON.stringify(mcqAnswers)
        })
      });

      if (res.ok) {
        const data = await res.json();
        let aiFeedbackParsed = {};
        try {
          aiFeedbackParsed = JSON.parse(data.ai_feedback);
        } catch (e) {
          aiFeedbackParsed = { summary: data.ai_feedback };
        }
        setEvalResult(aiFeedbackParsed);
        alert(`Task submitted! MCQ Score: ${data.mcq_score}%, AI Score: ${data.ai_score}`);
        fetchTasks();
        fetchAnalytics();
      } else {
        alert("Failed to submit task.");
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: mentorId,
          content: chatText
        })
      });

      if (res.ok) {
        setChatText("");
        fetchMessages();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const res = await fetch(`${API_BASE}/certificate/generate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Certificate generated successfully!");
        fetchCertificate();
      } else {
        const err = await res.json();
        alert("Cannot generate certificate: " + (err.detail || "Requirements not met. Ensure 80% tasks are submitted."));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSendMeetChat = (e) => {
    e.preventDefault();
    if (!meetText.trim()) return;
    setMeetMessages(prev => [...prev, { sender: internName, text: meetText }]);
    setMeetText("");
  };

  const parseJSON = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  };

  const printCertificate = () => {
    const printContent = document.getElementById("certificate-print-area").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return (
          <>
            <div className="grid">
              <div className="metric-card">
                <div className="metric-title">Course Progress</div>
                <div className="metric-value">{analytics?.progress_pct || 0}%</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${analytics?.progress_pct || 0}%` }}></div>
                </div>
              </div>
              <div className="metric-card" style={{ borderColor: "rgba(16, 185, 129, 0.4)" }}>
                <div className="metric-title" style={{ color: "var(--color-success)" }}>Work Attendance</div>
                <div className="metric-value">{analytics?.attendance_pct || 0}%</div>
                <p style={{fontSize:"11px", color:"var(--text-muted)", marginTop:"6px"}}>Attendance is automatically marked upon daily task submissions.</p>
              </div>
              <div className="metric-card">
                <div className="metric-title">Total Points Earned</div>
                <div className="metric-value">{analytics?.total_score || 0} pts</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Average Grading Score</div>
                <div className="metric-value">{analytics?.average_score_pct || 0}%</div>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
              <div className="card">
                <h3>Today's Learning Focus</h3>
                {selectedTask ? (
                  <div>
                    <h4 style={{ color: "var(--primary)", fontSize: "16px", marginBottom: "8px" }}>Day {selectedTask.day_number}: {selectedTask.title}</h4>
                    <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#d1d5db", marginBottom: "16px" }}>{selectedTask.description}</p>
                    <button onClick={() => setActive("Learning")} className="btn">Open Study Desk</button>
                  </div>
                ) : (
                  <p>All set! No tasks allocated yet.</p>
                )}
              </div>

              <div className="card">
                <h3>Improvement Areas</h3>
                {analytics?.weak_areas?.length > 0 ? (
                  <ul style={{ paddingLeft: "16px", fontSize: "13px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {analytics.weak_areas.map((wa, idx) => (
                      <li key={idx} style={{ color: "var(--accent)" }}>{wa}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "13px", color: "var(--color-success)" }}>Outstanding! You are excelling across all graded components.</p>
                )}
              </div>
            </div>
          </>
        );

      case "Learning":
        return (
          <div className="grid" style={{ gridTemplateColumns: "1fr 2.5fr", alignItems: "start" }}>
            <div className="card" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <h3>Path Days (1-30)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => t.unlocked && handleSelectTask(t)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: selectedTask?.id === t.id ? "rgba(0,173,181,0.12)" : "rgba(255,255,255,0.02)",
                      border: "1px solid " + (selectedTask?.id === t.id ? "var(--primary)" : (t.unlocked ? "rgba(255,255,255,0.06)" : "transparent")),
                      cursor: t.unlocked ? "pointer" : "not-allowed",
                      opacity: t.unlocked ? 1 : 0.4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "var(--transition-smooth)"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--primary)" }}>DAY {t.day_number}</div>
                      <div style={{ fontSize: "13px", color: "white", fontWeight: 500 }}>{t.title}</div>
                    </div>
                    {t.status === "approved" ? (
                      <span style={{ color: "var(--color-success)" }}>✓</span>
                    ) : (t.status === "submitted" ? (
                      <span style={{ color: "var(--color-warning)", fontSize: "11px" }}>Submitted</span>
                    ) : (!t.unlocked && (
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                    ))) }
                  </div>
                ))}
              </div>
            </div>

            {selectedTask && (
              <div className="card">
                <h3>{selectedTask.title}</h3>
                <div style={{ margin: "16px 0" }}>
                  {selectedTask.video_url && (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "10px", marginBottom: "20px", border: "1px solid var(--border-glow)" }}>
                      <iframe
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                        src={selectedTask.video_url}
                        title="Learning video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <div className="tab-list">
                    <button className="tab-btn active">Study Notes</button>
                    {selectedTask.document_url && (
                      <a href={selectedTask.document_url} target="_blank" rel="noreferrer" className="tab-btn" style={{ textDecoration: "none" }}>Official Docs</a>
                    )}
                  </div>

                  <p style={{ fontSize: "14px", lineHeight: "1.7", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-glow)" }}>
                    {selectedTask.notes || "Read the document references on the side tab to understand today's coding exercise."}
                  </p>
                  
                  {selectedTask.resources && (
                    <div style={{ marginTop: "16px", fontSize: "13px" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "bold" }}>Reference Links: </span>
                      <span style={{ color: "var(--text-muted)" }}>{selectedTask.resources}</span>
                    </div>
                  )}
                  
                  <div style={{ marginTop: "24px" }}>
                    <button onClick={() => setActive("Tasks")} className="btn">Start Assessment Challenge</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "Tasks":
        return (
          <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", alignItems: "start" }}>
            <div className="card">
              <h3>Coding Challenge Console</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "8px 0 16px 0" }}>
                Write the solution according to the requirements details below.
              </p>
              <div style={{ background: "#0c1524", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-glow)", marginBottom: "16px" }}>
                <h4 style={{ color: "var(--primary)", fontSize: "14px", marginBottom: "4px" }}>Instruction guidelines:</h4>
                <p style={{ fontSize: "13px", lineHeight: "1.5" }}>{selectedTask?.description}</p>
              </div>

              {selectedTask?.coding_prompt ? (
                <div className="code-editor">
                  <div className="code-header">
                    <div className="dots">
                      <div className="dot dot-red"></div>
                      <div className="dot dot-yellow"></div>
                      <div className="dot dot-green"></div>
                    </div>
                    <div className="code-lang">Python (3.x)</div>
                  </div>
                  <textarea
                    rows="12"
                    className="code-area"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ width: "100%", border: "none", outline: "none" }}
                  />
                </div>
              ) : (
                <p>This day does not require a coding compilation. Complete the MCQ questions on the right panel.</p>
              )}

              {evaluating && (
                <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="spinner"></div>
                  <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "13px" }}>
                    🤖 AI Evaluator: Compiling code syntax, verifying inputs, and executing logic modules...
                  </span>
                </div>
              )}

              {evalResult && (
                <div style={{
                  marginTop: "20px",
                  background: "rgba(0, 173, 181, 0.05)",
                  border: "1px solid var(--primary)",
                  borderRadius: "12px",
                  padding: "20px"
                }}>
                  <h4 style={{ color: "var(--primary)", marginBottom: "10px", fontSize: "15px" }}>AI Grader Report Summary</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                    <div><b>Syntax Validity:</b> {evalResult.syntax_check}</div>
                    <div><b>Estimated Complexity:</b> <code>{evalResult.complexity}</code></div>
                    <div><b>Quality:</b> <span className="badge badge-info">{evalResult.code_quality}</span></div>
                    <div>
                      <b>Test cases outputs:</b>
                      <ul style={{ paddingLeft: "16px", marginTop: "4px", fontSize: "12px" }}>
                        {evalResult.test_results?.map((tr, i) => <li key={i}>{tr}</li>)}
                      </ul>
                    </div>
                    <div>
                      <b>AI Grade Recommendations:</b>
                      <ul style={{ paddingLeft: "16px", marginTop: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                        {evalResult.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3>Day MCQ Test</h3>
              {selectedTask?.mcq_questions ? (
                <div>
                  {parseJSON(selectedTask.mcq_questions).map((q) => (
                    <div key={q.id} style={{ marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px" }}>
                      <p style={{ fontWeight: 600, fontSize: "14px", marginBottom: "10px" }}>Q{q.id}. {q.question}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {q.options?.map((opt) => (
                          <label
                            key={opt}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "10px",
                              borderRadius: "8px",
                              background: mcqAnswers[q.id] === opt ? "rgba(0,173,181,0.08)" : "rgba(255,255,255,0.02)",
                              border: "1px solid " + (mcqAnswers[q.id] === opt ? "var(--primary)" : "rgba(255,255,255,0.05)"),
                              cursor: "pointer",
                              fontSize: "13px"
                            }}
                          >
                            <input
                              type="radio"
                              name={`mcq-${q.id}`}
                              value={opt}
                              checked={mcqAnswers[q.id] === opt}
                              onChange={() => handleMCQChange(q.id, opt)}
                              style={{ width: "auto" }}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: "24px" }}>
                    <button 
                      onClick={handleRunAI} 
                      disabled={selectedTask.status === "approved" || evaluating} 
                      className="btn" 
                      style={{ width: "100%" }}
                    >
                      Submit Daily Deliverables
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No multiple choice questions for today.</p>
              )}
            </div>
          </div>
        );

      case "Mentor":
        return (
          <div className="card">
            <h3>Direct Mentor Support Channel</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Message your assigned mentor directly below. Other interns cannot read or join this conversation.
            </p>

            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`msg-wrapper ${msg.sender_id === mentorId ? 'msg-received' : 'msg-sent'}`}>
                    <div className="msg-bubble">{msg.content}</div>
                    <div className="msg-meta">{new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "40px" }}>
                    Send a message to your mentor Sarah Connor to clarify doubts.
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-bar">
                <input type="text" placeholder="Type a message..." value={chatText} onChange={(e) => setChatText(e.target.value)} />
                <button type="submit" className="btn">Send</button>
              </form>
            </div>
          </div>
        );

      case "Meeting":
        return (
          <div className="card">
            <h3>Mentor Breakout Rooms</h3>
            {!joinedMeeting ? (
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Join video conference breakout rooms scheduled by domain mentors for progress alignment.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {activeMeetings.map(m => (
                    <div key={m.id} style={{
                      padding: "16px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-glow)",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <h4 style={{ fontSize: "15px", color: "white" }}>{m.title}</h4>
                        <div style={{ fontSize: "11px", color: "var(--primary)", marginTop: "4px" }}>CODE: <code>{m.room_code}</code></div>
                      </div>
                      <button onClick={() => setJoinedMeeting(m)} className="btn">Join Session</button>
                    </div>
                  ))}
                  {activeMeetings.length === 0 && (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                      No active breakout rooms right now. Wait for your mentor to initiate.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="meeting-grid">
                <div className="video-section">
                  {meetCam ? (
                    <video ref={localVideoRef} autoPlay playsInline className="video-box" style={{ transform: "scaleX(-1)" }} />
                  ) : (
                    <div className="camera-simulated-avatar">{internName.charAt(0)}</div>
                  )}
                  <div className="video-label">{internName} (You)</div>

                  {/* Remote simulation feed overlay */}
                  <div style={{ position: "absolute", top: "16px", right: "16px", width: "160px", height: "120px", background: "#101827", borderRadius: "8px", border: "1px solid var(--border-glow)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize: "24px", color: "var(--primary)", fontWeight:"bold" }}>SC</div>
                    <div style={{ position: "absolute", bottom: "4px", left: "8px", fontSize: "10px", color: "white" }}>Sarah Connor (Mentor)</div>
                  </div>

                  <div className="meeting-controls">
                    <button onClick={() => setMeetMic(!meetMic)} className={`meet-control-btn ${!meetMic ? 'inactive' : ''}`}>
                      {meetMic ? "🎙️" : "🔇"}
                    </button>
                    <button onClick={() => setMeetCam(!meetCam)} className={`meet-control-btn ${!meetCam ? 'inactive' : ''}`}>
                      {meetCam ? "📷" : "🚫"}
                    </button>
                    <button onClick={() => setMeetScreen(!meetScreen)} className={`meet-control-btn ${meetScreen ? 'inactive' : ''}`}>
                      🖥️
                    </button>
                    <button onClick={() => { setJoinedMeeting(null); stopWebcam(); }} className="meet-control-btn btn-danger" style={{ background: "red" }}>
                      📞
                    </button>
                  </div>
                </div>

                <div className="meet-sidebar">
                  <div className="card" style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "240px", padding: "12px", marginBottom: 0 }}>
                    <h4 style={{ fontSize: "13px", marginBottom: "8px" }}>Session Chat</h4>
                    <div style={{ flexGrow: 1, overflowY: "auto", fontSize: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {meetMessages.map((m, i) => (
                        <div key={i}><b>{m.sender}:</b> {m.text}</div>
                      ))}
                    </div>
                    <form onSubmit={handleSendMeetChat} style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                      <input type="text" placeholder="Chat in meet..." value={meetText} onChange={(e) => setMeetText(e.target.value)} style={{ padding: "8px" }} />
                      <button type="submit" className="btn" style={{ padding: "8px" }}>Send</button>
                    </form>
                  </div>

                  <div className="card" style={{ height: "180px", padding: "12px", marginBottom: 0 }}>
                    <h4 style={{ fontSize: "13px", marginBottom: "8px" }}>Doubt Whiteboard</h4>
                    <textarea 
                      rows="4" 
                      placeholder="Type concepts to share on board..." 
                      value={whiteboardText}
                      onChange={(e) => setWhiteboardText(e.target.value)}
                      style={{ fontSize: "12px", background: "#0c1322" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "Portfolio":
        return (
          <div className="grid" style={{ gridTemplateColumns: "1.2fr 2fr", alignItems: "start" }}>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "50%", border: "4px solid var(--primary)", margin: "0 auto 16px auto", overflow: "hidden" }}>
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ marginBottom: "4px", color: "white" }}>{internName}</h3>
              <code style={{ fontSize: "12px", color: "var(--primary)" }}>ID: {analytics?.progress_pct ? "INT-2026-0101" : "INT-PENDING"}</code>
              
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", fontSize: "13px" }}>
                <div><b>College:</b> MIT University</div>
                <div><b>Domain Assigned:</b> React Frontend</div>
                <div><b>Internship Duration:</b> 30 Days</div>
                <div><b>Start Date:</b> 2026-06-24</div>
                <div><b>Grading Score:</b> {analytics?.average_score_pct || 0}%</div>
              </div>

              <div style={{ marginTop: "24px" }}>
                <button onClick={handleGenerateCertificate} className="btn" style={{ width: "100%" }}>
                  Generate Certificate
                </button>
              </div>
            </div>

            <div className="card">
              <h3>Submission Archive & Portfolio</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Showcase your daily work history and evaluations compiled during the program.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {tasks.filter(t => t.status === "approved" || t.status === "submitted").map(t => (
                  <div key={t.id} style={{
                    padding: "16px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-glow)",
                    borderRadius: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "14px", color: "white" }}>Day {t.day_number}: {t.title}</h4>
                      <span className="badge badge-success">{t.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "var(--primary)", marginTop: "8px" }}>
                      <span>MCQ: {t.mcq_score}%</span>
                      <span>AI Code Score: {t.ai_score}/100</span>
                      <span>Mentor: {t.mentor_score}/100</span>
                    </div>
                    {t.mentor_feedback && (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "8px" }}>
                        <b>Mentor Review:</b> {t.mentor_feedback}
                      </p>
                    )}
                  </div>
                ))}
                {tasks.filter(t => t.status === "approved" || t.status === "submitted").length === 0 && (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No completed daily curriculum submissions yet.</p>
                )}
              </div>

              {certData && (
                <div style={{ marginTop: "32px", borderTop: "1px solid var(--border-glow)", paddingTop: "24px" }}>
                  <h3 style={{ marginBottom: "16px" }}>Download Final Credential</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={printCertificate} className="btn" style={{ flexGrow: 1 }}>Print/Print-PDF Certificate</button>
                  </div>
                  
                  {/* Invisible Printable Area container */}
                  <div id="certificate-print-area" style={{ display: "none" }}>
                    <div className="certificate-preview-box">
                      <div className="cert-title">CERTIFICATE OF COMPLETION</div>
                      <div className="cert-subtitle">PROEDUVATE ONLINE INTERNSHIP PORTAL</div>
                      <div style={{ color: "#64748b", fontSize: "14px" }}>This is to certify that</div>
                      <div className="cert-name">{certData.intern_name}</div>
                      <div style={{ color: "#64748b", fontSize: "14px" }}>has successfully completed the 30-day intensive program on</div>
                      <div style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", margin: "10px 0" }}>{certData.domain_name}</div>
                      <div className="cert-body">
                        Demonstrating high technical capabilities in developing clean code, completing structured daily assessments, 
                        passing compiler AI evaluations, and collaborating with industrial mentors.
                      </div>
                      <div className="cert-grade">Grade Assigned: {certData.final_grade}</div>
                      <div className="cert-footer">
                        <div className="cert-sig">
                          <div className="cert-sig-line"></div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{certData.mentor_name}</div>
                          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Lead Mentor</div>
                        </div>
                        <div className="cert-stamp">VERIFIED</div>
                        <div className="cert-sig">
                          <div className="cert-sig-line"></div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>System Administrator</div>
                          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Director</div>
                        </div>
                      </div>
                      <div className="cert-id">Certificate ID: {certData.certificate_id} | Issued Date: {certData.generated_at}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Online Internship <span>Portal</span></h2>

        <ul>
          <li className={active === "Dashboard" ? "active" : ""} onClick={() => setActive("Dashboard")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"/></svg>
            Dashboard
          </li>
          <li className={active === "Learning" ? "active" : ""} onClick={() => setActive("Learning")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            Learning Curriculum
          </li>
          <li className={active === "Tasks" ? "active" : ""} onClick={() => setActive("Tasks")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            Graded Assessment
          </li>
          <li className={active === "Mentor" ? "active" : ""} onClick={() => setActive("Mentor")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Mentor Support
          </li>
          <li className={active === "Meeting" ? "active" : ""} onClick={() => setActive("Meeting")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            Breakout Rooms
          </li>
          <li className={active === "Portfolio" ? "active" : ""} onClick={() => setActive("Portfolio")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Work Portfolio
          </li>
        </ul>

        <button className="sidebar-logout" onClick={handleLogout}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
      </div>

      <div className="main">
        <div className="header">
          <div>
            <h2>Internship Workspace</h2>
            <p style={{fontSize: "13px", color:"var(--text-muted)"}}>Access daily curriculum tasks, submit code, and verify AI feedback reports</p>
          </div>
          <div className="user-badge">
            <div style={{ textAlign: "right" }}>
              <div>{internName}</div>
              <div style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase" }}>React Developer</div>
            </div>
            <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=80&q=80" alt="avatar" />
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}