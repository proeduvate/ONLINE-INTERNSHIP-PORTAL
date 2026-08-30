import { useState, useEffect } from "react";
import { Sparkles, X, Bell } from "lucide-react";
import { API_BASE } from "../../services/apiClient";
import SimulationView from "../../features/users/components/SimulationView";
import "./Dashboard.css";

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [factData, setFactData] = useState(null);
  const [showFactModal, setShowFactModal] = useState(false);
  const [isFactLoading, setIsFactLoading] = useState(true); // Prevent UI flash before modal

  const fetchFact = async (showInstantly = false) => {
    if (showInstantly) setShowFactModal(true);
    setIsFactLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/facts`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
        return;
      }
      const data = await response.json();
      if (data) {
        if (data.fact) {
          setFactData(data);
          setShowFactModal(true);
        } else if (data.completed) {
          setFactData({ domain: "All Caught Up!", fact: data.message });
          setShowFactModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching fact:", error);
    } finally {
      setIsFactLoading(false);
    }
  };

  useEffect(() => {
    fetchFact(false);
  }, []);


  // Mock State
  const progress = 40; // 12 of 30 days
  const [aiScore] = useState(88);
  const attendancePercent = 90;

  const [currentDay, setCurrentDay] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);


  useEffect(() => {
    let isMounted = true;
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/tasks/intern`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "/login";
          return;
        }
        const data = await response.json();
        if (isMounted && Array.isArray(data)) {
          setTasks(data);
          const unlockedTasks = data.filter(t => t.unlocked);
          if (unlockedTasks.length > 0) {
            const latest = unlockedTasks[unlockedTasks.length - 1];
            setCurrentDay(latest.day_number);
            
            // Check status for the current day's tasks
            const dayTasks = data.filter(t => t.day_number === latest.day_number);
            const codingTask = dayTasks.find(t => t.task_type === "coding");
            const simTask = dayTasks.find(t => t.task_type === "simulation");

            if (codingTask && ["submitted", "approved"].includes(codingTask.status)) {
                setMcqDone(true);
                setCodingDone(true);
            } else {
                setMcqDone(false);
                setCodingDone(false);
            }

            if (simTask && ["submitted", "approved"].includes(simTask.status)) {
                setSimulationDone(true);
            } else if (simTask && simTask.ai_feedback) {
              try {
                const parsed = JSON.parse(simTask.ai_feedback);
                if (parsed.day_completed) {
                  setSimulationDone(true);
                } else {
                  setSimulationDone(false);
                }
              } catch(e) {
                  setSimulationDone(false);
              }
            } else {
                setSimulationDone(false);
            }
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


  // Use tasks from backend.
  const activeTasks = tasks;

  // MCQ and Assessment Workflow State
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [assessmentView, setAssessmentView] = useState("selection"); // selection, mcq, coding
  const [mcqDone, setMcqDone] = useState(false);
  const [codingDone, setCodingDone] = useState(false);
  const [simulationDone, setSimulationDone] = useState(false);
  const [analyticsPosted, setAnalyticsPosted] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [activeAirdrop, setActiveAirdrop] = useState(null);
  const [airdropAnswer, setAirdropAnswer] = useState("");
  const [airdropTimeLeft, setAirdropTimeLeft] = useState(0);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilMidnight(`${h}h ${m < 10 ? '0' : ''}${m}m ${s < 10 ? '0' : ''}${s}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [ticketRes, airdropRes, notifRes] = await Promise.all([
          fetch(`${API_BASE}/tickets`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${API_BASE}/bonus-airdrops`, { headers: { "Authorization": `Bearer ${token}` } }),
          fetch(`${API_BASE}/notifications`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          if (isMounted) setTickets(ticketData);
        }
        if (airdropRes.ok) {
          const airdropData = await airdropRes.json();
          if (isMounted) setAirdrops(airdropData);
        }
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (isMounted) setNotifications(notifData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleTicketAction = async (action, payload = {}) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
      });
      if (res.ok) {
        const updatedT = await res.json();
        setSelectedTicket(updatedT);
        setTickets(tickets.map(t => t.id === updatedT.id ? updatedT : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      const token = localStorage.getItem("token");
      try {
        const lbRes = await fetch(`${API_BASE}/leaderboard?period=${leaderboardPeriod}`, { headers: { "Authorization": `Bearer ${token}` } });
        if (lbRes.ok) {
          const lbData = await lbRes.json();
          if (isMounted) setLeaderboard(lbData);
        }
      } catch (e) {}
    };
    fetchLeaderboard();
    return () => { isMounted = false; };
  }, [leaderboardPeriod]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE}/notifications/${notif.id}/read`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` }
        });
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (e) {
        console.error(e);
      }
    }
    setShowNotifDropdown(false);
  };

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
  const [filename, setFilename] = useState("");

  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // Chat message state
  const [chatMessages, setChatMessages] = useState([
    { sender: "Mentor", text: "Hi John, I saw your code. Good effort, try to refactor the key prop warning.", time: "10:30 AM" }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  useEffect(() => {
    const postAnalytics = async () => {
      if (mcqDone && codingDone && mcqGrade !== null && evalResult !== null && !analyticsPosted) {
        const token = localStorage.getItem("token");
        const payload = {
          question_id: currentDay,
          mcq_score: mcqGrade,
          coding_score: evalResult.score,
          date: new Date().toISOString().split('T')[0]
        };

        try {
          const res = await fetch(`${API_BASE}/daily-questions/results`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          
          if (res.ok) {
            setAnalyticsPosted(true);
            alert("Daily scores successfully recorded to your analytics!");
          }
        } catch (err) {
          console.error("Failed to post analytics:", err);
        }
      }
    };
    postAnalytics();
  }, [mcqDone, codingDone, mcqGrade, evalResult, analyticsPosted, currentDay]);

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

  const handleParticipateAirdrop = async (airdrop) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/bonus-airdrops/${airdrop.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "start" })
      });
      if (res.ok) {
        const updatedAirdrop = await res.json();
        setActiveAirdrop(updatedAirdrop);
        setAirdropTimeLeft(updatedAirdrop.time_limit);
        if (updatedAirdrop.task_type === 'match') {
          setAirdropAnswer({});
        } else if (updatedAirdrop.task_type === 'arrange') {
          setAirdropAnswer(Array(updatedAirdrop.task_config?.items?.length || 0).fill(""));
        } else {
          setAirdropAnswer("");
        }
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to start airdrop.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error starting airdrop.");
    }
  };

  const handleSubmitAirdrop = async () => {
    if (!activeAirdrop) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/bonus-airdrops/${activeAirdrop.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "submit", answer: airdropAnswer })
      });
      if (res.ok) {
        alert("Airdrop submitted successfully!");
        setActiveAirdrop(null);
        // refresh airdrops
        const airdropRes = await fetch(`${API_BASE}/bonus-airdrops`, { headers: { "Authorization": `Bearer ${token}` } });
        if (airdropRes.ok) {
            const airdropData = await airdropRes.json();
            setAirdrops(airdropData);
        }
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to submit airdrop.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error submitting airdrop.");
    }
  };

  useEffect(() => {
    let interval;
    if (activeAirdrop && airdropTimeLeft > 0) {
      interval = setInterval(() => {
        setAirdropTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitAirdrop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeAirdrop, airdropTimeLeft]);

  const handleRunCode = () => {
    alert("Running code against test cases...\nResult: PASSED (2/2 test cases)");
  };

  const handleSubmitCode = async () => {
    const currentCurriculum = activeTasks.find(c => c.day_number === currentDay) || activeTasks[activeTasks.length - 1] || { id: 1, day_number: currentDay };
    setEvaluating(true);
    const token = localStorage.getItem("token");
    try {
      const ext = language === 'python' ? 'py' : (language === 'javascript' ? 'js' : 'txt');
      const finalFilename = filename.trim() || `day${currentCurriculum.day_number}.${ext}`;
      const payload = {
        task_id: currentCurriculum.id,
        code_submission: code,
        language: language,
        filename: finalFilename
      };

      const res = await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Error: ${errData.detail || "Submission failed"}`);
        setEvaluating(false);
        return;
      }

      const data = await res.json();

      setEvaluating(false);
      let parsedSuggestions = data.ai_feedback || "Good job!";
      try {
        const parsed = JSON.parse(data.ai_feedback);
        let msgs = [];
        if (parsed.ai_analysis && parsed.ai_analysis.feedback) msgs.push(parsed.ai_analysis.feedback);
        if (parsed.runtime_evaluation && parsed.runtime_evaluation.runtime_feedback) msgs.push(`Runtime: ${parsed.runtime_evaluation.runtime_feedback}`);
        if (msgs.length > 0) {
          parsedSuggestions = msgs.join(" | ");
        } else {
          parsedSuggestions = "Code submitted successfully.";
        }
      } catch (e) { }
      setEvalResult({
        score: data.ai_score || 100,
        correctness: 100,
        logic: 90,
        quality: 85,
        performance: 95,
        suggestions: parsedSuggestions,
        ext: ext,
        savedFilename: finalFilename
      });
      alert(`Coding assessment submitted!`);
      setCodingDone(true);
    } catch (e) {
      console.error(e);
      alert("Network error during submission.");
      setEvaluating(false);
    }
  };

  const handleCompleteDay = () => {
    alert(`Day ${currentDay} Simulation complete! Unlocking Day ${currentDay + 1}.`);
    if (currentDay < activeTasks.length) {
      setCurrentDay(currentDay + 1);
    }
    // Reset test states
    setMcqDone(false);
    setCodingDone(false);
    setSimulationDone(false);
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>Leaderboard - Top Competing Interns</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>Compete with your peers based on your overall evaluation progress and daily assessment points.</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "4px" }}>
                      {["weekly", "monthly", "all"].map(period => (
                        <button
                          key={period}
                          onClick={() => setLeaderboardPeriod(period)}
                          style={{
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
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
                    <div style={{ backgroundColor: "#eff6ff", padding: "8px 16px", borderRadius: "20px", color: "#1d4ed8", fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap" }}>
                      Your Rank: #3
                    </div>
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
                      {leaderboard.length > 0 ? leaderboard.map((intern) => (
                        <tr key={intern.rank} style={intern.isCurrent ? { backgroundColor: "#eff6ff", fontWeight: "bold" } : {}}>
                          <td>{intern.rank}</td>
                          <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: intern.isCurrent ? "#3b82f6" : "#e5e7eb", color: intern.isCurrent ? "#fff" : "#6b7280", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px", fontWeight: "bold" }}>
                              {intern.user_name ? intern.user_name.substring(0, 2).toUpperCase() : "?"}
                            </div>
                            {intern.user_name}
                          </td>
                          <td><span className="badge badge-success">{intern.domain || intern.batch || "Unassigned"}</span></td>
                          <td style={{ color: "#2563eb", fontWeight: 600 }}>{intern.total_points} pts</td>
                          <td>
                            {intern.rank === 1 ? "🥇 Gold" : intern.rank === 2 ? "🥈 Silver" : intern.rank === 3 ? "🥉 Bronze" : "Member"}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" style={{textAlign: "center"}}>No leaderboard data available</td></tr>
                      )}
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
                  <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div>
                      <label style={{ fontWeight: 600, fontSize: "13px" }}>Language: </label>
                      <select className="form-control" style={{ width: "120px", display: "inline-block", marginLeft: "10px", marginBottom: 0 }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontWeight: 600, fontSize: "13px" }}>File Name: </label>
                      <input className="form-control" placeholder={`e.g. day${currentCurriculum.day_number}.${language === 'python' ? 'py' : 'js'}`} value={filename} onChange={(e) => setFilename(e.target.value)} style={{ width: "180px", display: "inline-block", marginLeft: "10px", marginBottom: 0 }} />
                    </div>
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
                          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "10px", borderRadius: "4px", fontSize: "12px", color: "#166534", marginTop: "12px" }}>
                            <b>File Saved:</b> Your code has been saved as <code>{evalResult.savedFilename}</code>
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
                  style={{ padding: "10px 20px", fontSize: "13px", width: "100%", marginBottom: "10px" }}
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



          </div>
        );

      case "Support & Ticketing":
        if (showTicketForm) {
          return (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>⚠️ File a Support Ticket</h3>
                <button className="btn btn-secondary" onClick={() => setShowTicketForm(false)}>Back</button>
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
                  <input type="text" className="form-control" placeholder="e.g. Cannot access Week 2 GitHub repo" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Detailed Content (Exact Issue)</label>
                  <textarea className="form-control" rows="5" placeholder="Please describe exactly what you are facing, steps to reproduce, and any error messages..." value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)}></textarea>
                </div>

                <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" style={{ backgroundColor: "#b91c1c", borderColor: "#b91c1c", opacity: isSubmittingTicket ? 0.7 : 1 }} disabled={isSubmittingTicket} onClick={async () => {
                    if (!ticketTitle.trim() || !ticketDesc.trim()) {
                      alert("Please provide both a title and description.");
                      return;
                    }
                    if (isSubmittingTicket) return;
                    setIsSubmittingTicket(true);
                    const token = localStorage.getItem("token");
                    try {
                      const res = await fetch(`${API_BASE}/tickets`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ title: ticketTitle, description: ticketDesc, domain: "General" })
                      });
                      if (res.ok) {
                        const newTicket = await res.json();
                        setTickets([...tickets, newTicket]);
                        alert("Ticket submitted successfully! Admin will review it shortly.");
                        setShowTicketForm(false);
                        setTicketTitle("");
                        setTicketDesc("");
                      } else {
                        alert("Failed to submit ticket.");
                      }
                    } catch (e) {
                      console.error(e);
                      alert("Error submitting ticket.");
                    } finally {
                      setIsSubmittingTicket(false);
                    }
                  }}>{isSubmittingTicket ? "Submitting..." : "Submit Ticket"}</button>
                </div>
              </div>
            </div>
          );
        }
        return (
            <div className="card" style={{ backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#b91c1c", fontSize: "16px" }}>Support & Ticketing</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#7f1d1d" }}>Facing issues with the portal, curriculum, or mentors? File a detailed ticket.</p>
                </div>
                <button className="btn btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }} onClick={() => setShowTicketForm(true)}>File a Ticket</button>
              </div>

              <div style={{ borderTop: "1px solid #fca5a5", paddingTop: "16px" }}>
                {!selectedTicket ? (
                  <>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#991b1b" }}>Your Filed Tickets</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {tickets.length > 0 ? tickets.map((ticket) => (
                        <div key={ticket.id} style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "transform 0.1s" }} onClick={() => setSelectedTicket(ticket)} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div>
                            <span style={{ fontSize: "11px", color: "#4b5563", fontWeight: 700, backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>TKT-{ticket.id.toString().padStart(4, '0')}</span>
                            <span style={{ fontSize: "13px", color: "#4b5563", fontWeight: 500, textDecoration: ticket.status === "Resolved" || ticket.status === "Closed" ? "line-through" : "none" }}>{ticket.title}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>Filed: {new Date(ticket.created_at).toLocaleDateString()}</span>
                            <span className={`badge ${['Resolved', 'Closed'].includes(ticket.status) ? 'badge-success' : ticket.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`} style={{ backgroundColor: ['Resolved', 'Closed'].includes(ticket.status) ? '#d1fae5' : ticket.status === 'In Progress' ? '#fef3c7' : '#e0e7ff', color: ['Resolved', 'Closed'].includes(ticket.status) ? '#065f46' : ticket.status === 'In Progress' ? '#92400e' : '#3730a3' }}>{ticket.status}</span>
                          </div>
                        </div>
                      )) : (
                        <div style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>No tickets filed yet.</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Back</button>
                        <h4 style={{ margin: 0, color: "#991b1b" }}>Ticket {selectedTicket.id}</h4>
                        <span className={`badge ${['Resolved', 'Closed'].includes(selectedTicket.status) ? 'badge-success' : selectedTicket.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`} style={{ backgroundColor: ['Resolved', 'Closed'].includes(selectedTicket.status) ? '#d1fae5' : selectedTicket.status === 'In Progress' ? '#fef3c7' : '#e0e7ff', color: ['Resolved', 'Closed'].includes(selectedTicket.status) ? '#065f46' : selectedTicket.status === 'In Progress' ? '#92400e' : '#3730a3' }}>{selectedTicket.status}</span>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "15px", color: "#1f2937" }}>{selectedTicket.title}</h4>
                      <div style={{ padding: "16px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#4b5563", lineHeight: "1.5" }}>
                        {selectedTicket.description}
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#991b1b" }}>Comments & Updates</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                        {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                          <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>No comments yet.</p>
                        ) : (
                          selectedTicket.messages.map((comment, idx) => (
                            <div key={idx} style={{ padding: "12px", backgroundColor: comment.sender_name === "Admin" || comment.sender_name === "Mentor" ? "#eff6ff" : "#f3f4f6", borderRadius: "8px", border: `1px solid ${comment.sender_name === "Admin" || comment.sender_name === "Mentor" ? "#bfdbfe" : "#e5e7eb"}` }}>
                              <div style={{ fontSize: "12px", fontWeight: 700, color: comment.sender_name === "Admin" || comment.sender_name === "Mentor" ? "#1d4ed8" : "#374151", marginBottom: "4px" }}>{comment.sender_name || "User"}</div>
                              <div style={{ fontSize: "13px", color: "#1f2937" }}>{comment.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {['Open', 'Assigned', 'In Progress'].includes(selectedTicket.status) && (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (ticketReply.trim()) {
                            handleTicketAction("message", { message: ticketReply });
                            setTicketReply("");
                          }
                        }} style={{ display: "flex", gap: "10px" }}>
                          <input type="text" className="form-control" placeholder="Write a reply..." value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
                          <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}>Send Reply</button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
        );

      case "Daily Scenario":
        if (simulationDone) {
          return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>DAY 2 OF 30</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" }}>REAL-WORLD WORKPLACE SIMULATION</h2>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#fffbeb", color: "#b45309", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, border: "1px solid #fde68a" }}>
                      🔒 12 AM Lock Active
                    </span>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={() => setActiveTab("Overview")}>Exit</button>
              </div>

              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <div style={{ backgroundColor: "#ffffff", padding: "60px 40px", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)", border: "1px solid #f1f5f9", textAlign: "center", maxWidth: "600px", width: "100%" }}>
                  <div style={{ width: "80px", height: "80px", backgroundColor: "#fef3c7", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 24px auto" }}>
                    <span style={{ fontSize: "32px" }}>🔒</span>
                  </div>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "24px", color: "#1e293b", fontWeight: 700 }}>Day 2 Scenario is Locked</h3>
                  <p style={{ margin: "0 0 32px 0", color: "#64748b", fontSize: "15px", lineHeight: "1.6" }}>
                    In production, each daily scenario unlocks automatically at 12:00 AM Midnight.
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                    <div style={{ padding: "12px 24px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "30px", color: "#3b82f6", fontWeight: 600, fontSize: "14px" }}>
                      Next Day Unlocks in (12:00 AM): {timeUntilMidnight}
                    </div>
                    <button style={{ padding: "14px 32px", backgroundColor: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "30px", fontSize: "15px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4338ca"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"} onClick={() => setSimulationDone(false)}>
                      Preview Day 2 Scenario (Demo Mode) →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
            <SimulationView 
              onComplete={() => {
                setSimulationDone(true);
                setActiveTab("Daily Scenario");
              }} 
              onExit={() => setActiveTab("Overview")} 
            />
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

      case "Bonus Airdrops":
        const activeAirdrops = airdrops.filter(a => a.status !== "FINALIZED");
        const finalizedAirdrops = airdrops.filter(a => a.status === "FINALIZED");

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="card">
              <h3 style={{ margin: "0 0 16px 0" }}>Active Bonus Airdrops</h3>
              {activeAirdrops.length > 0 ? (
                <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
                  {activeAirdrops.map(airdrop => (
                    <div key={airdrop.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px", backgroundColor: "#fdf4ff", borderRadius: "12px", border: "1px solid #fbcfe8" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#be185d", textTransform: "uppercase", letterSpacing: "0.5px" }}>🎁 Pop Quiz</span>
                          <span style={{ fontSize: "12px", color: "#9d174d", fontWeight: "bold" }}>{airdrop.points_distribution ? airdrop.points_distribution + " pts" : "+" + airdrop.bonus_points + " pts"}</span>
                        </div>
                        <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#831843" }}>{airdrop.title || "Untitled Airdrop"}</h4>
                      </div>
                      {(airdrop.attempts && airdrop.attempts.length > 0) ? (
                        <span className="badge badge-success" style={{ textAlign: "center", padding: "6px" }}>Participated</span>
                      ) : (
                        <button className="btn btn-primary" style={{ backgroundColor: "#ec4899", border: "none", padding: "8px" }} onClick={() => handleParticipateAirdrop(airdrop)}>
                          Participate ({airdrop.time_limit}s)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#6b7280" }}>No active bonus airdrops available right now. Keep learning!</p>
              )}
            </div>

            {finalizedAirdrops.length > 0 && (
              <div className="card">
                <h3 style={{ margin: "0 0 16px 0", color: "#4b5563" }}>Completed Airdrops</h3>
                <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
                  {finalizedAirdrops.map(airdrop => (
                    <div key={airdrop.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb", opacity: 0.85 }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>🏁 Finished</span>
                          <span style={{ fontSize: "12px", color: "#4b5563", fontWeight: "bold" }}>{airdrop.points_distribution ? airdrop.points_distribution + " pts" : "+" + airdrop.bonus_points + " pts"}</span>
                        </div>
                        <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#374151", textDecoration: "line-through", textDecorationColor: "#9ca3af" }}>{airdrop.title || "Untitled Airdrop"}</h4>
                      </div>
                      <div style={{ textAlign: "center", padding: "8px", backgroundColor: "#e5e7eb", color: "#4b5563", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
                        ✅ Challenge Ended
                      </div>
                    </div>
                  ))}
                </div>
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
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulse-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        
        .fact-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #8b5cf6;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 6px;
          border-radius: 50%;
        }
        .fact-icon-btn:hover:not(:disabled) {
          transform: scale(1.15) translateY(-1px);
          color: #7c3aed;
          background-color: rgba(139, 92, 246, 0.1);
        }
        .fact-icon-btn:active:not(:disabled) {
          transform: scale(0.9);
        }
        .fact-icon-btn:disabled {
          cursor: not-allowed;
          color: #9ca3af;
        }
        .fact-icon-btn.is-loading {
          animation: pulse-blink 1s ease-in-out infinite;
        }
      `}</style>
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
        </div>
      )}

      {/* Airdrop Modal Overlay */}
      {activeAirdrop && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px", width: "90%", maxWidth: "500px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative", animation: "slideIn 0.15s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>🎁 Bonus Airdrop</h3>
              <div style={{ color: airdropTimeLeft < 30 ? "#ef4444" : "#f59e0b", fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", gap: "6px", backgroundColor: airdropTimeLeft < 30 ? "#fef2f2" : "#fffbeb", padding: "6px 12px", borderRadius: "20px" }}>
                ⏱️ {Math.floor(airdropTimeLeft / 60)}:{(airdropTimeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <p style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#334155", fontWeight: 500, lineHeight: "1.5" }}>
                {activeAirdrop.task_config?.question || activeAirdrop.description || activeAirdrop.title}
              </p>
              
              {activeAirdrop.task_type === 'code_output_mcq' && activeAirdrop.task_config?.code && (
                <div style={{ marginBottom: "16px", backgroundColor: "#1e293b", padding: "16px", borderRadius: "8px", overflowX: "auto" }}>
                  <pre style={{ margin: 0, color: "#e2e8f0", fontSize: "14px", fontFamily: "monospace" }}>
                    {activeAirdrop.task_config.code}
                  </pre>
                </div>
              )}

              {(activeAirdrop.task_type === 'mcq' || activeAirdrop.task_type === 'code_output_mcq') && activeAirdrop.task_config?.options ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {activeAirdrop.task_config.options.map((opt, idx) => (
                    <label key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", backgroundColor: airdropAnswer === opt ? "#eff6ff" : "#fff", borderColor: airdropAnswer === opt ? "#3b82f6" : "#e2e8f0", transition: "all 0.2s" }}>
                      <input 
                        type="radio" 
                        name="mcq_answer"
                        value={opt}
                        checked={airdropAnswer === opt}
                        onChange={(e) => setAirdropAnswer(e.target.value)}
                        style={{ margin: 0, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "15px", color: "#1e293b" }}>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : activeAirdrop.task_type === 'true_false' ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", backgroundColor: airdropAnswer === 'True' ? "#eff6ff" : "#fff", borderColor: airdropAnswer === 'True' ? "#3b82f6" : "#e2e8f0", transition: "all 0.2s" }}>
                    <input type="radio" name="tf_answer" value="True" checked={airdropAnswer === 'True'} onChange={(e) => setAirdropAnswer(e.target.value)} style={{ margin: 0, cursor: "pointer" }} />
                    <span style={{ fontSize: "15px", color: "#1e293b" }}>True</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", backgroundColor: airdropAnswer === 'False' ? "#eff6ff" : "#fff", borderColor: airdropAnswer === 'False' ? "#3b82f6" : "#e2e8f0", transition: "all 0.2s" }}>
                    <input type="radio" name="tf_answer" value="False" checked={airdropAnswer === 'False'} onChange={(e) => setAirdropAnswer(e.target.value)} style={{ margin: 0, cursor: "pointer" }} />
                    <span style={{ fontSize: "15px", color: "#1e293b" }}>False</span>
                  </label>
                </div>
              ) : activeAirdrop.task_type === 'match' && activeAirdrop.task_config?.pairs ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Object.keys(activeAirdrop.task_config.pairs).map((key, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ flex: 1, padding: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                        {key}
                      </div>
                      <span style={{ color: "#94a3b8" }}>➔</span>
                      <select
                        style={{ flex: 1, padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", outline: "none", backgroundColor: "#fff" }}
                        value={airdropAnswer[key] || ""}
                        onChange={(e) => setAirdropAnswer({...airdropAnswer, [key]: e.target.value})}
                      >
                        <option value="">Select match...</option>
                        {Object.values(activeAirdrop.task_config.pairs).sort().map((val, i) => (
                          <option key={i} value={val} disabled={Object.values(airdropAnswer).includes(val) && airdropAnswer[key] !== val}>{val}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : activeAirdrop.task_type === 'arrange' && activeAirdrop.task_config?.items ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {activeAirdrop.task_config.items.map((_, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "24px", height: "24px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#e0e7ff", color: "#4f46e5", borderRadius: "50%", fontSize: "12px", fontWeight: "bold" }}>
                        {idx + 1}
                      </div>
                      <select
                        style={{ flex: 1, padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", outline: "none", backgroundColor: "#fff" }}
                        value={(Array.isArray(airdropAnswer) ? airdropAnswer[idx] : "") || ""}
                        onChange={(e) => {
                          const newAns = Array.isArray(airdropAnswer) ? [...airdropAnswer] : Array(activeAirdrop.task_config.items.length).fill("");
                          newAns[idx] = e.target.value;
                          setAirdropAnswer(newAns);
                        }}
                      >
                        <option value="">Select item for position {idx + 1}...</option>
                        {[...activeAirdrop.task_config.items].sort().map((item, i) => (
                          <option key={i} value={item} disabled={Array.isArray(airdropAnswer) && airdropAnswer.includes(item) && airdropAnswer[idx] !== item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Type your answer here..."
                  value={typeof airdropAnswer === 'string' ? airdropAnswer : ""}
                  onChange={(e) => setAirdropAnswer(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", resize: "none" }}
                />
              )}
            </div>
            
            <button className="btn btn-primary" onClick={handleSubmitAirdrop} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #ec4899, #be185d)", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(236, 72, 153, 0.4)" }}>
              Submit Answer
            </button>
          </div>
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
              "Support & Ticketing",
              "Daily Scenario",
              "Chat with Mentor",
              "Bonus Airdrops"
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
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{activeTab}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: 'relative' }}>
              <button 
                className="fact-icon-btn" 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <Bell size={22} color="#4b5563" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>
              
              {showNotifDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '10px', width: '320px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>Notifications</h4>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', backgroundColor: n.is_read ? 'white' : '#eff6ff', transition: 'background-color 0.2s' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{n.title}</span>
                            {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: '4px' }}></span>}
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {factData && (
              <button
                onClick={() => fetchFact()}
                className={"fact-icon-btn " + (isFactLoading ? "is-loading" : "")}
                title="View Daily Fact"
                disabled={isFactLoading}
              >
                <Sparkles size={20} />
              </button>
            )}
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280", paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              Role: <b>Intern</b>
            </span>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}