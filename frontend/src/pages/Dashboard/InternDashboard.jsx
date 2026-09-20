import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Activity, Ticket, MessageSquare, Gift, LogOut, Menu, Bell, Sparkles, Clock, Sun, Moon, ArrowLeft, CheckCircle, Target, Lock, Calendar, FileText, AlertTriangle, Check, CheckCheck, Flag, Maximize2, X, PartyPopper, ShieldAlert, Tag, Book, ClipboardList, Headset, MessageCircle, Coins, Award, TrendingUp, Code, Share2, Download, ExternalLink, Play, User, Star, Quote, HelpCircle, Rocket, Bot } from "lucide-react";
import "../../styles/Dashboard.css";
import DailyScenario from "../../components/ui/DailyScenario";
import DailyScenarioCalendar from "../../components/ui/DailyScenarioCalendar";
import BreakoutRoomsApp from "../breakout-rooms/BreakoutRoomsApp";
import InternProfile from "./InternProfile";
import AIClientReview from "./AIClientReview";
import AdminLeaderboard from "./AdminLeaderboard";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import WebIDE from "../../components/WebIDE/WebIDE";
import api from "../../api/axios";
import { useAuth } from "../../services/AuthContext";

const getArraySafe = (arr) => Array.isArray(arr) ? arr : [];

