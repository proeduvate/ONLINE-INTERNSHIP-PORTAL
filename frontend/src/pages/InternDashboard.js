import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  // Mock State
  const progress = 40; // 12 of 30 days
  const [aiScore, setAiScore] = useState(88);
  const attendancePercent = 90;

  // MCQ state
  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [answers, setAnswers] = useState({});
  const [mcqGrade, setMcqGrade] = useState(null);

  // Coding task state
  const [code, setCode] = useState("function sum(a, b) {\n  // write code\n}");
  const [language, setLanguage] = useState("javascript");

  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // Chat message state
  const [chatMessages, setChatMessages] = useState([
    { sender: "Mentor", text: "Hi John, I saw your code. Good effort, try to refactor the key prop warning.", time: "10:30 AM" }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const handleMcqSubmit = () => {
    setMcqSubmitted(true);
    // calculate score based on answers (mock score)
    const score = Object.keys(answers).length * 50; // simple score
    setMcqGrade(score);
    alert(`MCQ Test submitted! Score: ${score}%`);
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

  const handleSubmitCode = () => {
    setEvaluating(true);

    // Simulate AI compilation & scoring
    setTimeout(() => {
      setEvaluating(false);
      const randomScore = Math.floor(80 + Math.random() * 20);
      setAiScore(randomScore);
      setEvalResult({
        score: randomScore,
        correctness: 100,
        logic: 90,
        quality: 85,
        performance: 95,
        suggestions: "Consider handling null and undefined inputs at the start of your function block to prevent runtime reference errors."
      });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages([...chatMessages, { sender: "You", text: inputMsg, time: "Just now" }]);
    setInputMsg("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>
            {/* Row 1: Profile card */}
            <div className="card" style={{ display: "flex", gap: "20px", alignItems: "center", padding: "16px 24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#2563EB", color: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "bold" }}>
                JD
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px" }}>John Doe (Intern ID: INT001)</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Domain: <b>Artificial Intelligence</b> | Mentor: <b>Dr. Sakthi</b> | University: <b>MIT</b></p>
              </div>
            </div>

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

            {/* Attendance Calendar & Portfolio summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div className="card" style={{ margin: 0 }}>
                <h3>Attendance Timeline Tracker</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", textAlign: "center", fontSize: "11px", fontWeight: "600", marginTop: "12px" }}>
                  {["S","M","T","W","T","F","S"].map((d, i) => <span key={i}>{d}</span>)}
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span 
                      key={i} 
                      style={{
                        padding: "6px",
                        backgroundColor: i < 12 ? "#d1fae5" : "#FFFFFF",
                        color: i < 12 ? "#10B981" : "#E5E7EB",
                        border: "1px solid #E5E7EB",
                        borderRadius: "4px"
                      }}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3>Showcase Portfolio & Certificate</h3>
                  <p style={{ fontSize: "13px" }}>Compile your completed assignments and download your verification-keyed certificate.</p>
                  <div style={{ marginTop: "10px", fontSize: "12px", background: "#f9fafb", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                    <span>Eligibility: <b>Evaluating</b> (requires 30 days completed)</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button onClick={() => alert("Generating mock portfolio link...")} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>Share Portfolio</button>
                  <button className="btn btn-disabled" style={{ padding: "6px 12px", fontSize: "12px" }}>Download Cert</button>
                </div>
              </div>
            </div>
          </>
        );

      case "Learning":
        return (
          <div>
            {/* Course notes & video */}
            <div className="card">
              <h3>Day 12: React State & Custom Hooks</h3>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginTop: "16px" }}>
                <div>
                  <div style={{ background: "#000000", height: "200px", borderRadius: "6px", display: "flex", justifyContent: "center", alignItems: "center", color: "#FFFFFF", fontSize: "14px" }}>
                    🎬 [Video Player: Hooks In-Depth Walkthrough]
                  </div>
                  <p style={{ fontSize: "13px", marginTop: "12px" }}>Hooks are functions that let you "hook into" React state and lifecycle features from functional components.</p>
                </div>
                <div>
                  <div className="card" style={{ margin: 0, border: "1px solid #E5E7EB", padding: "16px" }}>
                    <h5 style={{ fontWeight: 600 }}>Attachments</h5>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "12px", marginTop: "8px" }}>
                      <li style={{ padding: "6px 0", borderBottom: "1px solid #E5E7EB" }}>
                        📄 <button onClick={() => alert("Downloading Notes.pdf")} style={{ color: "#2563EB", fontWeight: "600", border: "none", background: "none", cursor: "pointer", padding: 0 }}>Lecture Notes (PDF)</button>
                      </li>
                      <li style={{ padding: "6px 0" }}>
                        📄 <button onClick={() => alert("Downloading Exercises.zip")} style={{ color: "#2563EB", fontWeight: "600", border: "none", background: "none", cursor: "pointer", padding: 0 }}>Exercises (.zip)</button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Meetings list */}
            <div className="card">
              <h3>Upcoming Live Mentoring Calls</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Host</th><th>Topic</th><th>Time</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Dr. Sakthi</b></td>
                      <td>React Hook Refactoring Standup</td>
                      <td>Today, 3:00 PM</td>
                      <td>
                        <button onClick={() => alert("Joining mock Zoom room...")} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }}>Join zoom</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 3: Restricted Messaging */}
            <div className="card">
              <h3>Chat Room (Restricted: Dr. Sakthi Only)</h3>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "10px", background: "#f9fafb", borderBottom: "1px solid #E5E7EB", fontWeight: "700", fontSize: "13px" }}>
                  Active Chat: Dr. Sakthi (Mentor)
                </div>
                <div style={{ height: "180px", overflowY: "auto", padding: "12px", background: "#FFFFFF", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                      <span style={{ fontSize: "9px", color: "#6B7280" }}>{msg.sender} • {msg.time}</span>
                      <div style={{ backgroundColor: msg.sender === "You" ? "#2563EB" : "#F3F4F6", color: msg.sender === "You" ? "#FFFFFF" : "#1F2937", padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: "flex", borderTop: "1px solid #E5E7EB" }}>
                  <input type="text" placeholder="Ask your mentor a question..." className="form-control" value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} style={{ border: "none", borderRadius: 0 }} />
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: 0 }}>Send</button>
                </form>
              </div>
            </div>
          </div>
        );

      case "Assessments":
        return (
          <div>
            {/* Timed MCQ Assessment */}
            <div className="card">
              <h3>Part A: MCQ Assessment</h3>
              {!mcqStarted && !mcqSubmitted ? (
                <div>
                  <p>A quick 3-minute timed test containing 2 key React questions.</p>
                  <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={() => { setMcqStarted(true); setTimer(60); }}>Start MCQ Test</button>
                </div>
              ) : mcqStarted && !mcqSubmitted ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--danger-color)", fontWeight: 700, marginBottom: "12px", fontSize: "13px" }}>
                    <span>Timer: {timer} seconds remaining</span>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <p><b>Q1. Which hook is used to perform side effects in functional React components?</b></p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button className={`btn ${answers[1] === "useState" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 1: "useState"})}>useState</button>
                      <button className={`btn ${answers[1] === "useEffect" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 1: "useEffect"})}>useEffect</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <p><b>Q2. React props are mutable.</b></p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button className={`btn ${answers[2] === "true" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 2: "true"})}>True</button>
                      <button className={`btn ${answers[2] === "false" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 2: "false"})}>False</button>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={handleMcqSubmit}>Submit MCQ Answers</button>
                </div>
              ) : (
                <p><b>MCQ Status: Completed. Score: {mcqGrade}%</b></p>
              )}
            </div>

            {/* Coding assignment compiler terminal */}
            <div className="card">
              <h3>Part B: Coding Assessment & Compiler Editor</h3>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontWeight: 600, fontSize: "13px" }}>Language: </label>
                <select className="form-control" style={{ width: "120px", display: "inline-block", marginLeft: "10px" }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <textarea 
                className="form-control" 
                rows="6" 
                style={{ fontFamily: "monospace", fontSize: "13px" }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button className="btn btn-secondary" onClick={handleRunCode}>Run Test Cases</button>
                <button className="btn btn-primary" onClick={handleSubmitCode}>Submit to AI Evaluator</button>
              </div>
            </div>

            {/* AI compilation evaluations results display */}
            {evaluating || evalResult ? (
              <div className="card" style={{ marginTop: "24px" }}>
                <h3>AI evaluation results</h3>
                {evaluating ? (
                  <p>Analyzing code structure complexity and performance time...</p>
                ) : (
                  <div>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "6px solid #2563EB", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                        <span style={{ fontSize: "20px", fontWeight: "800", color: "#2563EB" }}>{evalResult.score}%</span>
                        <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>Grade</span>
                      </div>
                      <p style={{ fontSize: "13px" }}>Code complies with structural specifications. Recommended adjustments logged below.</p>
                    </div>
                    <div className="grid">
                      <div className="card" style={{ margin: 0, padding: "12px" }}>
                        <span>Correctness: <b>{evalResult.correctness}%</b></span>
                      </div>
                      <div className="card" style={{ margin: 0, padding: "12px" }}>
                        <span>Code Quality: <b>{evalResult.quality}%</b></span>
                      </div>
                    </div>
                    <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "10px", borderRadius: "4px", fontSize: "12px", color: "#1E3A8A", marginTop: "16px" }}>
                      <b>AI Suggestions:</b> {evalResult.suggestions}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
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
          <h2>Intern Panel</h2>
          <ul>
            {[
              "Overview",
              "Learning",
              "Assessments"
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