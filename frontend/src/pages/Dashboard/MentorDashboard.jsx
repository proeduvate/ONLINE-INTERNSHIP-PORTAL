import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { LayoutDashboard, Users, ClipboardCheck, BookOpen, Gift, MonitorPlay, AlertTriangle, Trophy, Medal, Award, LogOut, Menu, Bot, Maximize2, ClipboardList, Clock, MessageSquare, Calendar, CheckCircle2, Code, X, Target, Video, Layers, Coins, Bell, ArrowLeft, Trash2, User, Laptop, ArrowRight, Headset } from "lucide-react";
import BreakoutRoomsApp from "../breakout-rooms/BreakoutRoomsApp";
import AdminLeaderboard from "./AdminLeaderboard";
import MentorProfile from "./MentorProfile";
import AdminAirdropDetails from "./AdminAirdropDetails";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import api from "../../api/axios";
import "../../styles/Dashboard.css";
export default function MentorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');

  const canonicalTabs = [
    "Overview", "Cohort", "Evaluations", "Tickets", "Programs", 
    "Bonus Airdrops", "Credentials", "Breakout Rooms", "My Profile"
  ];

  const getTabFromUrl = (segment) => {
    if (!segment) return "Overview";
    const cleanSegment = decodeURIComponent(segment).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanSegment === "myinterns") return "Cohort";
    if (cleanSegment === "submissions") return "Evaluations";
    if (cleanSegment === "livemeeting") return "Breakout Rooms";
    if (cleanSegment === "profile" || cleanSegment === "myprofile") return "My Profile";
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
    }
  }, [location.pathname, activeTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState("Main Meeting");
  const [isMeetingActive, setIsMeetingActive] = useState(() => {
    return localStorage.getItem("breakout_meeting_active") === "true";
  });
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("overview");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return alert("Passwords do not match.");
    if (pwForm.next.length < 8) return alert("Password must be at least 8 characters.");
    alert("Password updated successfully!");
    setPwForm({ current: "", next: "", confirm: "" });
  };

  const mockNotifications = [
    { id: 1, text: "Task submission waiting for evaluation", time: "10 mins ago" },
    { id: 2, text: "New support ticket assigned to you", time: "1 hour ago" },
    { id: 3, text: "Breakout room session scheduled", time: "3 hours ago" }
  ];

  // Shared Bonus Airdrops State
  const [bonusAirdrops, setBonusAirdrops] = useState([]);
  const [selectedAirdrop, setSelectedAirdrop] = useState(null);
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const defaultAirdropState = {
    title: "",
    taskType: "Multiple Choice",
    question: "", // Used for Question, Pattern Series, Statement, Sentence with Blank
    mcqOptions: { A: "", B: "", C: "", D: "" },
    correctAnswer: "", // Used for MCQ correct option, pattern correct answer, True/False choice, Blank answer
    matchPairs: [{ key: "", value: "" }],
    arrangeItems: ["", ""],
    startMode: "Fixed Start Time",
    startDate: "",
    startTimeHour: "12",
    startTimeMinute: "00",
    startTimeAmPm: "AM",
    endDate: "",
    endTimeHour: "12",
    endTimeMinute: "00",
    endTimeAmPm: "AM",
    winners: "3",
    points: ["100", "50", "25"],
    timeLimit: "60"
  };
  const [newAirdrop, setNewAirdrop] = useState(defaultAirdropState);

  const [airdropPage, setAirdropPage] = useState(1);
  const [airdropFilter, setAirdropFilter] = useState("All");
  const airdropsPerPage = 13;

  const [credentialInterns, setCredentialInterns] = useState([
    { id: 1, name: "Alice Smith", batch: "Batch A", domain: "Frontend", grade: "92%", status: "Eligible", attendance: "95%", tasksCompleted: "15/15" },
    { id: 2, name: "Bob Jones", batch: "Batch B", domain: "Backend", grade: "88%", status: "Eligible", attendance: "90%", tasksCompleted: "14/15" }
  ]);
  const [selectedCredentialIntern, setSelectedCredentialIntern] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("app_certificate_requests");
    if (stored) {
      setCredentialInterns(JSON.parse(stored));
    }
  }, []);

  const handleRequestCertificate = async (internId) => {
    try {
      await api.post('/api/v1/certificates/request', {
        duration: "1 Month",
        achievement: "Successful Internship Completion",
        grade: "A",
        final_score: 90
      });
      alert("Certificate request created in live database!");
      setSelectedCredentialIntern(null);
      fetchMentorLiveData();
    } catch (err) {
      console.error("Certificate request error:", err);
      alert(err.response?.data?.detail || "Failed to request certificate.");
    }
  };

  const handleCreateAirdrop = async (e) => {
    e.preventDefault();
    if (!newAirdrop.title.trim()) return alert("Please enter an airdrop title.");
    
    // Validate based on taskType
    if (newAirdrop.taskType === "Multiple Choice") {
      if (!newAirdrop.question.trim()) return alert("Please enter the question.");
      if (!newAirdrop.mcqOptions.A.trim() || !newAirdrop.mcqOptions.B.trim() || !newAirdrop.mcqOptions.C.trim() || !newAirdrop.mcqOptions.D.trim()) {
        return alert("Please fill all MCQ options A, B, C, and D.");
      }
      if (!newAirdrop.correctAnswer) return alert("Please select the correct option.");
    } else if (newAirdrop.taskType === "Pattern / Sequence") {
      if (!newAirdrop.question.trim()) return alert("Please enter the pattern series.");
      if (!newAirdrop.correctAnswer.trim()) return alert("Please enter the correct answer.");
    } else if (newAirdrop.taskType === "True / False") {
      if (!newAirdrop.question.trim()) return alert("Please enter the statement.");
      if (!newAirdrop.correctAnswer) return alert("Please select the correct answer (True or False).");
    } else if (newAirdrop.taskType === "Fill in the Blank") {
      if (!newAirdrop.question.trim()) return alert("Please enter the sentence with blank.");
      if (!newAirdrop.correctAnswer.trim()) return alert("Please enter the correct answer.");
    } else if (newAirdrop.taskType === "Match the Following") {
      const invalidPair = newAirdrop.matchPairs.some(p => !p.key.trim() || !p.value.trim());
      if (invalidPair || newAirdrop.matchPairs.length === 0) {
        return alert("Please fill all Match pairs keys and values.");
      }
    } else if (newAirdrop.taskType === "Arrange in Order") {
      const invalidItem = newAirdrop.arrangeItems.some(item => !item.trim());
      if (invalidItem || newAirdrop.arrangeItems.length < 2) {
        return alert("Please fill all items in correct order. At least 2 items are required.");
      }
    }

    if (!newAirdrop.startDate || !newAirdrop.endDate) {
      return alert("Please select start and end dates.");
    }

    let taskTypeEnum = "MULTIPLE_CHOICE";
    if (newAirdrop.taskType.includes("Pattern")) taskTypeEnum = "PATTERN_SERIES";
    else if (newAirdrop.taskType.includes("True")) taskTypeEnum = "TRUE_FALSE";
    else if (newAirdrop.taskType.includes("Fill")) taskTypeEnum = "FILL_IN_BLANK";
    else if (newAirdrop.taskType.includes("Match")) taskTypeEnum = "MATCH_PAIRS";
    else if (newAirdrop.taskType.includes("Arrange")) taskTypeEnum = "ARRANGE_ITEMS";

    const taskConfigObj = {
      question: newAirdrop.question,
      mcqOptions: newAirdrop.taskType === "Multiple Choice" ? newAirdrop.mcqOptions : null,
      correctAnswer: newAirdrop.correctAnswer,
      matchPairs: newAirdrop.taskType === "Match the Following" ? newAirdrop.matchPairs : null,
      arrangeItems: newAirdrop.taskType === "Arrange in Order" ? newAirdrop.arrangeItems : null,
    };

    const startModeEnum = newAirdrop.startMode.toLowerCase().includes("fixed") ? "FIXED" : "FLEXIBLE";

    let startIso = null;
    if (newAirdrop.startDate) {
      startIso = `${newAirdrop.startDate}T${newAirdrop.startTimeHour}:${newAirdrop.startTimeMinute}:00`;
    }

    try {
      await api.post('/api/v1/bonus-airdrops', {
        title: newAirdrop.title,
        description: newAirdrop.question || "Bonus Airdrop Challenge",
        task_type: taskTypeEnum,
        task_config: taskConfigObj,
        domain: mentorDomain || "General",
        start_mode: startModeEnum,
        time_limit: parseInt(newAirdrop.timeLimit || "60", 10),
        start_time: startIso,
        points_distribution: newAirdrop.points.join(","),
        winner_count: parseInt(newAirdrop.winners || "3", 10)
      });

      alert("Bonus Airdrop created and sent to Admin for approval in live DB!");
      setShowAirdropModal(false);
      setNewAirdrop(defaultAirdropState);
      fetchMentorLiveData();
    } catch (err) {
      console.error("Failed to create bonus airdrop:", err);
      alert(err.response?.data?.detail || "Failed to create bonus airdrop.");
    }
  };

  const [assignedInterns, setAssignedInterns] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [submissions, setSubmissions] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedInternForChat, setSelectedInternForChat] = useState(null);
  const [mentorTickets, setMentorTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    assigned_interns_count: 0,
    pending_reviews_count: 0,
    meetings_today_count: 0,
    avg_performance: 0,
    backlog_data: [],
    at_risk_interns: []
  });

  const fetchMentorLiveData = async () => {
    try {
      const statsRes = await api.get('/api/v1/mentor/dashboard');
      if (statsRes.data) {
        setDashboardStats(statsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching mentor dashboard stats:", err);
    }

    try {
      const internsRes = await api.get('/api/v1/mentor/interns');
      if (Array.isArray(internsRes.data)) {
        setAssignedInterns(internsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching mentor assigned interns:", err);
    }

    try {
      const subsRes = await api.get('/api/v1/mentor/submissions');
      if (Array.isArray(subsRes.data)) {
        setSubmissions(subsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching mentor submissions:", err);
    }

    try {
      const ticketsRes = await api.get('/api/v1/tickets');
      if (Array.isArray(ticketsRes.data)) {
        setMentorTickets(ticketsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching mentor tickets:", err);
    }

    try {
      const meetingsRes = await api.get('/api/v1/mentor/meetings');
      if (Array.isArray(meetingsRes.data)) {
        setMeetings(meetingsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching mentor meetings:", err);
    }

    try {
      const airdropsRes = await api.get('/api/v1/bonus-airdrops');
      if (Array.isArray(airdropsRes.data)) {
        setBonusAirdrops(airdropsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching bonus airdrops:", err);
    }

    try {
      const notifsRes = await api.get('/api/v1/notifications');
      if (Array.isArray(notifsRes.data)) {
        setNotifications(notifsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching notifications:", err);
    }

    try {
      const certsRes = await api.get('/api/v1/certificates/pending');
      if (Array.isArray(certsRes.data)) {
        setCredentialInterns(certsRes.data);
      }
    } catch (err) {
      console.warn("Error fetching certificate requests:", err);
    }

    try {
      const userRes = await api.get('/api/v1/users/profile');
      if (userRes.data) {
        setCurrentUserProfile(userRes.data);
      }
    } catch (err) {
      console.warn("Backend user profile fetch error:", err);
    }
  };

  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  useEffect(() => {
    fetchMentorLiveData();
  }, []);

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicket) return;
    
    let existingComments = [];
    if (Array.isArray(selectedTicket.comments)) {
      existingComments = selectedTicket.comments;
    } else if (typeof selectedTicket.comments === "string") {
      try { existingComments = JSON.parse(selectedTicket.comments); } catch (e) { existingComments = []; }
    }

    const updatedComments = [...existingComments, { author: "Mentor", text: ticketReply, time: new Date().toISOString() }];

    try {
      const res = await api.patch(`/api/v1/tickets/${selectedTicket.id}`, {
        comments: updatedComments
      });
      setSelectedTicket(res.data);
      setMentorTickets(prev => prev.map(t => t.id === res.data.id ? res.data : t));
      setTicketReply("");
    } catch (err) {
      console.error("Failed to reply to ticket:", err);
      alert("Failed to submit reply.");
    }
  };

  const handleUpdateTicketStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      const res = await api.patch(`/api/v1/tickets/${selectedTicket.id}`, {
        status: status
      });
      setSelectedTicket(res.data);
      setMentorTickets(prev => prev.map(t => t.id === res.data.id ? res.data : t));
    } catch (err) {
      console.error("Failed to update ticket status:", err);
      alert("Failed to update ticket status.");
    }
  };

  // Weekly review state inputs
  const [weeklyIntern, setWeeklyIntern] = useState("John Doe");
  const [weeklyStrengths, setWeeklyStrengths] = useState("");
  const [weeklyWeaknesses, setWeeklyWeaknesses] = useState("");
  const [weeklyNotes, setWeeklyNotes] = useState("");

  const [mentorDomain] = useState("Artificial Intelligence");
  const [curriculumList] = useState([
    { day: "Day 1",  topic: "Introduction to AI & ML",          resources: "Video Link, Documentation PDF" },
    { day: "Day 2",  topic: "Python for Data Science",          resources: "Python Notebook, Cheatsheet" },
    { day: "Day 3",  topic: "NumPy & Pandas Basics",            resources: "Kaggle Tutorial, Practice Dataset" },
    { day: "Day 4",  topic: "Data Visualization (Matplotlib)",  resources: "Seaborn Docs, Lab Exercise" },
    { day: "Day 5",  topic: "Statistics for ML",                resources: "Khan Academy, PDF Notes" },
    { day: "Day 6",  topic: "Supervised Learning - Regression", resources: "Slides, Colab Notebook" },
    { day: "Day 7",  topic: "Supervised Learning - Classification", resources: "Github Repo, Slides PDF" },
    { day: "Day 8",  topic: "Model Evaluation & Metrics",       resources: "Scikit-learn Docs, Quiz" },
    { day: "Day 9",  topic: "Feature Engineering",              resources: "Kaggle Notebook, PDF" },
    { day: "Day 10", topic: "Unsupervised Learning - Clustering", resources: "K-Means Lab, Video" },
    { day: "Day 11", topic: "Dimensionality Reduction (PCA)",   resources: "Slides, Code Exercise" },
    { day: "Day 12", topic: "Decision Trees & Random Forests",  resources: "Scikit-learn Guide, Notebook" },
    { day: "Day 13", topic: "Support Vector Machines",          resources: "Research Paper, Lab" },
    { day: "Day 14", topic: "Neural Networks - Basics",         resources: "3Blue1Brown Video, PDF" },
    { day: "Day 15", topic: "Mid-term Assessment",              resources: "Assessment Portal" },
    { day: "Day 16", topic: "Deep Learning with TensorFlow",    resources: "TF Docs, Colab" },
    { day: "Day 17", topic: "CNN - Image Classification",       resources: "Fast.ai, CIFAR Dataset" },
    { day: "Day 18", topic: "RNN & LSTM - Sequence Models",     resources: "Andrej Karpathy Blog, Code" },
    { day: "Day 19", topic: "NLP - Text Processing",            resources: "NLTK Docs, Notebook" },
    { day: "Day 20", topic: "Transformers & Attention",         resources: "Hugging Face Tutorial" },
    { day: "Day 21", topic: "Transfer Learning",                resources: "Keras Guide, Pretrained Models" },
    { day: "Day 22", topic: "Model Deployment - Flask API",     resources: "Flask Docs, Postman" },
    { day: "Day 23", topic: "Docker & Cloud Basics",            resources: "Docker Tutorial, AWS Guide" },
    { day: "Day 24", topic: "MLOps Fundamentals",               resources: "MLflow Docs, Video" },
    { day: "Day 25", topic: "Project Planning & Architecture",  resources: "Project Template, Rubric" },
    { day: "Day 26", topic: "Project - Data Collection & EDA",  resources: "Dataset Links, EDA Checklist" },
    { day: "Day 27", topic: "Project - Model Training",         resources: "Training Guide, GPU Colab" },
    { day: "Day 28", topic: "Project - Evaluation & Tuning",    resources: "Hyperparameter Tuning Docs" },
    { day: "Day 29", topic: "Project - Deployment & Demo",      resources: "Deployment Checklist, Hosting" },
    { day: "Day 30", topic: "Final Presentation & Review",      resources: "Presentation Rubric, Feedback Form" },
  ]);
  const [tasks, setTasks] = useState(() => [
    { id: 1,  title: "Explore AI & ML use cases",               difficulty: "Easy",   deadline: "2026-08-01", domain: "Artificial Intelligence", status: "Completed" },
    { id: 2,  title: "Python data manipulation with Pandas",     difficulty: "Easy",   deadline: "2026-08-02", domain: "Artificial Intelligence", status: "Completed" },
    { id: 3,  title: "NumPy array operations assignment",        difficulty: "Easy",   deadline: "2026-08-03", domain: "Artificial Intelligence", status: "Completed" },
    { id: 4,  title: "Matplotlib visualization project",         difficulty: "Easy",   deadline: "2026-08-04", domain: "Artificial Intelligence", status: "Completed" },
    { id: 5,  title: "Statistical analysis on a dataset",        difficulty: "Medium", deadline: "2026-08-05", domain: "Artificial Intelligence", status: "Completed" },
    { id: 6,  title: "Build a Linear Regression model",          difficulty: "Medium", deadline: "2026-08-06", domain: "Artificial Intelligence", status: "Active" },
    { id: 7,  title: "Classification with Logistic Regression",  difficulty: "Medium", deadline: "2026-08-07", domain: "Artificial Intelligence", status: "Active" },
    { id: 8,  title: "Model evaluation metrics report",          difficulty: "Medium", deadline: "2026-08-08", domain: "Artificial Intelligence", status: "Active" },
    { id: 9,  title: "Feature engineering pipeline",             difficulty: "Medium", deadline: "2026-08-09", domain: "Artificial Intelligence", status: "Active" },
    { id: 10, title: "Implement K-Means Clustering",             difficulty: "Hard",   deadline: "2026-08-10", domain: "Artificial Intelligence", status: "Active" },
    { id: 11, title: "PCA dimensionality reduction exercise",    difficulty: "Hard",   deadline: "2026-08-11", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 12, title: "Build a Random Forest classifier",         difficulty: "Medium", deadline: "2026-08-12", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 13, title: "SVM classification on real dataset",       difficulty: "Hard",   deadline: "2026-08-13", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 14, title: "Build a Simple Neural Network",            difficulty: "Hard",   deadline: "2026-08-14", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 15, title: "Mid-term Assessment",                      difficulty: "Hard",   deadline: "2026-08-15", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 16, title: "Deep Learning model with TensorFlow",      difficulty: "Hard",   deadline: "2026-08-16", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 17, title: "CNN for image classification (CIFAR-10)",  difficulty: "Hard",   deadline: "2026-08-17", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 18, title: "LSTM sequence prediction model",           difficulty: "Hard",   deadline: "2026-08-18", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 19, title: "NLP text classification pipeline",         difficulty: "Medium", deadline: "2026-08-19", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 20, title: "Fine-tune a Transformer model",            difficulty: "Hard",   deadline: "2026-08-20", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 21, title: "Transfer learning with pre-trained CNN",   difficulty: "Hard",   deadline: "2026-08-21", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 22, title: "Deploy ML model as Flask REST API",        difficulty: "Medium", deadline: "2026-08-22", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 23, title: "Dockerize and push ML app to cloud",       difficulty: "Medium", deadline: "2026-08-23", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 24, title: "MLOps pipeline with MLflow tracking",      difficulty: "Hard",   deadline: "2026-08-24", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 25, title: "Define capstone project architecture",     difficulty: "Medium", deadline: "2026-08-25", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 26, title: "Collect data & perform EDA",              difficulty: "Hard",   deadline: "2026-08-26", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 27, title: "Train final project model",               difficulty: "Hard",   deadline: "2026-08-27", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 28, title: "Evaluate & tune the project model",       difficulty: "Hard",   deadline: "2026-08-28", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 29, title: "Deploy & demo the final project",         difficulty: "Hard",   deadline: "2026-08-29", domain: "Artificial Intelligence", status: "Upcoming" },
    { id: 30, title: "Final Presentation & Peer Review",        difficulty: "Hard",   deadline: "2026-08-30", domain: "Artificial Intelligence", status: "Upcoming" },
  ].map((t, i) => ({
    ...t,
    mcqs: Array.from({ length: 10 }, (_, m_idx) => ({
      id: m_idx + 1,
      question: `Question ${m_idx + 1} for Day ${i+1}: What is the main concept here?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      answer: m_idx % 4
    })),
    codingQuestion: {
      title: `Day ${i+1} Coding Challenge`,
      description: `Implement a solution related to: "${t.title}". Write clean, documented Python code.`,
      starterCode: `# Day ${i+1} Starter Code\nimport numpy as np\nimport pandas as pd\n\n# TODO: Implement your solution here\ndef solve():\n    pass\n\nsolve()`,
      expectedOutput: "Your output should demonstrate mastery of today's concept."
    }
  })));
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [taskDetailTab, setTaskDetailTab] = useState("MCQ"); // "MCQ" or "Coding"
  const [detailSubTab, setDetailSubTab] = useState("Curriculum");


  // Chart Data
  const backlogData = [
    { name: 'Week 1', Submitted: 40, Evaluated: 38 },
    { name: 'Week 2', Submitted: 45, Evaluated: 40 },
    { name: 'Week 3', Submitted: 50, Evaluated: 30 },
    { name: 'Week 4', Submitted: 60, Evaluated: 25 },
  ];

  const handleLogout = () => {
    alert("Logged out successfully.");
    window.location.href = "/login";
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    setChatMessages([...chatMessages, { sender: "You", text: currentMessage, time: "Just now" }]);
    setCurrentMessage("");
  };

  const handleReviewSubmission = async (id, action, score, feedback) => {
    try {
      await api.put(`/api/v1/mentor/submissions/${id}/review`, {
        action: action,
        score: Number(score),
        feedback: feedback
      });
      alert(`Submission has been ${action === "Approve" ? "Approved" : "Rejected"} in live DB!`);
      fetchMentorLiveData();
    } catch (err) {
      console.error("Error reviewing submission:", err);
      alert(err.response?.data?.detail || "Failed to review submission.");
    }
  };

  const handleCreateMeeting = async (title, time) => {
    if (!title || !time) return alert("Fill in title & time!");
    try {
      const res = await api.post('/api/v1/mentor/meetings', { title, time });
      setMeetings(prev => [...prev, res.data]);
      alert("Meeting created in live database!");
    } catch (err) {
      console.error("Failed to create meeting:", err);
      alert("Failed to create meeting.");
    }
  };

  const handleWeeklySubmit = (e) => {
    e.preventDefault();
    alert(`Weekly Review Logged for ${weeklyIntern}!\nStrengths: ${weeklyStrengths}\nWeaknesses: ${weeklyWeaknesses}`);
    setWeeklyStrengths("");
    setWeeklyWeaknesses("");
    setWeeklyNotes("");
  };

  const handleEndMeeting = () => {
    setIsMeetingActive(false);
  };

  // Bonus Airdrops State
  const [airdropTab, setAirdropTab] = useState("Active");

  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts.length > 2 && parts[2]) {
      const tabName = getTabFromUrl(parts[2]);
      if (tabName === "Evaluations") {
        if (parts[3]) {
          const found = submissions.find(s => String(s.id) === parts[3]);
          setSelectedEvaluation(found || null);
        } else {
          setSelectedEvaluation(null);
        }
      } else if (tabName === "Programs") {
        if (parts[3] === "view" && parts[4]) {
          const found = tasks.find(t => String(t.id) === parts[4]);
          setViewingTask(found || null);
          setEditingTask(null);
          setTaskDetailTab("MCQ");
        } else if (parts[3] === "edit" && parts[4]) {
          const found = tasks.find(t => String(t.id) === parts[4]);
          setEditingTask(found || null);
          setViewingTask(null);
          setTaskDetailTab("General");
        } else {
          setViewingTask(null);
          setEditingTask(null);
        }
      } else if (tabName === "Tickets") {
        if (parts[3]) {
          const found = mentorTickets.find(t => String(t.id) === parts[3]);
          setSelectedTicket(found || null);
        } else {
          setSelectedTicket(null);
        }
      } else if (tabName === "Credentials") {
        if (parts[3]) {
          const found = credentialInterns.find(i => String(i.id) === parts[3]);
          setSelectedCredentialIntern(found || null);
        } else {
          setSelectedCredentialIntern(null);
        }
      } else if (tabName === "Bonus Airdrops") {
        if (parts[3] === "completed") {
          setAirdropTab("Completed");
        } else {
          setAirdropTab("Active");
        }
      }
    }
  }, [location.pathname, submissions, tasks, mentorTickets, credentialInterns]);


  useEffect(() => {
    const storedAirdrops = localStorage.getItem("app_bonus_airdrops");
    if (storedAirdrops) {
      setBonusAirdrops(JSON.parse(storedAirdrops));
    } else {
      setBonusAirdrops([]);
    }
  }, []);

  const activeDrops = bonusAirdrops.filter(a => a.status === "APPROVED" || a.status === "PENDING_APPROVAL" || a.status === "Active");
  const completedDrops = bonusAirdrops.filter(a => a.status === "Completed");

  const renderLobby = () => {
    const isAlreadyActive = localStorage.getItem("breakout_meeting_active") === "true";
    
    const handleStartOrJoin = () => {
      setIsMeetingActive(true);
      localStorage.setItem("breakout_meeting_active", "true");
    };

    const handleScheduleSubmit = (e) => {
      e.preventDefault();
      // Format time for presentation
      const dateObj = new Date(scheduleTime);
      const formattedTime = dateObj.toLocaleString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric", 
        hour: "numeric", 
        minute: "2-digit" 
      });
      handleCreateMeeting(scheduleTitle, formattedTime);
      setScheduleTitle("");
      setScheduleTime("");
    };

    return (
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          
          {/* Card 1: Start/Join Meeting */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "280px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                  <MessageSquare size={20} />
                </div>
                <h3 style={{ margin: 0 }}>Breakout Rooms Meeting</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                {isAlreadyActive 
                  ? "An active breakout room session is currently running. You can join the room to manage interns, allocate breakout sessions, and review code."
                  : "Launch an instant meeting room. Interns will be notified and can join the main lobby or specific breakout sessions."}
              </p>
              {isAlreadyActive && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#ecfdf5", color: "#047857", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, marginBottom: "20px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                  Active Meeting In Progress
                </div>
              )}
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleStartOrJoin}
              style={{ width: "100%", padding: "12px", fontSize: "15px", fontWeight: "bold" }}
            >
              {isAlreadyActive ? "Join Active Meeting" : "Start New Meeting"}
            </button>
          </div>

          {/* Card 2: Schedule Meeting */}
          <div className="card" style={{ minHeight: "280px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#b45309" }}>
                <Calendar size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Schedule a Future Meeting</h3>
            </div>
            <form onSubmit={handleScheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>Meeting Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Weekly Code Sync & Reviews" 
                  className="form-control" 
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  className="form-control" 
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-secondary" 
                style={{ width: "100%", padding: "10px", marginTop: "8px", fontWeight: "bold" }}
              >
                Schedule Meeting
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>


            <div className="grid">
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <span className="stat-title">Assigned Interns</span>
                <span className="stat-value">{dashboardStats.assigned_interns_count || assignedInterns.length}</span>
                <span className="stat-desc">Tracking active progression</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <span className="stat-title">Pending Reviews</span>
                <span className="stat-value">{dashboardStats.pending_reviews_count ?? submissions.filter(s => s.status === "Pending").length}</span>
                <span className="stat-desc">Awaiting your feedback & score</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <span className="stat-title">Meetings Today</span>
                <span className="stat-value">{dashboardStats.meetings_today_count ?? meetings.length}</span>
                <span className="stat-desc">Scheduled sessions today</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <span className="stat-title">Average Performance</span>
                <span className="stat-value">{dashboardStats.avg_performance || 0}%</span>
                <span className="stat-desc">Calculated score of assigned cohort</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div className="card animate-slide-up" style={{ margin: 0, paddingBottom: 0, animationDelay: '0.5s' }}>
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Review Backlog Tracker</h3>
                <ResponsiveContainer width="100%" height={225}>
                  <BarChart data={dashboardStats.backlog_data && dashboardStats.backlog_data.length > 0 ? dashboardStats.backlog_data : backlogData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dx={-10} />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{ backgroundColor: 'var(--bg-surface, #ffffff)', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Submitted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Evaluated" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card animate-slide-up" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff5f5", borderColor: "#fecaca", animationDelay: '0.6s' }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}><AlertTriangle size={18} /> At-Risk Interns</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                  {dashboardStats.at_risk_interns && dashboardStats.at_risk_interns.length > 0 ? (
                    dashboardStats.at_risk_interns.map((intern) => (
                      <div key={intern.id} style={{ backgroundColor: "var(--bg-surface, #ffffff)", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700 }}>{intern.name}</span>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>{intern.batch || "Batch A"}</span>
                        </div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#475569" }}>{intern.reason}</p>
                        <button onClick={() => setSelectedInternForChat(intern.name)} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "#dc2626", borderColor: "#fca5a5", width: "100%", marginTop: "6px" }}>Send Message</button>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "13px", color: "#6b7280", textAlign: "center", padding: "16px" }}>
                      No at-risk interns identified. All interns on track!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", flex: 1, minHeight: 0 }}>
              <div className="card animate-slide-up" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', minHeight: 0, animationDelay: '0.7s' }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Upcoming Schedule</h3>
                <div style={{ padding: "12px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", flex: 1 }}>
                  {meetings.length > 0 ? meetings.map((m, index) => (
                    <div key={m.id || index} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#1f2937" }}>{m.title}</h4>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>{m.time}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span className={m.status === 'Scheduled' ? "badge badge-success" : "badge badge-warning"} style={{ fontSize: "10px" }}>{m.status === 'Upcoming' ? 'Meeting' : m.status}</span>
                          <button 
                            onClick={() => {
                              setIsMeetingActive(true);
                              localStorage.setItem("breakout_meeting_active", "true");
                              setActiveTab("Breakout Rooms");
                              navigate("/mentor/breakout-rooms");
                            }}
                            className="btn btn-primary"
                            style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px" }}
                          >
                            Join
                          </button>
                        </div>
                      </div>
                      {index < meetings.length - 1 && <div style={{ borderTop: "1px solid #e5e7eb" }}></div>}
                    </div>
                  )) : (
                    <div style={{ fontSize: "13px", color: "#6b7280", textAlign: "center", padding: "10px" }}>No upcoming meetings</div>
                  )}
                </div>
              </div>

              <div className="animate-slide-up" style={{ margin: 0, paddingBottom: 0, display: "flex", flexDirection: "column", height: "100%", animationDelay: '0.8s' }}>
                <AdminLeaderboard usersList={assignedInterns.map(i => ({...i, role: 'Intern'}))} isOverview={true} />
              </div>
            </div>
          </>
        );

      case "Cohort":
        return (
          <div>
            {/* Row 1: Interns List */}
            <div className="card">
              <h3>Assigned Interns Cohort</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Name</th><th>Progress</th><th>Avg Score</th><th>Weak Areas</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedInterns.map(i => (
                      <tr key={i.id}>
                        <td>{i.id}</td>
                        <td onClick={() => navigate(`/mentor/intern/${i.id}`)} style={{ cursor: "pointer", color: "#3b82f6", textDecoration: "underline" }}><b>{i.name}</b></td>
                        <td>{i.progress}</td>
                        <td><b>{i.score}</b></td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{i.weakAreas}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => setSelectedInternForChat(i.name)} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "12px" }}>
                              Chat
                            </button>
                            <button 
                              onClick={() => {
                                setScheduleTitle(`${i.name} - Code Review`);
                                setActiveTab("Breakout Rooms");
                                navigate("/mentor/breakout-rooms");
                              }} 
                              className="btn btn-primary" 
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                            >
                              Review Meeting
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 2: Meetings Planner */}
            <div className="card">
              <h3>Review Meetings Planner</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Meeting Title</th><th>Scheduled Time</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {meetings.map((m, idx) => (
                      <tr key={idx}>
                        <td><b>{m.title}</b></td>
                        <td>{m.time}</td>
                        <td><span className="badge badge-success">{m.status}</span></td>
                        <td>
                          <button 
                            onClick={() => {
                              setIsMeetingActive(true);
                              localStorage.setItem("breakout_meeting_active", "true");
                              setActiveTab("Breakout Rooms");
                              navigate("/mentor/breakout-rooms");
                            }} 
                            className="btn btn-primary" 
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            Join Room
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );

      case "Evaluations":
        return (
          <div>
            {/* Row 1: Submissions review & grading */}
            <div className="card">
              <h3 style={{ marginBottom: "16px" }}>Submissions Review</h3>
              {submissions.filter(s => s.status === "Pending").length === 0 ? (
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}><Trophy size={18} color="#10b981" /> All submissions have been evaluated!</p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Intern</th>
                        <th>Task</th>
                        <th>Domain</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.filter(s => s.status === "Pending").map(sub => (
                        <tr key={sub.id}>
                          <td style={{ fontWeight: 600 }}>{sub.intern}</td>
                          <td>{sub.task}</td>
                          <td>{sub.domain}</td>
                          <td><span className="badge badge-warning">{sub.status}</span></td>
                          <td>
                            <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => navigate("/mentor/evaluations/" + sub.id)}>Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedEvaluation && (
              <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
                <div style={{ backgroundColor: "#fff", width: "700px", maxWidth: "90%", borderRadius: "12px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", maxHeight: "90vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-dark)" }}>Evaluation Details</h2>
                    <button onClick={() => navigate("/mentor/evaluations")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}><X size={16} /></button>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div><span style={{ fontWeight: 600, color: "var(--text-gray)" }}>Intern:</span> {selectedEvaluation.intern}</div>
                    <div><span style={{ fontWeight: 600, color: "var(--text-gray)" }}>Domain:</span> {selectedEvaluation.domain}</div>
                    <div><span style={{ fontWeight: 600, color: "var(--text-gray)" }}>Curriculum:</span> {selectedEvaluation.curriculum}</div>
                    <div><span style={{ fontWeight: 600, color: "var(--text-gray)" }}>Task:</span> {selectedEvaluation.task}</div>
                    <div><span style={{ fontWeight: 600, color: "var(--text-gray)" }}>MCQ Results:</span> {selectedEvaluation.mcqResults}</div>
                  </div>

                  <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "16px", borderRadius: "8px", color: "#1E3A8A", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, marginBottom: "8px", fontSize: "14px" }}>
                      <Bot size={18} /> AI Evaluation: {selectedEvaluation.aiScore}
                    </div>
                    <div style={{ lineHeight: "1.5", fontSize: "13px" }}>{selectedEvaluation.aiFeedback}</div>
                  </div>

                  <div style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
                    <a href="https://github.com/mock-intern/repo" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", backgroundColor: "#24292e", color: "var(--bg-surface, #ffffff)", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600", transition: "opacity 0.2s" }}>
                      <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true" fill="currentColor">
                        <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                      </svg>
                      View on GitHub
                    </a>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#4b5563", marginBottom: "6px" }}>Final Score</label>
                      <input id="modalTempScore" className="form-control" placeholder="e.g. 85%" style={{ margin: 0 }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#4b5563", marginBottom: "6px" }}>Mentor Feedback</label>
                      <input id="modalTempFeedback" className="form-control" placeholder="Constructive remarks..." style={{ margin: 0 }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                    <button onClick={() => {
                      const score = document.getElementById("modalTempScore").value;
                      const feedback = document.getElementById("modalTempFeedback").value;
                      handleReviewSubmission(selectedEvaluation.id, "Reject", score || "0%", feedback || "Needs rework");
                      navigate("/mentor/evaluations");
                    }} className="btn btn-secondary" style={{ color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "#fef2f2", padding: "10px 24px", fontWeight: 600 }}>Reject</button>
                    <button onClick={() => {
                      const score = document.getElementById("modalTempScore").value;
                      const feedback = document.getElementById("modalTempFeedback").value;
                      handleReviewSubmission(selectedEvaluation.id, "Approve", score || "80%", feedback || "Approved");
                      navigate("/mentor/evaluations");
                    }} className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981", padding: "10px 24px", fontWeight: 600 }}>Approve</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "Programs":
        return (
          <div className="card">
            <h3 style={{ margin: "0 0 20px 0" }}>Program Details - {mentorDomain}</h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                className={`btn ${detailSubTab === "Curriculum" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setDetailSubTab("Curriculum")}
              >Curriculum</button>
              <button
                className={`btn ${detailSubTab === "Tasks" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setDetailSubTab("Tasks")}
              >Tasks</button>
            </div>

            {detailSubTab === "Curriculum" && (
              <div className="table-container" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                <table className="table">
                  <thead>
                    <tr><th>Day</th><th>Topic / Focus</th><th>Tasks/Resources</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {curriculumList.map((cur, i) => (
                      <tr key={i}>
                        <td style={{ width: "80px", fontWeight: "600", color: "#4b5563" }}>{cur.day}</td>
                        <td><b>{cur.topic}</b></td>
                        <td>{cur.resources}</td>
                        <td>
                          <span className={`badge ${i < 5 ? "badge-success" : i < 10 ? "badge-primary" : "badge-secondary"}`} style={{ fontSize: "10px" }}>
                            {i < 5 ? "Completed" : i < 10 ? "Active" : "Upcoming"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailSubTab === "Tasks" && (
              <div>
                {editingTask ? (
                  <div className="card" style={{ backgroundColor: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ margin: 0 }}>Edit Task TSK-{editingTask.id}</h4>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className={`btn ${taskDetailTab === "General" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("General")} style={{ padding: "4px 12px", fontSize: "12px" }}>General</button>
                        <button className={`btn ${taskDetailTab === "MCQ" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("MCQ")} style={{ padding: "4px 12px", fontSize: "12px" }}>MCQs ({editingTask.mcqs.length})</button>
                        <button className={`btn ${taskDetailTab === "Coding" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("Coding")} style={{ padding: "4px 12px", fontSize: "12px" }}>Coding</button>
                      </div>
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
                      setEditingTask(null);
                    }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      
                      {taskDetailTab === "General" && (
                        <div style={{ display: "flex", gap: "12px", maxWidth: "600px" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: "12px", fontWeight: 600 }}>Task Title</label>
                            <input className="form-control" type="text" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: 600 }}>Deadline</label>
                            <input className="form-control" type="date" value={editingTask.deadline} onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})} />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: 600 }}>Difficulty</label>
                            <select className="form-control" value={editingTask.difficulty} onChange={(e) => setEditingTask({...editingTask, difficulty: e.target.value})}>
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {taskDetailTab === "MCQ" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
                          {editingTask.mcqs.map((mcq, mi) => (
                            <div key={mcq.id} style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Q{mi + 1}. Question</label>
                              <input className="form-control" style={{ marginBottom: "10px" }} value={mcq.question}
                                onChange={e => setEditingTask({ ...editingTask, mcqs: editingTask.mcqs.map((q, qi) => qi === mi ? { ...q, question: e.target.value } : q) })} />
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                {mcq.options.map((opt, oi) => (
                                  <div key={oi} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    <span style={{ fontSize: "11px", width: "20px" }}>{["A","B","C","D"][oi]}.</span>
                                    <input className="form-control" style={{ fontSize: "12px", padding: "4px 8px" }} value={opt}
                                      onChange={e => setEditingTask({ ...editingTask, mcqs: editingTask.mcqs.map((q, qi) => qi === mi ? { ...q, options: q.options.map((o, oii) => oii === oi ? e.target.value : o) } : q) })} />
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700 }}>Correct Answer:</label>
                                <select style={{ fontSize: "12px", padding: "3px 6px" }} value={mcq.answer}
                                  onChange={e => setEditingTask({ ...editingTask, mcqs: editingTask.mcqs.map((q, qi) => qi === mi ? { ...q, answer: parseInt(e.target.value) } : q) })}>
                                  {mcq.options.map((_, oi) => <option key={oi} value={oi}>{["A","B","C","D"][oi]}</option>)}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {taskDetailTab === "Coding" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "800px" }}>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: 600 }}>Title</label>
                            <input className="form-control" value={editingTask.codingQuestion.title}
                              onChange={e => setEditingTask({ ...editingTask, codingQuestion: { ...editingTask.codingQuestion, title: e.target.value } })} />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: 600 }}>Description</label>
                            <textarea className="form-control" rows="3" value={editingTask.codingQuestion.description}
                              onChange={e => setEditingTask({ ...editingTask, codingQuestion: { ...editingTask.codingQuestion, description: e.target.value } })} />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: 600 }}>Starter Code</label>
                            <textarea className="form-control" rows="5" style={{ fontFamily: "monospace", fontSize: "12px" }} value={editingTask.codingQuestion.starterCode}
                              onChange={e => setEditingTask({ ...editingTask, codingQuestion: { ...editingTask.codingQuestion, starterCode: e.target.value } })} />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", fontWeight: 600 }}>Expected Output</label>
                            <input className="form-control" value={editingTask.codingQuestion.expectedOutput}
                              onChange={e => setEditingTask({ ...editingTask, codingQuestion: { ...editingTask.codingQuestion, expectedOutput: e.target.value } })} />
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate("/mentor/programs")}>Cancel</button>
                      </div>
                    </form>
                  </div>
                ) : viewingTask ? (
                  <div className="card" style={{ backgroundColor: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button className="btn btn-secondary" style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "6px" }} onClick={() => navigate("/mentor/programs")}><ArrowLeft size={16} /> Back</button>
                        <h4 style={{ margin: 0 }}>View Task TSK-{viewingTask.id}: {viewingTask.title}</h4>
                        <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "12px", marginLeft: "8px" }} onClick={() => navigate("/mentor/programs/edit/" + viewingTask.id)}>Edit Task</button>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className={`btn ${taskDetailTab === "MCQ" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("MCQ")} style={{ padding: "4px 12px", fontSize: "12px" }}>MCQs ({viewingTask.mcqs.length})</button>
                        <button className={`btn ${taskDetailTab === "Coding" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("Coding")} style={{ padding: "4px 12px", fontSize: "12px" }}>Coding Challenge</button>
                      </div>
                    </div>
                    
                    {taskDetailTab === "MCQ" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "500px", overflowY: "auto", paddingRight: "8px" }}>
                        {viewingTask.mcqs.map((mcq, mi) => (
                          <div key={mcq.id} style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Q{mi + 1}. {mcq.question}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                              {mcq.options.map((opt, oi) => (
                                <div key={oi} style={{ fontSize: "13px", padding: "8px 12px", borderRadius: "6px", backgroundColor: oi === mcq.answer ? "#dcfce7" : "#f1f5f9", border: `1px solid ${oi === mcq.answer ? "#86efac" : "transparent"}` }}>
                                  <span style={{ fontWeight: 600, marginRight: "8px" }}>{["A","B","C","D"][oi]}.</span> {opt} {oi === mcq.answer && <span style={{ float: "right", color: "#16a34a", display: "flex" }}><CheckCircle2 size={16} /></span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {taskDetailTab === "Coding" && (
                      <div style={{ padding: "16px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <h5 style={{ margin: "0 0 12px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Laptop size={18} /> {viewingTask.codingQuestion.title}</h5>
                        <div style={{ fontSize: "14px", marginBottom: "16px", lineHeight: "1.5" }}>{viewingTask.codingQuestion.description}</div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted, #64748b)", marginBottom: "6px" }}>Starter Code:</div>
                        <pre style={{ backgroundColor: "var(--text-primary, #1e293b)", color: "var(--bg-surface-elevated, #f8fafc)", padding: "16px", borderRadius: "8px", fontSize: "13px", overflowX: "auto", margin: "0 0 16px 0", fontFamily: "monospace" }}>
                          {viewingTask.codingQuestion.starterCode}
                        </pre>
                        <div style={{ fontSize: "13px", backgroundColor: "#fefce8", padding: "12px", borderRadius: "6px", border: "1px solid #fef08a" }}>
                          <b>Expected Output:</b> {viewingTask.codingQuestion.expectedOutput}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="table-container" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                    <table className="table">
                      <thead>
                        <tr><th>ID</th><th>Task Title</th><th>Difficulty</th><th>Deadline</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {tasks.map((t) => (
                          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => navigate("/mentor/programs/view/" + t.id)} className="hover-row">
                            <td style={{ color: "#6b7280", fontSize: "12px" }}>TSK-{t.id}</td>
                            <td><b>{t.title}</b></td>
                            <td><span className={`badge ${t.difficulty === "Hard" ? "badge-danger" : t.difficulty === "Medium" ? "badge-warning" : "badge-success"}`}>{t.difficulty}</span></td>
                            <td>{t.deadline}</td>
                            <td><span className={`badge ${t.status === "Completed" ? "badge-success" : t.status === "Active" ? "badge-primary" : "badge-secondary"}`} style={{ fontSize: "10px" }}>{t.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "Bonus Airdrops": {
        if (selectedAirdrop) {
          return <AdminAirdropDetails airdrop={selectedAirdrop} onBack={() => setSelectedAirdrop(null)} />;
        }

        const filteredAirdrops = bonusAirdrops.filter(a => {
          if (airdropFilter === "All") return true;
          if (airdropFilter === "Active") return a.status === "Active" || a.status === "ACTIVE" || a.status === "APPROVED";
          if (airdropFilter === "Completed") return a.status === "Completed" || a.status === "FINALIZED" || a.status === "COMPLETED";
          return a.status === airdropFilter;
        });
        const totalPages = Math.ceil(filteredAirdrops.length / airdropsPerPage) || 1;
        const currentAirdrops = [...filteredAirdrops].reverse().slice((airdropPage - 1) * airdropsPerPage, airdropPage * airdropsPerPage);

        return (
          <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <select 
                className="form-control" 
                style={{ width: "220px", margin: 0 }} 
                value={airdropFilter} 
                onChange={(e) => { setAirdropFilter(e.target.value); setAirdropPage(1); }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active / Approved</option>
                <option value="Completed">Completed / Finalized</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
              </select>
            </div>

            <div className="card" style={{ padding: "0", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
              <div className="table-container" style={{ margin: 0, flex: 1 }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 16px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)" }}>ID</th>
                      <th style={{ padding: "12px 16px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)" }}>Question</th>
                      <th style={{ padding: "12px 16px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)" }}>Points</th>
                      <th style={{ padding: "12px 16px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)" }}>Status</th>
                      <th style={{ padding: "12px 16px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)" }}>Time Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAirdrops.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No airdrops found.</td>
                      </tr>
                    ) : (
                      currentAirdrops.map(airdrop => {
                        const qText = airdrop.question || airdrop.title || airdrop.description || "Bonus Airdrop Challenge";
                        const pts = Array.isArray(airdrop.points) 
                          ? Math.max(0, ...airdrop.points.map(Number)) 
                          : (Array.isArray(airdrop.points_distribution) ? Math.max(0, ...airdrop.points_distribution) : (airdrop.points || 0));
                        const timeLimit = airdrop.timeLimit || airdrop.time_limit || 60;
                        return (
                          <tr 
                            key={airdrop.id} 
                            onClick={() => setSelectedAirdrop(airdrop)}
                            className="hover-row"
                            style={{ cursor: "pointer" }}
                          >
                            <td style={{ padding: "12px 16px", fontWeight: "600", color: "#475569" }}>{airdrop.id}</td>
                            <td style={{ padding: "12px 16px" }}>{qText.length > 60 ? qText.substring(0, 60) + "..." : qText}</td>
                            <td style={{ padding: "12px 16px", color: "#b91c1c", fontWeight: "600" }}>{pts} pts</td>
                            <td style={{ padding: "12px 16px" }}>
                              <span className={`badge ${airdrop.status === 'APPROVED' || airdrop.status === 'Active' || airdrop.status === 'ACTIVE' ? 'badge-primary' : airdrop.status === 'FINALIZED' || airdrop.status === 'Completed' || airdrop.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                                {airdrop.status || 'PENDING'}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px", color: "#6b7280" }}>{timeLimit}s</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid #e2e8f0", backgroundColor: "var(--bg-surface-elevated, #f8fafc)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted, #64748b)" }}>Showing page {airdropPage} of {totalPages}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} disabled={airdropPage === 1} onClick={() => setAirdropPage(p => Math.max(1, p - 1))}>Previous</button>
                  <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} disabled={airdropPage === totalPages} onClick={() => setAirdropPage(p => Math.min(totalPages, p + 1))}>Next</button>
                </div>
              </div>
            </div>

            {showAirdropModal && (
              <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
                <div style={{ backgroundColor: "var(--bg-surface, #ffffff)", borderRadius: "16px", width: "100%", maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  
                  {/* Modal Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-primary, #1e293b)" }}>Create New Bonus Airdrop</h3>
                        <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted, #64748b)" }}>Create a time-bound bonus challenge for interns.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowAirdropModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseEnter={(e) => e.target.style.color = "#475569"} onMouseLeave={(e) => e.target.style.color = "#94a3b8"}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleCreateAirdrop} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    {/* Modal Scrollable Body */}
                    <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
                      
                      {/* Title & Task Type */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                          <input 
                            type="text" 
                            required 
                            maxLength={100}
                            placeholder="Enter airdrop title" 
                            className="form-control" 
                            style={{ width: "100%", margin: 0 }} 
                            value={newAirdrop.title} 
                            onChange={(e) => setNewAirdrop({...newAirdrop, title: e.target.value})} 
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                            {newAirdrop.title.length}/100
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Task Type <span style={{ color: "#ef4444" }}>*</span></label>
                          <select 
                            className="form-control" 
                            style={{ width: "100%", margin: 0 }} 
                            value={newAirdrop.taskType} 
                            onChange={(e) => setNewAirdrop({
                              ...newAirdrop, 
                              taskType: e.target.value,
                              correctAnswer: "",
                              question: ""
                            })}
                          >
                            <option value="Multiple Choice">Multiple Choice</option>
                            <option value="Pattern / Sequence">Pattern / Sequence</option>
                            <option value="True / False">True / False</option>
                            <option value="Fill in the Blank">Fill in the Blank</option>
                            <option value="Match the Following">Match the Following</option>
                            <option value="Arrange in Order">Arrange in Order</option>
                          </select>
                        </div>
                      </div>

                      {/* Task Details Section */}
                      <div style={{ backgroundColor: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                          <ClipboardList size={16} />
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>
                            Task Details ({
                              newAirdrop.taskType === "Multiple Choice" ? "MCQ" :
                              newAirdrop.taskType === "Pattern / Sequence" ? "PATTERN" :
                              newAirdrop.taskType === "True / False" ? "TRUE FALSE" :
                              newAirdrop.taskType === "Fill in the Blank" ? "FILL BLANK" :
                              newAirdrop.taskType === "Match the Following" ? "MATCH" : "ARRANGE"
                            })
                          </h4>
                        </div>

                        {/* MCQ Specific Fields */}
                        {newAirdrop.taskType === "Multiple Choice" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                              <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Question <span style={{ color: "#ef4444" }}>*</span></label>
                                <textarea 
                                  required 
                                  maxLength={500}
                                  placeholder="Enter your question here..." 
                                  className="form-control" 
                                  rows="6" 
                                  style={{ width: "100%", margin: 0, resize: "none" }} 
                                  value={newAirdrop.question} 
                                  onChange={(e) => setNewAirdrop({...newAirdrop, question: e.target.value})} 
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                  {newAirdrop.question.length}/500
                                </div>
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Options <span style={{ color: "#ef4444" }}>*</span></label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {["A", "B", "C", "D"].map((opt) => (
                                    <div key={opt} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "var(--text-muted, #64748b)", backgroundColor: "var(--bg-surface, #ffffff)" }}>
                                        {opt}
                                      </div>
                                      <input 
                                        type="text" 
                                        required 
                                        placeholder={`Option ${opt}`} 
                                        className="form-control" 
                                        style={{ width: "100%", margin: 0, padding: "8px 12px" }}
                                        value={newAirdrop.mcqOptions[opt]} 
                                        onChange={(e) => {
                                          const updatedOptions = { ...newAirdrop.mcqOptions, [opt]: e.target.value };
                                          setNewAirdrop({...newAirdrop, mcqOptions: updatedOptions});
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Correct Answer <span style={{ color: "#ef4444" }}>*</span></label>
                              <select 
                                className="form-control" 
                                style={{ width: "100%", margin: 0 }} 
                                value={newAirdrop.correctAnswer} 
                                onChange={(e) => setNewAirdrop({...newAirdrop, correctAnswer: e.target.value})}
                              >
                                <option value="">Select the correct option</option>
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Pattern / Sequence Fields */}
                        {newAirdrop.taskType === "Pattern / Sequence" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Pattern Series <span style={{ color: "#ef4444" }}>*</span></label>
                              <textarea 
                                required 
                                placeholder="e.g. 2, 4, 6, ?" 
                                className="form-control" 
                                rows="3" 
                                style={{ width: "100%", margin: 0, resize: "none" }} 
                                value={newAirdrop.question} 
                                onChange={(e) => setNewAirdrop({...newAirdrop, question: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Correct Answer <span style={{ color: "#ef4444" }}>*</span></label>
                              <input 
                                type="text" 
                                required 
                                placeholder="Exact string match" 
                                className="form-control" 
                                style={{ width: "100%", margin: 0 }} 
                                value={newAirdrop.correctAnswer} 
                                onChange={(e) => setNewAirdrop({...newAirdrop, correctAnswer: e.target.value})} 
                              />
                            </div>
                          </div>
                        )}

                        {/* True / False Fields */}
                        {newAirdrop.taskType === "True / False" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Statement <span style={{ color: "#ef4444" }}>*</span></label>
                              <textarea 
                                required 
                                placeholder="Enter true/false statement" 
                                className="form-control" 
                                rows="3" 
                                style={{ width: "100%", margin: 0, resize: "none" }} 
                                value={newAirdrop.question} 
                                onChange={(e) => setNewAirdrop({...newAirdrop, question: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Correct Answer <span style={{ color: "#ef4444" }}>*</span></label>
                              <select 
                                className="form-control" 
                                style={{ width: "100%", margin: 0 }} 
                                value={newAirdrop.correctAnswer} 
                                onChange={(e) => setNewAirdrop({...newAirdrop, correctAnswer: e.target.value})}
                              >
                                <option value="">Select answer</option>
                                <option value="True">True</option>
                                <option value="False">False</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Fill in the Blank Fields */}
                        {newAirdrop.taskType === "Fill in the Blank" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Sentence with Blank <span style={{ color: "#ef4444" }}>*</span></label>
                              <textarea 
                                required 
                                placeholder="The quick brown ___ jumps over the lazy dog." 
                                className="form-control" 
                                rows="3" 
                                style={{ width: "100%", margin: 0, resize: "none" }} 
                                value={newAirdrop.question} 
                                onChange={(e) => setNewAirdrop({...newAirdrop, question: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Correct Answer <span style={{ color: "#ef4444" }}>*</span></label>
                              <input 
                                type="text" 
                                required 
                                placeholder="Exact string match" 
                                className="form-control" 
                                style={{ width: "100%", margin: 0 }} 
                                value={newAirdrop.correctAnswer} 
                                onChange={(e) => setNewAirdrop({...newAirdrop, correctAnswer: e.target.value})} 
                              />
                            </div>
                          </div>
                        )}

                        {/* Match the Following Fields */}
                        {newAirdrop.taskType === "Match the Following" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Pairs <span style={{ color: "#ef4444" }}>*</span></label>
                            {newAirdrop.matchPairs.map((pair, idx) => (
                              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder={`Key ${idx + 1}`} 
                                  className="form-control" 
                                  style={{ flex: 1, margin: 0 }} 
                                  value={pair.key} 
                                  onChange={(e) => {
                                    const updated = [...newAirdrop.matchPairs];
                                    updated[idx].key = e.target.value;
                                    setNewAirdrop({...newAirdrop, matchPairs: updated});
                                  }} 
                                />
                                <span style={{ color: "#94a3b8", fontWeight: "bold", display: "flex", alignItems: "center" }}><ArrowRight size={14} /></span>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder={`Value ${idx + 1}`} 
                                  className="form-control" 
                                  style={{ flex: 1, margin: 0 }} 
                                  value={pair.value} 
                                  onChange={(e) => {
                                    const updated = [...newAirdrop.matchPairs];
                                    updated[idx].value = e.target.value;
                                    setNewAirdrop({...newAirdrop, matchPairs: updated});
                                  }} 
                                />
                                {newAirdrop.matchPairs.length > 1 && (
                                  <button type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center" }} onClick={() => {
                                    const updated = newAirdrop.matchPairs.filter((_, i) => i !== idx);
                                    setNewAirdrop({...newAirdrop, matchPairs: updated});
                                  }}><Trash2 size={16} /></button>
                                )}
                              </div>
                            ))}
                            <button 
                              type="button" 
                              style={{ display: "inline-flex", width: "fit-content", alignItems: "center", gap: "6px", backgroundColor: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", marginTop: "4px" }}
                              onClick={() => {
                                setNewAirdrop({...newAirdrop, matchPairs: [...newAirdrop.matchPairs, { key: "", value: "" }]});
                              }}
                            >
                              + Add Pair
                            </button>
                          </div>
                        )}

                        {/* Arrange in Order Fields */}
                        {newAirdrop.taskType === "Arrange in Order" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Items in Correct Order <span style={{ color: "#ef4444" }}>*</span></label>
                            {newAirdrop.arrangeItems.map((item, idx) => (
                              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted, #64748b)", width: "20px" }}>{idx + 1}.</span>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder={`Item ${idx + 1}`} 
                                  className="form-control" 
                                  style={{ flex: 1, margin: 0 }} 
                                  value={item} 
                                  onChange={(e) => {
                                    const updated = [...newAirdrop.arrangeItems];
                                    updated[idx] = e.target.value;
                                    setNewAirdrop({...newAirdrop, arrangeItems: updated});
                                  }} 
                                />
                                {newAirdrop.arrangeItems.length > 2 && (
                                  <button type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center" }} onClick={() => {
                                    const updated = newAirdrop.arrangeItems.filter((_, i) => i !== idx);
                                    setNewAirdrop({...newAirdrop, arrangeItems: updated});
                                  }}><Trash2 size={16} /></button>
                                )}
                              </div>
                            ))}
                            <button 
                              type="button" 
                              style={{ display: "inline-flex", width: "fit-content", alignItems: "center", gap: "6px", backgroundColor: "#e0e7ff", color: "#4f46e5", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", marginTop: "4px" }}
                              onClick={() => {
                                setNewAirdrop({...newAirdrop, arrangeItems: [...newAirdrop.arrangeItems, ""]});
                              }}
                            >
                              + Add Item
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Timing & Start Mode Section */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                          <Clock size={16} />
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>Timing & Start Mode</h4>
                        </div>



                        {/* Dates and Dropdowns */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px", marginBottom: "12px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Start Date <span style={{ color: "#ef4444" }}>*</span></label>
                            <input 
                              type="date" 
                              required
                              className="form-control" 
                              style={{ width: "100%", margin: 0 }} 
                              value={newAirdrop.startDate} 
                              onChange={(e) => setNewAirdrop({...newAirdrop, startDate: e.target.value})} 
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Start Time <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <select className="form-control" style={{ flex: 1, margin: 0, padding: "8px 6px" }} value={newAirdrop.startTimeHour} onChange={(e) => setNewAirdrop({...newAirdrop, startTimeHour: e.target.value})}>
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              <span style={{ color: "var(--text-muted, #64748b)" }}>:</span>
                              <select className="form-control" style={{ flex: 1, margin: 0, padding: "8px 6px" }} value={newAirdrop.startTimeMinute} onChange={(e) => setNewAirdrop({...newAirdrop, startTimeMinute: e.target.value})}>
                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <select className="form-control" style={{ flex: 1, margin: 0, padding: "8px 6px" }} value={newAirdrop.startTimeAmPm} onChange={(e) => setNewAirdrop({...newAirdrop, startTimeAmPm: e.target.value})}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>End Date <span style={{ color: "#ef4444" }}>*</span></label>
                            <input 
                              type="date" 
                              required
                              className="form-control" 
                              style={{ width: "100%", margin: 0 }} 
                              value={newAirdrop.endDate} 
                              onChange={(e) => setNewAirdrop({...newAirdrop, endDate: e.target.value})} 
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>End Time <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <select className="form-control" style={{ flex: 1, margin: 0, padding: "8px 6px" }} value={newAirdrop.endTimeHour} onChange={(e) => setNewAirdrop({...newAirdrop, endTimeHour: e.target.value})}>
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              <span style={{ color: "var(--text-muted, #64748b)" }}>:</span>
                              <select className="form-control" style={{ flex: 1, margin: 0, padding: "8px 6px" }} value={newAirdrop.endTimeMinute} onChange={(e) => setNewAirdrop({...newAirdrop, endTimeMinute: e.target.value})}>
                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <select className="form-control" style={{ flex: 1, margin: 0, padding: "8px 6px" }} value={newAirdrop.endTimeAmPm} onChange={(e) => setNewAirdrop({...newAirdrop, endTimeAmPm: e.target.value})}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Time Limit (minutes) <span style={{ color: "#ef4444" }}>*</span></label>
                          <input 
                            type="number" 
                            required
                            min="1"
                            className="form-control" 
                            style={{ width: "100%", margin: 0 }} 
                            value={newAirdrop.timeLimit} 
                            onChange={(e) => setNewAirdrop({...newAirdrop, timeLimit: e.target.value})} 
                          />
                        </div>
                      </div>

                      {/* Winners & Rewards Section */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                          <Gift size={16} />
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>Winners & Rewards</h4>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Total Winners <span style={{ color: "#ef4444" }}>*</span></label>
                            <select 
                              className="form-control" 
                              style={{ width: "100%", margin: 0 }} 
                              value={newAirdrop.winners} 
                              onChange={(e) => {
                                const w = parseInt(e.target.value);
                                const newPoints = Array(w).fill("");
                                // Retain values if possible
                                for (let i = 0; i < Math.min(w, newAirdrop.points.length); i++) {
                                  newPoints[i] = newAirdrop.points[i];
                                }
                                setNewAirdrop({...newAirdrop, winners: e.target.value, points: newPoints});
                              }}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span style={{ fontSize: "11px", color: "var(--text-muted, #64748b)", display: "block", marginTop: "4px" }}>Exact number of winners to be selected</span>
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Points Per Rank <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {Array.from({ length: parseInt(newAirdrop.winners) }).map((_, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: 500, width: "60px" }}>Rank {i + 1}</span>
                                  <input 
                                    type="number" 
                                    required 
                                    className="form-control" 
                                    style={{ flex: 1, margin: 0, padding: "8px 12px" }} 
                                    value={newAirdrop.points[i] || ""} 
                                    placeholder="Enter points"
                                    onChange={(e) => {
                                      const newPoints = [...newAirdrop.points];
                                      newPoints[i] = e.target.value;
                                      setNewAirdrop({...newAirdrop, points: newPoints});
                                    }} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Modal Footer */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px", borderTop: "1px solid #f1f5f9", backgroundColor: "var(--bg-surface-elevated, #f8fafc)" }}>
                      <button type="button" className="btn btn-secondary" style={{ padding: "10px 20px" }} onClick={() => setShowAirdropModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>Create Airdrop</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      }
      case "Tickets":
        if (selectedTicket) {
          return (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button className="btn btn-secondary" onClick={() => navigate("/mentor/tickets")}>Back to Tickets</button>
                  <h3 style={{ margin: 0 }}>Ticket {selectedTicket.id}</h3>
                  <span className={`badge ${selectedTicket.status === 'Resolved' ? 'badge-success' : 'badge-primary'}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981", padding: "4px 10px", fontSize: "13px" }} onClick={() => handleUpdateTicketStatus("Resolved")}>Mark as Resolved</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>User</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.user || selectedTicket.creator_name || selectedTicket.user_name || "Intern"}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Filed On</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.date || (selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleDateString() : "Recently")}</div>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#1f2937" }}>{selectedTicket.title}</h4>
                <div style={{ padding: "16px", backgroundColor: "var(--bg-surface, #ffffff)", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>
                  {selectedTicket.description}
                </div>
              </div>

              <div>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Comments & Updates</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {(() => {
                    let commentsList = [];
                    if (selectedTicket.comments && Array.isArray(selectedTicket.comments)) {
                      commentsList = selectedTicket.comments;
                    } else if (selectedTicket.messages && Array.isArray(selectedTicket.messages)) {
                      commentsList = selectedTicket.messages.map(m => ({ author: m.sender_name || "User", text: m.message }));
                    } else if (typeof selectedTicket.comments === "string") {
                      try { commentsList = JSON.parse(selectedTicket.comments); } catch (e) { commentsList = []; }
                    }

                    if (commentsList.length === 0) {
                      return <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>No comments yet.</p>;
                    }

                    return commentsList.map((comment, idx) => (
                      <div key={idx} style={{ padding: "12px", backgroundColor: (comment.author === "Mentor" || comment.sender_role === "mentor") ? "#eff6ff" : "#f3f4f6", borderRadius: "8px", border: `1px solid ${(comment.author === "Mentor" || comment.sender_role === "mentor") ? "#bfdbfe" : "#e5e7eb"}` }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: (comment.author === "Mentor" || comment.sender_role === "mentor") ? "#1d4ed8" : "#374151", marginBottom: "4px" }}>{comment.author || comment.sender_name || "User"}</div>
                        <div style={{ fontSize: "13px", color: "#1f2937" }}>{comment.text || comment.message}</div>
                      </div>
                    ));
                  })()}
                </div>
                <form onSubmit={handleReplyTicket} style={{ display: "flex", gap: "10px" }}>
                  <input type="text" className="form-control" placeholder="Write a reply or update..." value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
                  <button type="submit" className="btn btn-primary">Send Reply</button>
                </form>
              </div>
            </div>
          );
        }

        return (
          <div className="card">
            <h3>Support Tickets</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Manage issues and support requests assigned to you.</p>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>User</th>
                    <th>Issue Title</th>
                    <th>Status</th>
                    <th>Date Filed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td><span style={{ fontWeight: 600, color: "#1f2937" }}>{ticket.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ticket.user}</div>
                      </td>
                      <td><span style={{ color: "#4b5563" }}>{ticket.title}</span></td>
                      <td>
                        <span className={`badge ${ticket.status === 'Resolved' ? 'badge-success' : 'badge-primary'}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td><span style={{ fontSize: "12px", color: "#6b7280" }}>{ticket.date}</span></td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => navigate("/mentor/tickets/" + ticket.id)}>View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Credentials":
        return (
          <div className="card">
            <h3 style={{ marginBottom: "16px" }}>Certificate Credentials Panel</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Manage 30-day completion certificates for your interns.</p>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Intern Name</th>
                    <th>Batch</th>
                    <th>Domain</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {credentialInterns.map(intern => (
                    <tr key={intern.id}>
                      <td style={{ fontWeight: 600 }}>{intern.name}</td>
                      <td>{intern.batch}</td>
                      <td>{intern.domain}</td>
                      <td><span style={{ fontWeight: 700, color: "var(--primary-color)" }}>{intern.grade}</span></td>
                      <td>
                        <span className={`badge ${intern.status === 'Approved' ? 'badge-success' : intern.status === 'Requested' ? 'badge-primary' : 'badge-warning'}`}>
                          {intern.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: "4px 12px", fontSize: "12px" }}
                          onClick={() => navigate("/mentor/credentials/" + intern.id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCredentialIntern && (
              <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
                <div style={{ backgroundColor: "#fff", width: "500px", maxWidth: "90%", borderRadius: "12px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-dark)" }}>30-Day Summary Report</h2>
                    <button onClick={() => navigate("/mentor/credentials")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={16} /></button>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-gray)", fontWeight: 600 }}>Intern Name:</span>
                      <span style={{ fontWeight: 700 }}>{selectedCredentialIntern.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-gray)", fontWeight: 600 }}>Domain:</span>
                      <span>{selectedCredentialIntern.domain}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-gray)", fontWeight: 600 }}>Attendance:</span>
                      <span>{selectedCredentialIntern.attendance}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-gray)", fontWeight: 600 }}>Tasks Completed:</span>
                      <span>{selectedCredentialIntern.tasksCompleted}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--text-gray)", fontWeight: 600 }}>Overall Grade:</span>
                      <span style={{ fontWeight: 800, color: "var(--primary-color)" }}>{selectedCredentialIntern.grade}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button onClick={() => navigate("/mentor/credentials")} className="btn btn-secondary">Cancel</button>
                    {selectedCredentialIntern.status === "Eligible" && (
                      <button onClick={() => handleRequestCertificate(selectedCredentialIntern.id)} className="btn btn-primary">Request Certificate</button>
                    )}
                    {selectedCredentialIntern.status !== "Eligible" && (
                      <button disabled className="btn btn-secondary" style={{ opacity: 0.7 }}>Already Requested</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "Bonus Airdrops":
        return (
          <div style={{ padding: "16px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: "20px", padding: "32px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", backgroundColor: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "20px", display: "inline-block", marginBottom: "12px" }}>Mentor View</span>
                <h2 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 8px 0" }}>Bonus Airdrops Overview</h2>
                <p style={{ margin: 0, opacity: 0.8, fontSize: "15px", maxWidth: "500px" }}>Monitor the exclusive challenges and pop quizzes assigned to your interns.</p>
              </div>
              <div style={{ width: "80px", height: "80px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coins size={40} color="#fcd34d" />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button 
                className={`btn ${airdropTab === "Active" ? "btn-primary" : "btn-secondary"}`} 
                onClick={() => navigate("/mentor/bonus-airdrops/active")}
                style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 600 }}
              >
                Active Airdrops ({activeDrops.length})
              </button>
              <button 
                className={`btn ${airdropTab === "Completed" ? "btn-primary" : "btn-secondary"}`} 
                onClick={() => navigate("/mentor/bonus-airdrops/completed")}
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
                      <div key={drop.id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "70%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", color: "#be185d", fontWeight: 700, backgroundColor: "#fdf2f8", padding: "2px 8px", borderRadius: "4px", border: "1px solid #fbcfe8", display: "inline-flex", alignItems: "center" }}>
                              <Gift size={12} style={{ marginRight: "4px" }} /> POP QUIZ
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                              {drop.timeLimit}s time limit
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-darker)", fontWeight: 500 }}>{drop.question}</p>
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
                      <div key={drop.id} style={{ backgroundColor: "var(--bg-gray-lighter, #f8fafc)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "70%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, backgroundColor: "var(--border-color, #e2e8f0)", padding: "2px 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              FINISHED
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-color)", fontWeight: 500, opacity: 0.8 }}>{drop.question}</p>
                        </div>
                        <div style={{ backgroundColor: "var(--border-color, #e2e8f0)", padding: "6px 12px", borderRadius: "6px", color: "#475569", fontSize: "12px", fontWeight: 600 }}>
                          Challenge Ended
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "My Profile":
        return <MentorProfile />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background-color, #f8fafc)", display: "flex", flexDirection: "column" }}>
      {/* Top Monolithic Webpage Hub Header */}
      <header style={{ 
        height: "70px", 
        backgroundColor: "var(--card-bg, #ffffff)", 
        borderBottom: "1px solid var(--border-color, #e2e8f0)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        {/* Brand Logo & Portal Tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--primary-color, #2563eb)", letterSpacing: "-0.5px" }}>
            ProEduvate
          </h2>
          <span style={{ fontSize: "12px", fontWeight: 600, backgroundColor: "#ecfdf5", color: "#047857", padding: "4px 10px", borderRadius: "12px" }}>
            Mentor Panel
          </span>
        </div>

        {/* Module Access Navigation Hub (Monolithic Pill Bar) */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--bg-light, #f1f5f9)", padding: "4px", borderRadius: "28px" }}>
          {[
            { id: "Overview", icon: <LayoutDashboard size={16} /> },
            { id: "Cohort", icon: <Users size={16} /> },
            { id: "Evaluations", icon: <ClipboardList size={16} /> },
            { id: "Tickets", icon: <Headset size={16} /> },
            { id: "Programs", icon: <Layers size={16} /> },
            { id: "Bonus Airdrops", icon: <Coins size={16} /> },
            { id: "Credentials", icon: <Award size={16} /> },
            { id: "Breakout Rooms", icon: <Video size={16} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(`/mentor/${tab.id.toLowerCase().replace(/\\s+/g, '-')}`);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "500",
                  backgroundColor: isActive ? "var(--primary-color, #2563eb)" : "transparent",
                  color: isActive ? "var(--bg-surface, #ffffff)" : "var(--text-color, #475569)",
                  boxShadow: isActive ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ color: isActive ? "var(--bg-surface, #ffffff)" : "inherit" }}>{tab.icon}</span>
                <span style={{ color: isActive ? "var(--bg-surface, #ffffff)" : "inherit" }}>{tab.id}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions & Utilities */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {activeTab === "Bonus Airdrops" && (
            <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "13px" }} onClick={() => setShowAirdropModal(true)}>
              + Create Airdrop
            </button>
          )}

          {/* Notifications */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <div onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} color="var(--text-gray, #64748b)" />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
            </div>
            
            {showNotifications && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '12px', 
                width: '300px', 
                backgroundColor: 'var(--card-bg, #ffffff)', 
                borderRadius: '12px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                border: '1px solid var(--border-color, #e2e8f0)',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color, #e2e8f0)', fontWeight: 600, color: 'var(--text-dark, #0f172a)', backgroundColor: 'var(--bg-light, #f8fafc)' }}>
                  Notifications
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {mockNotifications.map(notif => (
                    <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color, #e2e8f0)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '14px', color: 'var(--text-color, #334155)', marginBottom: '4px' }}>{notif.text}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>{notif.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color, #cbd5e1)' }}></div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#ecfdf5", color: "#047857", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold", cursor: "pointer", userSelect: "none", overflow: "hidden", border: "1px solid #a7f3d0" }}
            >
              {currentUserProfile?.avatar_url ? (
                <img 
                  src={currentUserProfile.avatar_url} 
                  alt="Profile" 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    const initials = currentUserProfile?.name ? currentUserProfile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "DM";
                    e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23ecfdf5"/><text x="50%" y="55%" font-size="36" font-weight="bold" fill="%23047857" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`; 
                  }} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              ) : (
                currentUserProfile?.name 
                  ? currentUserProfile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) 
                  : "DM"
              )}
            </div>
            
            {isProfileDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "170px", zIndex: 100, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: "var(--bg-surface-elevated, #f8fafc)" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>{currentUserProfile?.name || "Mentor"}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted, #64748b)" }}>{currentUserProfile?.email || ""}</p>
                </div>
                <button
                  onClick={() => { setActiveTab("My Profile"); navigate("/mentor/my-profile"); setIsProfileDropdownOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "11px 16px", backgroundColor: "transparent", border: "none", color: "#334155", cursor: "pointer", textAlign: "left", fontSize: "14px", fontWeight: "500" }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <User size={16} /> My Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "11px 16px", backgroundColor: "transparent", border: "none", color: "#dc2626", cursor: "pointer", textAlign: "left", fontSize: "14px", fontWeight: "500" }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = "#fef2f2"}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Content (Full Width) */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 24px", width: "100%", boxSizing: "border-box" }}>

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease-out" }}>
          {isMeetingActive && (
            <div style={{ display: activeTab === "Breakout Rooms" ? "flex" : "none", flex: 1, minHeight: 0, width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <BreakoutRoomsApp 
                onRoomChange={(r) => setActiveMeetingRoom(r)} 
                onLeaveMeeting={() => {
                  setIsMeetingActive(false);
                  localStorage.setItem("breakout_meeting_active", "false");
                  setActiveTab("Overview");
                }}
              />
            </div>
          )}

          {activeTab !== "Breakout Rooms" ? renderContent() : (!isMeetingActive && renderLobby())}
        </div>
      </main>

      {/* Floating Minimized Call Widget (Bottom Right) */}
      {isMeetingActive && activeTab !== "Breakout Rooms" && (
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
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#f2f3f5", display: 'flex', alignItems: 'center', gap: '4px' }}>LIVE <span>&bull;</span> {activeMeetingRoom}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                onClick={() => {
                  setActiveTab("Breakout Rooms");
                  navigate("/mentor/breakout-rooms");
                }}
                style={{ background: "none", border: "none", color: "#b5bac1", cursor: "pointer", fontSize: "16px", padding: "2px 4px" }}
                title="Maximize to full meeting screen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          <div 
            onClick={() => {
              setActiveTab("Breakout Rooms");
              navigate("/mentor/breakout-rooms");
            }}
            style={{ padding: "20px 16px", textAlign: "center", backgroundColor: "#111214", cursor: "pointer" }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#5865f2", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "18px", margin: "0 auto 8px auto", boxShadow: "0 0 12px rgba(88,101,242,0.5)" }}>
              An
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#dbdee1", display: "block" }}>Ananya (You)</span>
            <span style={{ fontSize: "11px", color: "#949ba4", marginTop: "2px", display: "block" }}>Click widget to return to Breakout Rooms</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "#2b2d31", gap: "8px" }}>
            <button onClick={() => { setActiveTab("Breakout Rooms"); navigate("/mentor/breakout-rooms"); }} style={{ flex: 1, backgroundColor: "#5865f2", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <span>Return</span> <Maximize2 size={14} />
            </button>
            <button onClick={() => { setIsMeetingActive(false); localStorage.setItem("breakout_meeting_active", "false"); setActiveTab("Overview"); navigate("/mentor/overview"); }} style={{ backgroundColor: "#da373c", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Leave
            </button>
          </div>
        </div>
      )}

      {/* Floating Side Chat Popup */}
      {selectedInternForChat && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "320px",
          height: "450px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          {/* Chat Header */}
          <div style={{ padding: "12px 16px", backgroundColor: "var(--text-primary, #1e293b)", color: "var(--bg-surface, #ffffff)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", backgroundColor: "#10b981", borderRadius: "50%" }}></div>
              Chat with {selectedInternForChat}
            </div>
            <button onClick={() => setSelectedInternForChat(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "4px", display: "flex", alignItems: "center" }}><X size={16} /></button>
          </div>

          {/* Chat Messages */}
          <div style={{ flexGrow: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "var(--bg-surface-elevated, #f8fafc)" }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8", display: "block", marginBottom: "4px", textAlign: msg.sender === "You" ? "right" : "left" }}>
                  {msg.sender === "You" ? "" : `${msg.sender} - `}{msg.time}
                </span>
                <div style={{ 
                  backgroundColor: msg.sender === "You" ? "#3b82f6" : "var(--bg-surface, #ffffff)", 
                  color: msg.sender === "You" ? "var(--bg-surface, #ffffff)" : "var(--text-primary, #1e293b)", 
                  padding: "8px 12px", 
                  borderRadius: msg.sender === "You" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", 
                  border: msg.sender !== "You" ? "1px solid #e2e8f0" : "none",
                  fontSize: "13px",
                  lineHeight: "1.4"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} style={{ display: "flex", padding: "12px", borderTop: "1px solid #e2e8f0", backgroundColor: "var(--bg-surface, #ffffff)" }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={currentMessage} 
              onChange={(e) => setCurrentMessage(e.target.value)} 
              style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "20px", padding: "8px 16px", fontSize: "13px", outline: "none", backgroundColor: "var(--bg-surface-elevated, #f8fafc)" }} 
            />
            <button type="submit" style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "600", cursor: "pointer", marginLeft: "12px" }}>Send</button>
          </form>
        </div>
      )}

    </div>
  );
}
