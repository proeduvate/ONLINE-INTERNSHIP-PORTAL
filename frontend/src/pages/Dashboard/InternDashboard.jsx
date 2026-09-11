import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { Award, Clock, Download } from "lucide-react";
import "../../styles/Dashboard.css";
import DailyScenario from "../../components/ui/DailyScenario";
import DailyScenarioCalendar from "../../components/ui/DailyScenarioCalendar";
import BreakoutRoomsApp from "../breakout-rooms/BreakoutRoomsApp";



export function InternCertificateCard({ user }) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch if they already requested it
    api.get("/api/certificates/me").then(res => {
      setCert(res.data);
    }).catch(err => {
      // 404 means no certificate requested yet
    });
  }, []);

  const handleRequestCertificate = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/certificates/request", {
        duration: "3 Months", 
        achievement: "Top 10% Performer",
        grade: "A",
        final_score: 95
      });
      setCert(res.data);
      alert("Certificate requested successfully! Awaiting Admin approval.");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to request certificate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: "24px", borderColor: cert?.status === "APPROVED" ? "#10b981" : "#e2e8f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Award size={20} color={cert?.status === "APPROVED" ? "#10b981" : "#6366f1"} />
        <h3 style={{ margin: 0 }}>Internship Certificate</h3>
      </div>
      
      {cert ? (
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
            Status: <strong style={{ color: cert.status === "APPROVED" ? "#10b981" : "#f59e0b" }}>{cert.status}</strong>
          </p>
          {cert.status === "APPROVED" && cert.pdf_path && (
            <a href={`http://127.0.0.1:8000${cert.pdf_path}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Download size={16} /> Download PDF
              </button>
            </a>
          )}
          {cert.status === "PENDING_ADMIN_APPROVAL" && (
            <button className="btn btn-primary" disabled style={{ opacity: 0.7 }}>
              Awaiting Approval...
            </button>
          )}
        </div>
      ) : (
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
            You have completed all program requirements. You can now request your official certificate of completion.
          </p>
          <button 
            onClick={handleRequestCertificate} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Requesting..." : "Request Certificate"}
          </button>
        </div>
      )}
    </div>
  );
}
export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light");
  const [trackerOpen, setTrackerOpen] = useState(true);

  
  // Live Meeting State
  const [meetings, setMeetings] = useState([]);
  
  useEffect(() => {
    const fetchUpcomingMeetings = async () => {
      try {
        const response = await api.get('/api/meetings');
        setMeetings(response.data);
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      }
    };
    fetchUpcomingMeetings();
    // Optional refresh interval
    const interval = setInterval(fetchUpcomingMeetings, 30000);
    return () => clearInterval(interval);
  }, []);

  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMeetingMinimized, setIsMeetingMinimized] = useState(false);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState("Main Meeting"); // force recompile
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const handleJoinMeeting = () => {
    
    setIsMeetingActive(true);
    setIsMeetingMinimized(false);
  };

  const handleEndMeeting = () => {
    setIsMeetingActive(false);
    setIsMeetingMinimized(false);
    setShowThankYouModal(true);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (isMeetingActive) {
      setIsMeetingMinimized(true);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Daily Domain Insight State & Rotation Logic
  const [showDomainInsightModal, setShowDomainInsightModal] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  // Bonus Airdrops State
  const [bonusAirdrops, setBonusAirdrops] = useState([]);
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [activeAirdrop, setActiveAirdrop] = useState(null);
  const [airdropAnswer, setAirdropAnswer] = useState("");
  const [airdropTimeLeft, setAirdropTimeLeft] = useState(0);
  const [airdropTab, setAirdropTab] = useState("Active");

  useEffect(() => {
    const storedAirdrops = localStorage.getItem("app_bonus_airdrops");
    let parsed = [];
    if (storedAirdrops) {
      parsed = JSON.parse(storedAirdrops);
    }
    
    const mockData = [
      {
        id: 101,
        question: "What is the primary purpose of React's Virtual DOM?",
        timeLimit: "60",
        points: [20, 15, 10],
        status: "Active"
      },
      {
        id: 102,
        question: "Explain the difference between useState and useReducer.",
        timeLimit: "45",
        points: [15, 10],
        status: "Active"
      },
      {
        id: 103,
        question: "What are the core web vitals and why do they matter?",
        timeLimit: "90",
        points: [30, 20, 10],
        status: "Completed"
      },
      {
        id: 104,
        question: "How does the Event Loop work in Node.js?",
        timeLimit: "120",
        points: [50, 25],
        status: "Completed"
      }
    ];
    
    // Merge real airdrops with mock data so there is always something to see
    setBonusAirdrops([...parsed, ...mockData]);
  }, []);

  useEffect(() => {
    let timer;
    if (showAirdropModal && airdropTimeLeft > 0) {
      timer = setInterval(() => {
        setAirdropTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (showAirdropModal && airdropTimeLeft === 0) {
      handleSubmitAirdrop();
    }
    return () => clearInterval(timer);
  }, [showAirdropModal, airdropTimeLeft]);

  const handleStartAirdrop = (airdrop) => {
    setActiveAirdrop(airdrop);
    setAirdropTimeLeft(parseInt(airdrop.timeLimit));
    setShowAirdropModal(true);
    setAirdropAnswer("");
  };

  const handleSubmitAirdrop = () => {
    if (activeAirdrop) {
      const updatedAirdrops = bonusAirdrops.map(a => 
        a.id === activeAirdrop.id ? { ...a, status: "FINALIZED" } : a
      );
      setBonusAirdrops(updatedAirdrops);
      localStorage.setItem("app_bonus_airdrops", JSON.stringify(updatedAirdrops));
      if (airdropTimeLeft > 0) {
        alert("Bonus Airdrop submitted successfully!");
      } else {
        alert("Time is up! Your answer was automatically submitted.");
      }
    }
    setShowAirdropModal(false);
    setActiveAirdrop(null);
  };

  const domainInsights = [
    "A key principle of Frontend involves understanding performance.",
    "React's Virtual DOM minimizes direct DOM manipulations to improve application rendering speed.",
    "Debouncing and throttling are essential techniques for optimizing event-heavy operations like scrolling or typing.",
    "State immutability in React ensures predictable data flow and enables effective re-rendering optimizations.",
    "Core Web Vitals measure key user experience metrics: LCP (Largest Contentful Paint), FID, and CLS.",
    "Code splitting with React.lazy and Suspense helps load components on-demand, reducing initial bundle size.",
    "Accessibility (a11y) standards ensure web interfaces are usable by everyone, including assistive technologies.",
    "Browser caching and Service Workers enable Progressive Web Apps (PWAs) to load quickly and offline.",
    "Semantic HTML improves SEO, readability, and screen reader navigation by providing structural meaning.",
    "CSS Grid and Flexbox combined provide modern responsive layout capabilities without heavy framework dependencies."
  ];

  useEffect(() => {
    // 1. Auto-show modal once per day upon login / first visit
    const todayStr = new Date().toDateString();
    const lastShownDate = localStorage.getItem("daily_domain_insight_last_date");
    if (lastShownDate !== todayStr) {
      setShowDomainInsightModal(true);
      localStorage.setItem("daily_domain_insight_last_date", todayStr);
    }

    // 2. Rotate/Update insight fact index every 10 minutes (based on 10-min time block)
    const updateInsightIndex = () => {
      const tenMinBlock = Math.floor(Date.now() / (10 * 60 * 1000));
      setCurrentInsightIndex(tenMinBlock % domainInsights.length);
    };

    updateInsightIndex();
    const interval = setInterval(updateInsightIndex, 10000); // Check timestamp index every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Dynamic Stats State
  const [progress, setProgress] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [totalDays, setTotalDays] = useState(30);
  const [daysPresent, setDaysPresent] = useState(0);
  const [daysAbsent, setDaysAbsent] = useState(0);
  
  useEffect(() => {
    api.get("/api/intern/stats")
      .then(res => {
        if (!res.data.error) {
          setProgress(res.data.progressPercent);
          setAiScore(res.data.aiScore);
          setAttendancePercent(res.data.attendancePercent);
          setDaysCompleted(res.data.daysCompleted);
          setTotalDays(res.data.totalDays);
          setDaysPresent(res.data.daysPresent);
          setDaysAbsent(res.data.daysAbsent);
          if (res.data.currentDay > 1) {
             setCurrentDay(res.data.currentDay);
          }
        }
      })
      .catch(err => console.error("Could not fetch intern stats:", err));
  }, []);

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
      statusBg: "var(--bg-yellow-light)",
      statusColor: "var(--warning-darker)",
      tagBg: "var(--bg-red-lighter)",
      tagColor: "var(--danger-darkest)",
      adminReply: "We are looking into the Dockerfile issue. Please ensure you have Docker Desktop v4.20+ installed. A mentor will join your system in the next standup."
    },
    {
      id: "TKT-0985",
      title: "Missing lecture notes for Day 5",
      date: "1 week ago",
      status: "Resolved",
      statusBg: "var(--bg-emerald-lighter)",
      statusColor: "var(--success-darker)",
      tagBg: "var(--bg-gray-light)",
      tagColor: "var(--text-gray)",
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
  
  

  
  // Global chat history from localstorage
  const getInitialChat = () => {
    const saved = localStorage.getItem("global_chat_history");
    if (saved) return JSON.parse(saved);
    return [
      { sender: "Mentor", recipientId: "INT001", text: "Hi John, I saw your code. Good effort, try to refactor the key prop warning.", time: "10:30 AM" }
    ];
  };

  const [chatMessages, setChatMessages] = useState(getInitialChat());

  // Listen for cross-tab updates
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "global_chat_history" && e.newValue) {
        setChatMessages(JSON.parse(e.newValue));
      }
      if (e.key === "app_bonus_airdrops" && e.newValue) {
        const mockData = [
          { id: 101, title: "React Context API Quick Fire", question: "In one sentence, explain when to use Context API vs Redux?", points: 50, timeLimit: 60, status: "Completed" }
        ];
        setBonusAirdrops([...JSON.parse(e.newValue), ...mockData]);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const [inputMsg, setInputMsg] = useState("");

  const [userId, setUserId] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    api.get("/api/auth/me")
      .then(res => setUserId(res.data.id))
      .catch(err => console.error("Could not fetch user ID:", err));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const baseUri = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
    const wsUri = baseUri.replace(/^http/, 'ws') + `/ws/chat/${userId}`;
    
    ws.current = new WebSocket(wsUri);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setChatMessages(prev => [...prev, {
        sender: "Mentor", 
        text: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    
    const newMsg = { sender: "Intern", internId: "INT001", text: inputMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    localStorage.setItem("global_chat_history", JSON.stringify(updatedMessages));

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



  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>
            {/* Removed Profile card as requested */}

            <div className="grid">
              <div className="stat-card">
                <span className="stat-title">Current Milestone</span>
                <span className="stat-value">Day {currentDay}</span>
                <span className="stat-desc">React Framework Basics</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Course Progress</span>
                <span className="stat-value">{progress}%</span>
                <span className="stat-desc">{daysCompleted} of {totalDays} days completed</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Attendance Rate</span>
                <span className="stat-value">{attendancePercent}%</span>
                <span className="stat-desc">{daysPresent} Days Present / {daysAbsent} Day{daysAbsent !== 1 ? "s" : ""} Absent</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">AI Evaluation Average</span>
                <span className="stat-value">{aiScore}%</span>
                <span className="stat-desc">Last updated 1 hour ago</span>
              </div>
            </div>
              <InternCertificateCard />


            {/* Removed Attendance Calendar & Portfolio summary as requested */}
            
            {/* Main Non-Scrollable Layout Content */}
            <div style={{ display: "flex", gap: "24px", marginTop: "20px", height: "calc(100vh - 250px)", overflow: "hidden" }}>
              
              {/* Left Column */}
              <div style={{ flex: "1.2", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: "4px" }}>
                {/* Bonus Airdrops Banner */}
                {(() => {
                  const activeDrops = bonusAirdrops.filter(a => a.status === "APPROVED");
                  const hasActive = activeDrops.length > 0;
                  const drop = hasActive ? activeDrops[0] : null;

                  return (
                    <div className="bonus-airdrop-banner" style={{ margin: 0, padding: "16px 20px" }}>
                      <div className="airdrop-content">
                        <h3 className="airdrop-title" style={{ fontSize: "16px" }}>
                          🎁 {hasActive ? "Live Bonus Airdrop!" : "Bonus Airdrops"}
                          {hasActive && <span className="airdrop-badge" style={{ fontSize: "10px", padding: "2px 8px" }}>Active Now</span>}
                        </h3>
                        <p className="airdrop-question" style={{ fontSize: "14px" }}>
                          {hasActive ? drop.question : "Stay tuned for unexpected pop quizes and bonus points!"}
                        </p>
                      </div>
                      <div className="airdrop-actions">
                        {hasActive && (
                          <div className="airdrop-timer" style={{ fontSize: "14px" }}>
                            ⏱️ {drop.timeLimit}s
                          </div>
                        )}
                        <button 
                          className="btn-participate"
                          style={{ padding: "8px 16px", fontSize: "12px" }}
                          onClick={() => hasActive ? handleStartAirdrop(drop) : setActiveTab("Bonus Airdrops")}
                        >
                          {hasActive ? "Participate" : "View"}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Daily Scenario Activity Calendar */}
                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <DailyScenarioCalendar onStartScenario={(day) => setActiveTab("Daily Scenario")} />
                </div>
              </div>

              {/* Right Column */}
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: "4px" }}>
                {/* Daily Task / Analytics (Top Right) */}
                <div className="card" style={{ margin: 0, padding: "20px", display: "flex", flexDirection: "column", backgroundColor: "var(--card-bg)", border: "none", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--bg-blue-light)", color: "var(--primary-color)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                        🎯
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-dark)" }}>Today's Objective</h3>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-slate)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Day 12: React Framework</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "var(--bg-red-light)", padding: "4px 8px", borderRadius: "12px" }}>
                      <span style={{ fontSize: "12px" }}>⏳</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--danger-color)" }}>45m</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>
                      <span style={{ color: "var(--text-muted)" }}>Module Progress</span>
                      <span style={{ color: "var(--primary-color)" }}>65%</span>
                    </div>
                    <div style={{ width: "100%", backgroundColor: "var(--border-color)", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
                      <div style={{ width: "65%", backgroundColor: "var(--primary-color)", height: "100%", borderRadius: "6px" }}></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-slate-dark)", fontWeight: 500 }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "6px", backgroundColor: "var(--bg-green-light)", color: "var(--success-dark)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "10px" }}>✓</div>
                        Component Composition
                      </li>
                      <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-slate-dark)", fontWeight: 500 }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "6px", backgroundColor: "var(--bg-gray-light)", color: "var(--text-gray-light)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "10px" }}>▶</div>
                        JSX Syntax & Rules
                      </li>
                    </ul>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: "var(--bg-light)", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px" }}>📅</span>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-slate)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Upcoming</span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-dark)" }}>React Hook Refactor</h4>
                    </div>
                    <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, backgroundColor: "var(--text-dark)", color: "var(--card-bg)", border: "none", borderRadius: "6px" }} onClick={handleJoinMeeting}>Join</button>
                  </div>
                </div>

                {/* Leaderboard (Bottom Right) */}
                <div className="card" style={{ margin: 0, padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "15px" }}>Leaderboard</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "11px", margin: "4px 0 0 0" }}>Compete with your peers.</p>
                    </div>
                    <div style={{ backgroundColor: "var(--bg-blue-light)", padding: "6px 12px", borderRadius: "20px", color: "var(--primary-darker)", fontWeight: 600, fontSize: "12px", whiteSpace: "nowrap" }}>
                      Your Rank: #3
                    </div>
                  </div>
                  <div className="table-container" style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                    <table className="table" style={{ fontSize: "13px" }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "8px" }}>Rank</th>
                          <th style={{ padding: "8px" }}>Name</th>
                          <th style={{ padding: "8px" }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { rank: 1, name: "Anu Sharma", points: 950 },
                          { rank: 2, name: "Raj Patel", points: 880 },
                          { rank: 3, name: "John Doe (You)", points: 850, isCurrent: true },
                          { rank: 4, name: "Alice Smith", points: 790 },
                          { rank: 5, name: "Bob Jones", points: 720 },
                        ].map((intern) => (
                          <tr key={intern.rank} style={intern.isCurrent ? { backgroundColor: "var(--bg-blue-light)", fontWeight: "bold" } : {}}>
                            <td style={{ padding: "8px" }}>{intern.rank}</td>
                            <td style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px" }}>
                              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: intern.isCurrent ? "var(--primary-color)" : "var(--border-gray)", color: intern.isCurrent ? "var(--card-bg)" : "var(--text-gray-muted)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "10px", fontWeight: "bold" }}>
                                {intern.name.split(" ")[0][0]}{intern.name.split(" ")[1] ? intern.name.split(" ")[1][0] : ""}
                              </div>
                              {intern.name}
                            </td>
                            <td style={{ color: "var(--primary-dark)", fontWeight: 600, padding: "8px" }}>{intern.points} pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
              <p style={{ color: "var(--text-gray-muted)", margin: "8px 0 24px 0" }}>Your next learning materials will unlock automatically tomorrow at 12:00 AM.</p>
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
                    <div className="card" style={{ margin: 0, textAlign: "center", border: "1px solid var(--border-gray)", background: mcqDone ? "var(--bg-emerald-light)" : "var(--card-bg)" }}>
                      <h4>Part A: MCQ Assessment</h4>
                      <p style={{ color: "var(--text-gray-muted)", fontSize: "13px" }}>Answer timed questions on today's concepts.</p>
                      {mcqDone ? (
                        <span style={{ color: "var(--success-color)", fontWeight: "bold", fontSize: "14px" }}>✓ Completed</span>
                      ) : (
                        <button className="btn btn-primary" onClick={() => { setAssessmentView("mcq"); setMcqStarted(true); setMcqSubmitted(false); setAnswers({}); setTimer(180); setCurrentQuestionIndex(0); }} style={{ width: "100%", marginTop: "12px" }}>Start MCQ</button>
                      )}
                    </div>
                    <div className="card" style={{ margin: 0, textAlign: "center", border: "1px solid var(--border-gray)", background: codingDone ? "var(--bg-emerald-light)" : "var(--card-bg)" }}>
                      <h4>Part B: Coding Assessment</h4>
                      <p style={{ color: "var(--text-gray-muted)", fontSize: "13px" }}>Write and execute code in our compiler.</p>
                      {codingDone ? (
                        <span style={{ color: "var(--success-color)", fontWeight: "bold", fontSize: "14px" }}>✓ Completed</span>
                      ) : (
                        <button className="btn btn-primary" onClick={() => setAssessmentView("coding")} style={{ width: "100%", marginTop: "12px" }}>Start Coding</button>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "var(--bg-light)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <h4 style={{ margin: "0 0 12px 0", color: "var(--text-dark)", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      📋 Rules and Conditions for Assessment
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>
                      <li><b>Completion:</b> Both Part A (MCQ) and Part B (Coding) must be completed to unlock the next day's module.</li>
                      <li><b>Timing:</b> The MCQ section is strictly timed. The timer cannot be paused once started.</li>
                      <li><b>Navigation:</b> During the MCQ test, you cannot return to the selection menu without submitting your answers.</li>
                      <li><b>Integrity:</b> Do not refresh the page during an active assessment, as this may result in automatic submission.</li>
                      <li><b>Grading:</b> AI Evaluation scores will be available immediately, while Mentor reviews may take up to 24 hours.</li>
                    </ul>
                  </div>

                  {mcqDone && codingDone && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                      <button className="btn btn-primary" onClick={handleCompleteDay} style={{ backgroundColor: "var(--success-color)", borderColor: "var(--success-color)", padding: "12px 32px", fontSize: "16px" }}>Complete & Unlock Next Day</button>
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-gray)", paddingBottom: "12px", marginBottom: "16px" }}>
                        <div style={{ color: "var(--danger-color)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                          ⏱️ Timer: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                        </div>
                        <button className="btn btn-primary" onClick={handleMcqSubmit} style={{ padding: "8px 16px", backgroundColor: "var(--success-color)", borderColor: "var(--success-color)" }}>Submit Test</button>
                      </div>

                      <div style={{ display: "flex", gap: "24px" }}>
                        {/* Left Sidebar: Question Numbers Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", width: "180px", alignContent: "start", borderRight: "1px solid var(--border-gray)", paddingRight: "16px", maxHeight: "400px", overflowY: "auto" }}>
                          {mcqQuestionsList.map((q, idx) => (
                            <button 
                              key={q.id}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              style={{
                                aspectRatio: "1/1",
                                padding: 0,
                                borderRadius: "6px",
                                  border: currentQuestionIndex === idx ? "2px solid var(--primary-color)" : (answers[q.id] ? "1px solid var(--success-color)" : "1px solid var(--border-gray)"),
                                  backgroundColor: answers[q.id] ? "var(--success-color)" : (currentQuestionIndex === idx ? "var(--bg-blue-light)" : "var(--card-bg)"),
                                  color: answers[q.id] ? "var(--card-bg)" : (currentQuestionIndex === idx ? "var(--primary-darker)" : "var(--text-gray)"),
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
                          <h4 style={{ fontSize: "16px", marginBottom: "20px", color: "var(--text-darker)", lineHeight: "1.5" }}>
                            <b>Q{currentQuestionIndex + 1}.</b> {mcqQuestionsList[currentQuestionIndex].text}
                          </h4>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {mcqQuestionsList[currentQuestionIndex].options.map(opt => (
                              <button 
                                key={opt.val}
                                className={`btn ${answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "btn-primary" : "btn-secondary"}`} 
                                onClick={() => setAnswers({...answers, [mcqQuestionsList[currentQuestionIndex].id]: opt.val})}
                                style={{ textAlign: "left", padding: "12px 16px", fontSize: "14px", justifyContent: "flex-start", backgroundColor: answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "var(--primary-color)" : "var(--card-bg)", color: answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "var(--card-bg)" : "var(--text-dark)", border: answers[mcqQuestionsList[currentQuestionIndex].id] === opt.val ? "none" : "1px solid var(--border-gray-dark)" }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          {/* Navigation Buttons */}
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", borderTop: "1px solid var(--border-gray)", paddingTop: "16px" }}>
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
                            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "6px solid var(--primary-dark)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                              <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary-dark)" }}>{evalResult.score}%</span>
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
                          <div style={{ background: "var(--bg-blue-light)", border: "1px solid var(--border-blue-light)", padding: "10px", borderRadius: "4px", fontSize: "12px", color: "var(--primary-darkest)", marginTop: "16px" }}>
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
                <p style={{ fontSize: "14px", color: "var(--text-gray-muted)", marginTop: "6px", marginBottom: "16px" }}>{currentCurriculum.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-gray-light)", padding: "10px 16px", borderRadius: "8px", width: "fit-content" }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>📄 {currentCurriculum.notes}</span>
                  <button onClick={() => alert(`Downloading ${currentCurriculum.notes}`)} style={{ background: "none", border: "none", color: "var(--primary-dark)", fontWeight: "600", cursor: "pointer", fontSize: "13px", padding: 0, textDecoration: "underline" }}>Download PDF Notes</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", borderLeft: "1px solid var(--border-gray)", paddingLeft: "24px", minWidth: "180px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-gray-light)", fontWeight: "600", letterSpacing: "0.5px" }}>DAY ASSESSMENT</span>
                <button className="btn btn-primary" onClick={() => setShowAssessment(true)} style={{ padding: "10px 20px", fontSize: "13px", width: "100%" }}>Start Test</button>
              </div>
            </div>

            {/* Row 2: Meetings list */}
            <div className="card">
              <h3>Upcoming Live Mentoring Calls</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Scheduled Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.length > 0 ? meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td>{meeting.title}</td>
                        <td>{new Date().toLocaleDateString()} (Active)</td>
                        <td>
                          <button onClick={() => {
                            setActiveMeetingRoom(meeting.room_code);
                            setIsMeetingActive(true);
                            setIsMeetingMinimized(false);
                          }} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }}>Join</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" style={{textAlign: 'center'}}>No upcoming meetings</td>
                      </tr>
                    )}
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
                <h3 style={{ margin: 0, color: "var(--danger-darker)", display: "flex", alignItems: "center", gap: "8px" }}>⚠️ File a Support Ticket</h3>
                <button className="btn btn-secondary" onClick={() => setShowTicketForm(false)}>Back to Tickets</button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-gray)" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-gray-muted)", fontWeight: 600 }}>User Name</label>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>John Doe</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-gray-muted)", fontWeight: 600 }}>Mentor Name</label>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>Dr. Sakthi</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-gray-muted)", fontWeight: 600 }}>Domain</label>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>Artificial Intelligence</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-gray-muted)", fontWeight: 600 }}>Branch / University</label>
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
                  <button className="btn btn-primary" style={{ backgroundColor: "var(--danger-darker)", borderColor: "var(--danger-darker)" }} onClick={() => {
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
            <div className="card" style={{ backgroundColor: "#fff5f5", borderColor: "var(--bg-red-lightest)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "var(--danger-darker)", fontSize: "16px" }}>Support & Ticketing</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--danger-black)" }}>Facing issues with the portal, curriculum, or mentors? File a detailed ticket.</p>
                </div>
                <button className="btn btn-primary" style={{ backgroundColor: "var(--danger-dark)", borderColor: "var(--danger-dark)" }} onClick={() => setShowTicketForm(true)}>File a Ticket</button>
              </div>

              <div style={{ marginTop: "16px", borderTop: "1px solid var(--text-red-light)", paddingTop: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--danger-darkest)" }}>Your Filed Tickets</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {ticketsData.map(ticket => (
                    <div 
                      key={ticket.id}
                      onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                      style={{ backgroundColor: "var(--card-bg)", padding: "12px", borderRadius: "8px", border: selectedTicket?.id === ticket.id ? "2px solid var(--danger-color)" : "1px solid var(--border-gray)", display: "flex", flexDirection: "column", cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: ticket.tagColor, fontWeight: 700, backgroundColor: ticket.tagBg, padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>{ticket.id}</span>
                          <span style={{ fontSize: "13px", color: "var(--text-gray-dark)", fontWeight: 500, textDecoration: ticket.status === "Resolved" ? "line-through" : "none" }}>{ticket.title}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-gray-muted)" }}>Filed: {ticket.date}</span>
                          <span className="badge" style={{ backgroundColor: ticket.statusBg, color: ticket.statusColor }}>{ticket.status}</span>
                        </div>
                      </div>
                      
                      {selectedTicket?.id === ticket.id && (
                        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--bg-gray-light)" }}>
                          <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Admin Reply</h5>
                          <div style={{ backgroundColor: "var(--bg-light)", padding: "12px", borderRadius: "6px", borderLeft: "3px solid var(--primary-color)" }}>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-slate-dark)", lineHeight: "1.5" }}>{ticket.adminReply}</p>
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
          <div className="card" style={{ margin: 0, padding: 0, height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            {/* Professional Chat Header */}
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", backgroundColor: "var(--text-darker)", color: "var(--card-bg)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--primary-color)", color: "var(--card-bg)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px", fontWeight: "bold", marginRight: "16px" }}>
                DS
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "var(--card-bg)", fontWeight: 600 }}>Dr. Sakthi</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-slate-light)" }}>Mentor • Online</p>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, backgroundColor: "var(--bg-light)", padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {chatMessages.filter(m => m.internId === "INT001" || m.recipientId === "INT001").map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === "Intern" ? "flex-end" : "flex-start", maxWidth: "70%", position: "relative", marginBottom: "8px" }}>
                  <div style={{ 
                    backgroundColor: msg.sender === "Intern" ? "var(--primary-dark)" : "var(--card-bg)", 
                    color: msg.sender === "Intern" ? "var(--card-bg)" : "var(--text-darker)", 
                    padding: "10px 14px 22px 14px", 
                    borderRadius: "12px", 
                    borderBottomRightRadius: msg.sender === "Intern" ? "0" : "12px",
                    borderBottomLeftRadius: msg.sender !== "Intern" ? "0" : "12px",
                    fontSize: "14px", 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)", 
                    wordBreak: "break-word",
                    border: msg.sender !== "Intern" ? "1px solid var(--border-color)" : "none"
                  }}>
                    {msg.text}
                    <span style={{ fontSize: "10px", color: msg.sender === "Intern" ? "var(--border-blue-light)" : "var(--text-slate-light)", position: "absolute", bottom: "6px", right: "12px" }}>
                      {msg.time} {msg.sender === "Intern" && "✓✓"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "center", padding: "16px", backgroundColor: "var(--card-bg)", margin: 0, borderTop: "1px solid var(--border-color)" }}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)} 
                style={{ flex: 1, padding: "12px 20px", borderRadius: "24px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-gray-lighter)", fontSize: "14px", outline: "none", color: "var(--text-darker)" }} 
              />
              <button type="submit" style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "var(--primary-dark)", color: "var(--card-bg)", border: "none", display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "12px", cursor: "pointer", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--primary-darker)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--primary-dark)"}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </button>
            </form>
          </div>
        );

      case "Daily Scenario":
        return <DailyScenario onBackToDashboard={() => setActiveTab("Overview")} />;

      case "Bonus Airdrops":
        const activeDrops = bonusAirdrops.filter(a => a.status === "Active" || a.status === "APPROVED");
        const completedDrops = bonusAirdrops.filter(a => a.status === "Completed" || a.status === "FINALIZED");
        
        return (
          <div style={{ paddingBottom: "40px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <button 
                className={`btn ${airdropTab === "Active" ? "btn-primary" : "btn-secondary"}`} 
                onClick={() => setAirdropTab("Active")}
                style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 600 }}
              >
                Active Airdrops ({activeDrops.length})
              </button>
              <button 
                className={`btn ${airdropTab === "Completed" ? "btn-primary" : "btn-secondary"}`} 
                onClick={() => setAirdropTab("Completed")}
                style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 600 }}
              >
                Completed Airdrops ({completedDrops.length})
              </button>
            </div>

            {airdropTab === "Active" && (
              <div>
                {activeDrops.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--card-bg)", borderRadius: "8px", border: "1px dashed var(--border-color)" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>No active airdrops at the moment.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {activeDrops.map(drop => (
                      <div key={drop.id} style={{ 
                        backgroundColor: "var(--card-bg)", 
                        border: "1px solid var(--border-color)", 
                        borderRadius: "8px", 
                        padding: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "var(--shadow-sm)"
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "70%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", color: "#be185d", fontWeight: 700, backgroundColor: "#fdf2f8", padding: "2px 8px", borderRadius: "4px", border: "1px solid #fbcfe8" }}>
                              🎁 POP QUIZ
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                              {drop.timeLimit}s time limit
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-darker)", fontWeight: 500 }}>{drop.question}</p>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <button 
                            onClick={() => handleStartAirdrop(drop)}
                            style={{ 
                              backgroundColor: "#ec4899", 
                              color: "#fff", 
                              border: "none", 
                              padding: "8px 16px", 
                              borderRadius: "6px", 
                              fontWeight: 600, 
                              fontSize: "13px",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(236, 72, 153, 0.2)"
                            }}
                          >
                            Participate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {airdropTab === "Completed" && (
              <div>
                {completedDrops.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--card-bg)", borderRadius: "8px", border: "1px dashed var(--border-color)" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>No completed airdrops yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {completedDrops.map(drop => (
                      <div key={drop.id} style={{ 
                        backgroundColor: "var(--bg-gray-lighter)", 
                        border: "1px solid var(--border-color)", 
                        borderRadius: "8px", 
                        padding: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "70%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, backgroundColor: "#e2e8f0", padding: "2px 8px", borderRadius: "4px" }}>
                              🏁 FINISHED
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-color)", fontWeight: 500, opacity: 0.8 }}>{drop.question}</p>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                          <div style={{ backgroundColor: "#e2e8f0", padding: "6px 12px", borderRadius: "6px", color: "#475569", fontSize: "12px", fontWeight: 600 }}>
                            ✓ Challenge Ended
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              { id: "Daily Scenario", icon: "🧩" },
              { id: "Tickets", icon: "🎫" },
              { id: "Chat with Mentor", icon: "💬" },
              { id: "Bonus Airdrops", icon: "🎁" }
            ].map((tab) => (
              <li
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => handleTabClick(tab.id)}
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
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: "var(--text-color)" }}>☰</button>}
            <h2>{isMeetingActive && !isMeetingMinimized ? "Live Meeting Room" : activeTab}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

            {/* Domain Insight Toggle Button */}
            <button
              onClick={() => setShowDomainInsightModal(true)}
              title="Daily Domain Insight"
              style={{
                backgroundColor: "var(--bg-blue-light, #e0e7ff)",
                border: "none",
                borderRadius: "12px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-color, #4f46e5)",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" fill="currentColor" />
              </svg>
            </button>

            {/* Theme Toggle Button (Icon Only, SVG) */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-color)",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
              }}
            >
              {theme === "light" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-gray-muted)" }}>
              Role: <b>Intern</b>
            </span>
          </div>
        </div>

        <div style={{ display: (isMeetingActive && !isMeetingMinimized) ? "block" : "none", height: "calc(100vh - 120px)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color, #e2e8f0)" }}>
          <BreakoutRoomsApp 
            isIntern={true} 
            onLeaveMeeting={handleEndMeeting} 
            onMinimize={() => setIsMeetingMinimized(true)}
            onRoomChange={(roomName) => setActiveMeetingRoom(roomName)}
          />
        </div>
        {(!isMeetingActive || isMeetingMinimized) && renderContent()}
      </div>

      {/* Floating Minimized Call Widget (Bottom Right - Google Meet Style) */}
      {isMeetingActive && isMeetingMinimized && (
        <div 
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            width: "320px",
            backgroundColor: "#1e1f22",
            color: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
            border: "2px solid #5865f2",
            overflow: "hidden",
            fontFamily: "Inter, sans-serif"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "#2b2d31", borderBottom: "1px solid #3f4248" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#da373c", display: "inline-block" }}></span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#f2f3f5" }}>LIVE • {activeMeetingRoom}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                onClick={() => setIsMeetingMinimized(false)}
                style={{ background: "none", border: "none", color: "#b5bac1", cursor: "pointer", fontSize: "16px", padding: "2px 4px" }}
                title="Maximize to full meeting screen"
              >
                ⛶
              </button>
              <button 
                onClick={handleEndMeeting}
                style={{ background: "none", border: "none", color: "#fa5252", cursor: "pointer", fontSize: "16px", padding: "2px 4px" }}
                title="Leave Meeting"
              >
                🚪
              </button>
            </div>
          </div>

          <div 
            onClick={() => setIsMeetingMinimized(false)}
            style={{ padding: "20px 16px", textAlign: "center", backgroundColor: "#111214", cursor: "pointer" }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#5865f2", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "18px", margin: "0 auto 8px auto", boxShadow: "0 0 12px rgba(88,101,242,0.5)" }}>
              DS
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#dbdee1", display: "block" }}>Dr. Sakthi (Speaker)</span>
            <span style={{ fontSize: "11px", color: "#949ba4", marginTop: "2px", display: "block" }}>Click widget to maximize call</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "#2b2d31" }}>
            <button onClick={() => setIsMeetingMinimized(false)} style={{ backgroundColor: "#5865f2", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Expand Call</span> ⛶
            </button>
            <button onClick={handleEndMeeting} style={{ backgroundColor: "#da373c", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Leave Call
            </button>
          </div>
        </div>
      )}

      {/* Thank You Modal when Intern leaves meeting */}
      {showThankYouModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.75)", zIndex: 100000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "36px", maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#dcfce7", color: "#16a34a", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "32px", margin: "0 auto 16px auto" }}>
              🎉
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>Thank You for Attending!</h2>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px 0" }}>
              You have successfully left the mentoring session <b>"React Hook Refactoring Standup"</b>. Your attendance and active participation points have been recorded.
            </p>


            <button
              className="btn btn-primary"
              onClick={() => { setShowThankYouModal(false); setActiveTab("Overview"); }}
              style={{ width: "100%", padding: "12px", backgroundColor: "#5b5bd6", borderColor: "#5b5bd6", borderRadius: "10px", fontSize: "15px", fontWeight: 700 }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Daily Domain Insight Modal */}
      {showDomainInsightModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 100000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "var(--card-bg, #ffffff)",
            borderRadius: "24px",
            padding: "36px 32px 32px 32px",
            maxWidth: "440px",
            width: "100%",
            textAlign: "center",
            position: "relative",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25)",
            border: "1px solid var(--border-color, #e2e8f0)",
            color: "var(--text-color, #0f172a)",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif"
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowDomainInsightModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "18px",
                color: "var(--text-slate-light, #94a3b8)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "50%",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>

            {/* Top Star/Sparkle Icon Badge */}
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 20px auto",
              boxShadow: "0 10px 22px rgba(99, 102, 241, 0.35)"
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-color, #0f172a)" }}>
              Daily Domain Insight
            </h2>

            {/* Subtitle / Domain Tag */}
            <span style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#6366f1",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "24px"
            }}>
              FRONTEND
            </span>

            {/* Fact Box */}
            <div style={{
              padding: "20px 18px",
              borderRadius: "16px",
              backgroundColor: "var(--bg-light, #f8fafc)",
              marginBottom: "28px",
              border: "1px solid var(--border-color, #f1f5f9)"
            }}>
              <p style={{
                color: "var(--text-color, #334155)",
                fontSize: "15px",
                fontWeight: 500,
                lineHeight: "1.6",
                margin: 0
              }}>
                "{domainInsights[currentInsightIndex]}"
              </p>
            </div>

            {/* Button */}
            <button
              onClick={() => setShowDomainInsightModal(false)}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(79, 70, 229, 0.35)",
                transition: "transform 0.1s ease, background-color 0.2s ease"
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Got it, let's go!
            </button>
          </div>
        </div>
      )}

      {/* Bonus Airdrop Participate Modal */}
      {showAirdropModal && activeAirdrop && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100000, padding: "20px"
        }}>
          <div style={{
            backgroundColor: "var(--card-bg, #ffffff)", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "500px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid var(--border-color)", position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>🎁</span>
                <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-color)" }}>Bonus Airdrop Challenge</h3>
              </div>
              <div style={{ backgroundColor: airdropTimeLeft <= 10 ? "#fee2e2" : "#f1f5f9", color: airdropTimeLeft <= 10 ? "#ef4444" : "#475569", padding: "6px 12px", borderRadius: "20px", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                ⏱ {airdropTimeLeft}s
              </div>
            </div>
            
            <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 500, color: "#1e293b", lineHeight: 1.5 }}>
                {activeAirdrop.question}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>Your Answer (Run fast!)</label>
              <textarea 
                rows="4" 
                value={airdropAnswer}
                onChange={(e) => setAirdropAnswer(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0", backgroundColor: "var(--bg-gray-lighter)", fontSize: "14px", outline: "none", resize: "none", color: "var(--text-color)", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                placeholder="Type your solution here..."
                autoFocus
              />
            </div>

            <button 
              onClick={handleSubmitAirdrop}
              style={{ width: "100%", marginTop: "24px", backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)" }}
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
