import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mock State
  const progress = 40; // 12 of 30 days
  const [aiScore, setAiScore] = useState(88);
  const attendancePercent = 90;

  // Dynamic Learning Workflow State
  const [currentDay, setCurrentDay] = useState(1);
  
  const curriculumData = [
    { day: 1, topic: "Introduction to React", desc: "Understand component composition, JSX, and render paths.", notes: "Lecture_Notes_Day1.pdf" },
    { day: 2, topic: "State and Props", desc: "Learn to handle component data flow using props and local state.", notes: "Lecture_Notes_Day2.pdf" },
    { day: 3, topic: "React Hooks Lifecycle", desc: "Implement useEffect and customize functional hooks.", notes: "Lecture_Notes_Day3.pdf" },
    { day: 4, topic: "Context API & Global State", desc: "Avoid prop drilling by introducing context providers.", notes: "Lecture_Notes_Day4.pdf" },
    { day: 5, topic: "Routing and Layouts", desc: "Route single page interfaces cleanly using react-router.", notes: "Lecture_Notes_Day5.pdf" }
  ];

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

  const mcqQuestionsList = [
    { id: 1, text: "Which hook is used to perform side effects in functional React components?", options: [{ label: "useState", val: "useState" }, { label: "useEffect", val: "useEffect" }] },
    { id: 2, text: "React props are mutable.", options: [{ label: "True", val: "true" }, { label: "False", val: "false" }] },
    { id: 3, text: "What is the correct syntax to import React?", options: [{ label: "import React from 'react'", val: "import" }, { label: "import { React } from 'react'", val: "destructure" }] },
    { id: 4, text: "Virtual DOM updates are slower than Real DOM updates.", options: [{ label: "True", val: "true" }, { label: "False", val: "false" }] },
    { id: 5, text: "Which function is used to update state in useState hook?", options: [{ label: "setState()", val: "setState" }, { label: "The second returned element", val: "updater" }] },
    { id: 6, text: "React components must start with a capital letter.", options: [{ label: "True", val: "true" }, { label: "False", val: "false" }] },
    { id: 7, text: "What does JSX stand for?", options: [{ label: "JavaScript XML", val: "xml" }, { label: "Java Syntax Extension", val: "extension" }] },
    { id: 8, text: "Can functional components have state in React?", options: [{ label: "Yes", val: "yes" }, { label: "No", val: "no" }] },
    { id: 9, text: "Which prop is required when rendering a list of elements dynamically?", options: [{ label: "key", val: "key" }, { label: "id", val: "id" }] },
    { id: 10, text: "React is a full framework.", options: [{ label: "True", val: "true" }, { label: "False", val: "false" }] },
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 11,
      text: `Mock Question ${i + 11} for React assessment.`,
      options: [{ label: "Option A", val: "A" }, { label: "Option B", val: "B" }, { label: "Option C", val: "C" }, { label: "Option D", val: "D" }]
    }))
  ];

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
      alert(`Coding assessment submitted! Score: ${randomScore}%. Part B completed.`);
      setCodingDone(true);
      setAssessmentView("selection");
    }, 2000);
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
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginTop: "24px" }}>
              {/* Daily Task / Analytics (Left) */}
              <div className="card" style={{ margin: 0, padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#ffffff", border: "none", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#eff6ff", color: "#3b82f6", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" }}>
                        🎯
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Today's Objective</h3>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Day 12: React Framework Basics</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#fef2f2", padding: "6px 12px", borderRadius: "20px" }}>
                      <span style={{ fontSize: "14px" }}>⏳</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444" }}>45 mins left</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", fontWeight: 600 }}>
                      <span style={{ color: "#475569" }}>Module Progress</span>
                      <span style={{ color: "#3b82f6" }}>65%</span>
                    </div>
                    <div style={{ width: "100%", backgroundColor: "#e2e8f0", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: "65%", backgroundColor: "#3b82f6", height: "100%", borderRadius: "8px" }}></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "12px" }}>Key Topics</span>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#dcfce7", color: "#16a34a", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px" }}>✓</div>
                        Component Composition
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#f3f4f6", color: "#9ca3af", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px" }}>▶</div>
                        JSX Syntax & Rules
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#f8fafc", color: "#cbd5e1", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px" }}>🔒</div>
                        Render Paths
                      </li>
                    </ul>
                  </div>

                  <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px" }}>📅</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Upcoming Meeting</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>React Hook Refactoring</h4>
                        <span style={{ fontSize: "13px", color: "#475569" }}>Dr. Sakthi • 3:00 PM</span>
                      </div>
                      <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 600, backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "8px" }} onClick={() => alert("Joining mock Zoom room...")}>Join</button>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: "100%", marginTop: "24px", padding: "14px", fontSize: "15px", fontWeight: 600, borderRadius: "10px", backgroundColor: "#3b82f6", border: "none" }}
                  onClick={() => setActiveTab("Learning")}
                >
                  Resume Learning
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
                      {[
                        { rank: 1, name: "Anu Sharma", domain: "Cyber Security", points: 950, badge: "🥇 Gold" },
                        { rank: 2, name: "Raj Patel", domain: "Data Science", points: 880, badge: "🥈 Silver" },
                        { rank: 3, name: "John Doe (You)", domain: "Artificial Intelligence", points: 850, badge: "🥉 Bronze", isCurrent: true },
                        { rank: 4, name: "Alice Smith", domain: "Data Science", points: 790, badge: "Member" },
                        { rank: 5, name: "Bob Jones", domain: "Web Development", points: 720, badge: "Member" },
                      ].map((intern) => (
                        <tr key={intern.rank} style={intern.isCurrent ? { backgroundColor: "#eff6ff", fontWeight: "bold" } : {}}>
                          <td>{intern.rank}</td>
                          <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: intern.isCurrent ? "#3b82f6" : "#e5e7eb", color: intern.isCurrent ? "#fff" : "#6b7280", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px", fontWeight: "bold" }}>
                              {intern.name.split(" ")[0][0]}{intern.name.split(" ")[1] ? intern.name.split(" ")[1][0] : ""}
                            </div>
                            {intern.name}
                          </td>
                          <td><span className="badge badge-success">{intern.domain}</span></td>
                          <td style={{ color: "#2563eb", fontWeight: 600 }}>{intern.points} pts</td>
                          <td>{intern.badge}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        );

      case "Learning":
        const currentCurriculum = curriculumData.find(c => c.day === currentDay) || curriculumData[curriculumData.length - 1];
        
        if (isDayLockedUntilMidnight) {
          return (
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>🔒</p>
              <h3>Day {currentDay} is Locked</h3>
              <p style={{ color: "#6b7280", margin: "8px 0 24px 0" }}>Your next learning materials will unlock automatically tomorrow at 12:00 AM.</p>
              <button className="btn btn-secondary" onClick={() => setIsDayLockedUntilMidnight(false)}>Bypass / Unlock Now (Demo Mode)</button>
            </div>
          );
        }

        if (showAssessment) {
          return (
            <div>
              {assessmentView === "selection" && (
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>Day {currentDay} Assessment Selection</h3>
                    <button className="btn btn-secondary" onClick={() => setShowAssessment(false)} style={{ padding: "6px 12px", fontSize: "12px" }}>Back to Learning</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div className="card" style={{ margin: 0, textAlign: "center", border: "1px solid #e5e7eb", background: mcqDone ? "#ecfdf5" : "#fff" }}>
                      <h4>Part A: MCQ Assessment</h4>
                      <p style={{ color: "#6b7280", fontSize: "13px" }}>Answer timed questions on today's concepts.</p>
                      {mcqDone ? (
                        <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "14px" }}>✓ Completed</span>
                      ) : (
                        <button className="btn btn-primary" onClick={() => { setAssessmentView("mcq"); setMcqStarted(true); setMcqSubmitted(false); setAnswers({}); setTimer(180); setCurrentQuestionIndex(0); }} style={{ width: "100%", marginTop: "12px" }}>Start MCQ</button>
                      )}
                    </div>
                    <div className="card" style={{ margin: 0, textAlign: "center", border: "1px solid #e5e7eb", background: codingDone ? "#ecfdf5" : "#fff" }}>
                      <h4>Part B: Coding Assessment</h4>
                      <p style={{ color: "#6b7280", fontSize: "13px" }}>Write and execute code in our compiler.</p>
                      {codingDone ? (
                        <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "14px" }}>✓ Completed</span>
                      ) : (
                        <button className="btn btn-primary" onClick={() => setAssessmentView("coding")} style={{ width: "100%", marginTop: "12px" }}>Start Coding</button>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 12px 0", color: "#0f172a", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      📋 Rules and Conditions for Assessment
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
                      <li><b>Completion:</b> Both Part A (MCQ) and Part B (Coding) must be completed to unlock the next day's module.</li>
                      <li><b>Timing:</b> The MCQ section is strictly timed. The timer cannot be paused once started.</li>
                      <li><b>Navigation:</b> During the MCQ test, you cannot return to the selection menu without submitting your answers.</li>
                      <li><b>Integrity:</b> Do not refresh the page during an active assessment, as this may result in automatic submission.</li>
                      <li><b>Grading:</b> AI Evaluation scores will be available immediately, while Mentor reviews may take up to 24 hours.</li>
                    </ul>
                  </div>

                  {mcqDone && codingDone && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                      <button className="btn btn-primary" onClick={handleCompleteDay} style={{ backgroundColor: "#10b981", borderColor: "#10b981", padding: "12px 32px", fontSize: "16px" }}>Complete & Unlock Next Day</button>
                    </div>
                  )}
                </div>
              )}

              {/* Timed MCQ Assessment */}
              {assessmentView === "mcq" && (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0 }}>Part A: MCQ Assessment</h3>
                    {mcqSubmitted && (
                      <button className="btn btn-secondary" onClick={() => setAssessmentView("selection")} style={{ padding: "6px 12px", fontSize: "12px" }}>Back</button>
                    )}
                  </div>
                  {!mcqSubmitted ? (
                    <div>
                      {/* Top Bar: Timer and Submit */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px", marginBottom: "16px" }}>
                        <div style={{ color: "var(--danger-color)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                          ⏱️ Timer: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                        </div>
                        <button className="btn btn-primary" onClick={handleMcqSubmit} style={{ padding: "8px 16px", backgroundColor: "#10b981", borderColor: "#10b981" }}>Submit Test</button>
                      </div>

                      <div style={{ display: "flex", gap: "24px" }}>
                        {/* Left Sidebar: Question Numbers Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", width: "180px", alignContent: "start", borderRight: "1px solid #e5e7eb", paddingRight: "16px", maxHeight: "400px", overflowY: "auto" }}>
                          {mcqQuestionsList.map((q, idx) => (
                            <button 
                              key={q.id}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              style={{
                                aspectRatio: "1/1",
                                padding: 0,
                                borderRadius: "6px",
                                  border: currentQuestionIndex === idx ? "2px solid #3b82f6" : (answers[q.id] ? "1px solid #10b981" : "1px solid #e5e7eb"),
                                  backgroundColor: answers[q.id] ? "#10b981" : (currentQuestionIndex === idx ? "#eff6ff" : "#fff"),
                                  color: answers[q.id] ? "#fff" : (currentQuestionIndex === idx ? "#1d4ed8" : "#4b5563"),
                                  fontWeight: currentQuestionIndex === idx ? 700 : 500,
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: "14px"
                              }}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>

                        {/* Right Content: Current Question */}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "16px", marginBottom: "20px", color: "#1e293b", lineHeight: "1.5" }}>
                            <b>Q{currentQuestionIndex + 1}.</b> {mcqQuestionsList[currentQuestionIndex].text}
                          </h4>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {mcqQuestionsList[currentQuestionIndex].options.map(opt => (
                              <button 
                                key={opt.val}
                                className={`btn ${answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "btn-primary" : "btn-secondary"}`} 
                                onClick={() => setAnswers({...answers, [mcqQuestionsList[currentQuestionIndex].id]: opt.val})}
                                style={{ textAlign: "left", padding: "12px 16px", fontSize: "14px", justifyContent: "flex-start", backgroundColor: answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "#3b82f6" : "#fff", color: answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "#fff" : "#333", border: answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "none" : "1px solid #d1d5db" }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          {/* Navigation Buttons */}
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                            <button 
                              className="btn btn-secondary" 
                              disabled={currentQuestionIndex === 0} 
                              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                              style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                            >
                              Previous
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              disabled={currentQuestionIndex === mcqQuestionsList.length - 1} 
                              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                              style={{ opacity: currentQuestionIndex === mcqQuestionsList.length - 1 ? 0.5 : 1 }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p><b>MCQ Status: Completed. Score: {mcqGrade}%</b></p>
                      <button className="btn btn-primary" onClick={() => setAssessmentView("selection")}>Continue</button>
                    </div>
                  )}
                </div>
              )}

              {/* Coding assignment compiler terminal */}
              {assessmentView === "coding" && (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0 }}>Part B: Coding Assessment</h3>
                    <button className="btn btn-secondary" onClick={() => setAssessmentView("selection")} style={{ padding: "6px 12px", fontSize: "12px" }}>Back</button>
                  </div>
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

                  {evaluating || evalResult ? (
                    <div style={{ marginTop: "24px" }}>
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
                          <button className="btn btn-primary" onClick={() => setAssessmentView("selection")} style={{ marginTop: "16px" }}>Continue</button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        }

        return (
          <div>
            {/* Course notes ONLY, NO video */}
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>Day {currentCurriculum.day}: {currentCurriculum.topic}</h3>
                <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "6px", marginBottom: "16px" }}>{currentCurriculum.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f3f4f6", padding: "10px 16px", borderRadius: "8px", width: "fit-content" }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>📄 {currentCurriculum.notes}</span>
                  <button onClick={() => alert(`Downloading ${currentCurriculum.notes}`)} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", fontSize: "13px", padding: 0, textDecoration: "underline" }}>Download PDF Notes</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderLeft: "1px solid #e5e7eb", paddingLeft: "24px", minWidth: "180px" }}>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px" }}>DAY ASSESSMENT</span>
                <button className="btn btn-primary" onClick={() => setShowAssessment(true)} style={{ padding: "10px 20px", fontSize: "13px", width: "100%" }}>Start Test</button>
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

          </div>
        );

      case "Tickets":
        if (showTicketForm) {
          return (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>⚠️ File a Support Ticket</h3>
                <button className="btn btn-secondary" onClick={() => setShowTicketForm(false)}>Back to Tickets</button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>User Name</label>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>John Doe</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Mentor Name</label>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>Dr. Sakthi</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Domain</label>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>Artificial Intelligence</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Branch / University</label>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>Computer Science (MIT)</div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Issue Description (Short Title)</label>
                  <input type="text" className="form-control" placeholder="e.g. Cannot access Week 2 GitHub repo" />
                </div>
                
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Detailed Content (Exact Issue)</label>
                  <textarea className="form-control" rows="5" placeholder="Please describe exactly what you are facing, steps to reproduce, and any error messages..."></textarea>
                </div>
                
                <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" style={{ backgroundColor: "#b91c1c", borderColor: "#b91c1c" }} onClick={() => {
                    alert("Ticket submitted successfully! Admin will review it shortly.");
                    setShowTicketForm(false);
                  }}>Submit Ticket</button>
                </div>
              </div>
            </div>
          );
        }

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
      <div className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', gap: '10px', marginBottom: '30px' }}>
            {isSidebarOpen && <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "50px", maxWidth: "100%" }} />}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>☰</button>
          </div>
          <ul>
            {[
              { id: "Overview", icon: "📊" },
              { id: "Learning", icon: "📚" },
              { id: "Tickets", icon: "🎫" },
              { id: "Chat with Mentor", icon: "💬" }
            ].map((tab) => (
              <li
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
                title={!isSidebarOpen ? tab.id : ""}
              >
                <span>{tab.icon}</span>
                {isSidebarOpen && <span className="sidebar-text">{tab.id}</span>}
              </li>
            ))}
          </ul>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          {isSidebarOpen ? "Logout" : "🚪"}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main">
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>☰</button>}
            <h2>{activeTab}</h2>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
            Role: <b>Intern</b>
          </span>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}