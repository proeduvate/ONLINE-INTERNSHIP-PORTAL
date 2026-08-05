import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { API_BASE } from "./api";

export default function MentorDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  // Evaluation fields
  const [selectedSub, setSelectedSub] = useState(null);
  const [evalScore, setEvalScore] = useState(80);
  const [evalFeedback, setEvalFeedback] = useState("");

  // Meeting fields
  const [meetTitle, setMeetTitle] = useState("");
  const [meetCode, setMeetCode] = useState("");

  // Chat fields
  const [selectedIntern, setSelectedIntern] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const mentorName = localStorage.getItem("name") || "Mentor";

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        if (data.intern_list?.length > 0 && !selectedIntern) {
          setSelectedIntern(data.intern_list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [token, selectedIntern]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchMessages = useCallback(async () => {
    if (!selectedIntern) return;
    try {
      const res = await fetch(`${API_BASE}/messages?contact_id=${selectedIntern}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token, selectedIntern]);

  useEffect(() => {
    // Auth Validation
    if (!token || localStorage.getItem("role") !== "mentor") {
      navigate("/");
      return;
    }

    fetchAnalytics();
    fetchSubmissions();
    fetchMeetings();
  }, [token, active, navigate, fetchAnalytics, fetchSubmissions, fetchMeetings]);

  // Periodic polling for chat messages if Chat tab is active
  useEffect(() => {
    if (active === "Chat" && selectedIntern) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [active, selectedIntern, fetchMessages]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetTitle || !meetCode) return;
    
    try {
      const res = await fetch(`${API_BASE}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: meetTitle, room_code: meetCode })
      });

      if (res.ok) {
        alert("Meeting breakout room created successfully!");
        setMeetTitle("");
        setMeetCode("");
        fetchMeetings();
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleCloseMeeting = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/meetings/${code}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Meeting closed successfully.");
        fetchMeetings();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      const res = await fetch(`${API_BASE}/submissions/${selectedSub.id}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mentor_score: parseInt(evalScore),
          mentor_feedback: evalFeedback
        })
      });

      if (res.ok) {
        alert("Evaluation submitted!");
        setSelectedSub(null);
        setEvalFeedback("");
        fetchSubmissions();
        fetchAnalytics();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim() || !selectedIntern) return;

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: parseInt(selectedIntern),
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

  const handlePlagiarismCheck = async () => {
    if (!selectedSub) return;
    try {
      const res = await fetch(`${API_BASE}/plagiarism/check/${selectedSub.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.comparisons || data.comparisons.length === 0) {
          alert("No other submissions available for comparison.");
          return;
        }
        const top = data.comparisons.slice(0, 5).map(c => `Submission ${c.submission_id} (Intern ${c.intern_id}): ${c.similarity_pct}%`).join('\n');
        alert("Plagiarism check results (top matches):\n" + top);
      } else {
        const err = await res.json();
        alert("Plagiarism check failed: " + (err.detail || res.status));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const getAIResult = (sub) => {
    if (!sub.ai_feedback) return null;
    try {
      return jsonParseSafely(sub.ai_feedback);
    } catch (e) {
      return { summary: sub.ai_feedback };
    }
  };

  const jsonParseSafely = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return { summary: str };
    }
  };

  const getInternName = (id) => {
    const match = analytics?.intern_list?.find(i => i.id === id);
    return match ? match.name : `Intern (ID: ${id})`;
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return (
          <>
            <div className="grid">
              <div className="metric-card">
                <div className="metric-title">Assigned Interns</div>
                <div className="metric-value">{analytics?.total_assigned_interns || 0}</div>
              </div>
              <div className="metric-card" style={{ borderColor: "rgba(245, 158, 11, 0.4)" }}>
                <div className="metric-title" style={{ color: "var(--color-warning)" }}>Pending Reviews</div>
                <div className="metric-value">{analytics?.pending_reviews || 0}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Active Breakouts</div>
                <div className="metric-value">{analytics?.active_meetings || 0}</div>
              </div>
            </div>

            <div className="card">
              <h3>Assigned Interns Progress</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>College</th>
                    <th>Attendance</th>
                    <th>Course Progress</th>
                    <th>Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.intern_list?.map((i) => (
                    <tr key={i.id}>
                      <td><b>{i.name}</b></td>
                      <td>{i.college}</td>
                      <td>
                        <span className={`badge ${i.attendance >= 85 ? 'badge-success' : 'badge-warning'}`}>
                          {i.attendance}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span>{i.progress}%</span>
                          <div className="progress-bar-container" style={{ width: "80px" }}>
                            <div className="progress-bar-fill" style={{ width: `${i.progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td><b>{i.total_score} pts</b></td>
                    </tr>
                  ))}
                  {(!analytics?.intern_list || analytics.intern_list.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{textAlign:"center"}}>No interns currently assigned to your mentoring group.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case "Submissions":
        return (
          <div className="grid" style={{ gridTemplateColumns: selectedSub ? "1fr 1fr" : "1fr", alignItems: "start" }}>
            <div className="card">
              <h3>Intern Submissions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Intern</th>
                    <th>Task ID (Day)</th>
                    <th>MCQ Score</th>
                    <th>AI Score</th>
                    <th>Mentor Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td><b>{getInternName(sub.intern_id)}</b></td>
                      <td>Day {sub.task_id}</td>
                      <td>{sub.mcq_score}%</td>
                      <td><span style={{color: "var(--primary)"}}>{sub.ai_score}/100</span></td>
                      <td>{sub.status === "approved" ? `${sub.mentor_score}/100` : <span style={{color:"var(--text-muted)"}}>Pending</span>}</td>
                      <td>
                        <span className={`badge ${sub.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => setSelectedSub(sub)} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "12px" }}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{textAlign:"center"}}>No submissions uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedSub && (
              <div className="card">
                <h3>Evaluate: {getInternName(selectedSub.intern_id)} (Day {selectedSub.task_id})</h3>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Submitted Code Snippet:</label>
                  <pre style={{
                    background: "#060913",
                    padding: "16px",
                    borderRadius: "8px",
                    overflowX: "auto",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    border: "1px solid var(--border-glow)",
                    color: "#38bdf8",
                    marginTop: "6px"
                  }}>
                    {selectedSub.code_submission || "# No coding task submitted."}
                  </pre>
                </div>

                {selectedSub.ai_feedback && (
                  <div style={{
                    background: "rgba(0,173,181,0.05)",
                    border: "1px solid var(--primary)",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "20px"
                  }}>
                    <h4 style={{ color: "var(--primary)", fontSize: "14px", marginBottom: "8px" }}>AI Evaluation Feedback:</h4>
                    {(() => {
                      const ai = getAIResult(selectedSub);
                      if (!ai) return null;
                      return (
                        <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div><b>Complexity:</b> <code>{ai.complexity}</code></div>
                          <div><b>Code Quality:</b> <span className="badge badge-info">{ai.code_quality}</span></div>
                          <div><b>Test Results:</b> {ai.test_results?.join(", ")}</div>
                          <div>
                            <b>Suggestions:</b>
                            <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                              {ai.suggestions?.map((s, idx) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <form onSubmit={handleEvaluate}>
                  <div className="form-group">
                    <label>Mentor Score (0 - 100)</label>
                    <input type="number" min="0" max="100" value={evalScore} onChange={(e) => setEvalScore(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Evaluation Feedback / Comments</label>
                    <textarea rows="4" placeholder="Highlight improvement areas..." value={evalFeedback} onChange={(e) => setEvalFeedback(e.target.value)} required></textarea>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn">Submit Review</button>
                    <button type="button" onClick={handlePlagiarismCheck} className="btn btn-warning">Check Similarity</button>
                    <button type="button" onClick={() => setSelectedSub(null)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );

      case "Meetings":
        return (
          <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", alignItems: "start" }}>
            <div className="card">
              <h3>Create Meeting (Breakout)</h3>
              <form onSubmit={handleCreateMeeting}>
                <div className="form-group">
                  <label>Meeting Title</label>
                  <input type="text" placeholder="Weekly Progress Review" value={meetTitle} onChange={(e) => setMeetTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Meeting Code (Unique string)</label>
                  <input type="text" placeholder="react-review-week1" value={meetCode} onChange={(e) => setMeetCode(e.target.value)} required />
                </div>
                <button type="submit" className="btn" style={{ width: "100%" }}>Launch Breakout Room</button>
              </form>
            </div>

            <div className="card">
              <h3>Active Meeting Rooms</h3>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Room Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={m.id}>
                      <td><b>{m.title}</b></td>
                      <td><code>{m.room_code}</code></td>
                      <td><span className="badge badge-success">{m.status}</span></td>
                      <td>
                        <button onClick={() => handleCloseMeeting(m.room_code)} className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }}>
                          Close Meeting
                        </button>
                      </td>
                    </tr>
                  ))}
                  {meetings.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{textAlign:"center"}}>No active meeting rooms. Create one to invite interns.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Chat":
        return (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>Communicate with Intern</h3>
              <select style={{ width: "220px" }} value={selectedIntern} onChange={(e) => setSelectedIntern(e.target.value)}>
                {analytics?.intern_list?.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`msg-wrapper ${msg.sender_id === parseInt(selectedIntern) ? 'msg-received' : 'msg-sent'}`}>
                    <div className="msg-bubble">{msg.content}</div>
                    <div className="msg-meta">{new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "40px" }}>
                    Select an intern and send a message to start the conversation.
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

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Mentor <span>Panel</span></h2>

        <ul>
          <li className={active === "Dashboard" ? "active" : ""} onClick={() => setActive("Dashboard")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"/></svg>
            Dashboard
          </li>
          <li className={active === "Submissions" ? "active" : ""} onClick={() => setActive("Submissions")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            Review Submissions
          </li>
          <li className={active === "Meetings" ? "active" : ""} onClick={() => setActive("Meetings")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            Review Meetings
          </li>
          <li className={active === "Chat" ? "active" : ""} onClick={() => setActive("Chat")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Chat Support
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
            <h2>Mentor Workspace</h2>
            <p style={{fontSize: "13px", color:"var(--text-muted)"}}>Review intern deliverables and schedule meetings</p>
          </div>
          <div className="user-badge">
            <div style={{ textAlign: "right" }}>
              <div>{mentorName}</div>
              <div style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase" }}>Domain Mentor</div>
            </div>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="avatar" />
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}