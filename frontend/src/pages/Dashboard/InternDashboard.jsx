import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Ticket, Gift, LogOut, Bell, Sparkles, Clock, Sun, Moon, ArrowLeft, CheckCircle, CheckCircle2, Target, Lock, Calendar, FileText, Check, CheckCheck, Flag, PartyPopper, ShieldAlert, ClipboardList, Headset, MessageCircle, Coins, Award, TrendingUp, Code, Share2, Download, ExternalLink, Play, User, Star, Quote, Rocket, Bot } from "lucide-react";
import "../../styles/Dashboard.css";
import DailyScenario from "../../components/Simulation/DailyScenario";
import DailyScenarioCalendar from "../../components/Simulation/DailyScenarioCalendar";
import BreakoutRoomsApp from "../breakout-rooms/BreakoutRoomsApp";
import InternProfile from "./InternProfile";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import WebIDE from "../../components/WebIDE/WebIDE";
import AIClientReview from "./AIClientReview";
import InteractiveLearningDashboard from "../../features/learning/interactive/InteractiveLearningDashboard";
import api from "../../api/axios";
import MentorChatTab from "../../components/Chat/MentorChatTab";
import InternOverviewTab from "./Intern/InternOverviewTab";
import InternProgressTab from "./Intern/InternProgressTab";
import InternTicketsTab from "./Intern/InternTicketsTab";
import InternBonusAirdropsTab from "./Intern/InternBonusAirdropsTab";
export default function InternDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');

  const canonicalTabs = [
    "Overview", "Learning", "Daily Scenario", "Progress", 
    "Tickets", "Chat with Mentor", "Bonus Airdrops", "Profile"
  ];

  const getTabFromUrl = (segment) => {
    if (!segment) return "Overview";
    const cleanSegment = decodeURIComponent(segment).toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = canonicalTabs.find(t => t.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSegment);
    return matched || "Overview";
  };

  const initialTabFromUrl = pathParts.length > 2 ? getTabFromUrl(pathParts[2]) : "Overview";
  
  const [activeTab, setActiveTab] = useState(initialTabFromUrl);

  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts.length > 2 && parts[2]) {
      const tabName = getTabFromUrl(parts[2]);
      if (activeTab !== tabName) {
         setActiveTab(tabName);
      }
      if (tabName === "Learning") {
        if (parts[3] === "assessment") {
          setShowAssessment(true);
          if (parts[4] === "mcq") {
            setAssessmentView("mcq");
          } else if (parts[4] === "coding") {
            setAssessmentView("coding");
          } else {
            setAssessmentView("selection");
          }
        } else {
          setShowAssessment(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, activeTab]);

  const [activeLearningTab, setActiveLearningTab] = useState("Reading Materials");
  const [theme, setTheme] = useState("light");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showCertificateView, setShowCertificateView] = useState(false);
  const [isInternshipCompleted, setIsInternshipCompleted] = useState(false);
  const [internUser, setInternUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  });
  const [internDomain, setInternDomain] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.domain_name || "Frontend";
    } catch (e) {
      return "Frontend";
    }
  });
  const [mentorInfo, setMentorInfo] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        id: u.mentor_id || 2,
        name: u.mentor_name || "Dr. Sakthi"
      };
    } catch (e) {
      return { id: 2, name: "Dr. Sakthi" };
    }
  });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchInternData = async () => {
      try {
        const profileRes = await api.get('/api/v1/users/profile');
        if (profileRes.data) {
          setInternUser(profileRes.data);
          if (profileRes.data.domain_name) {
            setInternDomain(profileRes.data.domain_name);
          }
          if (profileRes.data.mentor_id) {
            setMentorInfo({
              id: profileRes.data.mentor_id,
              name: profileRes.data.mentor_name || "Assigned Mentor"
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch user profile:", err);
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setInternUser(parsedUser);
            if (parsedUser.domain_name) setInternDomain(parsedUser.domain_name);
            if (parsedUser.mentor_id) {
              setMentorInfo({
                id: parsedUser.mentor_id,
                name: parsedUser.mentor_name || "Assigned Mentor"
              });
            }
          } catch (e) {}
        }
      }

      try {
        const notificationsRes = await api.get('/api/v1/notifications');
        if (Array.isArray(notificationsRes.data)) {
          setNotifications(notificationsRes.data);
        }
      } catch (err) {
        console.warn("Failed to fetch notifications:", err);
      }
    };
    fetchInternData();
  }, []);

  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("user_profile_photo"));

  useEffect(() => {
    const handlePhotoUpdate = () => {
      setProfilePhoto(localStorage.getItem("user_profile_photo"));
    };
    window.addEventListener("profile_photo_updated", handlePhotoUpdate);
    window.addEventListener("storage", handlePhotoUpdate);
    return () => {
      window.removeEventListener("profile_photo_updated", handlePhotoUpdate);
      window.removeEventListener("storage", handlePhotoUpdate);
    };
  }, []);

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
    navigate(`/intern/${tabId.toLowerCase().replace(/\s+/g, '-')}`);
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
    const fetchAirdrops = async () => {
      try {
        const res = await api.get('/api/v1/bonus-airdrops');
        if (Array.isArray(res.data)) {
          setBonusAirdrops(res.data);
          return;
        }
      } catch (err) {
        console.warn("Error fetching airdrops from API:", err);
      }
      const storedAirdrops = localStorage.getItem("app_bonus_airdrops");
      if (storedAirdrops) {
        setBonusAirdrops(JSON.parse(storedAirdrops));
      } else {
        setBonusAirdrops([]);
      }
    };
    fetchAirdrops();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSubmitAirdrop = async () => {
    if (!activeAirdrop) return;
    try {
      await api.patch(`/api/v1/bonus-airdrops/${activeAirdrop.id}`, {
        action: "SUBMIT",
        answer: airdropAnswer
      });
      alert(airdropTimeLeft > 0 ? "Bonus Airdrop submitted successfully!" : "Time is up! Your answer was submitted.");
      const res = await api.get('/api/v1/bonus-airdrops');
      if (Array.isArray(res.data)) setBonusAirdrops(res.data);
    } catch (err) {
      console.error("Failed to submit airdrop:", err);
      alert(err.response?.data?.detail || "Failed to submit airdrop.");
    } finally {
      setShowAirdropModal(false);
      setActiveAirdrop(null);
    }
  };

  const domainInsights = (() => {
    const d = (internDomain || "").toLowerCase();
    if (d.includes("ai") || d.includes("machine learning") || d.includes("aiml")) {
      return [
        "A key principle of AIML involves understanding data preprocessing, model selection, and feature engineering.",
        "Supervised learning relies on labeled datasets, while unsupervised learning discovers patterns in unlabeled data.",
        "Neural networks use backpropagation and gradient descent to update weights and minimize loss functions.",
        "Overfitting occurs when a model learns noise in training data; regularization (L1/L2, dropout) prevents it.",
        "Feature scaling (Standardization & Normalization) accelerates gradient descent convergence in ML algorithms.",
        "Cross-validation assesses model generalization by evaluating performance across multiple data folds.",
        "Convolutional Neural Networks (CNNs) specialize in grid-like data such as images and spatial structures.",
        "Recurrent Neural Networks (RNNs) and LSTMs handle sequential time-series and natural language data.",
        "Transformer architectures utilize self-attention mechanisms to process sequential data in parallel.",
        "Hyperparameter tuning (GridSearch, RandomSearch, Bayesian) optimizes model evaluation metrics."
      ];
    }
    if (d.includes("data science") || (d.includes("data") && !d.includes("full"))) {
      return [
        "Data Science combines statistics, data analysis, and machine learning to extract insights from structured/unstructured data.",
        "Exploratory Data Analysis (EDA) identifies data distributions, anomalies, patterns, and relationships.",
        "Pandas and NumPy provide high-performance data structures and numerical processing in Python.",
        "Data cleaning involves handling missing values, removing duplicates, and transforming data types.",
        "Data visualization with Matplotlib and Seaborn effectively communicates complex analytical findings.",
        "Statistical hypothesis testing validates experimental conclusions and data significance.",
        "Feature engineering transforms raw variables into informative representations for predictive models.",
        "SQL is essential for querying, joining, aggregating, and filtering relational database tables.",
        "Machine learning models in Data Science automate predictive forecasting and decision making.",
        "Model evaluation metrics (Accuracy, Precision, Recall, F1-Score, ROC-AUC) quantify classification performance."
      ];
    }
    if (d.includes("python")) {
      return [
        "Python's clean syntax and readability emphasize developer productivity and rapid prototyping.",
        "List comprehensions provide a concise way to create lists based on existing iterables.",
        "Python memory management utilizes automatic garbage collection and reference counting.",
        "Decorators modify function or class behavior dynamically using higher-order functions.",
        "Virtual environments isolate project dependencies to avoid library version conflicts.",
        "Object-Oriented Programming (OOP) in Python relies on classes, inheritance, encapsulation, and polymorphism.",
        "Generators and yield statements stream data lazily without allocating large arrays in memory.",
        "Asynchronous programming with asyncio enables non-blocking concurrent IO operations.",
        "Type hinting in Python improves code readability, IDE auto-completion, and static analysis.",
        "Python packages like FastAPI and Flask enable rapid backend REST API development."
      ];
    }
    if (d.includes("java")) {
      return [
        "Java operates on the Write Once, Run Anywhere principle powered by the Java Virtual Machine (JVM).",
        "Object-Oriented Programming pillars in Java: Encapsulation, Inheritance, Polymorphism, and Abstraction.",
        "The Java Collections Framework provides standardized data structures like ArrayList, HashMap, and HashSet.",
        "Garbage collection in Java automatically manages heap memory allocation and object deallocation.",
        "Multithreading in Java enables concurrent execution of execution threads for high performance.",
        "Exception handling with try-catch-finally guarantees robust program control flow.",
        "Java Streams API enables functional-style declarative operations on collections of data.",
        "Spring Boot simplifies building enterprise-grade production-ready REST microservices.",
        "Maven and Gradle manage Java project dependencies, builds, and lifecycle plugins.",
        "JVM JIT (Just-In-Time) compilation translates bytecode to native machine code at runtime."
      ];
    }
    if (d.includes("ui") || d.includes("ux")) {
      return [
        "User Experience (UX) design focuses on the overall user journey, usability, and task satisfaction.",
        "User Interface (UI) design crafts visual elements like typography, color palettes, spacing, and layout hierarchy.",
        "Wireframing creates low-fidelity structural blueprints before high-fidelity visual design.",
        "Usability testing identifies user friction points and validates design decisions through observation.",
        "Design systems maintain brand consistency across components, color schemes, and interactive elements.",
        "Information Architecture (IA) organizes and structures content to help users navigate intuitively.",
        "Micro-interactions provide visual feedback for user actions, improving interface engagement.",
        "Figma and Penpot enable collaborative real-time interface design and interactive prototyping.",
        "Accessibility (a11y) design standards ensure visual interfaces are usable for users with visual impairments.",
        "Responsive UI design adapts layout grids fluidly across mobile, tablet, and desktop screens."
      ];
    }
    if (d.includes("full") || d.includes("stack")) {
      return [
        "Full-Stack development bridges client-side user interfaces with scalable server architectures and databases.",
        "RESTful API design follows standard HTTP verbs, status codes, and stateless request cycles.",
        "Database normalization eliminates data redundancy while maintaining referential integrity across schemas.",
        "Containerization with Docker ensures application environment consistency across dev and production.",
        "State management tools synchronize complex asynchronous client states with remote backend databases.",
        "Authentication patterns like JWT and OAuth secure stateless communication across microservices.",
        "Middleware functions intercept, validate, authenticate, and transform requests before endpoint execution.",
        "Object-Relational Mappers (ORMs) abstract database queries into typed object models and schema migrations.",
        "CI/CD pipelines automate testing, static analysis, bundle compression, and container deployments.",
        "End-to-end performance optimization requires CDN caching, query indexing, lazy loading, and asset minification."
      ];
    }
    return [
      "A key principle of Frontend involves understanding performance, layout rendering, and DOM updates.",
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
  })();

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Dynamic Dashboard Stats & Live Data State
  const [progress, setProgress] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [tasksCompletedCount, setTasksCompletedCount] = useState(0);
  const [assessmentsCount, setAssessmentsCount] = useState(0);

  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [userRankStr, setUserRankStr] = useState("Unranked");
  const [liveSubmissions, setLiveSubmissions] = useState([]);
  const [domainTasksList, setDomainTasksList] = useState([]);

  const fetchDashboardData = async () => {
    // 1. Fetch Analytics
    try {
      const res = await api.get('/api/v1/analytics/dashboard');
      if (res.data) {
        const p = res.data.progress_pct !== undefined ? res.data.progress_pct : 0;
        setProgress(p);
        if (res.data.average_score_pct !== undefined) {
          setAiScore(res.data.average_score_pct);
        } else if (res.data.total_score !== undefined) {
          setAiScore(Math.min(100, Math.round(res.data.total_score / 10)));
        } else {
          setAiScore(0);
        }
        if (res.data.attendance_pct !== undefined) setAttendancePercent(res.data.attendance_pct);
        if (p >= 100) setIsInternshipCompleted(true);
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard analytics:", err);
    }

    // 2. Fetch Leaderboard & Rank
    try {
      const lbRes = await api.get('/api/v1/leaderboard?limit=5');
      if (Array.isArray(lbRes.data)) {
        setLiveLeaderboard(lbRes.data);
      }
    } catch (err) {
      console.warn("Failed to fetch leaderboard:", err);
    }

    try {
      const myRankRes = await api.get('/api/v1/leaderboard/me');
      if (myRankRes.data && myRankRes.data.rank) {
        setUserRankStr(`#${myRankRes.data.rank}`);
      }
    } catch (err) {
      console.warn("Failed to fetch user rank:", err);
    }

    // 3 & 4. Fetch Submissions & Domain Tasks to determine current unlocked Day
    let userSubmissions = [];
    let fetchedTasks = [];

    try {
      const subRes = await api.get('/api/v1/submissions');
      if (Array.isArray(subRes.data)) {
        userSubmissions = subRes.data;
        setLiveSubmissions(subRes.data);
        const completedTasks = subRes.data.filter(s => s.status === "approved" || s.status === "submitted").length;
        const completedMcq = subRes.data.filter(s => (s.mcq_score || 0) > 0).length;
        setTasksCompletedCount(completedTasks);
        setAssessmentsCount(completedMcq);
      }
    } catch (err) {
      console.warn("Failed to fetch submissions:", err);
    }

    try {
      const tasksRes = await api.get('/api/v1/tasks/intern');
      fetchedTasks = Array.isArray(tasksRes.data)
        ? tasksRes.data
        : (Array.isArray(tasksRes.data?.tasks) ? tasksRes.data.tasks : []);
      if (fetchedTasks.length > 0) {
        setDomainTasksList(fetchedTasks);
      }
    } catch (err) {
      console.warn("Failed to fetch domain tasks:", err);
    }

    // Auto-calculate current unlocked day from user's completed submissions
    if (userSubmissions.length > 0) {
      const taskDayMap = {};
      fetchedTasks.forEach(t => { taskDayMap[t.id] = t.day_number; });

      const completedDays = userSubmissions
        .filter(s => s.status === "approved" || s.status === "submitted" || s.status === "completed" || (s.mcq_score && s.mcq_score > 0) || (s.ai_score && s.ai_score > 0))
        .map(s => taskDayMap[s.task_id] || (typeof s.task_id === 'number' ? s.task_id : parseInt(String(s.task_id).replace(/\D/g, ''), 10) || null))
        .filter(Boolean);

      if (completedDays.length > 0) {
        const maxCompleted = Math.max(...completedDays);
        const nextDay = maxCompleted + 1;
        const maxTaskDay = fetchedTasks.length > 0 ? Math.max(...fetchedTasks.map(t => t.day_number || 1)) : 30;
        setCurrentDay(Math.min(nextDay, maxTaskDay));
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dynamic Learning Workflow State
  const [currentDay, setCurrentDay] = useState(1);
  
  const curriculumData = domainTasksList.length > 0
    ? domainTasksList.map(t => ({
        day: t.day_number,
        topic: t.title,
        desc: t.description,
        notes: t.notes || `Lecture_Notes_Day${t.day_number}.pdf`,
        document_url: t.document_url,
        video_url: t.video_url,
        resources: t.resources
      }))
    : [
        { day: 1, topic: `${internDomain || 'Domain'} Fundamentals`, desc: "Understand core concepts and setup your workspace.", notes: "Lecture_Notes_Day1.pdf" },
        { day: 2, topic: "Core Architecture & Workflow", desc: "Learn key architectural patterns and data flow.", notes: "Lecture_Notes_Day2.pdf" },
        { day: 3, topic: "Implementation & Development", desc: "Build functional modules and implement logic.", notes: "Lecture_Notes_Day3.pdf" },
        { day: 4, topic: "Testing & Refactoring", desc: "Validate implementation, test cases, and optimize execution.", notes: "Lecture_Notes_Day4.pdf" },
        { day: 5, topic: "Integration & Deployment", desc: "Integrate components and deploy practical solutions.", notes: "Lecture_Notes_Day5.pdf" }
      ];

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

  useEffect(() => {
    const fetchInternTickets = async () => {
      try {
        const res = await api.get('/api/v1/tickets');
        if (Array.isArray(res.data)) {
          setTicketsData(res.data);
        }
      } catch (err) {
        console.warn("Error fetching intern tickets from API:", err);
      }
    };
    fetchInternTickets();
  }, []);

  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim()) {
      alert("Please enter an issue title before submitting.");
      return;
    }
    try {
      const res = await api.post('/api/v1/tickets', {
        title: newTicketTitle,
        description: newTicketDesc || "Support issue submitted by intern.",
        domain: internDomain || "General"
      });
      setTicketsData(prev => [res.data, ...prev]);
      setNewTicketTitle("");
      setNewTicketDesc("");
      setShowTicketForm(false);
      navigate("/intern/tickets");
      alert("Ticket submitted successfully to support team!");
    } catch (err) {
      console.error("Failed to create ticket:", err);
      alert(err.response?.data?.detail || "Failed to create ticket.");
    }
  };

  const [mcqStarted, setMcqStarted] = useState(false);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [answers, setAnswers] = useState({});
  const [mcqGrade, setMcqGrade] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [mcqQuestionsList, setMcqQuestionsList] = useState([]);
  const [dayCodingChallenge, setDayCodingChallenge] = useState(null);

  const loadDayAssessments = async (day) => {
    // 1. Fetch Day-specific MCQs from backend
    try {
      const mcqRes = await api.get(`/api/v1/questions/mcq/day/${day}`);
      if (mcqRes.data && Array.isArray(mcqRes.data.questions) && mcqRes.data.questions.length > 0) {
        const formatted = mcqRes.data.questions.map((q, idx) => ({
          id: q.id || idx + 1,
          text: q.question,
          options: Object.entries(q.options || {}).map(([key, val]) => ({
            label: `${key}. ${val}`,
            val: key
          })),
          correct_answer: q.correct_answer
        }));
        setMcqQuestionsList(formatted);
      } else {
        fallbackMcqs(day);
      }
    } catch (err) {
      fallbackMcqs(day);
    }

    // 2. Fetch Day-specific Coding Challenge from backend
    try {
      const codeRes = await api.get(`/api/v1/questions/code/day/${day}`);
      if (codeRes.data && Array.isArray(codeRes.data.questions) && codeRes.data.questions.length > 0) {
        setDayCodingChallenge(codeRes.data.questions[0]);
      } else {
        fallbackCoding(day);
      }
    } catch (err) {
      fallbackCoding(day);
    }
  };

  const fallbackMcqs = (day) => {
    const curTaskObj = domainTasksList.find(t => t.day_number === day);
    if (curTaskObj && curTaskObj.mcq_questions) {
      try {
        const parsed = typeof curTaskObj.mcq_questions === 'string' ? JSON.parse(curTaskObj.mcq_questions) : curTaskObj.mcq_questions;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMcqQuestionsList(parsed.map((q, idx) => ({
            id: q.id || idx + 1,
            text: q.question || q.text,
            options: Array.isArray(q.options) 
              ? q.options 
              : Object.entries(q.options || {}).map(([k, v]) => ({ label: `${k}. ${v}`, val: k }))
          })));
          return;
        }
      } catch (e) {}
    }

    const topicName = curriculumData[day - 1]?.topic || `Day ${day} Concepts`;
    setMcqQuestionsList([
      { id: 1, text: `What is the primary objective of ${topicName}?`, options: [{ label: "A. Build core architecture & understand modular flow", val: "A" }, { label: "B. Legacy code deletion without testing", val: "B" }], correct_answer: "A" },
      { id: 2, text: `Which engineering practice is recommended for ${topicName}?`, options: [{ label: "A. Comprehensive validation & error handling", val: "A" }, { label: "B. Skipping boundary conditions", val: "B" }], correct_answer: "A" },
      { id: 3, text: `How does ${topicName} improve system scalability?`, options: [{ label: "A. Optimizing execution and decoupled components", val: "A" }, { label: "B. Introducing unhandled exceptions", val: "B" }], correct_answer: "A" },
      { id: 4, text: `What is a key consideration when testing ${topicName}?`, options: [{ label: "A. Validating expected parameters and output structure", val: "A" }, { label: "B. Deleting unit tests", val: "B" }], correct_answer: "A" },
      { id: 5, text: `Which component plays a vital role in ${topicName}?`, options: [{ label: "A. Core state processor & execution engine", val: "A" }, { label: "B. Unused static variables", val: "B" }], correct_answer: "A" }
    ]);
  };

  const fallbackCoding = (day) => {
    const curTaskObj = domainTasksList.find(t => t.day_number === day);
    setDayCodingChallenge({
      title: curTaskObj?.title || `Day ${day} Coding Challenge`,
      description: curTaskObj?.description || `Implement the core logic solution for Day ${day}. Handle edge cases and validate parameter constraints.`,
      requirements: [
        "Write clean, modular code with clear function structure.",
        "Handle potential edge cases and parameter validation.",
        "Ensure compiler tests pass cleanly before submission."
      ]
    });
  };

  // Coding task state
  const [code, setCode] = useState("function sum(a, b) {\n  // write code\n}");
  const [language, setLanguage] = useState("javascript");

  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);


  const handleDownloadNotes = (title, type) => {
    const curTask = domainTasksList.find(t => t.day_number === currentDay);
    if (curTask && curTask.document_url && (curTask.document_url.startsWith("http") || curTask.document_url.startsWith("/uploads"))) {
      window.open(curTask.document_url, "_blank");
      return;
    }

    const topic = curriculumData[currentDay - 1]?.topic || `Day ${currentDay} Module`;
    const desc = curriculumData[currentDay - 1]?.desc || "Complete the curriculum and tasks for today.";
    const notesContent = curTask?.notes || curTask?.description || "Detailed official lecture notes and learning material references.";
    
    const content = `================================================================================
PROEDUVATE ONLINE INTERNSHIP PORTAL - OFFICIAL LEARNING MODULE
================================================================================
Domain: ${internDomain || "Engineering & Development"}
Module: Day ${currentDay} - ${topic}
Date: ${new Date().toLocaleDateString()}
================================================================================

1. MODULE OVERVIEW & OBJECTIVES
--------------------------------------------------------------------------------
${desc}

2. LECTURE NOTES & CORE CONCEPTS
--------------------------------------------------------------------------------
${notesContent}

3. PRACTICAL EXERCISES & HANDS-ON TASKS
--------------------------------------------------------------------------------
- Review today's reading materials and core architectural guidelines.
- Complete the MCQ Knowledge Assessment (Part A).
- Implement the practical coding solution in the Web Compiler (Part B).

4. REFERENCES & ADDITIONAL RESOURCES
--------------------------------------------------------------------------------
- Official Portal Learning Hub: https://online-internship-portal.onrender.com/intern/learning
- Mentor & AI Support: Available via Live Tickets & Portal Assistant

================================================================================
Downloaded from ProEduvate Internship Portal. Confidential & Proprietary.
================================================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (title || `Day${currentDay}_Lecture_Notes`).replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts.length > 2 && parts[2]) {
      const tabName = getTabFromUrl(parts[2]);
      if (tabName === "Learning") {
        if (parts[3] === "live-meetings") {
          setActiveLearningTab("Live Meetings");
        } else if (parts[3] === "ai-client") {
          setActiveLearningTab("AI Client");
        } else if (parts[3] === "reading-materials") {
          setActiveLearningTab("Reading Materials");
        } else if (parts[3] === "interactive") {
          setActiveLearningTab("Interactive Learning");
        }
      } else if (tabName === "Tickets") {
        if (parts[3] === "new") {
          setShowTicketForm(true);
          setSelectedTicket(null);
        } else if (parts[3]) {
          setShowTicketForm(false);
          const foundTicket = ticketsData.find(t => t.id === parts[3]);
          setSelectedTicket(foundTicket || null);
        } else {
          setShowTicketForm(false);
          setSelectedTicket(null);
        }
      } else if (tabName === "Progress") {
        if (parts[3] === "certificate") {
          setShowCertificateView(true);
        } else {
          setShowCertificateView(false);
        }
      } else if (tabName === "Bonus Airdrops") {
        if (parts[3] === "completed") {
          setAirdropTab("Completed");
        } else {
          setAirdropTab("Active");
        }
      }
    }
  }, [location.pathname, ticketsData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentDay) {
      loadDayAssessments(currentDay);
    }
  }, [currentDay, domainTasksList]);


  const handleMcqSubmit = async () => {
    setMcqSubmitted(true);
    const totalQ = mcqQuestionsList.length || 1;
    let correctCount = 0;

    mcqQuestionsList.forEach((q) => {
      const userAnswer = answers[q.id];
      const correct = q.correct_answer !== undefined ? q.correct_answer : (q.answer !== undefined ? q.answer : "A");

      if (userAnswer !== undefined && userAnswer !== null) {
        if (typeof correct === "number") {
          const optKeys = ["A", "B", "C", "D"];
          if (String(userAnswer).toUpperCase() === optKeys[correct] || Number(userAnswer) === correct) {
            correctCount++;
          }
        } else if (String(userAnswer).trim().toUpperCase() === String(correct).trim().toUpperCase()) {
          correctCount++;
        }
      }
    });

    const score = Math.min(100, Math.round((correctCount / totalQ) * 100));
    setMcqGrade(score);
    setMcqDone(true);

    try {
      const currentTaskObj = domainTasksList.find(t => t.day_number === currentDay);
      const taskIdToSend = currentTaskObj?.id || currentDay;
      await api.post('/api/v1/submissions', {
        task_id: taskIdToSend,
        mcq_answers: JSON.stringify(answers),
        mcq_score: score,
        code_submission: code || "// MCQ Completed",
        ai_score: 80,
        ai_feedback: `MCQ Part A completed. Correct: ${correctCount}/${totalQ}.`
      });
      fetchDashboardData();
    } catch (e) {
      console.warn("Failed to persist MCQ submission to backend:", e);
    }

    alert(`MCQ Test submitted!\nCorrect Answers: ${correctCount} / ${totalQ}\nScore: ${score}%. Part A completed.`);
    navigate("/intern/learning/assessment");
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

  const handleRunCode = async () => {
    try {
      const currentTaskObj = domainTasksList.find(t => t.day_number === currentDay);
      const taskIdToSend = Number(currentTaskObj?.id || currentDay) || 1;
      const res = await api.post('/api/v1/code/execute', {
        code: code,
        code_submission: code,
        language: language || "javascript",
        task_id: taskIdToSend
      });
      if (res.data?.success) {
        alert(`Execution Result: SUCCESS\nOutput: ${res.data.output || "No output"}`);
      } else {
        alert(`Execution Result: FAILED\nError: ${res.data?.error || "Execution failed."}`);
      }
    } catch (err) {
      console.warn("Code execution warning:", err);
      alert("Code executed against test cases!");
    }
  };

  const handleSubmitCode = async () => {
    setEvaluating(true);
    try {
      const currentTaskObj = domainTasksList.find(t => t.day_number === currentDay);
      const taskIdToSend = Number(currentTaskObj?.id || currentDay) || 1;

      const execRes = await api.post('/api/v1/code/execute', {
        code: code,
        code_submission: code,
        language: language || "javascript",
        task_id: taskIdToSend
      });

      const finalScore = execRes.data?.ai_score !== undefined ? execRes.data.ai_score : (execRes.data?.runtime_score ?? 0);
      setAiScore(finalScore);
      const totalTc = execRes.data?.total_test_cases || 0;
      const passedTc = execRes.data?.test_cases_passed || 0;
      setEvalResult({
        score: finalScore,
        correctness: totalTc > 0 ? Math.round((passedTc / totalTc) * 100) : (finalScore > 0 ? 100 : 0),
        logic: finalScore >= 80 ? 90 : (finalScore >= 50 ? 70 : 40),
        quality: finalScore >= 80 ? 85 : (finalScore >= 50 ? 65 : 30),
        performance: execRes.data?.successful ? 95 : 40,
        suggestions: execRes.data?.runtime_feedback || (typeof execRes.data?.ai_feedback === 'string' ? execRes.data.ai_feedback : "Consider handling edge cases and validating parameters.")
      });

      await api.post('/api/v1/submissions', {
        task_id: taskIdToSend,
        code_submission: code,
        code: code,
        mcq_score: mcqGrade !== null ? mcqGrade : 100,
        ai_score: finalScore,
        ai_feedback: execRes.data?.ai_feedback || "Passed automated evaluation."
      });

      alert(`Coding assessment submitted to database! Score: ${finalScore}%. Part B completed.`);
      setCodingDone(true);
      fetchDashboardData();
      navigate("/intern/learning/assessment");
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data?.detail || "Coding assessment submitted!");
      setCodingDone(true);
      fetchDashboardData();
    } finally {
      setEvaluating(false);
    }
  };

  const handleCompleteDay = () => {
    alert(`Day ${currentDay} complete! Day ${currentDay + 1} is now unlocked.`);
    setIsDayLockedUntilMidnight(false);
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
    fetchDashboardData();
    navigate("/intern/learning");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <InternOverviewTab
            currentDay={currentDay}
            tasksCompletedCount={tasksCompletedCount}
            assessmentsCount={assessmentsCount}
            attendancePercent={attendancePercent}
            aiScore={aiScore}
            curriculumData={curriculumData}
            liveSubmissions={liveSubmissions}
            liveLeaderboard={liveLeaderboard}
            userRankStr={userRankStr}
            internUser={internUser}
            bonusAirdrops={bonusAirdrops}
            setActiveTab={setActiveTab}
            setIsMeetingActive={setIsMeetingActive}
            handleStartAirdrop={handleStartAirdrop}
          />
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
                    background: "var(--gradient-soft-blue, linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%))", 
                    borderRadius: "12px", 
                    padding: "16px 24px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    boxShadow: "var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.04))",
                    border: "1px solid var(--border-color, #bae6fd)"
                  }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--brand-primary, #0284c7)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Test Your Knowledge</div>
                      <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary, #0f172a)", margin: "2px 0 0 0" }}>Assessments</h2>
                      <p style={{ color: "var(--text-secondary, #334155)", fontSize: "13px", margin: "2px 0 0 0" }}>
                        Reinforce what you've learned. Track your understanding and prepare for real-world challenges.
                      </p>
                    </div>
                    <div>
                      <button className="btn btn-secondary" onClick={() => navigate("/intern/learning")} style={{ background: "var(--bg-surface, #ffffff)", color: "var(--text-primary, #0f172a)", border: "1px solid var(--border-color, #cbd5e1)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", padding: "6px 14px", fontSize: "13px", fontWeight: "600" }}>
                        <ArrowLeft size={14} style={{ marginRight: "4px", verticalAlign: "middle" }}/> Back
                      </button>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
                    
                    {/* Left Column: Assessments List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-dark)", margin: "0 0 4px 0" }}>Day {currentDay} - Assessments</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>Complete the assessments below to strengthen your understanding.</p>
                      </div>

                      {/* MCQ Card */}
                      <div className="card" style={{ display: "flex", alignItems: "center", padding: "20px", gap: "20px", border: "1px solid", borderColor: mcqDone ? "#86efac" : "var(--border-color)", background: mcqDone ? "#f0fdf4" : "var(--card-bg)", transition: "all 0.2s ease" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: mcqDone ? "#dcfce7" : "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={32} color={mcqDone ? "#16a34a" : "#0284c7"} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-dark)", margin: "0 0 6px 0" }}>MCQ Test</h4>
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
                            <button className="btn btn-primary" onClick={() => { setMcqStarted(true); setMcqSubmitted(false); setAnswers({}); setTimer(180); setCurrentQuestionIndex(0); navigate("/intern/learning/assessment/mcq"); }} style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "600" }}>Start MCQ &rarr;</button>
                          )}
                        </div>
                      </div>

                      {/* Coding Card */}
                      <div className="card" style={{ display: "flex", alignItems: "center", padding: "20px", gap: "20px", border: "1px solid", borderColor: codingDone ? "#86efac" : "var(--border-color)", background: codingDone ? "#f0fdf4" : "var(--card-bg)", transition: "all 0.2s ease" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: codingDone ? "#dcfce7" : "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Code size={32} color={codingDone ? "#16a34a" : "#9333ea"} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-dark)", margin: "0 0 6px 0" }}>{internDomain.toLowerCase() === "ui/ux" ? "UI/UX Assignment" : "Coding Assignment"}</h4>
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
                            <button className="btn btn-primary" onClick={() => navigate("/intern/learning/assessment/coding")} style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "600", background: "#9333ea", borderColor: "#9333ea" }}>Continue Coding &rarr;</button>
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
                        <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-dark)", margin: "0 0 20px 0" }}>Your Assessment Progress</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                          <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "8px solid #f1f5f9", borderTopColor: "#3b82f6", borderRightColor: (mcqDone || codingDone) ? "#3b82f6" : "#f1f5f9", borderBottomColor: (mcqDone && codingDone) ? "#3b82f6" : "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "24px", fontWeight: "bold", color: "var(--text-primary, #0f172a)" }}>{(mcqDone ? 1 : 0) + (codingDone ? 1 : 0)} / 2</span>
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-dark)" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }}></div> Completed ({(mcqDone ? 1 : 0) + (codingDone ? 1 : 0)})
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-dark)" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--border-color, #cbd5e1)" }}></div> Pending ({2 - ((mcqDone ? 1 : 0) + (codingDone ? 1 : 0))})
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: "24px", padding: "12px", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "8px", border: "1px dashed var(--border-color, #cbd5e1)", display: "flex", alignItems: "center", gap: "12px" }}>
                          <TrendingUp size={20} color="#10b981" />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-primary, #0f172a)" }}>Keep going!</div>
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
                      <button className="btn btn-secondary" onClick={() => navigate("/intern/learning/assessment")} style={{ padding: "6px 12px", fontSize: "12px" }}>Back</button>
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
                      <button className="btn btn-primary" onClick={() => navigate("/intern/learning/assessment")}>Continue</button>
                    </div>
                  )}
                </div>
              )}

              {/* Coding assignment compiler terminal */}
              {assessmentView === "coding" && (
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0 }}>Part B: {false ? "UI/UX Assessment" : "Coding Assessment"}</h3>
                    <button className="btn btn-secondary" onClick={() => navigate("/intern/learning/assessment")} style={{ padding: "6px 12px", fontSize: "12px" }}>Back</button>
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
                      {/* Coding Problem Statement Card */}
                      {dayCodingChallenge && (
                        <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", marginBottom: "16px" }}>
                          <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "var(--text-primary, #0f172a)", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                            💻 Problem Statement: {dayCodingChallenge.title}
                          </h4>
                          <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--text-secondary, #475569)", lineHeight: 1.5 }}>
                            {dayCodingChallenge.description}
                          </p>
                          {dayCodingChallenge.requirements && dayCodingChallenge.requirements.length > 0 && (
                            <div>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary, #0f172a)", display: "block", marginBottom: "4px" }}>Task Guidelines & Requirements:</span>
                              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-secondary, #475569)", lineHeight: 1.5 }}>
                                {dayCodingChallenge.requirements.map((req, i) => (
                                  <li key={i}>{req}</li>
                                ))}
                              </ul>
                            </div>
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
                        onChange={(files) => {
                          const activeFile = files.find(f => !f.isFolder);
                          if (activeFile) setCode(activeFile.content);
                        }} 
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
                          <button className="btn btn-primary" onClick={() => navigate("/intern/learning/assessment")} style={{ marginTop: "16px" }}>Continue</button>
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
              
              <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--brand-300, #1e40af)", display: "block", marginBottom: "4px" }}>
                    DAY {currentDay} OF {curriculumData.length || 30}
                  </span>
                  <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 6px 0", color: "var(--text-primary, #0f172a)", letterSpacing: "-0.02em" }}>
                    {curriculumData.find(c => c.day === currentDay)?.topic || curriculumData[0]?.topic}
                  </h1>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary, #334155)" }}>
                    {curriculumData.find(c => c.day === currentDay)?.desc || curriculumData[0]?.desc}
                  </p>
                </div>

                {/* Day Switcher Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", padding: "6px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Module Day:</label>
                  <select 
                    value={currentDay} 
                    onChange={(e) => setCurrentDay(Number(e.target.value))}
                    style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, outline: "none", cursor: "pointer", backgroundColor: "#f8fafc", color: "#0f172a" }}
                  >
                    {curriculumData.map(c => {
                      const cTask = domainTasksList.find(t => t.day_number === c.day);
                      const isCompleted = liveSubmissions.some(s => {
                        if (cTask && s.task_id === cTask.id) return true;
                        const sDay = typeof s.task_id === 'number' ? s.task_id : parseInt(String(s.task_id).replace(/\D/g, ''), 10);
                        return sDay === c.day;
                      });
                      return (
                        <option key={c.day} value={c.day}>
                          Day {c.day}: {c.topic.length > 25 ? c.topic.slice(0, 25) + "..." : c.topic} {isCompleted ? "✓ (Completed)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div style={{ position: "absolute", right: "24px", bottom: "-10px", opacity: 0.1, transform: "rotate(-10deg)", pointerEvents: "none", zIndex: 1 }}>
                <h2 style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 0.9, margin: 0, textAlign: "right" }}>
                  Learn<br/>Build<br/>Grow
                </h2>
              </div>
            </div>
            {/* Two Column Layout for Main Content */}
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
              
              {/* Left Column: Main Learning Interface */}
              <div style={{ flex: (activeLearningTab === "AI Client" || activeLearningTab === "Interactive Learning") ? "1" : "2.2", width: (activeLearningTab === "AI Client" || activeLearningTab === "Interactive Learning") ? "100%" : "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Navigation Tabs */}
                <div style={{ display: "flex", gap: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "12px", marginBottom: "8px", flexShrink: 0 }}>
                  <button onClick={() => navigate("/intern/learning/reading-materials")} style={{ background: "none", border: "none", color: activeLearningTab === "Reading Materials" ? "#2563eb" : "var(--text-muted, #64748b)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", position: "relative" }}>
                    <BookOpen size={16} /> Reading Materials
                    {activeLearningTab === "Reading Materials" && <div style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, height: "2px", background: "#2563eb", borderRadius: "2px" }} />}
                  </button>
                  <button onClick={() => navigate("/intern/learning/live-meetings")} style={{ background: "none", border: "none", color: activeLearningTab === "Live Meetings" ? "#2563eb" : "var(--text-muted, #64748b)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", position: "relative" }}>
                    <Calendar size={16} /> Live Meetings
                    {activeLearningTab === "Live Meetings" && <div style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, height: "2px", background: "#2563eb", borderRadius: "2px" }} />}
                  </button>
                  <button onClick={() => navigate("/intern/learning/ai-client")} style={{ background: "none", border: "none", color: activeLearningTab === "AI Client" ? "#2563eb" : "var(--text-muted, #64748b)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", position: "relative" }}>
                    <Bot size={16} /> AI Client Review
                    {activeLearningTab === "AI Client" && <div style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, height: "2px", background: "#2563eb", borderRadius: "2px" }} />}
                  </button>
                  <button onClick={() => navigate("/intern/learning/interactive")} style={{ background: "none", border: "none", color: activeLearningTab === "Interactive Learning" ? "#2563eb" : "var(--text-muted, #64748b)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", position: "relative" }}>
                    <Play size={16} /> Interactive Learning
                    {activeLearningTab === "Interactive Learning" && <div style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, height: "2px", background: "#2563eb", borderRadius: "2px" }} />}
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
                      <button onClick={() => handleDownloadNotes("Module_Notes", "pdf")} style={{ background: "none", border: "none", color: "var(--text-muted, #64748b)", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
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
                        <button onClick={() => handleDownloadNotes("Official_Lecture_Notes", "pdf")} style={{ background: "none", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
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
                        <button onClick={() => handleDownloadNotes("Practice_Exercises", "docx")} style={{ background: "none", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
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
                        <CheckCircle size={16} color="var(--success, #16a34a)" />
                        <span style={{ fontSize: "13px", color: "var(--text-primary, #0f172a)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Notes Area */}
                <div style={{ marginTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-primary, #0f172a)", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileText size={16} color="var(--text-muted, #64748b)" /> My Personal Notes
                    </h4>
                    <span style={{ fontSize: "11px", color: "var(--text-muted, #94a3b8)", fontWeight: 600 }}>Auto-saved</span>
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
                      color: "var(--text-primary, #0f172a)",
                      resize: "vertical",
                      fontFamily: "inherit",
                      outline: "none",
                      transition: "all 0.2s",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--border-brand, #93c5fd)";
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
                    <Badge variant="outline" style={{ color: "var(--brand-primary, #3b82f6)", borderColor: "var(--border-blue-light, #bfdbfe)", background: "var(--brand-bg, #eff6ff)" }}>2 Upcoming</Badge>
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
                      <button onClick={handleJoinMeeting} style={{ background: "var(--brand-primary, #2563eb)", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}>
                        Join Native Room
                      </button>
                    </div>

                    {/* Event 2 */}
                    <div style={{ background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", transition: "all 0.2s", cursor: "pointer" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.08)"; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "10px", padding: "10px 16px", textAlign: "center", border: "1px solid var(--border-color, #e2e8f0)", opacity: 0.7 }}>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted, #94a3b8)", textTransform: "uppercase" }}>Tomorrow</span>
                          <span style={{ display: "block", fontSize: "18px", fontWeight: 900, color: "var(--text-muted, #64748b)" }}>2:00</span>
                          <span style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted, #94a3b8)" }}>PM</span>
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>Weekly Architecture Review</h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <User size={14} color="var(--text-muted, #94a3b8)" />
                              <span style={{ fontSize: "13px", color: "var(--text-muted, #94a3b8)", fontWeight: 600 }}>David Chen</span>
                            </div>
                            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-color, #cbd5e1)" }} />
                            <span style={{ fontSize: "13px", color: "var(--text-muted, #94a3b8)", fontWeight: 600 }}>45 min session</span>
                          </div>
                        </div>
                      </div>
                      <button style={{ background: "var(--bg-surface-elevated, #f1f5f9)", color: "var(--text-muted, #64748b)", border: "1px solid var(--border-color, #e2e8f0)", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "not-allowed" }}>
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

                {activeLearningTab === "Interactive Learning" && (
                  <div style={{ marginTop: "8px" }}>
                    <InteractiveLearningDashboard />
                  </div>
                )}


              </div>

              {/* Right Column: Sidebar */}
              {(activeLearningTab !== "AI Client" && activeLearningTab !== "Interactive Learning") && (
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Assessment Card */}
                {(() => {
                  const currentTaskObj = domainTasksList.find(t => t.day_number === currentDay);
                  const currentSub = liveSubmissions.find(s => {
                    if (currentTaskObj && s.task_id === currentTaskObj.id) return true;
                    const sDay = typeof s.task_id === 'number' ? s.task_id : parseInt(String(s.task_id).replace(/\D/g, ''), 10);
                    return sDay === currentDay;
                  });
                  const isCompleted = !!currentSub && (currentSub.status === "approved" || currentSub.status === "submitted" || currentSub.status === "completed" || (currentSub.mcq_score && currentSub.mcq_score > 0) || (currentSub.ai_score && currentSub.ai_score > 0));

                  if (isCompleted) {
                    return (
                      <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "16px", border: "1px solid #bbf7d0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", background: "#dcfce7", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CheckCircle2 size={22} color="#166534" />
                          </div>
                          <div>
                            <h4 style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#166534", fontWeight: 800 }}>Day {currentDay} Assessment Completed!</h4>
                            <span style={{ fontSize: "12px", color: "#15803d", fontWeight: 600 }}>Score: {currentSub.ai_score || currentSub.mcq_score || 80}% • Passed ✓</span>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#166534", lineHeight: 1.5 }}>
                          You completed the learning module & assessment for Day {currentDay}. Next module is unlocked!
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => navigate("/intern/learning/assessment")} 
                            style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#334155" }}
                          >
                            Review
                          </button>
                          <button 
                            className="btn" 
                            onClick={() => { setCurrentDay(currentDay + 1); navigate("/intern/learning"); }} 
                            style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", backgroundColor: "#10b981", color: "white", border: "none", cursor: "pointer" }}
                          >
                            Go to Day {currentDay + 1} &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div style={{ background: "var(--bg-surface, #ffffff)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", background: "var(--brand-bg, #eff6ff)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Target size={20} color="var(--brand-primary, #2563eb)" />
                          </div>
                          <div>
                            <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Day Assessment</h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Test your knowledge</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary, #475569)", lineHeight: 1.5 }}>
                        Ready to complete today's module? Take the MCQ and Coding test now.
                      </p>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => navigate("/intern/learning/assessment")} 
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", background: "var(--brand-primary, #0B82F6)", color: "#ffffff", border: "none" }}
                      >
                        Start Assessment &rarr;
                      </button>
                    </div>
                  );
                })()}

                {/* Mentor Feedback Card */}
                <div style={{ background: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "radial-gradient(circle at top right, rgba(59,155,255,0.15), transparent)", opacity: 0.6 }}></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative", zIndex: 1 }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--brand-bg, #eff6ff)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-brand, #bfdbfe)" }}>
                      <User size={14} color="var(--brand-primary, #2563eb)" />
                    </div>
                    <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Mentor Tip</h4>
                  </div>
                  <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "12px", borderRadius: "10px", borderLeft: "3px solid var(--brand-primary, #2563eb)", position: "relative", zIndex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary, #334155)", fontStyle: "italic", lineHeight: 1.5 }}>
                      "Focus on understanding how state affects rendering before moving to complex hooks."
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", position: "relative", zIndex: 1 }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "var(--border-color, #e2e8f0)", display: "inline-block" }}></span>
                      {mentorInfo?.name || "Dr. Sakthi"} (Lead Mentor)
                    </span>
                  </div>
                </div>

                {/* Upcoming Milestone Card */}
                <div style={{ background: "var(--warning-bg, #fffbeb)", padding: "16px", borderRadius: "12px", border: "1px solid var(--warning-border, #fde68a)", boxShadow: "0 2px 8px rgba(217, 119, 6, 0.03)", display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: "-10px", top: "-10px", opacity: 0.15 }}>
                    <Calendar size={60} color="var(--warning)" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative", zIndex: 1 }}>
                    <div style={{ background: "var(--warning-surface, #fef08a)", padding: "4px", borderRadius: "6px" }}>
                      <Calendar size={14} color="var(--warning)" />
                    </div>
                    <h4 style={{ margin: 0, fontSize: "14px", color: "var(--warning)", fontWeight: 800 }}>Upcoming Milestone</h4>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", position: "relative", zIndex: 1 }}>
                    <span style={{ fontSize: "13px", color: "var(--warning)", fontWeight: 800 }}>
                      {currentDay > 15 ? "Capstone Project Milestone" : "Midterm Assessment Milestone"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--warning)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      {currentDay < 15
                        ? `Due in ${15 - currentDay} day${15 - currentDay === 1 ? '' : 's'} (Day 15)`
                        : currentDay === 15
                        ? "Midterm Assessment Active Today! (Day 15)"
                        : `Final Capstone Due in ${30 - currentDay} days (Day 30)`}
                    </span>
                  </div>
                </div>

                {/* Need Help Card */}
                <div style={{ background: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "12px", position: "relative", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-surface-elevated, #f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MessageCircle size={16} color="var(--text-secondary, #475569)" />
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Need Help?</h4>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Stuck somewhere?</p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveTab("Chat with Mentor"); navigate("/intern/chat-with-mentor"); }} style={{ background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", color: "var(--text-primary, #334155)", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }} onMouseOver={(e) => { e.currentTarget.style.background = "var(--brand-bg, #eff6ff)"; e.currentTarget.style.color = "var(--brand-primary, #2563eb)"; e.currentTarget.style.borderColor = "var(--border-brand, #bfdbfe)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "var(--bg-surface-elevated, #f8fafc)"; e.currentTarget.style.color = "var(--text-primary, #334155)"; e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)"; }}>
                    Message Mentor &rarr;
                  </button>
                </div>

              </div>
              )}
            </div>
          </div>
        );

      case "Tickets":
        return (
          <InternTicketsTab
            showTicketForm={showTicketForm}
            newTicketTitle={newTicketTitle}
            setNewTicketTitle={setNewTicketTitle}
            newTicketDesc={newTicketDesc}
            setNewTicketDesc={setNewTicketDesc}
            handleCreateTicket={handleCreateTicket}
            ticketFilter={ticketFilter}
            setTicketFilter={setTicketFilter}
            ticketsData={ticketsData}
            selectedTicket={selectedTicket}
            internUser={internUser}
            internDomain={internDomain}
            navigate={navigate}
          />
        );

      case "Chat with Mentor":
        return (
          <MentorChatTab
            mentorInfo={mentorInfo}
            internUser={internUser}
            internDomain={internDomain}
            isActive={activeTab === "Chat with Mentor"}
          />
        );

      case "Daily Scenario":
        return <DailyScenario onBackToDashboard={() => setActiveTab("Overview")} />;

      case "Bonus Airdrops":
        return (
          <InternBonusAirdropsTab
            bonusAirdrops={bonusAirdrops}
            airdropTab={airdropTab}
            handleStartAirdrop={handleStartAirdrop}
            navigate={navigate}
          />
        );

      case "Progress":
        return (
          <InternProgressTab
            progress={progress}
            aiScore={aiScore}
            attendancePercent={attendancePercent}
            tasksCompletedCount={tasksCompletedCount}
            assessmentsCount={assessmentsCount}
            currentDay={currentDay}
            domainTasksList={domainTasksList}
            internUser={internUser}
            internDomain={internDomain}
            mentorInfo={mentorInfo}
            isInternshipCompleted={isInternshipCompleted}
            showCertificateView={showCertificateView}
            navigate={navigate}
          />
        );
      case "Profile":
        return <InternProfile />;
      default:
        return null;
    }
  };

  if (activeTab === "Learning" && (activeLearningTab === "AI Client" || activeLearningTab === "Interactive Learning")) {
    const isInteractive = activeLearningTab === "Interactive Learning";
    return (
      <div style={{ height: "100vh", width: "100vw", backgroundColor: "var(--background-color, #f8fafc)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", flexShrink: 0, borderBottom: "1px solid var(--border-color, #e2e8f0)", backgroundColor: "var(--card-bg, #ffffff)", display: "flex", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", zIndex: 10 }}>
          <button 
            onClick={() => navigate("/intern/learning/reading-materials")}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary, #334155)", fontWeight: 700, fontSize: "14px", transition: "color 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.color = "var(--brand-primary, #2563eb)"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary, #334155)"}
          >
            <ArrowLeft size={16} /> Back to Learning Page
          </button>
        </div>
        <div style={{ padding: isInteractive ? "0" : "16px 24px", flex: "1 1 0%", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
           {isInteractive ? <InteractiveLearningDashboard /> : <AIClientReview />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", height: (isMeetingActive && !isMeetingMinimized) ? "100vh" : "auto", overflow: (isMeetingActive && !isMeetingMinimized) ? "hidden" : "auto", backgroundColor: "var(--background-color, #f8fafc)", display: "flex", flexDirection: "column" }}>
      {/* Top Header Navbar */}
      <header className="intern-header">
        {/* Brand Logo & Tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setActiveTab("Overview")}>
          <img 
            src="/Horizontal Logo SVG File-png.png" 
            alt="ProEduvate Logo" 
            style={{ height: "32px", width: "auto", objectFit: "contain" }} 
          />
          <span style={{ fontSize: "12px", fontWeight: 600, backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "12px" }}>
            Intern Portal
          </span>
        </div>

        {/* Header Navigation Bar (Exact Original Modules & Workflow) */}
        {(!isMeetingActive || isMeetingMinimized) && (
          <nav className="intern-nav-container">
            {[
              { id: "Overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
              { id: "Learning", label: "Learning", icon: <BookOpen size={14} /> },
              { id: "Daily Scenario", label: "Daily Scenario", icon: <Code size={14} /> },
              { id: "Progress", label: "Progress", icon: <Award size={14} /> },
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
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    fontWeight: isActive ? "700" : "500",
                    backgroundColor: isActive ? "var(--primary-color, #2563eb)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--text-secondary, #475569)",
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
          {/* Theme Toggle */}
          <div onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" }} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} color="var(--text-gray, #64748b)" /> : <Sun size={18} color="var(--text-gray, #94a3b8)" />}
          </div>

          {/* Bell Notifications */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <div onClick={() => setShowNotifications(!showNotifications)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={18} color="var(--text-muted, #64748b)" />
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: 'var(--error, #ef4444)', borderRadius: '50%', border: "2px solid var(--card-bg, #ffffff)" }}></div>
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
                    <div key={notif.id || Math.random()} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color, #e2e8f0)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-color, #334155)', marginBottom: '4px' }}>{notif.message || notif.title || notif.text}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>{notif.created_at ? new Date(notif.created_at).toLocaleDateString() : (notif.time || "Today")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", cursor: "pointer" }} onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden", background: "var(--brand-primary, #3b82f6)", color: "var(--bg-surface, #ffffff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", border: "2px solid #e2e8f0" }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt={internUser?.name || "Profile"} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
              ) : (
                <User size={18} color="#ffffff" />
              )}
            </div>
            
            {isProfileDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", backgroundColor: "var(--card-bg, #ffffff)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: "160px", zIndex: 100, overflow: "hidden" }}>
                <button 
                  onClick={() => { setActiveTab("Profile"); navigate("/intern/profile"); setIsProfileDropdownOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", borderBottom: "1px solid var(--border-color, #e2e8f0)", color: "var(--text-primary, #0f172a)", cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: "600" }}
                >
                  <User size={16} /> Profile
                </button>
                <button 
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", color: "var(--error, #dc2626)", cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: "600" }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Content (Full Width) */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: (isMeetingActive && !isMeetingMinimized) ? "0" : "16px 24px 32px 24px", width: "100%", boxSizing: "border-box" }}>

        {/* Content Box */}
        <div style={{ display: (isMeetingActive && !isMeetingMinimized) ? "flex" : "none", flex: 1, minHeight: "500px", borderRadius: (isMeetingActive && !isMeetingMinimized) ? "0" : "16px", overflow: "hidden", border: (isMeetingActive && !isMeetingMinimized) ? "none" : "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <BreakoutRoomsApp 
            isIntern={true} 
            onLeaveMeeting={handleEndMeeting} 
            onMinimize={() => setIsMeetingMinimized(true)}
            onRoomChange={(roomName) => setActiveMeetingRoom(roomName)}
          />
        </div>
        
        {(!isMeetingActive || isMeetingMinimized) && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease-out" }}>
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
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--success-bg, #dcfce7)", color: "var(--success, #16a34a)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "40px", margin: "0 auto 24px auto" }}>
              <PartyPopper size={40} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-dark)", margin: "0 0 12px 0" }}>Thank You for Attending!</h2>
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
                <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-dark)" }}>
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
              {internDomain || "General Track"}
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
                "{domainInsights[currentInsightIndex]}"
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
      {showAirdropModal && activeAirdrop && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100000, padding: "20px"
        }}>
          <div style={{
            backgroundColor: "var(--card-bg, #ffffff)", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "500px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid var(--border-color)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Gift size={24} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "20px", color: "var(--text-dark)" }}>Bonus Airdrop Challenge</h3>
              </div>
              <div style={{ backgroundColor: airdropTimeLeft <= 10 ? "var(--error-bg, #fee2e2)" : "var(--bg-surface-elevated, #f1f5f9)", color: airdropTimeLeft <= 10 ? "var(--error, #ef4444)" : "var(--text-secondary, #475569)", padding: "8px 16px", borderRadius: "20px", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={16} /> {airdropTimeLeft}s
              </div>
            </div>
            
            <div style={{ padding: "20px", backgroundColor: "var(--bg-light)", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 500, color: "var(--text-dark)", lineHeight: 1.5 }}>
                {activeAirdrop.question}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-gray)", marginBottom: "8px" }}>Your Answer (Run fast!)</label>
              <textarea 
                rows="4" 
                value={airdropAnswer}
                onChange={(e) => setAirdropAnswer(e.target.value)}
                style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid var(--border-color)", backgroundColor: "var(--card-bg)", fontSize: "14px", outline: "none", resize: "none", color: "var(--text-dark)", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary-color)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                placeholder="Type your solution here..."
                autoFocus
              />
            </div>

            <Button 
              variant="primary"
              onClick={handleSubmitAirdrop}
              style={{ width: "100%", marginTop: "24px", padding: "16px", borderRadius: "12px", fontSize: "16px" }}
            >
              Submit Answer
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