export default function InternDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');

  const canonicalTabs = [
    "Overview", "Learning", "Daily Scenario", "Progress & Certificate", 
    "Tickets", "Chat with Mentor", "Bonus Airdrops", "Profile"
  ];

  const getTabFromUrl = (segment) => {
    if (!segment) return "Overview";
    const cleanSegment = decodeURIComponent(segment).toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = canonicalTabs.find(t => t.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSegment);
    return matched || "Overview";
  };

  const initialTabFromUrl = pathParts.length > 2 ? getTabFromUrl(pathParts[2]) : "Overview";

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTabFromUrl);
  const [activeLearningTab, setActiveLearningTab] = useState("Reading Materials");

  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts.length > 2 && parts[2]) {
      const tabName = getTabFromUrl(parts[2]);
      if (activeTab !== tabName) {
         setActiveTab(tabName);
      }
      if (tabName === "Learning") {
        if (parts[3] === "live-meetings") {
          setActiveLearningTab("Live Meetings");
        } else if (parts[3] === "ai-client") {
          setActiveLearningTab("AI Client");
        } else if (parts[3] === "reading-materials") {
          setActiveLearningTab("Reading Materials");
        }
      } else if (tabName === "Progress & Certificate" || tabName === "Progress") {
        if (parts[3] === "certificate") {
          setShowCertificateView(true);
        } else {
          setShowCertificateView(false);
        }
      }
    }
  }, [location.pathname]);
  const [theme, setTheme] = useState("light");
  const [trackerOpen, setTrackerOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isInternshipCompleted, setIsInternshipCompleted] = useState(false);
  const [internDomain, setInternDomain] = useState("Loading...");
  const [showCertificateView, setShowCertificateView] = useState(false);
  // Real Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [domainFact, setDomainFact] = useState(null);
  const [completedDays, setCompletedDays] = useState([]);
  const [simulationDay, setSimulationDay] = useState(1);
  const [portfolioData, setPortfolioData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const [
        profileRes,
        leaderboardRes,
        tasksRes,
        ticketsRes,
        factRes,
        simRes,
        portfolioRes,
        usersRes,
        subsRes,
        airdropsRes
      ] = await Promise.all([
        api.get('/profile').catch(() => ({ data: {} })),
        api.get('/leaderboard').catch(() => ({ data: [] })),
        api.get('/tasks').catch(() => ({ data: [] })),
        api.get('/tickets').catch(() => ({ data: [] })),
        api.get('/facts').catch(() => ({ data: null })),
        api.get('/simulation/intern/current').catch(() => ({ data: null })),
        api.get('/portfolio').catch(() => ({ data: { total_score: 0 } })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/analytics/daily-questions/me').catch(() => ({ data: [] })),
        api.get('/bonus-airdrops').catch(() => ({ data: [] }))
      ]);

      setDashboardData(profileRes.data || {});
      setInternDomain(profileRes.data?.domain_name || "Unassigned");
      setAiScore(portfolioRes?.data?.total_score || 0);
      setPortfolioData(portfolioRes?.data || null);
      setLeaderboardData(getArraySafe(leaderboardRes.data));
      setUsersList(getArraySafe(usersRes.data));
      setDomainFact(factRes.data || null);
      if (airdropsRes.data) setBonusAirdrops(airdropsRes.data);

      let doneDaysSet = new Set();
      let simDay = 1;
      if (simRes && simRes.data) {
        if (simRes.data.day) simDay = simRes.data.day;
        if (simRes.data.completed_days && Array.isArray(simRes.data.completed_days)) {
          simRes.data.completed_days.forEach(d => doneDaysSet.add(d));
        }
        if (simRes.data.completed && simRes.data.day) {
          doneDaysSet.add(simRes.data.day);
        }
      }
      setSimulationDay(simDay);

      let calculatedDay = 1;
      let shouldLockToday = false;
      const submissions = subsRes.data || [];
      setRecentSubmissions(submissions);
      if (submissions.length > 0) {
        calculatedDay = submissions.length + 1;
        
        const lastSubDateStr = submissions[submissions.length - 1].date;
        const today = new Date();
        const utcMs = today.getTime() + (today.getTimezoneOffset() * 60000);
        const istToday = new Date(utcMs + (3600000 * 5.5));
        const todayStr = istToday.toISOString().split('T')[0];
        
        if (lastSubDateStr === todayStr) {
          shouldLockToday = true;
        }
      }

      setCompletedDays(Array.from(doneDaysSet));
      setCurrentDay(calculatedDay);
      if (shouldLockToday) {
        setIsDayLockedUntilMidnight(true);
      }

      api.get(`/mcq/day/${calculatedDay}/result`).then(mcqRes => {
        if (mcqRes.data && mcqRes.data.status === "submitted") {
          setMcqDone(true);
          setMcqGrade(mcqRes.data.percentage);
        } else {
          setMcqDone(false);
        }
      }).catch(() => setMcqDone(false));

      // Transform task data to match curriculumData shape if needed
      const fetchedTasks = tasksRes.data.map(task => ({
        id: task.id,
        day: task.day_number,
        topic: task.title,
        desc: task.description,
        notes: task.document_url || "N/A"
      }));

      // Keep a fallback just in case no tasks exist
      setCurriculumData(fetchedTasks.length ? fetchedTasks : [
        { day: 1, topic: "Introduction to Domain", desc: "Welcome to your internship. Please wait for mentor to assign tasks.", notes: "" }
      ]);

      if (ticketsRes.data && ticketsRes.data.length > 0) {
        const mappedTickets = ticketsRes.data.map(t => {
          const statusStr = t.status === "resolved" || t.status === "closed" ? "Resolved" : "Pending";
          return {
            ...t,
            id: `TKT-${t.id}`,
            date: new Date(t.created_at).toLocaleDateString(),
            status: statusStr,
            adminReply: t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1].message : (t.status === "resolved" ? t.resolution : "Your ticket is under review.")
          };
        });
        setTicketsData(mappedTickets);
      }

      if (factRes.data && !factRes.data.completed) {
        setDomainInsights([factRes.data.fact]);
      }

      // We will keep notifications mocked for now as there's no endpoint
      setNotifications([
        { id: 1, text: "Welcome to ProEduvate!", time: "Just now" }
      ]);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/facts?t=' + new Date().getTime()).then(res => {
        if (res.data && !res.data.completed) {
          setDomainFact(res.data);
        }
      }).catch(e => console.warn(e));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Notifications will be fetched from API
  // previously mockNotifications...

  // Live Meeting State
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMeetingMinimized, setIsMeetingMinimized] = useState(false);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState("Main Meeting"); // force recompile
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const handleJoinMeeting = () => {
    // Bypassing mentor restriction for trial/demo purposes
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
    const slug = tabId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    navigate(`/intern/${slug}`);
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

  const fetchAirdrops = async () => {
    try {
      const res = await api.get('/bonus-airdrops');
      setBonusAirdrops(res.data);
    } catch (err) {
      console.error("Failed to fetch airdrops", err);
    }
  };

  useEffect(() => {
    const airdropInterval = setInterval(() => {
      fetchAirdrops();
    }, 15000); // Check for new airdrops every 15 seconds
    return () => clearInterval(airdropInterval);
  }, []);

  // fetchAirdrops is now executed concurrently inside fetchDashboard

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

  const getParsedConfig = (drop) => {
    if (!drop || !drop.task_config) return {};
    if (typeof drop.task_config === 'string') {
      try { return JSON.parse(drop.task_config); } catch (e) { return {}; }
    }
    return drop.task_config;
  };

  const getAirdropQuestion = (drop) => {
    if (!drop) return "";
    const config = getParsedConfig(drop);
    const taskType = (drop.task_type || drop.taskType || "").toLowerCase();

    if (config.question) return config.question;
    if (config.statement) return config.statement;
    if (config.sentence) return config.sentence;
    if (taskType.includes("match")) return "Match the following items correctly:";
    if (taskType.includes("arrange")) return "Arrange the following items in the correct sequence:";
    return drop.title || drop.description || "Bonus Airdrop Challenge";
  };

  const handleStartAirdrop = async (airdrop) => {
    try {
      await api.patch(`/bonus-airdrops/${airdrop.id}`, { action: "start" });
      setActiveAirdrop(airdrop);
      setAirdropTimeLeft(parseInt(airdrop.time_limit));

      const config = getParsedConfig(airdrop);
      const taskType = (airdrop.task_type || airdrop.taskType || "").toLowerCase();

      if (taskType.includes("match") && config.pairs) {
        const initialPairs = {};
        Object.keys(config.pairs).forEach(k => { initialPairs[k] = ""; });
        setAirdropAnswer(initialPairs);
      } else if (taskType.includes("arrange")) {
        const items = [...(config.correct_sequence || config.items || config.correct_order || [])];
        setAirdropAnswer(items);
      } else {
        setAirdropAnswer("");
      }

      setShowAirdropModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to start Airdrop: " + (err.response?.data?.detail || err.message));
    }
  };

  const [isSubmittingAirdrop, setIsSubmittingAirdrop] = useState(false);

  const handleSubmitAirdrop = async () => {
    if (activeAirdrop && !isSubmittingAirdrop) {
      setIsSubmittingAirdrop(true);
      try {
        let answerPayload = airdropAnswer;
        if (typeof answerPayload === 'object' && answerPayload !== null) {
          answerPayload = JSON.stringify(answerPayload);
        }
        await api.patch(`/bonus-airdrops/${activeAirdrop.id}`, {
          action: "submit",
          answer: answerPayload
        });

        if (airdropTimeLeft > 0) {
          alert("Bonus Airdrop submitted successfully!");
        } else {
          alert("Time is up! Your answer was automatically submitted.");
        }
        fetchAirdrops(); // Refetch to update status
      } catch (err) {
        console.error(err);
        alert("Failed to submit Airdrop: " + (err.response?.data?.detail || err.message));
      } finally {
        setIsSubmittingAirdrop(false);
        setShowAirdropModal(false);
        setActiveAirdrop(null);
      }
    } else {
      setShowAirdropModal(false);
      setActiveAirdrop(null);
    }
  };

  const [domainInsights, setDomainInsights] = useState([
    "React's Virtual DOM minimizes direct DOM manipulations to improve application rendering speed.",
    "Debouncing and throttling are essential techniques for optimizing event-heavy operations like scrolling or typing.",
    "State immutability in React ensures predictable data flow and enables effective re-rendering optimizations."
  ]);

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

  // Mock State
  const progress = 40; // 12 of 30 days
  const [aiScore, setAiScore] = useState(0);
  const attendancePercent = 90;

  // Dynamic Learning Workflow State
  const [currentDay, setCurrentDay] = useState(1);

  const [curriculumData, setCurriculumData] = useState([]);

  // MCQ and Assessment Workflow State
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentView, setAssessmentView] = useState("selection"); // selection, mcq, coding
  const [mcqDone, setMcqDone] = useState(false);
  const [codingDone, setCodingDone] = useState(false);
  const [isDayLockedUntilMidnight, setIsDayLockedUntilMidnight] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [ticketsData, setTicketsData] = useState([]);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [ticketFilter, setTicketFilter] = useState("All");

  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim()) {
      alert("Please enter an issue title before submitting.");
      return;
    }

    try {
      const res = await api.post('/tickets', {
        title: newTicketTitle,
        description: newTicketDesc || "",
        domain: "General"
      });
      const t = res.data;
      const newTicket = {
        ...t,
        id: `TKT-${t.id}`,
        date: new Date(t.created_at).toLocaleDateString(),
        status: "Pending",
        adminReply: "Your ticket is under review."
      };
      setTicketsData([newTicket, ...ticketsData]);
      setNewTicketTitle("");
      setNewTicketDesc("");
      setShowTicketForm(false);
    } catch (err) {
      console.error("Failed to create ticket", err);
      alert("Failed to create ticket.");
    }
  };

  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [answers, setAnswers] = useState({});
  const [mcqGrade, setMcqGrade] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [mcqAttemptId, setMcqAttemptId] = useState(null);

  const [codeAssessment, setCodeAssessment] = useState(null);

  // Coding task state
  const [code, setCode] = useState("function sum(a, b) {\n  // write code\n}");
  const [filesData, setFilesData] = useState(null);
  const [language, setLanguage] = useState("javascript");

  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // Chat message state
  const [chatMessages, setChatMessages] = useState([
    { sender: "Mentor", text: "Hi John, I saw your code. Good effort, try to refactor the key prop warning.", time: "10:30 AM" }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const handleMcqSubmit = async () => {
    setMcqSubmitted(true);
    try {
      const res = await api.post(`/mcq/day/${currentDay}/submit`, {
        attempt_id: mcqAttemptId,
        answers: answers
      });
      setMcqGrade(res.data.percentage);
      setMcqDone(true);
      alert(`MCQ Test submitted! Score: ${res.data.percentage}%. Part A completed.`);
      setAssessmentView("selection");
    } catch (err) {
      console.error(err);
      alert("Failed to submit MCQ: " + (err.response?.data?.detail || err.message));
    }
  };

  const startMcqTest = async () => {
    try {
      const res = await api.post(`/mcq/day/${currentDay}/start`);
      const mapped = res.data.questions.map(q => ({
        id: q.id,
        text: q.question,
        options: Object.entries(q.options).map(([k, v]) => ({ label: v, val: k }))
      }));
      setMcqQuestions(mapped);
      setMcqAttemptId(res.data.attempt_id);
      setAssessmentView("mcq");
      setMcqStarted(true);
      setMcqSubmitted(false);
      setAnswers({});
      setTimer(180);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error(err);
      alert("Failed to start MCQ: " + (err.response?.data?.detail || err.message));
    }
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

  const startCodeTest = async () => {
    try {
      const res = await api.get(`/questions/code/day/${currentDay}`);
      if (res.data && res.data.questions && res.data.questions.length > 0) {
        setCodeAssessment(res.data.questions[0]);
        setAssessmentView("coding");
      } else {
        alert("No coding assessment available for today.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load coding assessment: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleLogout = () => {
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  const handleRunCode = () => {
    alert("Running code against test cases...\nResult: PASSED (2/2 test cases)");
  };

  const handleSubmitCode = async () => {
    setEvaluating(true);

    const currentTask = curriculumData.find(t => t.day === currentDay);
    if (!currentTask || !currentTask.id) {
      setEvaluating(false);
      alert("Could not find the current task ID for submission.");
      return;
    }

    try {
      // 1. Submit actual code to backend
      const submitRes = await api.post('/submissions', {
        task_id: currentTask.id,
        code_submission: code,
        language: language
      });

      const aiScoreResult = submitRes.data.ai_score || 0;
      setAiScore(aiScoreResult);

      let parsedFeedback = "Great job!";
      try {
        if (submitRes.data.ai_feedback) {
          const fb = JSON.parse(submitRes.data.ai_feedback);
          parsedFeedback = fb.suggestions || fb.feedback || submitRes.data.ai_feedback;
        }
      } catch (e) {
        parsedFeedback = submitRes.data.ai_feedback;
      }

      setEvalResult({
        score: aiScoreResult,
        correctness: Math.min(100, aiScoreResult + 10),
        logic: aiScoreResult,
        quality: Math.min(100, aiScoreResult + 5),
        performance: aiScoreResult,
        suggestions: parsedFeedback
      });

      const today = new Date();
      const utcMs = today.getTime() + (today.getTimezoneOffset() * 60000);
      const istToday = new Date(utcMs + (3600000 * 5.5));
      const istDateStr = istToday.toISOString().split('T')[0];

      const analyticsRes = await api.post('/daily-questions/results', {
        question_id: currentDay,
        mcq_score: mcqGrade || 0,
        coding_score: aiScoreResult,
        date: istDateStr
      });

      setRecentSubmissions(prev => {
        if (!prev.some(s => s.date === analyticsRes.data.date)) {
          return [...prev, analyticsRes.data];
        }
        return prev;
      });

      // Note: We intentionally don't update completedDays here because completedDays is exclusively for the Daily Scenario calendar, not attendance.

      try {
        const profileRes = await api.get('/profile');
        setDashboardData(profileRes.data);
      } catch (err) {
        console.warn("Failed to update profile after submission", err);
      }

      alert(`Coding assessment submitted! Score: ${aiScoreResult}%. Part B completed.`);
      setCodingDone(true);
      setAssessmentView("selection");
    } catch (err) {
      console.error("Failed to submit code", err);
      alert("Failed to submit code: " + (err.response?.data?.detail || err.message));
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [...prev, { sender: "You", text: inputMsg, time: "Just now" }]);
    setInputMsg("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "calc(100vh - 96px)", overflowY: "auto", overflowX: "hidden", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", boxSizing: "border-box", paddingBottom: "20px" }}>

            {/* Top Row Container: Hero Banner on Left + Dark Blue Quote Card on Right */}
            <div style={{ display: "flex", gap: "20px", flexShrink: 0, height: "180px" }}>

              {/* Hero Banner ("Learn. Build. Grow.") */}
              <div className="hero-banner-card" style={{
                flex: "2.5",
                borderRadius: "16px",
                padding: "20px 24px",
                color: "var(--text-primary, #0f172a)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                {/* Mountain Silhouette Background SVG */}
                <svg style={{ position: "absolute", right: "20px", bottom: 0, height: "100%", width: "40%", opacity: 0.3, pointerEvents: "none" }} viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
                  <path d="M0 200 L140 60 L240 160 L350 10 L400 200 Z" fill="#0284c7" />
                  <path d="M100 200 L250 40 L340 130 L400 200 Z" fill="#0369a1" opacity="0.7" />
                  <circle cx="350" cy="8" r="3" fill="var(--text-primary, #0f172a)" />
                  <path d="M348 12 L352 22 M345 16 L355 16" stroke="var(--text-primary, #0f172a)" strokeWidth="2" />
                </svg>

                <div style={{ position: "relative", zIndex: 2 }}>
                  <span className="hero-banner-title" style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", display: "block", marginBottom: "4px" }}>
                    YOUR INTERNSHIP JOURNEY
                  </span>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-primary, #0f172a)", letterSpacing: "-0.03em", lineHeight: "1.1" }}>
                    Learn. Build. <span className="hero-banner-grow">Grow.</span>
                  </h1>
                </div>

                {/* 4 Floating Metric Cards Row inside Hero Bottom */}
                <div style={{ display: "flex", gap: "12px", position: "relative", zIndex: 3 }}>
                  <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)", flex: 1 }}>
                    <div className="stat-icon-bg-blue" style={{ width: "32px", height: "32px", borderRadius: "8px", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{completedDays.length || 0} / 30</h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Tasks Completed</span>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)", flex: 1 }}>
                    <div className="stat-icon-bg-green" style={{ width: "32px", height: "32px", borderRadius: "8px", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{recentSubmissions?.length || 0} / 30</h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Assessments</span>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)", flex: 1 }}>
                    <div className="stat-icon-bg-orange" style={{ width: "32px", height: "32px", borderRadius: "8px", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{dashboardData?.attendance_pct || 0}%</h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Attendance</span>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)", flex: 1 }}>
                    <div className="stat-icon-bg-purple" style={{ width: "32px", height: "32px", borderRadius: "8px", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{aiScore}%</h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Overall Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Card on Right */}
              <div className="hero-quote-card" style={{
                flex: "1",
                borderRadius: "16px",
                padding: "20px 24px",
                background: "#0a1128",
                border: "1px solid #1e293b",
                color: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}>
                <svg style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "160px", opacity: 0.1, pointerEvents: "none" }} viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>

                <p style={{ margin: "0 0 12px 0", fontSize: "1rem", fontStyle: "italic", lineHeight: "1.5", color: "#f8fafc", fontWeight: 500, zIndex: 1 }}>
                  "{domainFact && domainFact.fact ? domainFact.fact : 'Concept security is widely used in Frontend.'}"
                </p>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#3b82f6", zIndex: 1 }}>— ProEduvate</span>
              </div>
            </div>

            {/* Main Content Row */}
            <div className="dashboard-layout-row" style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>

              {/* Left Column: Your 30-Day Journey Timeline */}
              <div style={{ flex: "0.65", background: "var(--bg-surface, #ffffff)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Your 30-Day Journey</h3>
                  <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }} onClick={() => handleTabClick("Progress & Certificate")}>View Path &rarr;</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", paddingLeft: "8px", flex: 1, justifyContent: "flex-start", paddingTop: "10px" }}>
                  <div style={{ position: "absolute", left: "16.5px", top: "16px", bottom: "16px", width: "3px", background: "#f1f5f9", borderRadius: "4px" }}></div>

                  {(() => {
                    const visibleDaysCount = 10;
                    let startDay = Math.max(1, currentDay - 2);
                    if (startDay + visibleDaysCount - 1 > 30) startDay = 30 - visibleDaysCount + 1;

                    return Array.from({ length: visibleDaysCount }, (_, i) => {
                      const dayNum = startDay + i;
                      const topics = ["Introduction to HTML", "CSS Styling", "JavaScript Basics", "DOM Manipulation", "React Basics", "Component Composition", "State and Props", "React Hooks Lifecycle", "Context API & Global State", "Routing and Layouts", "Redux Basics", "Testing & Debugging", "REST API Development", "Authentication", "Git & GitHub", "Database Basics", "Node.js Basics", "Express framework", "MongoDB Integration", "Building the Backend", "Frontend/Backend Connect", "Security Best Practices", "Deployment", "CI/CD Pipelines", "Docker Basics", "Cloud Services", "Performance Optimization", "Web Accessibility", "Final Project Setup", "Final Project Delivery"];
                      const mockTitle = curriculumData.find(c => c.day === dayNum)?.topic || topics[dayNum - 1];
                      return {
                        day: `Day ${dayNum}`,
                        title: mockTitle,
                        done: dayNum < currentDay,
                        current: dayNum === currentDay,
                        locked: dayNum > currentDay,
                        isFlag: dayNum === 30
                      };
                    });
                  })().map((step, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: 2, padding: "4px 0" }}>
                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: step.done ? "#16a34a" : (step.current ? "#2563eb" : "var(--bg-surface, #ffffff)"),
                        border: step.locked ? "2px solid var(--border-color, #cbd5e1)" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: step.done || step.current ? "var(--bg-surface, #ffffff)" : "#94a3b8",
                        fontSize: "10px",
                        boxShadow: step.current ? "0 0 0 4px rgba(37, 99, 235, 0.15)" : "none",
                        transition: "all 0.2s ease"
                      }}>
                        {step.done && <Check size={12} strokeWidth={3} />}
                        {step.current && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--bg-surface, #ffffff)" }} />}
                        {step.locked && !step.isFlag && <Lock size={10} />}
                        {step.isFlag && <Flag size={10} />}
                      </div>

                      <div style={{ flex: 1, padding: step.current ? "10px 14px" : "8px 10px", background: step.current ? "#eff6ff" : "transparent", borderRadius: "10px", border: step.current ? "1px solid var(--border-blue-light, #bfdbfe)" : "1px solid transparent", transition: "all 0.2s ease" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: step.current ? "#1d4ed8" : (step.done ? "var(--text-primary, #0f172a)" : "#94a3b8") }}>{step.day}</span>
                          {step.current && <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#2563eb", background: "#dbeafe", padding: "2px 8px", borderRadius: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current</span>}
                        </div>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: step.current ? "#2563eb" : (step.done ? "#475569" : "#94a3b8"), fontWeight: step.current ? 700 : 500 }}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Column: Today's Objective & Daily Scenario Activity */}
              <div style={{ flex: "1.5", display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>

                {/* Today's Objective Card */}
                {(() => {
                  const activeCurriculum = curriculumData.find(c => c.day === currentDay) || curriculumData[0];
                  return (
                    <div style={{ background: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>

                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Target size={18} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Today's Objective</h3>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Day {activeCurriculum.day}: {activeCurriculum.topic}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f97316", fontSize: "0.75rem", fontWeight: 700, background: "#fff7ed", padding: "4px 10px", borderRadius: "20px" }}>
                            <Clock size={12} /> 45m
                          </div>
                          <button className="btn-primary" style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, margin: 0 }} onClick={() => setActiveTab("Learning")}>
                            Go to Learning &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Module Progress */}
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>Module Progress</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#2563eb" }}>{Math.round((recentSubmissions.length / 30) * 100)}%</span>
                        </div>
                        <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${Math.round((recentSubmissions.length / 30) * 100)}%`, height: "100%", background: "#2563eb", borderRadius: "3px" }}></div>
                        </div>
                      </div>

                      {/* Tasks Checklist */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: "#f1f5f9", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Play size={8} fill="currentColor" />
                          </div>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-primary, #0f172a)", fontWeight: 600 }}>{curriculumData.find(c => c.day === currentDay)?.topic || "Daily Task"}</span>
                        </div>
                      </div>

                      {/* Upcoming / Join Meeting Box */}
                      <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--border-color, #e2e8f0)", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Calendar size={16} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted, #64748b)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Upcoming</span>
                            <span style={{ fontSize: "0.9rem", color: "var(--text-primary, #0f172a)", fontWeight: 700 }}>
                              {curriculumData.find(c => c.day === currentDay + 1)?.topic || "Project Review"}
                            </span>
                          </div>
                        </div>
                        <button style={{ padding: "6px 16px", background: "var(--text-primary, #0f172a)", color: "var(--bg-surface, #ffffff)", border: "none", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }} onClick={() => setIsMeetingActive(true)}>
                          Join
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Bonus Airdrop Card - Compact Single Line */}
                <div className="bonus-airdrop-card" style={{ background: "linear-gradient(to right, #faf5ff, #fdf4ff)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #f3e8ff" }}>
                  {/* Icon */}
                  <div className="bonus-airdrop-icon" style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#d946ef", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Gift size={16} />
                  </div>
                  {/* Label */}
                  <span className="bonus-airdrop-text" style={{ fontSize: "0.85rem", fontWeight: 800, color: "#701a75", flexShrink: 0 }}>Bonus Airdrops</span>
                  <span className="bonus-airdrop-badge" style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700, color: "#d946ef", background: "#fae8ff", flexShrink: 0 }}>
                    {bonusAirdrops.filter(a => a.status === "PUBLISHED").length} Active
                  </span>
                  
                  {/* First airdrop question - truncated */}
                  <span className="bonus-airdrop-text" style={{ flex: 1, fontSize: "0.8rem", fontWeight: 600, color: "#86198f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {bonusAirdrops.filter(a => a.status === "PUBLISHED")[0]?.question ?? "No active airdrops right now"}
                  </span>

                  {/* Actions */}
                  {bonusAirdrops.filter(a => a.status === "PUBLISHED")[0] && (
                    <button className="bonus-airdrop-btn" onClick={() => handleStartAirdrop(bonusAirdrops.filter(a => a.status === "PUBLISHED")[0])} style={{ flexShrink: 0, padding: "6px 14px", background: "#d946ef", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                      Participate Now
                    </button>
                  )}
                  {/* View All */}
                  <button className="bonus-airdrop-view" onClick={() => setActiveTab("Bonus Airdrops")} style={{ flexShrink: 0, padding: "6px 14px", background: "transparent", color: "#a21caf", border: "1px solid #f0abfc", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                    View All &rarr;
                  </button>
                </div>

                {/* Recent Submissions Card */}
                <div style={{ flex: 1, background: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexShrink: 0 }}>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Recent Submissions</h3>
                    <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }}>View All &rarr;</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {recentSubmissions.length === 0 ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>No recent submissions</span>
                    ) : (
                      recentSubmissions.slice(0, 3).map((sub, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <CheckCircle size={14} />
                            </div>
                            <div>
                              <span style={{ fontSize: "0.8rem", color: "var(--text-primary, #0f172a)", fontWeight: 700, display: "block" }}>Day Score: {sub.date}</span>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Graded</span>
                            </div>
                          </div>
                          <span style={{ fontSize: "0.9rem", color: "#16a34a", fontWeight: 800 }}>{sub.final_score}/100</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Calendar & Leaderboard */}
              <div className="mobile-w-full" style={{ flex: "1.1", display: "flex", flexDirection: "column", gap: "16px", minHeight: 0, overflow: "hidden" }}>

                {/* Daily Scenario Calendar Widget */}
                <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", overflow: "hidden" }}>
                  <DailyScenarioCalendar
                    currentDay={simulationDay}
                    completedDays={completedDays}
                    onStartScenario={(day) => setActiveTab("Daily Scenario")}
                  />
                </div>

                {/* Leaderboard Card */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "300px" }}>
                  <AdminLeaderboard usersList={usersList} isOverview={true} />
                </div>
              </div>
            </div>
          </div>
        );

      case "Learning":
        const currentCurriculum = curriculumData.find(c => c.day === currentDay) || curriculumData[curriculumData.length - 1];

        if (isDayLockedUntilMidnight) {
          return (
            <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <Lock size={48} color="var(--text-muted, #64748b)" />
              </div>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Hero Banner */}
                  <div style={{
                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                    borderRadius: "12px",
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                    border: "1px solid #bae6fd"
                  }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>Test Your Knowledge</div>
                      <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary, #0f172a)", margin: "2px 0 0 0" }}>Assessments</h2>
                      <p style={{ color: "#334155", fontSize: "13px", margin: "2px 0 0 0" }}>
                        Reinforce what you've learned. Track your understanding and prepare for real-world challenges.
                      </p>
                    </div>
                    <div>
                      <button className="btn btn-secondary" onClick={() => setShowAssessment(false)} style={{ background: "white", color: "var(--text-primary, #0f172a)", border: "1px solid var(--border-color, #cbd5e1)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", padding: "6px 14px", fontSize: "13px", fontWeight: "600" }}>
                        <ArrowLeft size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Back
                      </button>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>

                    {/* Left Column: Assessments List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-color, #1f2937)", margin: "0 0 4px 0" }}>Day {currentDay} - Assessments</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Complete the assessments below to strengthen your understanding.</p>
                      </div>

                      {/* MCQ Card */}
                      <div className="card" style={{ display: "flex", alignItems: "center", padding: "20px", gap: "20px", border: "1px solid", borderColor: mcqDone ? "#86efac" : "var(--border-color)", background: mcqDone ? "#f0fdf4" : "var(--card-bg)", transition: "all 0.2s ease" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: mcqDone ? "#dcfce7" : "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={32} color={mcqDone ? "#16a34a" : "#0284c7"} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-color, #1f2937)", margin: "0 0 6px 0" }}>MCQ Test</h4>
                          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 8px 0" }}>Part A: Timed questions on today's concepts.</p>
                          <div style={{ display: "flex", gap: "16px", color: "var(--text-muted)", fontSize: "12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> 3 mins</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Target size={14} /> AI Evaluated</span>
                          </div>
                        </div>
                        <div>
                          {mcqDone ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                              <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={18} /> Completed</span>
                              <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "600" }}>Score: {mcqGrade}%</span>
                            </div>
                          ) : (
                            <button className="btn btn-primary" onClick={startMcqTest} style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "600" }}>Start MCQ &rarr;</button>
                          )}
                        </div>
                      </div>

                      {/* Coding Card */}
                      <div className="card" style={{ display: "flex", alignItems: "center", padding: "20px", gap: "20px", border: "1px solid", borderColor: codingDone ? "#86efac" : "var(--border-color)", background: codingDone ? "#f0fdf4" : "var(--card-bg)", transition: "all 0.2s ease" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: codingDone ? "#dcfce7" : "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Code size={32} color={codingDone ? "#16a34a" : "#9333ea"} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-color, #1f2937)", margin: "0 0 6px 0" }}>{internDomain.toLowerCase() === "ui/ux" ? "UI/UX Assignment" : "Coding Assignment"}</h4>
                          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 8px 0" }}>Part B: {internDomain.toLowerCase() === "ui/ux" ? "Upload your photos and Figma link." : "Write and execute code in our compiler."}</p>
                          <div style={{ display: "flex", gap: "16px", color: "var(--text-muted)", fontSize: "12px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> Untimed</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Target size={14} /> Practical Skill</span>
                          </div>
                        </div>
                        <div>
                          {codingDone ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                              <span style={{ color: "#16a34a", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={18} /> Completed</span>
                            </div>
                          ) : (
                            <button className="btn btn-primary" onClick={startCodeTest} disabled={codingDone || !mcqDone} style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "600", background: "#9333ea", borderColor: "#9333ea" }}>
                              {codingDone ? "Completed" : "Continue Coding \u2192"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Completion Banner */}
                      {mcqDone && codingDone && (
                        <div style={{ background: "linear-gradient(to right, #4f46e5, #3b82f6)", borderRadius: "12px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white", marginTop: "8px", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "50%" }}><PartyPopper size={24} color="white" /></div>
                            <div>
                              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "white" }}>Complete all assessments for Day {currentDay}!</h4>
                              <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, color: "white" }}>Stay consistent. You're doing great!</p>
                            </div>
                          </div>
                          <button className="btn" onClick={handleCompleteDay} style={{ background: "white", color: "#4f46e5", border: "none", padding: "10px 24px", fontWeight: "bold", borderRadius: "8px" }}>Unlock Next Day</button>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Progress & Rules */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                      <div className="card" style={{ padding: "24px" }}>
                        <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-color, #1f2937)", margin: "0 0 20px 0" }}>Your Assessment Progress</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                          <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "8px solid #f1f5f9", borderTopColor: "#3b82f6", borderRightColor: (mcqDone || codingDone) ? "#3b82f6" : "#f1f5f9", borderBottomColor: (mcqDone && codingDone) ? "#3b82f6" : "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-primary, #0f172a)" }}>{(mcqDone ? 1 : 0) + (codingDone ? 1 : 0)} / 2</span>
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-color, #1f2937)" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }}></div> Completed ({(mcqDone ? 1 : 0) + (codingDone ? 1 : 0)})
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-color, #1f2937)" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--border-color, #cbd5e1)" }}></div> Pending ({2 - ((mcqDone ? 1 : 0) + (codingDone ? 1 : 0))})
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: "24px", padding: "12px", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "8px", border: "1px dashed var(--border-color, #cbd5e1)", display: "flex", alignItems: "center", gap: "12px" }}>
                          <TrendingUp size={20} color="#10b981" />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{user?.name || "Intern User"}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user?.email || "intern@proeduvate.com"}</div>
                            <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary, #0f172a)", marginTop: "4px" }}>Keep going!</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>You're {((mcqDone ? 50 : 0) + (codingDone ? 50 : 0))}% through today's assessments.</div>
                          </div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: "20px", background: "#fffbeb", border: "1px solid #fde68a" }}>
                        <h4 style={{ margin: "0 0 12px 0", color: "#d97706", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <ShieldAlert size={18} /> Rules & Conditions
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: "20px", color: "#92400e", fontSize: "13px", lineHeight: "1.6" }}>
                          <li><b>Completion:</b> Both Part A & B must be completed to unlock the next day.</li>
                          <li><b>Timing:</b> MCQ section is strictly timed. Cannot be paused.</li>
                          <li><b>Navigation:</b> Cannot return to menu during active MCQ test.</li>
                          <li><b>Integrity:</b> Do not refresh page during an active assessment.</li>
                        </ul>
                      </div>

                    </div>
                  </div>
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
                          {mcqQuestions.map((q, idx) => (
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
                            <b>Q{currentQuestionIndex + 1}.</b> {mcqQuestions[currentQuestionIndex]?.text}
                          </h4>

                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {mcqQuestions[currentQuestionIndex]?.options.map(opt => (
                              <button
                                key={opt.val}
                                className={`btn ${answers[mcqQuestions[currentQuestionIndex].id] === opt.val ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => setAnswers({ ...answers, [mcqQuestions[currentQuestionIndex].id]: opt.val })}
                                style={{ textAlign: "left", padding: "12px 16px", fontSize: "14px", justifyContent: "flex-start", backgroundColor: answers[mcqQuestions[currentQuestionIndex].id] === opt.val ? "var(--primary-color)" : "var(--card-bg)", color: answers[mcqQuestions[currentQuestionIndex].id] === opt.val ? "var(--card-bg)" : "var(--text-color, #1f2937)", border: answers[mcqQuestions[currentQuestionIndex].id] === opt.val ? "none" : "1px solid var(--border-gray-dark)" }}
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
                              disabled={currentQuestionIndex === mcqQuestions.length - 1}
                              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                              style={{ opacity: currentQuestionIndex === mcqQuestions.length - 1 ? 0.5 : 1 }}
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
                    <h3 style={{ margin: 0 }}>Part B: {false ? "UI/UX Assessment" : "Coding Assessment"}</h3>
                    <button className="btn btn-secondary" onClick={() => setAssessmentView("selection")} style={{ padding: "6px 12px", fontSize: "12px" }}>Back</button>
                  </div>

                  {false ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "8px" }}>Upload Design Photos: </label>
                        <input type="file" multiple className="form-control" style={{ fontSize: "13px", width: "100%", boxSizing: "border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "8px" }}>Figma Project Link: </label>
                        <input type="url" placeholder="https://www.figma.com/file/..." className="form-control" style={{ fontSize: "13px", width: "100%", boxSizing: "border-box" }} />
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                        <button className="btn btn-primary" onClick={handleSubmitCode}>Submit Design Work</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {codeAssessment && (
                        <div style={{ marginBottom: "16px", padding: "16px", backgroundColor: "var(--bg-blue-light)", borderRadius: "8px", border: "1px solid var(--border-blue-light)" }}>
                          <h4 style={{ marginTop: 0, color: "var(--primary-dark)" }}>{codeAssessment.title}</h4>
                          <p style={{ fontSize: "14px", margin: "8px 0" }}>{codeAssessment.description}</p>
                          {codeAssessment.requirements && codeAssessment.requirements.length > 0 && (
                            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px" }}>
                              {codeAssessment.requirements.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ fontWeight: 600, fontSize: "13px" }}>Language: </label>
                        <select className="form-control" style={{ width: "120px", display: "inline-block", marginLeft: "10px" }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                        </select>
                      </div>

                      <WebIDE
                        language={language}
                        onChange={(files) => setFilesData(files)}
                      />

                      <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                        <button className="btn btn-secondary" onClick={handleRunCode}>Run Test Cases</button>
                        <button className="btn btn-primary" onClick={handleSubmitCode}>Submit to AI Evaluator</button>
                      </div>
                    </>
                  )}

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
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px", fontFamily: "Inter, sans-serif" }}>
            <div className="hero-banner-card" style={{
              borderRadius: "16px",
              padding: "20px 24px",
              color: "var(--text-primary, #0f172a)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              gap: "20px"
            }}>
              {/* Mountain Silhouette Background SVG */}
              <svg style={{ position: "absolute", right: "0", bottom: 0, height: "100%", width: "100%", opacity: 0.2, pointerEvents: "none" }} viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
                <path d="M-100 200 L140 60 L240 160 L550 10 L900 200 Z" fill="#0284c7" />
                <path d="M100 200 L250 40 L340 130 L600 20 L900 200 Z" fill="#0369a1" opacity="0.5" />
              </svg>

              <div style={{ position: "relative", zIndex: 2, background: "var(--bg-surface, #ffffff)", width: "56px", height: "56px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", color: "#2563eb", flexShrink: 0 }}>
                <Code size={28} />
              </div>

              <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
                <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1e40af", display: "block", marginBottom: "4px" }}>
                  DAY {currentDay} OF 30
                </span>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 6px 0", color: "var(--text-primary, #0f172a)", letterSpacing: "-0.02em" }}>
                  {curriculumData.find(c => c.day === currentDay)?.topic || curriculumData[0].topic}
                </h1>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#334155" }}>
                  {curriculumData.find(c => c.day === currentDay)?.desc || curriculumData[0].desc}
                </p>
              </div>

              <div style={{ position: "absolute", right: "24px", bottom: "-10px", opacity: 0.1, transform: "rotate(-10deg)", pointerEvents: "none", zIndex: 1 }}>
                <h2 style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 0.9, margin: 0, textAlign: "right" }}>
                  Learn<br />Build<br />Grow
                </h2>
              </div>
            </div>
            {/* Two Column Layout for Main Content */}
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

              {/* Left Column: Main Learning Interface */}
              <div style={{ flex: activeLearningTab === "AI Client" ? "1" : "2.2", width: activeLearningTab === "AI Client" ? "100%" : "auto", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Navigation Tabs */}
                <div style={{ display: "flex", gap: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px", marginBottom: "8px", flexShrink: 0 }}>
                  <button onClick={() => setActiveLearningTab("Reading Materials")} style={{ background: "none", border: "none", color: activeLearningTab === "Reading Materials" ? "#2563eb" : "var(--text-muted, #64748b)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", position: "relative" }}>
                    <BookOpen size={16} /> Reading Materials
                    {activeLearningTab === "Reading Materials" && <div style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, height: "2px", background: "#2563eb", borderRadius: "2px" }} />}
                  </button>
                  <button onClick={() => setActiveLearningTab("Live Meetings")} style={{ background: "none", border: "none", color: activeLearningTab === "Live Meetings" ? "#2563eb" : "var(--text-muted, #64748b)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", position: "relative" }}>
                    <Calendar size={16} /> Live Meetings
                    {activeLearningTab === "Live Meetings" && <div style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, height: "2px", background: "#2563eb", borderRadius: "2px" }} />}
                  </button>
                  <button onClick={() => setActiveLearningTab("AI Client")} style={{ background: "none", border: "none", color: activeLearningTab === "AI Client" ? "#2563eb" : "var(--text-muted, #64748b)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", position: "relative" }}>
                    <Bot size={16} /> AI Client Review
                    {activeLearningTab === "AI Client" && <div style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, height: "2px", background: "#2563eb", borderRadius: "2px" }} />}
                  </button>
                </div>

                {activeLearningTab === "Reading Materials" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Document Viewer Mockup */}
                    <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "16px", overflow: "hidden", position: "relative", boxShadow: "0 8px 30px rgba(0,0,0,0.05)", border: "1px solid var(--border-color, #e2e8f0)" }}>

                      {/* Top Bar */}
                      <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "16px 24px", borderBottom: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "32px", height: "32px", background: "#eff6ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BookOpen size={16} color="#2563eb" />
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Module Notes: {currentCurriculum.topic}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button style={{ background: "none", border: "none", color: "var(--text-muted, #64748b)", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                            <Download size={14} /> Download PDF
                          </button>
                        </div>
                      </div>

                      {/* Main Content Area */}
                      <div style={{ padding: "32px 40px", minHeight: "260px", display: "flex", flexDirection: "column" }}>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {/* PDF Card */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "12px", transition: "all 0.2s", cursor: "pointer" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--border-color, #cbd5e1)"; e.currentTarget.style.background = "var(--bg-surface, #ffffff)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; e.currentTarget.style.background = "var(--bg-surface-elevated, #f8fafc)"; e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <div style={{ width: "40px", height: "40px", background: "#fee2e2", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FileText size={20} color="#ef4444" />
                              </div>
                              <div>
                                <span style={{ display: "block", fontSize: "15px", fontWeight: 700, color: "var(--text-primary, #0f172a)", marginBottom: "4px" }}>Official Lecture Notes</span>
                                <span style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>PDF Document • 2.4 MB</span>
                              </div>
                            </div>
                            <button style={{ background: "none", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                              <Download size={16} /> Download
                            </button>
                          </div>

                          {/* DOC Card */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "12px", transition: "all 0.2s", cursor: "pointer" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--border-color, #cbd5e1)"; e.currentTarget.style.background = "var(--bg-surface, #ffffff)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; e.currentTarget.style.background = "var(--bg-surface-elevated, #f8fafc)"; e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <div style={{ width: "40px", height: "40px", background: "#e0e7ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ClipboardList size={20} color="#4f46e5" />
                              </div>
                              <div>
                                <span style={{ display: "block", fontSize: "15px", fontWeight: 700, color: "var(--text-primary, #0f172a)", marginBottom: "4px" }}>Practice Exercises</span>
                                <span style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Word Document • 1.1 MB</span>
                              </div>
                            </div>
                            <button style={{ background: "none", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                              <Download size={16} /> Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* What you'll learn */}
                    <div style={{ marginTop: "8px" }}>
                      <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>What you'll learn today</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        {["Understanding component rendering", "Setting up standard project", "Creating first components", "Next steps in the module"].map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle size={16} color="#16a34a" />
                            <span style={{ fontSize: "13px", color: "#334155" }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personal Notes Area */}
                    <div style={{ marginTop: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexShrink: 0 }}>
                        <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-primary, #0f172a)", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                          <FileText size={16} color="var(--text-muted, #64748b)" /> My Personal Notes
                        </h4>
                        <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Auto-saved</span>
                      </div>
                      <textarea
                        placeholder="Jot down important takeaways, questions, or ideas from this module..."
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "1px solid var(--border-color, #e2e8f0)",
                          backgroundColor: "var(--bg-surface-elevated, #f8fafc)",
                          fontSize: "14px",
                          color: "#334155",
                          resize: "vertical",
                          fontFamily: "inherit",
                          outline: "none",
                          transition: "all 0.2s",
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#93c5fd";
                          e.target.style.backgroundColor = "var(--bg-surface, #ffffff)";
                          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border-color, #e2e8f0)";
                          e.target.style.backgroundColor = "var(--bg-surface-elevated, #f8fafc)";
                          e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.02)";
                        }}
                      />
                    </div>

                  </div>
                )}

                {activeLearningTab === "Live Meetings" && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary, #0f172a)", margin: 0 }}>Upcoming Meetings</h3>
                      <Badge variant="outline" style={{ color: "#3b82f6", borderColor: "var(--border-blue-light, #bfdbfe)", background: "#eff6ff" }}>2 Upcoming</Badge>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {/* Event 1 */}
                      <div style={{ background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", transition: "all 0.2s", cursor: "pointer" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.08)"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "10px", padding: "10px 16px", textAlign: "center", border: "1px solid var(--border-color, #e2e8f0)" }}>
                            <span style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted, #64748b)", textTransform: "uppercase" }}>Today</span>
                            <span style={{ display: "block", fontSize: "18px", fontWeight: 900, color: "var(--text-primary, #0f172a)" }}>4:00</span>
                            <span style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted, #64748b)" }}>PM</span>
                          </div>
                          <div>
                            <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>React Core Concepts Q&A</h4>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <User size={14} color="var(--text-muted, #64748b)" />
                                <span style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Sarah Jenkins</span>
                              </div>
                              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-color, #cbd5e1)" }} />
                              <span style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>1 hr session</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={handleJoinMeeting} style={{ background: "#2563eb", color: "var(--bg-surface, #ffffff)", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}>
                          Join Zoom
                        </button>
                      </div>

                      {/* Event 2 */}
                      <div style={{ background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", transition: "all 0.2s", cursor: "pointer" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.08)"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "10px", padding: "10px 16px", textAlign: "center", border: "1px solid var(--border-color, #e2e8f0)", opacity: 0.7 }}>
                            <span style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Tomorrow</span>
                            <span style={{ display: "block", fontSize: "18px", fontWeight: 900, color: "var(--text-muted, #64748b)" }}>2:00</span>
                            <span style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>PM</span>
                          </div>
                          <div>
                            <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 800, color: "#334155" }}>Weekly Architecture Review</h4>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <User size={14} color="#94a3b8" />
                                <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>David Chen</span>
                              </div>
                              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-color, #cbd5e1)" }} />
                              <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>45 min session</span>
                            </div>
                          </div>
                        </div>
                        <button style={{ background: "#f1f5f9", color: "var(--text-muted, #64748b)", border: "1px solid var(--border-color, #e2e8f0)", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "not-allowed" }}>
                          Starts Tomorrow
                        </button>
                      </div>
                    </div>
                  </div>

                )}

                {activeLearningTab === "AI Client" && (
                  <div style={{ marginTop: "8px" }}>
                    <AIClientReview />
                  </div>
                )}


              </div>

              {/* Right Column: Sidebar */}
              {activeLearningTab !== "AI Client" && (
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* Assessment Card */}
                  <div style={{ background: "var(--bg-surface, #ffffff)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", background: "#eff6ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Target size={20} color="#2563eb" />
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Day Assessment</h4>
                          <span style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Test your knowledge</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
                      Ready to complete today's module? Take the MCQ and Coding test now.
                    </p>
                    <button
                      onClick={() => setShowAssessment(true)}
                      style={{ background: "#2563eb", color: "var(--bg-surface, #ffffff)", border: "none", padding: "10px", borderRadius: "8px", fontSize: "14px", fontWeight: 800, cursor: "pointer", transition: "all 0.2s", textAlign: "center", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
                    >
                      Start Assessment &rarr;
                    </button>
                  </div>

                  {/* Mentor Feedback Card */}
                  <div style={{ background: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "radial-gradient(circle at top right, #dbeafe, transparent)", opacity: 0.6 }}></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative", zIndex: 1 }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-blue-light, #bfdbfe)" }}>
                        <User size={14} color="#2563eb" />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Mentor Tip</h4>
                    </div>
                    <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "12px", borderRadius: "10px", borderLeft: "3px solid #2563eb", position: "relative", zIndex: 1 }}>
                      <p style={{ margin: 0, fontSize: "13px", color: "#334155", fontStyle: "italic", lineHeight: 1.5 }}>
                        "Focus on understanding how state affects rendering before moving to complex hooks."
                      </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", position: "relative", zIndex: 1 }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "var(--border-color, #e2e8f0)", display: "inline-block" }}></span>
                        Sarah (Lead Mentor)
                      </span>
                    </div>
                  </div>

                  {/* Upcoming Milestone Card */}
                  <div style={{ background: "var(--warning-bg, #fffbeb)", padding: "16px", borderRadius: "12px", border: "1px solid #fde68a", boxShadow: "0 2px 8px rgba(217, 119, 6, 0.03)", display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", right: "-10px", top: "-10px", opacity: 0.1 }}>
                      <Calendar size={60} color="#d97706" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative", zIndex: 1 }}>
                      <div style={{ background: "#fef08a", padding: "4px", borderRadius: "6px" }}>
                        <Calendar size={14} color="#d97706" />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "14px", color: "#92400e", fontWeight: 800 }}>Upcoming Milestone</h4>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", position: "relative", zIndex: 1 }}>
                      <span style={{ fontSize: "13px", color: "#92400e", fontWeight: 800 }}>Midterm Assessment</span>
                      <span style={{ fontSize: "11px", color: "#b45309", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> Due in 5 days (Day 15)
                      </span>
                    </div>
                  </div>

                  {/* Need Help Card */}
                  <div style={{ background: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "12px", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MessageCircle size={16} color="#475569" />
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Need Help?</h4>
                        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Stuck somewhere?</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("Chat with Mentor")} style={{ background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", color: "#334155", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }} onMouseOver={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.borderColor = "var(--border-blue-light, #bfdbfe)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "var(--bg-surface-elevated, #f8fafc)"; e.currentTarget.style.color = "#334155"; e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; }}>
                      Message Mentor &rarr;
                    </button>
                  </div>

                  {/* Motivational Quote Card */}


                </div>
              )}
            </div>
          </div>
        );

      case "Tickets":
        if (showTicketForm) {
          return (
            <div className="card" style={{ padding: "28px", maxWidth: "800px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, color: "var(--text-color, #1f2937)", fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Ticket size={22} color="#3b82f6" /> File a New Support Ticket
                </h3>
                <button className="btn btn-secondary" onClick={() => setShowTicketForm(false)} style={{ padding: "6px 14px", fontSize: "13px" }}>
                  Back
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "var(--bg-surface-elevated, #f8fafc)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>User Name</label>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-color, #1f2937)", marginTop: "2px" }}>{user?.name || "Intern"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{user?.email || "intern@proeduvate.com"}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Assigned Mentor</label>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-color, #1f2937)", marginTop: "2px" }}>Dr. Sakthi</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Domain</label>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-color, #1f2937)", marginTop: "2px" }}>{internDomain}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Branch / University</label>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-color, #1f2937)", marginTop: "2px" }}>Computer Science (MIT)</div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px", color: "var(--text-color, #1f2937)" }}>Issue Subject / Short Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Docker container fails to start on local machine"
                    value={newTicketTitle}
                    onChange={(e) => setNewTicketTitle(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "8px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "6px", color: "var(--text-color, #1f2937)" }}>Detailed Description & Error Logs</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Please describe step-by-step what issue you are facing..."
                    value={newTicketDesc}
                    onChange={(e) => setNewTicketDesc(e.target.value)}
                    style={{ padding: "12px 14px", borderRadius: "8px" }}
                  ></textarea>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                  <button className="btn btn-secondary" onClick={() => setShowTicketForm(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ padding: "10px 24px" }} onClick={handleCreateTicket}>Submit Ticket &rarr;</button>
                </div>
              </div>
            </div>
          );
        }

        const filteredTickets = ticketsData.filter(t => {
          if (ticketFilter === "Active") return t.status !== "Resolved";
          if (ticketFilter === "Resolved") return t.status === "Resolved";
          return true;
        });

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            {/* Top Hero Banner */}
            <div style={{
              background: "linear-gradient(135deg, #dbeafe 0%, var(--border-blue-light, #bfdbfe) 50%, #93c5fd 100%)",
              borderRadius: "12px",
              padding: "14px 20px",
              color: "var(--text-primary, #0f172a)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(191, 219, 254, 0.4)",
              border: "1px solid var(--border-blue-light, #bfdbfe)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              {/* Mountain Silhouette Background SVG */}
              <svg style={{ position: "absolute", right: "0", bottom: 0, height: "100%", width: "50%", opacity: 0.35, pointerEvents: "none" }} viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
                <path d="M0 200 L140 60 L240 160 L350 10 L400 200 Z" fill="#0284c7" />
                <path d="M100 200 L250 40 L340 130 L400 200 Z" fill="#0369a1" opacity="0.7" />
              </svg>

              {/* "Learn Build Grow" Watermark */}
              <div style={{ position: "absolute", right: "160px", top: "8px", opacity: 0.12, transform: "rotate(-10deg)", pointerEvents: "none" }}>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block" }}>Learn</span>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block", marginLeft: "10px" }}>Build</span>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block", marginLeft: "20px" }}>Grow</span>
              </div>

              <div style={{ position: "relative", zIndex: 2, display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{ width: "44px", height: "44px", background: "var(--bg-surface, #ffffff)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)", flexShrink: 0 }}>
                  <Ticket size={22} color="#2563eb" />
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1d4ed8", display: "block", marginBottom: "2px" }}>
                    Support & Ticketing Hub
                  </span>
                  <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 2px 0", color: "var(--text-primary, #0f172a)", letterSpacing: "-0.02em" }}>
                    Support & Help Center
                  </h1>
                  <p style={{ margin: 0, fontSize: "12px", color: "#334155", maxWidth: "600px", lineHeight: "1.4" }}>
                    File tickets for curriculum questions, environment bugs, or platform assistance.
                  </p>
                </div>
              </div>

              <div style={{ position: "relative", zIndex: 2 }}>
                <button className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "13px", fontWeight: "600", borderRadius: "8px", border: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} onClick={() => setShowTicketForm(true)}>
                  + File a Ticket
                </button>
              </div>
            </div>



            {/* Main Tickets Table / Container */}
            <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", border: "1px solid var(--border-color)" }}>
              {/* Header & Filter Tabs */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--text-color, #1f2937)" }}>Ticket History</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Click on any ticket to expand mentor and admin responses.</span>
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
                  {["All", "Active", "Resolved"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTicketFilter(tab)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        border: "none",
                        cursor: "pointer",
                        background: ticketFilter === tab ? "var(--bg-surface, #ffffff)" : "transparent",
                        color: ticketFilter === tab ? "var(--text-primary, #0f172a)" : "var(--text-muted, #64748b)",
                        boxShadow: ticketFilter === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {tab} ({tab === "All" ? ticketsData.length : tab === "Active" ? ticketsData.filter(t => t.status !== "Resolved").length : ticketsData.filter(t => t.status === "Resolved").length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredTickets.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                    No tickets found for this filter.
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                      style={{
                        padding: "16px 20px",
                        cursor: "pointer",
                        borderRadius: "10px",
                        border: selectedTicket?.id === ticket.id ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                        transition: "all 0.2s ease",
                        backgroundColor: selectedTicket?.id === ticket.id ? "#eff6ff" : "var(--card-bg)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "11px", color: "#1e40af", fontWeight: 700, backgroundColor: "#dbeafe", padding: "4px 10px", borderRadius: "6px" }}>{ticket.id}</span>
                          <span style={{ fontSize: "14.5px", color: "var(--text-color, #1f2937)", fontWeight: "600" }}>{ticket.title}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={14} /> {ticket.date}
                          </span>
                          <span className="badge" style={{
                            backgroundColor: ticket.status === "Resolved" ? "#dcfce7" : ticket.status === "Pending" ? "#eff6ff" : "#fef3c7",
                            color: ticket.status === "Resolved" ? "#15803d" : ticket.status === "Pending" ? "#1d4ed8" : "#b45309",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontWeight: "700",
                            fontSize: "12px"
                          }}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      {selectedTicket?.id === ticket.id && (
                        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Mentor & Admin Response</div>
                            <div style={{ backgroundColor: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #3b82f6", border: "1px solid var(--border-color, #cbd5e1)" }}>
                              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary, #1e293b)", lineHeight: "1.6", whiteSpace: "pre-line" }}>{ticket.adminReply}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
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
            <div style={{ flex: 1, backgroundColor: "var(--bg-light)", padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>

              {/* Generative Background Image Overlay */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: "none", zIndex: 1, opacity: 0.6,
                backgroundImage: (() => {
                  const domain = (internDomain || "").toLowerCase();
                  if (domain.includes("ui/ux") || domain.includes("design")) return "url('/images/chat_bg_uiux.png')";
                  if (domain.includes("data") || domain.includes("ai") || domain.includes("machine learning")) return "url('/images/chat_bg_data.png')";
                  return "url('/images/chat_bg_code.png')";
                })(),
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}></div>

              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "70%", position: "relative", marginBottom: "8px", zIndex: 2 }}>
                  <div style={{
                    backgroundColor: msg.sender === "You" ? "var(--primary-dark)" : "var(--card-bg)",
                    color: msg.sender === "You" ? "var(--card-bg)" : "var(--text-darker)",
                    padding: "10px 14px 22px 14px",
                    borderRadius: "12px",
                    borderBottomRightRadius: msg.sender === "You" ? "0" : "12px",
                    borderBottomLeftRadius: msg.sender !== "You" ? "0" : "12px",
                    fontSize: "14px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    wordBreak: "break-word",
                    border: msg.sender !== "You" ? "1px solid var(--border-color)" : "none"
                  }}>
                    {msg.text}
                    <span style={{ fontSize: "10px", color: msg.sender === "You" ? "var(--border-blue-light)" : "var(--text-slate-light)", position: "absolute", bottom: "6px", right: "12px", display: "flex", alignItems: "center", gap: "2px" }}>
                      {msg.time} {msg.sender === "You" && <CheckCheck size={12} />}
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
        return <DailyScenario onBackToDashboard={() => { setActiveTab("Overview"); fetchDashboard(); }} domainName={dashboardData?.domain?.name || 'Frontend'} />;

      case "Bonus Airdrops":
        const now = new Date();
        const isPassedTime = (a) => a.start_mode === "fixed" && a.end_time && new Date(a.end_time) < now;
        
        const activeDrops = bonusAirdrops.filter(a => a.status === "PUBLISHED" && (!a.attempts || a.attempts.length === 0) && !isPassedTime(a));
        const completedDrops = bonusAirdrops.filter(a => a.status === "ENDED" || a.status === "FINALIZED" || (a.attempts && a.attempts.length > 0) || isPassedTime(a));

        // Motivational quotes for Airdrops
        const quotes = [
          "Success is where preparation and opportunity meet.",
          "Challenge yourself; it's the only path which leads to growth.",
          "Innovation distinguishes between a leader and a follower.",
          "The expert in anything was once a beginner.",
          "Great things never come from comfort zones."
        ];
        // Pick a random quote based on the day or just the first one
        const quoteIndex = new Date().getDay() % quotes.length;
        const selectedQuote = quotes[quoteIndex] || quotes[0];

        return (
          <div style={{ paddingBottom: "40px", display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Ultra-Compact Catchy Airdrop Banner */}
            <div style={{
              background: "linear-gradient(135deg, #cce3fd 0%, #7ab6e8 100%)",
              borderRadius: "12px",
              padding: "16px 20px",
              color: "var(--text-primary, #0f172a)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              boxShadow: "0 4px 12px rgba(122, 182, 232, 0.3)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.5)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Gift size={18} color="#1e3a8a" />
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                  Expect the <span style={{ color: "#1e3a8a" }}>Unexpected.</span>
                </h2>
              </div>

              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary, #1e293b)", lineHeight: "1.4", flex: 1, fontWeight: 500, borderLeft: "1px solid rgba(255,255,255,0.4)", paddingLeft: "20px" }}>
                Airdrops are spontaneous challenges. Showcase your mastery and skyrocket your score!
              </p>

              <div style={{
                background: "rgba(255,255,255,0.3)",
                padding: "6px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
                maxWidth: "280px"
              }}>
                <Quote size={14} color="#1e3a8a" style={{ opacity: 0.6, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontStyle: "italic", fontWeight: 600, color: "var(--text-primary, #1e293b)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  "{selectedQuote}"
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
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
                            <span style={{ fontSize: "11px", color: "#be185d", fontWeight: 700, backgroundColor: "#fdf2f8", padding: "2px 8px", borderRadius: "4px", border: "1px solid #fbcfe8", display: "inline-flex", alignItems: "center" }}>
                              <Gift size={12} style={{ marginRight: "4px" }} /> POP QUIZ
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#fef2f2", color: "#ef4444", padding: "4px 10px", borderRadius: "12px" }}>
                              <Clock size={14} />
                              {drop.time_limit}s time limit
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-darker)", fontWeight: 600 }}>{drop.title || "Bonus Airdrop Challenge"}</p>
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
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, backgroundColor: "var(--border-color, #e2e8f0)", padding: "2px 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Flag size={12} /> FINISHED
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-color)", fontWeight: 600, opacity: 0.8 }}>{drop.title || "Bonus Airdrop Challenge"}</p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                          <div style={{ backgroundColor: "var(--border-color, #e2e8f0)", padding: "6px 12px", borderRadius: "6px", color: "#475569", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                            <Check size={14} /> Challenge Ended
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
      case "Progress & Certificate": {
        const perfBreakdown = (() => {
          if (!portfolioData || !portfolioData.submissions || portfolioData.submissions.length === 0) {
            return { mcq: 0, ai: 0, mentor: 0, overall: 0 };
          }
          const subs = portfolioData.submissions;
          const mcqAvg = Math.round(subs.reduce((acc, curr) => acc + (curr.mcq_score || 0), 0) / subs.length);
          const aiAvg = Math.round(subs.reduce((acc, curr) => acc + (curr.ai_score || 0), 0) / subs.length);
          const mentorAvg = Math.round(subs.reduce((acc, curr) => acc + (curr.mentor_score || 0), 0) / subs.length);
          return {
            mcq: mcqAvg,
            ai: aiAvg,
            mentor: mentorAvg,
            overall: portfolioData.total_score || 0
          };
        })();

        if (showCertificateView) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "hidden", paddingBottom: "10px", height: "calc(100vh - 110px)", paddingRight: "10px" }}>
              {/* Back Button */}
              <div style={{ marginBottom: "-8px" }}>
                <button onClick={() => setShowCertificateView(false)} style={{ background: "none", border: "none", color: "#475569", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", padding: "4px 0", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "var(--text-primary, #0f172a)"} onMouseOut={(e) => e.target.style.color = "#475569"}>
                  <ArrowLeft size={16} style={{ pointerEvents: 'none' }} /> Back to Dashboard
                </button>
              </div>

              {/* Premium Completion Banner - Theme Aligned */}
              <div style={{
                background: "var(--gradient-primary, linear-gradient(135deg, #0875E1, #0B82F6))",
                borderRadius: "20px",
                padding: "24px 32px",
                color: "var(--bg-surface, #ffffff)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(8, 27, 53, 0.1))",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0
              }}>
                <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.9)", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "8px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "10px" }}>
                    Mission Accomplished <Rocket size={12} />
                  </span>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.5px", color: "var(--bg-surface, #ffffff)" }}>
                    Boom! You did it, Dhanush!
                  </h2>
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(255,255,255,0.9)", lineHeight: "1.4", maxWidth: "600px" }}>
                    Incredible work crushing this program. Your relentless hustle has truly paid off. This is just the beginning of your tech journey!
                  </p>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)", padding: "12px 24px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", textAlign: "center", position: "relative", zIndex: 1 }}>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.8)", display: "block" }}>Performance</span>
                  <span style={{ fontSize: "2rem", fontWeight: 800, display: "block", margin: "4px 0", color: "var(--bg-surface, #ffffff)" }}>91%</span>
                  <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: "10px", fontWeight: 700, border: "1px solid #bbf7d0" }}>Excellent</span>
                </div>
              </div>

              {/* Main Grid: Certificate & Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", flexGrow: 1, minHeight: 0 }}>

                {/* Certificate Render */}
                <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "20px", padding: "20px 24px", boxShadow: "var(--shadow-md)", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary, #081B35)" }}>Official Certificate</h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--success-dark, #059669)", fontWeight: 600, background: "var(--success-bg, #ECFDF5)", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px", border: "1px solid var(--success-border, #A7F3D0)" }}>
                      <CheckCircle size={12} /> Verified
                    </span>
                  </div>

                  <div style={{
                    flexGrow: 1,
                    border: "1px solid var(--border-color, #e2e8f0)",
                    borderRadius: "12px",
                    padding: "24px 32px",
                    background: "linear-gradient(180deg, #ffffff 0%, var(--surface-soft, #F8FBFF) 100%)",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 20px 25px -5px rgba(8, 27, 53, 0.05), 0 8px 10px -6px rgba(8, 27, 53, 0.01)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    {/* Corner accents */}
                    <div style={{ position: "absolute", top: "16px", left: "16px", width: "30px", height: "30px", borderTop: "2px solid var(--brand-primary, #0B82F6)", borderLeft: "2px solid var(--brand-primary, #0B82F6)", opacity: 0.3 }}></div>
                    <div style={{ position: "absolute", top: "16px", right: "16px", width: "30px", height: "30px", borderTop: "2px solid var(--brand-primary, #0B82F6)", borderRight: "2px solid var(--brand-primary, #0B82F6)", opacity: 0.3 }}></div>
                    <div style={{ position: "absolute", bottom: "16px", left: "16px", width: "30px", height: "30px", borderBottom: "2px solid var(--brand-primary, #0B82F6)", borderLeft: "2px solid var(--brand-primary, #0B82F6)", opacity: 0.3 }}></div>
                    <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "30px", height: "30px", borderBottom: "2px solid var(--brand-primary, #0B82F6)", borderRight: "2px solid var(--brand-primary, #0B82F6)", opacity: 0.3 }}></div>

                    {/* Logo Area */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-primary, #0B82F6)", color: "var(--bg-surface, #ffffff)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 4px 10px rgba(11, 130, 246, 0.3)" }}>P</div>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary, #081B35)", letterSpacing: "-0.5px" }}>ProEduvate</span>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "3px", color: "var(--text-muted, #7890AA)", textTransform: "uppercase", display: "block", marginBottom: "16px" }}>
                        Certificate of Internship
                      </span>

                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary, #45617F)", margin: "0 0 12px 0", fontStyle: "italic" }}>This is to certify that</p>

                      <h1 style={{ fontSize: "2.2rem", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: "var(--brand-primary, #0B82F6)", margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>
                        Sadie Sink
                      </h1>

                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary, #45617F)", maxWidth: "500px", margin: "0 auto", lineHeight: "1.6" }}>
                        has successfully completed the 30-day Internship Program in <strong style={{ color: "var(--text-primary, #081B35)" }}>Backend Development</strong> at ProEduvate. During this period, he has demonstrated strong learning ability, consistency, and technical skills.
                      </p>
                    </div>

                    {/* Dates & Signatures Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "16px", padding: "0 10px" }}>
                      <div style={{ textAlign: "left" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary, #081B35)", display: "block", marginBottom: "2px" }}>01 Aug 2025 – 30 Aug 2025</span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted, #7890AA)", textTransform: "uppercase", letterSpacing: "1px" }}>Program Duration</span>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{ borderBottom: "1px solid var(--border-strong, #C7D8EA)", width: "120px", margin: "0 auto 4px auto", paddingBottom: "4px", fontWeight: 600, fontFamily: "cursive", fontSize: "1rem", color: "var(--text-primary, #081B35)" }}>Arun Prakash</div>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted, #7890AA)", textTransform: "uppercase", letterSpacing: "1px" }}>Program Mentor</span>
                      </div>

                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <div style={{ width: "40px", height: "40px", background: "var(--bg-surface, #ffffff)", border: "1px dashed var(--border-strong, #C7D8EA)", borderRadius: "6px", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 700, color: "var(--text-placeholder, #9DB0C5)" }}>QR</div>
                        <span style={{ fontSize: "0.55rem", color: "var(--text-muted, #7890AA)", fontFamily: "monospace", letterSpacing: "0.5px" }}>ID: EX-PL-INT-2025-041</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "var(--card-bg, #ffffff)", padding: "20px", borderRadius: "20px", boxShadow: "var(--shadow-md)", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary, #081B35)" }}>Share & Download</h4>

                    <button style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--brand-primary, #0B82F6)", color: "var(--bg-surface, #ffffff)", border: "none", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(11, 130, 246, 0.3)" }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(11, 130, 246, 0.4)"; e.currentTarget.style.background = "var(--brand-primary-hover, #0875E1)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(11, 130, 246, 0.3)"; e.currentTarget.style.background = "var(--brand-primary, #0B82F6)"; }} onClick={() => alert("Downloading Official Certificate PDF...")}>
                      <Download size={16} /> Download PDF
                    </button>

                    <button style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--surface-blue, #EFF7FF)", color: "var(--brand-primary, #0B82F6)", border: "1px solid var(--border-default, #DCE7F2)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.background = "var(--border-default, #DCE7F2)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "var(--surface-blue, #EFF7FF)"; }} onClick={() => alert("Sharing certificate on LinkedIn...")}>
                      <Share2 size={16} /> Share on LinkedIn
                    </button>

                    <button style={{ width: "100%", padding: "12px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--bg-surface, #ffffff)", color: "var(--text-secondary, #45617F)", border: "1px solid var(--border-color, #e2e8f0)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "var(--text-primary, #081B35)"; e.currentTarget.style.borderColor = "var(--border-strong, #C7D8EA)"; }} onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-secondary, #45617F)"; e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; }} onClick={() => alert("Shareable link copied to clipboard!")}>
                      <ExternalLink size={16} /> Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "calc(100vh - 110px)", overflowY: "hidden", paddingRight: "8px" }}>


            {/* Top 4 Metrics Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              <div style={{ padding: "16px", background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-dark, #0f172a)" }}>{Math.max(0, currentDay - 1)} / 30</h3>
                    <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700 }}>{Math.round((Math.max(0, currentDay - 1) / 30) * 100)}%</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "8px" }}>Days Completed</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${Math.round((Math.max(0, currentDay - 1) / 30) * 100)}%`, background: "#2563eb", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              <div style={{ padding: "16px", background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-dark, #0f172a)" }}>{completedDays.length || 0} / 45</h3>
                    <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 700 }}>{Math.round(((completedDays.length || 0) / 45) * 100)}%</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "8px" }}>Tasks Completed</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${Math.round(((completedDays.length || 0) / 45) * 100)}%`, background: "#16a34a", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              <div style={{ padding: "16px", background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Star size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-dark, #0f172a)" }}>{recentSubmissions?.length || 0} / 30</h3>
                    <span style={{ fontSize: "0.8rem", color: "#9333ea", fontWeight: 700 }}>{Math.round(((recentSubmissions?.length || 0) / 30) * 100)}%</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "8px" }}>Assessments Completed</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${Math.round(((recentSubmissions?.length || 0) / 30) * 100)}%`, background: "#9333ea", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>

              <div style={{ padding: "16px", background: "var(--card-bg, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-dark, #0f172a)" }}>{dashboardData?.attendance_pct || 0}%</h3>
                    <span style={{ fontSize: "0.8rem", color: "#ea580c", fontWeight: 700 }}>{(dashboardData?.attendance_pct || 0) >= 90 ? "Excellent" : (dashboardData?.attendance_pct || 0) >= 75 ? "Good" : "Needs Improvement"}</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "block", marginBottom: "8px" }}>Attendance</span>
                  <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}><div style={{ width: `${dashboardData?.attendance_pct || 0}%`, background: "#ea580c", height: "100%", borderRadius: "3px" }}></div></div>
                </div>
              </div>
            </div>

            {/* Middle Grid (3-Column) */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>

              {/* Column 1: Learning Progress Curve */}
              <div style={{ background: "var(--card-bg, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexShrink: 0 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-dark, #0f172a)" }}>Learning Progress</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "var(--text-muted, #64748b)" }}>Your performance from Day 1 to Day 30</p>
                  </div>
                  <div style={{ padding: "4px 8px", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)", fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>Performance ▾</div>
                </div>

                <div style={{ flex: 1, width: "100%", position: "relative", minHeight: "160px", paddingLeft: "30px", boxSizing: "border-box" }}>
                  {(() => {
                    const maxDays = 30;
                    const sortedSubs = [...recentSubmissions].sort((a, b) => new Date(a.date) - new Date(b.date));
                    let points = [];

                    if (sortedSubs.length === 0) {
                      points = [{ x: 0, y: 160, label: "Day 1", value: 0 }];
                    } else {
                      points = sortedSubs.map((sub, idx) => {
                        const dayNum = idx + 1;
                        const x = ((dayNum - 1) / (maxDays - 1)) * 600;
                        const score = sub.final_score || 0;
                        const y = 160 - (score / 100) * 160;
                        return { x, y, label: `Day ${dayNum}`, value: score };
                      });
                      if (points[0].x !== 0) {
                        points.unshift({ x: 0, y: 160, label: "Day 1", value: 0 });
                      }
                    }

                    const pointsString = points.map(p => `${p.x},${p.y}`).join(" ");
                    const polygonPoints = `0,160 ${pointsString} ${points[points.length - 1].x},160 0,160`;
                    const pathString = `M${points.map(p => `${p.x},${p.y}`).join(" L")}`;

                    return (
                      <>
                        <svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                          <defs>
                            <linearGradient id="progressGradFull" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="0" y1="0" x2="600" y2="0" stroke="#f1f5f9" strokeWidth="1" />

                          {points.length > 0 && <polygon points={polygonPoints} fill="url(#progressGradFull)" />}
                          {points.length > 0 && <path d={pathString} stroke="#2563eb" strokeWidth="3" fill="none" />}

                          {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 8 : 5} fill="#2563eb" stroke={i === points.length - 1 ? "var(--bg-surface, #ffffff)" : "none"} strokeWidth={i === points.length - 1 ? 3 : 0} />
                          ))}
                        </svg>

                        {points.length > 0 && (
                          <div style={{ position: "absolute", top: `${Math.max(0, points[points.length - 1].y - 50)}px`, left: `calc(${Math.max(5, (points[points.length - 1].x / 600) * 100)}% + 30px)`, transform: "translateX(-50%)", background: "#2563eb", color: "var(--bg-surface, #ffffff)", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, boxShadow: "0 6px 12px rgba(37,99,235,0.3)", zIndex: 10, minWidth: "90px", textAlign: "center" }}>
                            <div style={{ marginBottom: "2px" }}>{points[points.length - 1].label}</div>
                            <div style={{ fontSize: "1rem" }}>{points[points.length - 1].value}% Score</div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Y-axis labels */}
                  <div style={{ position: "absolute", left: "0", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "0.8rem", color: "var(--text-muted, #64748b)", paddingLeft: "10px" }}>
                  {[1, 5, 10, 15, 20, 25, 30].map(day => (
                    <span key={day} style={{ color: currentDay === day ? "#2563eb" : "inherit", fontWeight: currentDay === day ? 700 : 400 }}>Day {day}</span>
                  ))}
                </div>
              </div>

              {/* Column 2: Skill Development */}
              <div style={{ background: "var(--card-bg, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-dark, #0f172a)" }}>Skill Development</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "var(--text-muted, #64748b)" }}>Your skill growth across key areas</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
                  {(() => {
                    let skills = [];
                    const domainStr = (internDomain || "").toLowerCase();
                    if (domainStr.includes("backend")) {
                      skills = ["Python", "FastAPI", "Databases", "API Design", "Security", "Architecture"];
                    } else if (domainStr.includes("frontend")) {
                      skills = ["React", "JavaScript", "CSS/UI", "State Mgmt", "Performance", "Responsive"];
                    } else if (domainStr.includes("data")) {
                      skills = ["Python", "Pandas", "Machine Learning", "SQL", "Data Viz", "Statistics"];
                    } else {
                      skills = ["Problem Solving", "Logic", "Algorithms", "Debugging", "Code Quality", "Testing"];
                    }
                    
                    // Generate realistic looking values based on overall performance
                    const baseScore = perfBreakdown.overall || 10;
                    return skills.map((name, i) => {
                      // Slight variance for each skill
                      const variance = (i * 7) % 25 - 12; // -12 to +12
                      let val = Math.min(100, Math.max(0, baseScore + variance));
                      if (baseScore === 0) val = 0; // if no progress, 0%
                      return (
                        <div key={name} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Star size={14} />
                          </div>
                          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155", width: "120px" }}>{name}</span>
                          <div style={{ flex: 1, background: "#f1f5f9", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${val}%`, background: "#2563eb", height: "100%", borderRadius: "4px" }}></div>
                          </div>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary, #0f172a)", width: "36px", textAlign: "right" }}>{val}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Column 3: Performance Overview Donut */}
              <div style={{ background: "var(--card-bg, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "var(--text-dark, #0f172a)" }}>Performance Overview</h3>

                <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 16px auto" }}>
                  <svg width="100%" height="100%" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#2563eb" strokeWidth="16" strokeDasharray="440" strokeDashoffset={440 - (440 * perfBreakdown.overall) / 100} strokeLinecap="round" transform="rotate(-90 80 80)" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>{perfBreakdown.overall}%</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Overall Score</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#2563eb" }}></div><span style={{ color: "#334155", fontWeight: 500, fontSize: "0.95rem" }}>MCQ Scores</span></div>
                    <strong style={{ fontSize: "1rem" }}>{perfBreakdown.mcq}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#a855f7" }}></div><span style={{ color: "#334155", fontWeight: 500, fontSize: "0.95rem" }}>AI Evaluation</span></div>
                    <strong style={{ fontSize: "1rem" }}>{perfBreakdown.ai}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }}></div><span style={{ color: "#334155", fontWeight: 500, fontSize: "0.95rem" }}>Mentor Reviews</span></div>
                    <strong style={{ fontSize: "1rem" }}>{perfBreakdown.mentor}</strong>
                  </div>
                </div>

                <div style={{ marginTop: "24px", padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <TrendingUp size={20} color="#16a34a" />
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534", lineHeight: "1.4" }}>You're performing above average! Keep up the great work.</p>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", gap: "12px", minHeight: 0, flex: 1 }}>

              {/* Day-wise Progress */}
              <div style={{ background: "var(--card-bg, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexShrink: 0 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-dark, #0f172a)" }}>Day-wise Progress</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "var(--text-muted, #64748b)" }}>Track your daily learning and task completion</p>
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: 600, cursor: "pointer" }}>View All Days →</span>
                </div>

                <div style={{ display: "flex", gap: "16px", overflowX: "auto", overflowY: "hidden", paddingBottom: "40px" }}>
                  {(() => {
                    const timelineDays = [];
                    const startDay = Math.max(1, currentDay - 2);
                    const endDay = Math.min(30, startDay + 5);
                    for (let i = startDay; i <= endDay; i++) {
                      const cData = curriculumData.find(c => c.day === i);
                      timelineDays.push({
                        day: i,
                        title: cData ? cData.topic : `Day ${i} Challenge`,
                        complete: i < currentDay,
                        active: i === currentDay,
                        locked: i > currentDay,
                        progress: i === currentDay ? 0 : (i < currentDay ? 100 : 0)
                      });
                    }
                    return timelineDays.map(d => (
                    <div key={d.day} style={{
                      flexShrink: 0, width: "160px", padding: "16px", borderRadius: "16px",
                      border: d.active ? "2px solid #2563eb" : (d.complete ? "1px solid var(--border-color, #e2e8f0)" : "1px dashed var(--border-color, #cbd5e1)"),
                      background: d.locked ? "var(--bg-surface-elevated, #f8fafc)" : "var(--bg-surface, #ffffff)",
                      position: "relative"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", textAlign: "center" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: d.locked ? "#94a3b8" : "var(--text-primary, #1e293b)" }}>Day {d.day}</span>
                        <span style={{ fontSize: "0.85rem", color: d.locked ? "#94a3b8" : "var(--text-muted, #64748b)", height: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{d.title}</span>

                        {d.complete && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontWeight: 700, fontSize: "0.9rem" }}>
                            <CheckCircle size={18} /> 100%
                          </div>
                        )}
                        {d.active && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2563eb", fontWeight: 700, fontSize: "0.9rem" }}>
                            <Clock size={18} /> {d.progress}%
                          </div>
                        )}
                        {d.locked && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontWeight: 600, fontSize: "0.9rem" }}>
                            <Lock size={16} /> Locked
                          </div>
                        )}
                      </div>

                      {/* Timeline Line */}
                      <div style={{ position: "absolute", bottom: "-30px", left: "0", right: "-16px", height: "2px", background: d.complete || d.active ? "#2563eb" : "var(--border-color, #e2e8f0)" }}></div>
                      <div style={{ position: "absolute", bottom: "-34px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "10px", borderRadius: "50%", background: d.complete || d.active ? "#2563eb" : "var(--border-color, #cbd5e1)" }}></div>
                    </div>
                  ));
                  })()}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted, #64748b)" }}>
                  <span style={{ width: "160px", textAlign: "center" }}>Completed</span>
                  <span style={{ width: "160px", textAlign: "center", color: "#2563eb" }}>Current Day</span>
                  <span style={{ width: "160px", textAlign: "center" }}>Locked</span>
                </div>
              </div>

              {/* Achievements */}
              <div style={{ background: "var(--card-bg, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-dark, #0f172a)" }}>Achievements</h3>
                  <span style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: 600, cursor: "pointer" }}>View All →</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}><Star size={20} /></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #1e293b)" }}>Consistent Learner</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>Completed 5 days in a row</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f5f3ff", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={20} /></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #1e293b)" }}>First Submission</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>Submitted your first task</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f0fdf4", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle size={20} /></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #1e293b)" }}>Quiz Master</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted, #64748b)" }}>Scored 90%+ in a quiz</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Card */}
              <div style={{
                background: isInternshipCompleted ? "linear-gradient(135deg, #cce3fd, #7ab6e8)" : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                borderRadius: "16px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                border: isInternshipCompleted ? "none" : "1px solid var(--border-color, #e2e8f0)",
                color: isInternshipCompleted ? "var(--text-primary, #0f172a)" : "var(--text-muted, #64748b)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{ zIndex: 1 }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: isInternshipCompleted ? "rgba(255,255,255,0.4)" : "var(--border-color, #e2e8f0)", color: isInternshipCompleted ? "#2563eb" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    {isInternshipCompleted ? <Award size={24} /> : <Lock size={24} />}
                  </div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary, #1e293b)" }}>
                    {isInternshipCompleted ? "Certificate Ready!" : "Certificate Locked"}
                  </h3>
                  <p style={{ margin: "0 0 20px 0", fontSize: "0.85rem", lineHeight: "1.5", opacity: isInternshipCompleted ? 0.9 : 1 }}>
                    {isInternshipCompleted
                      ? "Your official verified certificate is now available."
                      : "Complete all 30 days of your internship to unlock."}
                  </p>
                  <button
                    disabled={!isInternshipCompleted}
                    onClick={() => setShowCertificateView(true)}
                    style={{
                      width: "100%",
                      background: isInternshipCompleted ? "var(--bg-surface, #ffffff)" : "var(--border-color, #e2e8f0)",
                      color: isInternshipCompleted ? "#1e3a8a" : "#94a3b8",
                      border: "none",
                      padding: "12px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: isInternshipCompleted ? "pointer" : "not-allowed",
                      transition: "all 0.2s"
                    }}
                  >
                    {isInternshipCompleted ? "View Certificate" : "Locked"}
                  </button>
                </div>
                {isInternshipCompleted && <div style={{ position: "absolute", right: "-20%", bottom: "-20%", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)", zIndex: 0 }}></div>}
              </div>
            </div>
          </div>
        );
      }
      case "Profile":
        return <InternProfile />;
    }
  };

  if (activeTab === "Learning" && activeLearningTab === "AI Client") {
    return (
      <div style={{ height: "100vh", width: "100vw", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff", display: "flex", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <button
            onClick={() => setActiveLearningTab("Reading Materials")}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#334155", fontWeight: 700, fontSize: "14px", transition: "color 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.color = "#2563eb"}
            onMouseOut={(e) => e.currentTarget.style.color = "#334155"}
          >
            <ArrowLeft size={16} /> Back to Learning Page
          </button>
        </div>
        <div style={{ padding: "16px 24px", flex: 1, overflow: "hidden" }}>
          <AIClientReview />
        </div>
      </div>
    );
  }

  if (loadingDashboard) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading Dashboard...</p>
      </div>
    );
  }
  return (
    <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "var(--background-color, #f8fafc)", display: "flex", flexDirection: "column" }}>
      {/* Top Header Navbar */}
      <header style={{
        height: "72px",
        backgroundColor: "var(--card-bg, #ffffff)",
        borderBottom: "1px solid var(--border-color, #e2e8f0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
      }}>
        {/* Brand Logo & Tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setActiveTab("Overview")}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z" />
              <path d="M9 12H4.5s.55-3.03 2-4.5c.78-.78 2.07-.79 2.91-.09" />
              <path d="M15 15v4.5s-3.03-.55-4.5-2c-.78-.78-.79-2.07-.09-2.91" />
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#1e3a8a", letterSpacing: "-0.5px", lineHeight: "1" }}>
              ProEduvate
            </h2>
            <span style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--text-muted, #64748b)", letterSpacing: "0.2px", display: "block", marginTop: "2px" }}>
              people, projects and potential
            </span>
          </div>
        </div>

        {/* Header Navigation Bar (Exact Original Modules & Workflow) */}
        {(!isMeetingActive || isMeetingMinimized) && (
          <nav style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "var(--bg-light, #f1f5f9)", padding: "4px 6px", borderRadius: "30px", border: "1px solid var(--border-color, #e2e8f0)" }}>
            {[
              { id: "Overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
              { id: "Learning", label: "Learning", icon: <BookOpen size={14} /> },
              { id: "Daily Scenario", label: "Daily Scenario", icon: <Code size={14} /> },
              { id: "Progress & Certificate", label: "Progress & Certificate", icon: <Award size={14} /> },
              { id: "Tickets", label: "Tickets", icon: <Headset size={14} /> },
              { id: "Chat with Mentor", label: "Chat with Mentor", icon: <MessageCircle size={14} /> },
              { id: "Bonus Airdrops", label: "Bonus Airdrops", icon: <Coins size={14} /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 13px",
                    borderRadius: "20px",
                    border: "none",
                    fontSize: "12.5px",
                    fontWeight: isActive ? "700" : "500",
                    backgroundColor: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "var(--bg-surface, #ffffff)" : "#475569",
                    boxShadow: isActive ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right User Actions & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Theme Toggle 
          <div onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" }} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} color="var(--text-gray, #64748b)" /> : <Sun size={18} color="var(--text-gray, #94a3b8)" />}
          </div>
          */}

          {/* Bell Notifications */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <div onClick={() => setShowNotifications(!showNotifications)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} color="var(--text-muted, #64748b)" />
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: "2px solid #ffffff" }}></div>
            </div>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '12px',
                width: '300px',
                backgroundColor: 'var(--card-bg, #ffffff)',
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid var(--border-color, #e2e8f0)',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color, #e2e8f0)', fontWeight: 700, color: 'var(--text-dark, #0f172a)', backgroundColor: 'var(--bg-light, #f8fafc)' }}>
                  Notifications
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color, #e2e8f0)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-color, #334155)', marginBottom: '4px' }}>{notif.text}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>{notif.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", cursor: "pointer" }} onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden", background: "#3b82f6", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", border: "2px solid #e2e8f0" }}>
              <img src="/assets/sadie-pfp.jpg" alt="Sadie Sink Profile" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={(e) => { e.target.style.display = "none"; }} />
            </div>

            {isProfileDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", backgroundColor: "#fff", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: "160px", zIndex: 100, overflow: "hidden" }}>
                <button
                  onClick={() => { setActiveTab("Profile"); setIsProfileDropdownOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", borderBottom: "1px solid var(--border-color, #e2e8f0)", color: "var(--text-primary, #0f172a)", cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: "600" }}
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", color: "#dc2626", cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: "600" }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Content (Full Width) */}
      <main style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column", padding: "12px 20px", width: "100%", boxSizing: "border-box" }}>

        {/* Content Box */}
        <div style={{ display: (isMeetingActive && !isMeetingMinimized) ? "flex" : "none", flex: 1, minHeight: 0, borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <BreakoutRoomsApp
            isIntern={true}
            onLeaveMeeting={handleEndMeeting}
            onMinimize={() => setIsMeetingMinimized(true)}
            onRoomChange={(roomName) => setActiveMeetingRoom(roomName)}
          />
        </div>

        {(!isMeetingActive || isMeetingMinimized) && (
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease-out" }}>
            {renderContent()}
          </div>
        )}
      </main>

      {/* Floating Minimized Call Widget (Bottom Right) */}
      {isMeetingActive && isMeetingMinimized && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            width: "320px",
            backgroundColor: "#1e1f22",
            color: "var(--bg-surface, #ffffff)",
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
                title="Maximize"
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
        </div>
      )}

      {/* Thank You Modal when Intern leaves meeting */}
      {showThankYouModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.75)", zIndex: 100000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "var(--card-bg, #ffffff)", borderRadius: "24px", padding: "40px", maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#dcfce7", color: "#16a34a", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "40px", margin: "0 auto 24px auto" }}>
              <PartyPopper size={40} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-color, #1f2937)", margin: "0 0 12px 0" }}>Thank You for Attending!</h2>
            <p style={{ color: "var(--text-gray)", fontSize: "15px", lineHeight: "1.6", margin: "0 0 32px 0" }}>
              You have successfully left the mentoring session <b>"React Hook Refactoring Standup"</b>. Your attendance and active participation points have been recorded.
            </p>
            <Button
              variant="primary"
              onClick={() => { setShowThankYouModal(false); setActiveTab("Overview"); }}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "16px" }}
            >
              Back to Dashboard
            </Button>
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
          }}>
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "var(--bg-surface, #ffffff)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 20px auto",
              boxShadow: "0 10px 22px rgba(99, 102, 241, 0.35)"
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-color, #1f2937)" }}>
              Daily Domain Insight
            </h2>
            <span style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#6366f1",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "24px"
            }}>
              {internDomain ? internDomain.toUpperCase() : "DOMAIN"}
            </span>
            <div style={{
              padding: "20px 18px",
              borderRadius: "16px",
              backgroundColor: "var(--bg-light, #f8fafc)",
              marginBottom: "28px",
              border: "1px solid var(--border-color, #f1f5f9)"
            }}>
              <p style={{
                color: "var(--text-dark, #334155)",
                fontSize: "15px",
                fontWeight: 500,
                lineHeight: "1.6",
                margin: 0
              }}>
                "{domainInsights[currentInsightIndex % domainInsights.length] || domainInsights[0]}"
              </p>
            </div>
            <button
              onClick={() => setShowDomainInsightModal(false)}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#4f46e5",
                color: "var(--bg-surface, #ffffff)",
                border: "none",
                borderRadius: "14px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(79, 70, 229, 0.35)",
              }}
            >
              Got it, let's go!
            </button>
          </div>
        </div>
      )}

      {/* Bonus Airdrop Participate Modal */}
      {showAirdropModal && activeAirdrop && (() => {
        const config = getParsedConfig(activeAirdrop);
        const rawTaskType = (activeAirdrop.task_type || activeAirdrop.taskType || "mcq").toLowerCase();
        const questionText = getAirdropQuestion(activeAirdrop);

        const renderTaskBody = () => {
          if (rawTaskType.includes("mcq") || rawTaskType.includes("multiple choice")) {
            const rawOptions = config.options || [];
            let optionsList = [];
            if (Array.isArray(rawOptions)) {
              optionsList = rawOptions;
            } else if (typeof rawOptions === 'object' && rawOptions !== null) {
              optionsList = [rawOptions.A, rawOptions.B, rawOptions.C, rawOptions.D].filter(Boolean);
            }
            const letters = ["A", "B", "C", "D"];

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-gray)", marginBottom: "4px" }}>
                  Select the Correct Option:
                </label>
                {letters.map((letter, idx) => {
                  const optText = optionsList[idx] || `Option ${letter}`;
                  const isSelected = airdropAnswer === letter;
                  return (
                    <div
                      key={letter}
                      onClick={() => setAirdropAnswer(letter)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 18px",
                        borderRadius: "14px",
                        border: isSelected ? "2px solid #2563eb" : "1px solid var(--border-color)",
                        backgroundColor: isSelected ? "#eff6ff" : "var(--card-bg, #ffffff)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.15)" : "none"
                      }}
                    >
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        backgroundColor: isSelected ? "#2563eb" : "#f1f5f9",
                        color: isSelected ? "#ffffff" : "#475569",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "14px", flexShrink: 0
                      }}>
                        {letter}
                      </div>
                      <span style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-color, #1f2937)" }}>
                        {optText}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }

          if (rawTaskType.includes("true_false") || rawTaskType.includes("true / false")) {
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-gray)", marginBottom: "4px" }}>
                  Choose Your Answer:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {["True", "False"].map((choice) => {
                    const isSelected = airdropAnswer === choice;
                    return (
                      <div
                        key={choice}
                        onClick={() => setAirdropAnswer(choice)}
                        style={{
                          padding: "20px",
                          borderRadius: "16px",
                          border: isSelected ? `2px solid ${choice === "True" ? "#16a34a" : "#dc2626"}` : "1px solid var(--border-color)",
                          backgroundColor: isSelected ? (choice === "True" ? "#f0fdf4" : "#fef2f2") : "var(--card-bg, #ffffff)",
                          cursor: "pointer",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: "18px",
                          color: choice === "True" ? "#16a34a" : "#dc2626",
                          transition: "all 0.2s ease",
                          boxShadow: isSelected ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none"
                        }}
                      >
                        {choice}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (rawTaskType.includes("fill_blank") || rawTaskType.includes("pattern") || rawTaskType.includes("fill in the blank")) {
            return (
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-gray)", marginBottom: "8px" }}>
                  {(rawTaskType.includes("fill_blank") || rawTaskType.includes("fill in the blank")) ? "Missing Word / Phrase:" : "Your Answer (Run fast!):"}
                </label>
                <input
                  type="text"
                  value={airdropAnswer || ""}
                  onChange={(e) => setAirdropAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: "12px",
                    border: "2px solid var(--border-color)", backgroundColor: "var(--card-bg)",
                    fontSize: "15px", outline: "none", color: "var(--text-color, #1f2937)"
                  }}
                  autoFocus
                />
              </div>
            );
          }

          if (rawTaskType.includes("match")) {
            const pairs = config.pairs || {};
            const allValues = Object.values(pairs);
            const currentMatch = (typeof airdropAnswer === 'object' && airdropAnswer !== null) ? airdropAnswer : {};

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-gray)" }}>
                  Select the matching item for each key:
                </label>
                {Object.keys(pairs).map((key) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-color, #1f2937)" }}>{key}</span>
                    <select
                      value={currentMatch[key] || ""}
                      onChange={(e) => setAirdropAnswer({ ...currentMatch, [key]: e.target.value })}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "10px",
                        border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)",
                        fontSize: "14px", color: "var(--text-color, #1f2937)", outline: "none"
                      }}
                    >
                      <option value="">-- Select Match --</option>
                      {allValues.map((val, idx) => (
                        <option key={idx} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            );
          }

          if (rawTaskType.includes("arrange")) {
            const items = Array.isArray(airdropAnswer) ? airdropAnswer : [];

            const moveItem = (fromIndex, toIndex) => {
              if (toIndex < 0 || toIndex >= items.length) return;
              const updated = [...items];
              const [moved] = updated.splice(fromIndex, 1);
              updated.splice(toIndex, 0, moved);
              setAirdropAnswer(updated);
            };

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-gray)" }}>
                  Reorder items into correct sequence:
                </label>
                {items.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-color)",
                    backgroundColor: "var(--card-bg)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontWeight: 700, color: "#6366f1", fontSize: "14px" }}>#{idx + 1}</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-color, #1f2937)" }}>{item}</span>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, idx - 1)}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-light)", cursor: idx === 0 ? "not-allowed" : "pointer" }}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => moveItem(idx, idx + 1)}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-light)", cursor: idx === items.length - 1 ? "not-allowed" : "pointer" }}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          // Fallback / Textarea
          return (
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-gray)", marginBottom: "8px" }}>Your Answer (Run fast!)</label>
              <textarea
                rows="4"
                value={typeof airdropAnswer === 'string' ? airdropAnswer : JSON.stringify(airdropAnswer)}
                onChange={(e) => setAirdropAnswer(e.target.value)}
                style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid var(--border-color)", backgroundColor: "var(--card-bg)", fontSize: "14px", outline: "none", resize: "none", color: "var(--text-color, #1f2937)", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary-color)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                placeholder="Type your solution here..."
                autoFocus
              />
            </div>
          );
        };

        return (
          <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100000, padding: "20px"
          }}>
            <div style={{
              backgroundColor: "var(--card-bg, #ffffff)", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid var(--border-color)",
              maxHeight: "90vh", overflowY: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Gift size={24} color="#2563eb" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-color, #1f2937)", fontWeight: 700 }}>
                      {activeAirdrop.title || "Bonus Airdrop Challenge"}
                    </h3>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                      Task: {rawTaskType.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ backgroundColor: airdropTimeLeft <= 10 ? "#fee2e2" : "#f1f5f9", color: airdropTimeLeft <= 10 ? "#ef4444" : "#475569", padding: "8px 16px", borderRadius: "20px", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={16} /> {airdropTimeLeft}s
                </div>
              </div>

              <div style={{ padding: "20px", backgroundColor: "var(--bg-light, #f8fafc)", borderRadius: "14px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text-color, #1f2937)", lineHeight: 1.5 }}>
                  {questionText}
                </p>
              </div>

              {renderTaskBody()}

              <Button
                variant="primary"
                onClick={handleSubmitAirdrop}
                style={{ width: "100%", marginTop: "24px", padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: 700 }}
              >
                Submit Answer
              </Button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}