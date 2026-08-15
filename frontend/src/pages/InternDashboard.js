import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

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
                    <button className="btn btn-secondary" onClick={() => setAssessmentView("selection")} style={{ padding: "6px 12px", fontSize: "12px" }}>Back</button>
                  </div>
                  {!mcqStarted && !mcqSubmitted ? (
                    <div>
                      <p>A quick timed test containing 10 key React questions to verify your day's learning.</p>
                      <button className="btn btn-primary" style={{ marginTop: "10px" }} onClick={() => { setMcqStarted(true); setTimer(180); }}>Start MCQ Test</button>
                    </div>
                  ) : mcqStarted && !mcqSubmitted ? (
                    <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--danger-color)", fontWeight: 700, marginBottom: "12px", fontSize: "13px", position: "sticky", top: 0, background: "#fff", padding: "8px 0" }}>
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
                      <div style={{ marginBottom: "16px" }}>
                        <p><b>Q3. What is the correct syntax to import React?</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[3] === "import" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 3: "import"})}>import React from 'react'</button>
                          <button className={`btn ${answers[3] === "destructure" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 3: "destructure"})}>import {"{ React }"} from 'react'</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <p><b>Q4. Virtual DOM updates are slower than Real DOM updates.</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[4] === "true" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 4: "true"})}>True</button>
                          <button className={`btn ${answers[4] === "false" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 4: "false"})}>False</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <p><b>Q5. Which function is used to update state in useState hook?</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[5] === "setState" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 5: "setState"})}>setState()</button>
                          <button className={`btn ${answers[5] === "updater" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 5: "updater"})}>The second returned element</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <p><b>Q6. React components must start with a capital letter.</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[6] === "true" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 6: "true"})}>True</button>
                          <button className={`btn ${answers[6] === "false" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 6: "false"})}>False</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <p><b>Q7. What does JSX stand for?</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[7] === "xml" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 7: "xml"})}>JavaScript XML</button>
                          <button className={`btn ${answers[7] === "extension" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 7: "extension"})}>Java Syntax Extension</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <p><b>Q8. Can functional components have state in React?</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[8] === "yes" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 8: "yes"})}>Yes</button>
                          <button className={`btn ${answers[8] === "no" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 8: "no"})}>No</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <p><b>Q9. Which prop is required when rendering a list of elements dynamically?</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[9] === "key" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 9: "key"})}>key</button>
                          <button className={`btn ${answers[9] === "id" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 9: "id"})}>id</button>
                        </div>
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <p><b>Q10. React is a full framework.</b></p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button className={`btn ${answers[10] === "true" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 10: "true"})}>True</button>
                          <button className={`btn ${answers[10] === "false" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAnswers({...answers, 10: "false"})}>False</button>
                        </div>
                      </div>
                      <button className="btn btn-primary" onClick={handleMcqSubmit} style={{ width: "100%", padding: "12px" }}>Submit MCQ Answers</button>
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

            {/* Row 3: Restricted Messaging */}
            <div className="card" style={{ marginTop: "16px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Chat Room (Restricted: Dr. Sakthi Only)</h3>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #E5E7EB", fontWeight: "700", fontSize: "12px" }}>
                  Active Chat: Dr. Sakthi (Mentor)
                </div>
                <div style={{ height: "100px", overflowY: "auto", padding: "10px", background: "#FFFFFF", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                      <span style={{ fontSize: "9px", color: "#6B7280" }}>{msg.sender} • {msg.time}</span>
                      <div style={{ backgroundColor: msg.sender === "You" ? "#2563EB" : "#F3F4F6", color: msg.sender === "You" ? "#FFFFFF" : "#1F2937", padding: "4px 8px", borderRadius: "8px", fontSize: "12px" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: "flex", borderTop: "1px solid #E5E7EB", margin: 0 }}>
                  <input type="text" placeholder="Ask your mentor a question..." className="form-control" value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} style={{ border: "none", borderRadius: 0, padding: "8px", marginBottom: 0, fontSize: "13px" }} />
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: 0, padding: "0 16px" }}>Send</button>
                </form>
              </div>
            </div>
          </div>
        );

      case "Leadership":
        const internsRank = [
          { rank: 1, name: "Anu Sharma", domain: "Cyber Security", points: 950, badge: "🥇 Gold" },
          { rank: 2, name: "Raj Patel", domain: "Data Science", points: 880, badge: "🥈 Silver" },
          { rank: 3, name: "John Doe (You)", domain: "Artificial Intelligence", points: 850, badge: "🥉 Bronze", isCurrent: true },
          { rank: 4, name: "Alice Smith", domain: "Data Science", points: 790, badge: "Member" },
          { rank: 5, name: "Bob Jones", domain: "Web Development", points: 720, badge: "Member" },
        ];
        return (
          <div className="card">
            <h3>Leaderboard - Top Competing Interns</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Compete with your peers based on your overall evaluation progress and daily assessment points.</p>
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
                  {internsRank.map((intern) => (
                    <tr key={intern.rank} style={intern.isCurrent ? { backgroundColor: "#eff6ff", fontWeight: "bold" } : {}}>
                      <td>{intern.rank}</td>
                      <td>{intern.name}</td>
                      <td><span className="badge badge-success">{intern.domain}</span></td>
                      <td style={{ color: "#2563eb", fontWeight: 600 }}>{intern.points} pts</td>
                      <td>{intern.badge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
            <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "50px", maxWidth: "100%" }} />
          </div>
          <ul>
            {[
              "Overview",
              "Learning",
              "Leadership"
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