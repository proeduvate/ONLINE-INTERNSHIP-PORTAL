import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { API_BASE } from "../api";
import "../styles/Dashboard.css";

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [factData, setFactData] = useState(null);
  const [showFactModal, setShowFactModal] = useState(false);
  const [isFactLoading, setIsFactLoading] = useState(true); // Prevent UI flash before modal

  useEffect(() => {
    let isMounted = true;
    const fetchFact = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/facts`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        const data = await response.json();
        if (isMounted && data && data.fact) {
          setFactData(data);
          setShowFactModal(true);
        }
      } catch (error) {
        console.error("Error fetching fact:", error);
      } finally {
        if (isMounted) setIsFactLoading(false);
      }
    };
    fetchFact();
    return () => { isMounted = false; };
  }, []);


  // Mock State
  const progress = 40; // 12 of 30 days
  const [aiScore, setAiScore] = useState(88);
  const attendancePercent = 90;

  const [currentDay, setCurrentDay] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [repoStatus, setRepoStatus] = useState("Not Requested");
  const [repoUrl, setRepoUrl] = useState(null);
  
  const [githubLink, setGithubLink] = useState("");
  const [linkSubmitted, setLinkSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/tasks/intern`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (isMounted && Array.isArray(data)) {
          setTasks(data);
          const unlockedTasks = data.filter(t => t.unlocked);
          if (unlockedTasks.length > 0) {
            const latest = unlockedTasks[unlockedTasks.length - 1];
            setCurrentDay(latest.day_number);
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        if (isMounted) setIsLoadingTasks(false);
      }
    };
    fetchTasks();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const checkRepoStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/repository-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const assignedReq = data.find(req => req.repository_url);
          if (assignedReq) {
            setRepoStatus("assigned");
            setRepoUrl(assignedReq.repository_url);
          } else {
            const latestReq = data[data.length - 1];
            setRepoStatus(latestReq.request_status);
            setRepoUrl(null);
          }
        } else {
          setRepoStatus("Not Requested");
          setRepoUrl(null);
        }
      } catch (err) {
        console.error("Failed to check repo status", err);
      }
    };
    checkRepoStatus();
  }, [currentDay, tasks]);

  // Use tasks from backend.
  const activeTasks = tasks;

  // MCQ and Assessment Workflow State
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentView, setAssessmentView] = useState("selection"); // selection, mcq, coding
  const [mcqDone, setMcqDone] = useState(false);
  const [codingDone, setCodingDone] = useState(false);
  const [isDayLockedUntilMidnight, setIsDayLockedUntilMidnight] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);

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
    }, 2000);
  };

  const handleCompleteDay = () => {
    alert(`Day ${currentDay} complete! Day ${currentDay + 1} will unlock at 12:00 AM.`);
    setIsDayLockedUntilMidnight(true);
    if (currentDay < activeTasks.length) {
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
        if (isLoadingTasks) return <div style={{ padding: "40px", textAlign: "center" }}>Loading tasks...</div>;
        if (activeTasks.length === 0) return (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "20px" }}>Welcome to Proeduvate!</h3>
            <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "400px", margin: "0 auto" }}>You have not been assigned to an internship domain yet. Please wait for an administrator to assign your domain before you can view tasks.</p>
          </div>
        );
        const currentCurriculum = activeTasks.find(c => c.day_number === currentDay) || activeTasks[activeTasks.length - 1];

        if (showTicketForm) {
          return (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>⚠️ File a Support Ticket</h3>
                <button className="btn btn-secondary" onClick={() => setShowTicketForm(false)}>Back to Learning</button>
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
                        <button className="btn btn-primary" onClick={() => { setAssessmentView("mcq"); setMcqStarted(false); setMcqSubmitted(false); setAnswers({}); setTimer(180); }} style={{ width: "100%", marginTop: "12px" }}>Start MCQ</button>
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

                  <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#1e293b" }}>GitHub Repository Request</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Request a repository for submitting your task code.</p>
                      <p style={{ margin: "6px 0 0 0", fontSize: "14px", fontWeight: "bold" }}>Status: <span style={{ color: repoStatus === "assigned" ? "#10b981" : "#d97706" }}>{repoStatus}</span></p>
                      {repoUrl && (() => {
                        let finalUrl = repoUrl.trim();
                        if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
                          finalUrl = "https://" + finalUrl;
                        }
                        return (
                          <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
                            <b>URL:</b> <a href={finalUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>{repoUrl}</a>
                          </p>
                        );
                      })()}
                    </div>
                    {repoStatus === "assigned" ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          if (repoUrl) {
                            let finalUrl = repoUrl.trim();
                            if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
                              finalUrl = "https://" + finalUrl;
                            }
                            window.open(finalUrl, "_blank");
                          }
                        }}
                      >
                        View Repository
                      </button>
                    ) : repoStatus === "requested" ? (
                      <button className="btn btn-secondary" disabled>
                        Requested...
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          try {
                            const response = await fetch(`${API_BASE}/repository-requests`, {
                              method: "POST",
                              headers: { 
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                              },
                              body: JSON.stringify({ task_id: currentCurriculum.id })
                            });
                            if (!response.ok) {
                              const errorData = await response.json();
                              const detail = errorData.detail;
                              const errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail || errorData);
                              alert(`Error: ${errorMessage || "Failed to request repo"}`);
                              return;
                            }
                            setRepoStatus("requested");
                            alert("Repository requested successfully!");
                          } catch (error) {
                            console.error("Error requesting repo:", error);
                            alert("Network error occurred.");
                          }
                        }}
                      >
                        Request Repository
                      </button>
                    )}
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
                    {!(mcqStarted && !mcqSubmitted) && (
                      <button className="btn btn-secondary" onClick={() => setAssessmentView("selection")} style={{ padding: "6px 12px", fontSize: "12px" }}>Back</button>
                    )}
                  </div>
                  {!mcqStarted && !mcqSubmitted ? (
                    <div>
                      <p>A quick timed test containing 10 key React questions to verify your day's learning.</p>
                      <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={() => { setMcqStarted(true); setTimer(180); setCurrentQuestionIndex(0); }}>Start MCQ Test</button>
                    </div>
                  ) : mcqStarted && !mcqSubmitted ? (
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
                                border: currentQuestionIndex === idx ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                                backgroundColor: currentQuestionIndex === idx ? "#eff6ff" : (answers[q.id] ? "#10b981" : "#fff"),
                                color: currentQuestionIndex === idx ? "#1d4ed8" : (answers[q.id] ? "#fff" : "#4b5563"),
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
                                onClick={() => setAnswers({ ...answers, [mcqQuestionsList[currentQuestionIndex].id]: opt.val })}
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

                          <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <h4 style={{ margin: "0 0 8px 0", fontSize: "15px" }}>Step 3: Push to GitHub</h4>
                            <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#475569" }}>
                              Click the button below to automatically generate a file in your assigned GitHub repository with your completed code! You just need to click "Commit changes" on GitHub.
                            </p>
                            
                            {!linkSubmitted ? (
                              <button 
                                className="btn btn-primary" 
                                style={{ backgroundColor: "#24292e", borderColor: "#24292e", display: "flex", alignItems: "center", gap: "8px" }}
                                onClick={() => {
                                  if(!repoUrl) {
                                    alert("You do not have a repository assigned yet! Please request one first.");
                                    return;
                                  }
                                  
                                  const cleanRepoUrl = repoUrl.replace(/\/$/, "");
                                  const filename = `Day_${currentCurriculum.day_number}_Task.${language === 'python' ? 'py' : 'js'}`;
                                  const githubUrl = `${cleanRepoUrl}/new/main?filename=${encodeURIComponent(filename)}&value=${encodeURIComponent(code)}`;
                                  
                                  window.open(githubUrl, "_blank");
                                  setLinkSubmitted(true);
                                }}
                              >
                                <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="white"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                                Create File on GitHub
                              </button>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: "bold" }}>
                                <span>✓ Code successfully sent to GitHub!</span>
                              </div>
                            )}
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
                <h3 style={{ margin: 0 }}>Day {currentCurriculum.day_number}: {currentCurriculum.title}</h3>
                <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "6px", marginBottom: "16px" }}>{currentCurriculum.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f3f4f6", padding: "10px 16px", borderRadius: "8px", width: "fit-content" }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>📄 {currentCurriculum.instructions || 'Task Instructions'}</span>
                  <button onClick={() => alert(`Downloading ${currentCurriculum.instructions}`)} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", fontSize: "13px", padding: 0, textDecoration: "underline" }}>Download PDF Notes</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderLeft: "1px solid #e5e7eb", paddingLeft: "24px", minWidth: "180px" }}>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.5px" }}>DAY ASSESSMENT</span>
                <button 
                  className="btn btn-primary" 
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    try {
                      const response = await fetch(`${API_BASE}/tasks/${currentCurriculum.id}/start`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}` }
                      });
                      if (!response.ok) {
                        const err = await response.json();
                        alert(`Warning: ${err.detail}`);
                      }
                    } catch (e) {
                      console.error("Failed to start task:", e);
                    }
                    setShowAssessment(true);
                  }} 
                  style={{ padding: "10px 20px", fontSize: "13px", width: "100%" }}
                >
                  Start Task
                </button>
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

            {/* Row 3: Support & Ticketing */}
            <div className="card" style={{ marginTop: "16px", backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
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
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#991b1b", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>TKT-1042</span>
                      <span style={{ fontSize: "13px", color: "#1f2937", fontWeight: 500 }}>Environment setup failing on local machine during Docker build</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Filed: 2 days ago</span>
                      <span className="badge badge-warning" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>In Progress</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#4b5563", fontWeight: 700, backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>TKT-0985</span>
                      <span style={{ fontSize: "13px", color: "#4b5563", fontWeight: 500, textDecoration: "line-through" }}>Missing lecture notes for Day 5</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>Filed: 1 week ago</span>
                      <span className="badge badge-success" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>Resolved</span>
                    </div>
                  </div>
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
      {/* Daily Fact Modal Overlay */}
      {showFactModal && factData && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "32px", width: "90%", maxWidth: "450px", border: "1px solid rgba(255, 255, 255, 0.4)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative", animation: "slideIn 0.15s ease-out" }}>
            <button onClick={() => setShowFactModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
              <X size={20} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", marginBottom: "16px", boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)" }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", background: "linear-gradient(to right, #1e293b, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 }}>Daily Domain Insight</h3>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>{factData.domain}</span>
              <p style={{ margin: "0 0 24px 0", fontSize: "15px", color: "#334155", lineHeight: "1.6", fontWeight: 500 }}>"{factData.fact}"</p>
              <button onClick={() => setShowFactModal(false)} className="btn btn-primary" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.4)", color: "#fff", cursor: "pointer" }}>Got it, let's go!</button>
            </div>
          </div>
          <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        </div>
      )}

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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {factData && (
              <button
                onClick={() => setShowFactModal(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8b5cf6", display: "flex", alignItems: "center", gap: "6px" }}
                title="View Daily Fact"
              >
                <Sparkles size={20} />
              </button>
            )}
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
              Role: <b>Intern</b>
            </span>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}