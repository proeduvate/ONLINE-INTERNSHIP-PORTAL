import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, LineChart, Line } from "recharts";
import { LayoutDashboard, Users, ClipboardCheck, BookOpen, Gift, MonitorPlay, AlertTriangle, Trophy, Medal, Award, LogOut, Headset, Menu, Bot, Maximize2, ClipboardList, Clock, MessageSquare, Calendar, CheckCircle2, Code, X, Target, Video, Layers, Coins, Bell, ArrowLeft, Trash2, User, Laptop, ArrowRight, TrendingUp, CheckCircle } from "lucide-react";
import BreakoutRoomsApp from "../breakout-rooms/BreakoutRoomsApp";
import InternProfile from "./InternProfile";
import AdminLeaderboard from "./AdminLeaderboard";
import MentorProfile from "./MentorProfile";
import AdminAirdropDetails from "./AdminAirdropDetails";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import "../../styles/Dashboard.css";
export default function MentorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState("Main Meeting");
  const [isMeetingActive, setIsMeetingActive] = useState(() => {
    return localStorage.getItem("breakout_meeting_active") === "true";
  });
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [ticketsList, setTicketsList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");
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
  const [selectedAirdrop, setSelectedAirdrop] = useState(null);
  const [isSubmittingAirdrop, setIsSubmittingAirdrop] = useState(false);

  // Bonus Airdrops now fetched via API in fetchMentorData

  const handleCreateAirdrop = async (e) => {
    e.preventDefault();
    if (isSubmittingAirdrop) return;
    if (!newAirdrop.title.trim()) return alert("Please enter an airdrop title.");
    
    // Validate based on taskType
    let mappedTaskType = "mcq";
    let taskConfig = {};

    if (newAirdrop.taskType === "Multiple Choice") {
      if (!newAirdrop.question.trim()) return alert("Please enter the question.");
      if (!newAirdrop.mcqOptions.A.trim() || !newAirdrop.mcqOptions.B.trim() || !newAirdrop.mcqOptions.C.trim() || !newAirdrop.mcqOptions.D.trim()) {
        return alert("Please fill all MCQ options A, B, C, and D.");
      }
      if (!newAirdrop.correctAnswer) return alert("Please select the correct option.");
      
      mappedTaskType = "mcq";
      taskConfig = {
        question: newAirdrop.question,
        options: [newAirdrop.mcqOptions.A, newAirdrop.mcqOptions.B, newAirdrop.mcqOptions.C, newAirdrop.mcqOptions.D],
        correct_answer: newAirdrop.correctAnswer
      };
    } else if (newAirdrop.taskType === "Pattern / Sequence") {
      if (!newAirdrop.question.trim()) return alert("Please enter the pattern series.");
      if (!newAirdrop.correctAnswer.trim()) return alert("Please enter the correct answer.");
      mappedTaskType = "pattern";
      taskConfig = {
        question: newAirdrop.question,
        correct_answer: newAirdrop.correctAnswer
      };
    } else if (newAirdrop.taskType === "True / False") {
      if (!newAirdrop.question.trim()) return alert("Please enter the statement.");
      if (!newAirdrop.correctAnswer) return alert("Please select the correct answer (True or False).");
      mappedTaskType = "true_false";
      taskConfig = {
        statement: newAirdrop.question,
        correct_answer: newAirdrop.correctAnswer === "True"
      };
    } else if (newAirdrop.taskType === "Fill in the Blank") {
      if (!newAirdrop.question.trim()) return alert("Please enter the sentence with blank.");
      if (!newAirdrop.correctAnswer.trim()) return alert("Please enter the correct answer.");
      mappedTaskType = "fill_blank";
      taskConfig = {
        sentence: newAirdrop.question,
        correct_answer: newAirdrop.correctAnswer
      };
    } else if (newAirdrop.taskType === "Match the Following") {
      const invalidPair = newAirdrop.matchPairs.some(p => !p.key.trim() || !p.value.trim());
      if (invalidPair || newAirdrop.matchPairs.length === 0) {
        return alert("Please fill all Match pairs keys and values.");
      }
      mappedTaskType = "match";
      taskConfig = {
        pairs: newAirdrop.matchPairs.reduce((acc, pair) => { acc[pair.key] = pair.value; return acc; }, {})
      };
    } else if (newAirdrop.taskType === "Arrange in Order") {
      const invalidItem = newAirdrop.arrangeItems.some(item => !item.trim());
      if (invalidItem || newAirdrop.arrangeItems.length < 2) {
        return alert("Please fill all items in correct order. At least 2 items are required.");
      }
      mappedTaskType = "arrange";
      taskConfig = {
        correct_sequence: newAirdrop.arrangeItems
      };
    }

    if (!newAirdrop.startDate || !newAirdrop.endDate) {
      return alert("Please select start and end dates.");
    }

    const parseDateSafe = (dateStr, hr, min, ampm) => {
      let h = parseInt(hr, 10) || 0;
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      const hStr = h.toString().padStart(2, '0');
      const mStr = min.toString().padStart(2, '0');
      return new Date(`${dateStr}T${hStr}:${mStr}:00`);
    };

    const startIso = parseDateSafe(newAirdrop.startDate, newAirdrop.startTimeHour, newAirdrop.startTimeMinute, newAirdrop.startTimeAmPm).toISOString();
    const endIso = parseDateSafe(newAirdrop.endDate, newAirdrop.endTimeHour, newAirdrop.endTimeMinute, newAirdrop.endTimeAmPm).toISOString();

    const payload = {
      title: newAirdrop.title,
      description: "Bonus Airdrop created by mentor",
      task_type: mappedTaskType,
      task_config: taskConfig,
      domain: selectedDomain || null,
      batch_id: null,
      start_mode: "fixed",
      time_limit: parseInt(newAirdrop.timeLimit) || 60,
      start_time: startIso,
      end_time: endIso,
      points_distribution: newAirdrop.points.filter(p => p.trim() !== "").join(","),
      winner_count: parseInt(newAirdrop.winners) || 3
    };

    try {
      setIsSubmittingAirdrop(true);
      await api.post('/bonus-airdrops', payload);
      
      // Refresh airdrops list
      const res = await api.get('/bonus-airdrops');
      setBonusAirdrops(res.data.map(a => {
        const startDate = a.start_time ? new Date(a.start_time).toLocaleDateString() : "";
        const startTime = a.start_time ? new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
        const endDate = a.end_time ? new Date(a.end_time).toLocaleDateString() : "";
        const endTime = a.end_time ? new Date(a.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
        
        let frontendTaskType = a.task_type;
        let questionText = a.title || "No Title";
        if (a.task_type === 'mcq') {
          frontendTaskType = 'Multiple Choice';
          questionText = a.task_config?.question || questionText;
        } else if (a.task_type === 'pattern') {
          frontendTaskType = 'Pattern / Sequence';
          questionText = a.task_config?.question || questionText;
        } else if (a.task_type === 'true_false') {
          frontendTaskType = 'True / False';
          questionText = a.task_config?.statement || questionText;
        } else if (a.task_type === 'fill_blank') {
          frontendTaskType = 'Fill in the Blank';
          questionText = a.task_config?.sentence || questionText;
        } else if (a.task_type === 'match') {
          frontendTaskType = 'Match the Following';
          questionText = "Match the following pairs correctly.";
        } else if (a.task_type === 'arrange') {
          frontendTaskType = 'Arrange in Order';
          questionText = "Arrange the items in the correct sequence.";
        }

        return {
          ...a,
          id: a.id,
          question: questionText,
          points: a.points_distribution ? a.points_distribution.split(",") : ["0"],
          status: a.status,
          timeLimit: a.time_limit,
          taskType: frontendTaskType,
          startMode: a.start_mode === 'fixed' ? 'Fixed Start Time' : 'Flexible Start',
          startDate,
          startTime,
          endDate,
          endTime,
          mcqOptions: a.task_config?.options,
          correctAnswer: a.task_config?.correct_answer,
          matchPairs: a.task_config?.pairs ? Object.entries(a.task_config.pairs).map(([k, v]) => ({ key: k, value: v })) : [],
          arrangeItems: a.task_config?.correct_sequence || []
        };
      }));

      setShowAirdropModal(false);
      setNewAirdrop(defaultAirdropState);
      alert("Bonus Airdrop created and sent to Admin for approval!");
    } catch (err) {
      console.error("Failed to create airdrop:", err);
      alert("Failed to create airdrop. Check console for details.");
    } finally {
      setIsSubmittingAirdrop(false);
    }
  };

  // State from DB
  const [dashboardStats, setDashboardStats] = useState({
    assigned_interns_count: 0,
    pending_reviews_count: 0,
    meetings_today_count: 0,
    avg_performance: 0,
    backlog_data: [],
    at_risk_interns: []
  });
  const [assignedInterns, setAssignedInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [chartData, setChartData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedChartInternId, setSelectedChartInternId] = useState("");


  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      const mappedTickets = res.data.map(t => {
        const dateObj = new Date(t.created_at);
        return {
          ...t,
          user: t.creator_name || "Unknown",
          role: "Intern",
          date: dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          assigned_to: t.assigned_to
        };
      });
      setTicketsList(mappedTickets);
    } catch (err) {
      console.error("Failed to fetch mentor tickets", err);
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicket) return;
    try {
      await api.patch(`/tickets/${selectedTicket.id}`, { message: ticketReply });
      setTicketReply("");
      fetchTickets();
      setSelectedTicket({
        ...selectedTicket,
        messages: [
          ...(selectedTicket.messages || []),
          { sender_role: "Mentor", sender_name: "You", message: ticketReply }
        ]
      });
    } catch (err) {
      console.error("Failed to reply", err);
      alert("Failed to send reply");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
  

  const fetchMentorData = async () => {
      try {
        const [statsRes, internsRes, subsRes, meetRes, tasksRes, airdropsRes, usersRes] = await Promise.all([
          api.get('/mentor/dashboard'),
          api.get('/mentor/interns'),
          api.get('/mentor/submissions'),
          api.get('/mentor/meetings'),
          api.get('/tasks'),
          api.get('/bonus-airdrops'),
          api.get('/users').catch(() => ({ data: [] }))
        ]);
        
        setDashboardStats(statsRes.data);
        setAssignedInterns(internsRes.data);
        setAllUsers(usersRes.data || []);
        if (internsRes.data && internsRes.data.length > 0) {
          setSelectedChartInternId(internsRes.data[0].db_id);
        }
        setSubmissions(subsRes.data);
        setMeetings(meetRes.data);

        const fetchedTasks = tasksRes.data;
        
        const domains = [...new Set(fetchedTasks.map(t => t.domain_name).filter(Boolean))];
        setAvailableDomains(domains);
        if (domains.length > 0) setSelectedDomain(domains[0]);

        setAllTasks(fetchedTasks.map(t => ({
          id: t.id,
          title: t.title,
          day_number: t.day_number,
          domain_name: t.domain_name,
          difficulty: "Medium",
          deadline: t.deadline_days ? `${t.deadline_days} days` : "Flexible",
          status: "Active",
          type: t.task_type === 'coding' ? 'Coding' : t.task_type === 'mcq' ? 'MCQ' : 'Curriculum',
          resources: t.resources || "No resources",
          mcqs: t.mcq_questions ? (typeof t.mcq_questions === "string" ? JSON.parse(t.mcq_questions) : t.mcq_questions) : [],
          codingQuestion: {
            title: `${t.title} Challenge`,
            description: t.description || "Complete the coding challenge.",
            starterCode: t.coding_prompt || "",
            expectedOutput: "Valid execution based on requirements"
          }
        })));

        const fetchedAirdrops = airdropsRes.data;
        setBonusAirdrops(fetchedAirdrops.map(a => {
          const startDate = a.start_time ? new Date(a.start_time).toLocaleDateString() : "";
          const startTime = a.start_time ? new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
          const endDate = a.end_time ? new Date(a.end_time).toLocaleDateString() : "";
          const endTime = a.end_time ? new Date(a.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
          
          let frontendTaskType = a.task_type;
          let questionText = a.title || "No Title";
          if (a.task_type === 'mcq') {
            frontendTaskType = 'Multiple Choice';
            questionText = a.task_config?.question || questionText;
          } else if (a.task_type === 'pattern') {
            frontendTaskType = 'Pattern / Sequence';
            questionText = a.task_config?.question || questionText;
          } else if (a.task_type === 'true_false') {
            frontendTaskType = 'True / False';
            questionText = a.task_config?.statement || questionText;
          } else if (a.task_type === 'fill_blank') {
            frontendTaskType = 'Fill in the Blank';
            questionText = a.task_config?.sentence || questionText;
          } else if (a.task_type === 'match') {
            frontendTaskType = 'Match the Following';
            questionText = "Match the following pairs correctly.";
          } else if (a.task_type === 'arrange') {
            frontendTaskType = 'Arrange in Order';
            questionText = "Arrange the items in the correct sequence.";
          }

          return {
            ...a,
            id: a.id,
            question: questionText,
            points: a.points_distribution ? a.points_distribution.split(",") : ["0"],
            status: a.status,
            timeLimit: a.time_limit,
            taskType: frontendTaskType,
            startMode: a.start_mode === 'fixed' ? 'Fixed Start Time' : 'Flexible Start',
            startDate,
            startTime,
            endDate,
            endTime,
            mcqOptions: a.task_config?.options,
            correctAnswer: a.task_config?.correct_answer,
            matchPairs: a.task_config?.pairs ? Object.entries(a.task_config.pairs).map(([k, v]) => ({ key: k, value: v })) : [],
            arrangeItems: a.task_config?.correct_sequence || []
          };
        }));

      } catch (error) {
        console.error("Failed to fetch mentor data:", error);
      } finally {
        setLoadingInterns(false);
      }
    };
    fetchMentorData();
  }, [navigate]);

  useEffect(() => {
    if (selectedChartInternId) {
      api.get(`/analytics/daily-questions/intern/${selectedChartInternId}`)
        .then(res => {
          const mappedData = res.data.map(item => ({
            date: item.date,
            CodingScore: item.coding_score,
            MCQScore: item.mcq_score,
            FinalScore: item.final_score
          }));
          setChartData(mappedData);
        })
        .catch(err => console.error("Failed to fetch daily analytics", err));
    }
  }, [selectedChartInternId]);

  const [chatMessages, setChatMessages] = useState([]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedInternForChat, setSelectedInternForChat] = useState(null);

  const handleEvaluationSubmit = (action) => {
    if (!selectedEvaluation) return;
    
    const payload = {
      action: action,
      score: action === "Approve" ? 10 : 0,
      feedback: action === "Approve" ? "Great job, code looks good!" : "Needs revision. Please check feedback."
    };

    api.put(`/mentor/submissions/${selectedEvaluation.id}/review`, payload)
      .then(() => {
        // Remove from pending UI
        setSubmissions(submissions.map(s => s.id === selectedEvaluation.id ? {...s, status: action === "Approve" ? "Approved" : "Rejected"} : s));
        setSelectedEvaluation(null);
        // Refresh stats
        api.get('/mentor/dashboard').then(res => setDashboardStats(res.data));
      })
      .catch(err => console.error("Failed to submit review:", err));
  };

  // Weekly review state inputs
  const [weeklyIntern, setWeeklyIntern] = useState("");
  const [weeklyStrengths, setWeeklyStrengths] = useState("");
  const [weeklyWeaknesses, setWeeklyWeaknesses] = useState("");
  const [weeklyNotes, setWeeklyNotes] = useState("");

  const [mentorDomain] = useState("Artificial Intelligence");
  // Curriculum and Tasks data is now populated dynamically via API
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [taskDetailTab, setTaskDetailTab] = useState("MCQ"); // "MCQ" or "Coding"
  const [detailSubTab, setDetailSubTab] = useState("Curriculum");


  // Chart Data
  const backlogData = dashboardStats.backlog_data || [];

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
      await api.put(`/mentor/submissions/${id}/review`, { action, score: parseInt(score), feedback });
      setSubmissions(submissions.map(sub => 
        sub.id === id 
          ? { ...sub, status: action === "Approve" ? "Approved" : "Rejected", score: score, mentorFeedback: feedback } 
          : sub
      ));
      alert(`Submission has been ${action === "Approve" ? "Approved" : "Rejected"}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to review submission");
    }
  };

  const handleCreateMeeting = async (title, time) => {
    if (!title || !time) return alert("Fill in title & time!");
    try {
      const response = await api.post('/mentor/meetings', { title, time });
      setMeetings([...meetings, response.data]);
      alert("Meeting created!");
    } catch (err) {
      console.error(err);
      alert("Failed to create meeting");
    }
  };

  const handleWeeklySubmit = (e) => {
    e.preventDefault();
    alert(`Weekly Review Logged for ${weeklyIntern}!\nStrengths: ${weeklyStrengths}\nWeaknesses: ${weeklyWeaknesses}`);
    setWeeklyStrengths("");
    setWeeklyWeaknesses("");
    setWeeklyNotes("");
  };

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
                <span className="stat-value">{dashboardStats.assigned_interns_count}</span>
                <span className="stat-desc">Tracking active progression</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <span className="stat-title">Pending Reviews</span>
                <span className="stat-value">{dashboardStats.pending_reviews_count}</span>
                <span className="stat-desc">Awaiting your feedback & score</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <span className="stat-title">Meetings Today</span>
                <span className="stat-value">{dashboardStats.meetings_today_count}</span>
                <span className="stat-desc">Review meetings scheduled</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <span className="stat-title">Average Performance</span>
                <span className="stat-value">{dashboardStats.avg_performance}%</span>
                <span className="stat-desc">Calculated score of assigned cohort</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "16px" }}>
              <div className="card animate-slide-up" style={{ margin: 0, paddingBottom: 0, animationDelay: '0.5s' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "16px", margin: 0 }}>Daily Question Analytics</h3>
                  <select 
                    className="form-control" 
                    style={{ width: "150px", fontSize: "12px", padding: "4px 8px" }}
                    value={selectedChartInternId}
                    onChange={(e) => setSelectedChartInternId(e.target.value)}
                  >
                    {assignedInterns.map(intern => (
                      <option key={intern.db_id} value={intern.db_id}>{intern.name}</option>
                    ))}
                  </select>
                </div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={225}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 11 }} 
                        dy={10}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        name="Coding Score"
                        dataKey="CodingScore" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        name="Final Score"
                        dataKey="FinalScore" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        name="MCQ Score"
                        dataKey="MCQScore" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "225px", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "14px" }}>
                    No daily question data available for this intern.
                  </div>
                )}
              </div>

              <div className="card animate-slide-up" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#eff6ff", borderColor: "#bfdbfe", animationDelay: '0.6s' }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "8px" }}><MessageSquare size={18} /> Assigned Tickets</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                  {ticketsList.filter(t => t.status !== "Resolved" && t.status !== "Closed").length === 0 ? (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "14px", fontStyle: "italic", textAlign: "center", padding: "20px" }}>
                      No open tickets assigned to you.
                    </div>
                  ) : (
                    ticketsList.filter(t => t.status !== "Resolved" && t.status !== "Closed").map((ticket, idx) => (
                      <div key={idx} style={{ backgroundColor: "var(--bg-surface, #ffffff)", padding: "12px", borderRadius: "8px", border: "1px solid #93c5fd", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#1e3a8a", fontWeight: 700 }}>Ticket #{ticket.id}</span>
                          <span className={`badge ${ticket.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: "10px", padding: "2px 6px" }}>{ticket.status}</span>
                        </div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#475569", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ticket.subject}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                           <span style={{ fontSize: "11px", color: "#6b7280" }}>{ticket.user}</span>
                           <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "11px" }} onClick={() => { setActiveTab("Tickets"); setSelectedTicket(ticket); }}>View Ticket</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", flex: 1, minHeight: 0 }}>
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
                <AdminLeaderboard usersList={allUsers.length > 0 ? allUsers : assignedInterns.map(i => ({...i, role: 'Intern'}))} isOverview={true} />
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
                            <button onClick={() => handleCreateMeeting(`${i.name} - Code Review`, "Tomorrow, 2:00 PM")} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }}>
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
                            <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={() => setSelectedEvaluation(sub)}>Review</button>
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
                    <button onClick={() => setSelectedEvaluation(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}><X size={16} /></button>
                  </div>
                  
                  <div className="dashboard-grid-half" style={{ marginBottom: "20px" }}>
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

                  <div className="dashboard-grid-1-2" style={{ marginBottom: "20px" }}>
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
                      setSelectedEvaluation(null);
                    }} className="btn btn-secondary" style={{ color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "#fef2f2", padding: "10px 24px", fontWeight: 600 }}>Reject</button>
                    <button onClick={() => {
                      const score = document.getElementById("modalTempScore").value;
                      const feedback = document.getElementById("modalTempFeedback").value;
                      handleReviewSubmission(selectedEvaluation.id, "Approve", score || "80%", feedback || "Approved");
                      setSelectedEvaluation(null);
                    }} className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981", padding: "10px 24px", fontWeight: 600 }}>Approve</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "Programs":
        const domainTasks = allTasks.filter(t => t.domain_name === selectedDomain);
        const mcqTasks = domainTasks.filter(t => t.type === "MCQ").sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
        const codingTasks = domainTasks.filter(t => t.type === "Coding").sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

        // Group curriculum by day for a cleaner view
        const curriculumDays = [...new Set(domainTasks.map(t => t.day_number))].sort((a,b) => a - b);

        return (
          <div className="card">
            <h3 style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "12px" }}>
              Program Details
              <select 
                className="form-control" 
                style={{ width: "auto", margin: 0, fontSize: "14px", padding: "4px 8px" }} 
                value={selectedDomain} 
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {availableDomains.length > 0 ? (
                  availableDomains.map(d => <option key={d} value={d}>{d}</option>)
                ) : (
                  <option value="">No Domains Found</option>
                )}
              </select>
            </h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                className={`btn ${detailSubTab === "Curriculum" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setDetailSubTab("Curriculum")}
              >Curriculum</button>
              <button
                className={`btn ${detailSubTab === "MCQ" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setDetailSubTab("MCQ")}
              >MCQ Assessments</button>
              <button
                className={`btn ${detailSubTab === "Coding" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setDetailSubTab("Coding")}
              >Code Assessments</button>
            </div>

            {detailSubTab === "Curriculum" && (
              <div className="table-container" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                <table className="table">
                  <thead>
                    <tr><th>Day</th><th>Topic / Focus</th><th>Tasks/Resources</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {curriculumDays.map((day) => {
                      const dayTasks = domainTasks.filter(t => t.day_number === day);
                      const topicTask = dayTasks.find(t => t.type === "MCQ") || dayTasks[0];
                      return (
                        <tr key={day}>
                          <td style={{ width: "80px", fontWeight: "600", color: "#4b5563" }}>Day {day}</td>
                          <td><b>{topicTask?.title || `Day ${day} Content`}</b></td>
                          <td>{topicTask?.resources}</td>
                          <td>
                            <span className="badge badge-primary" style={{ fontSize: "10px" }}>Active</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {(detailSubTab === "MCQ" || detailSubTab === "Coding") && (
              <div>
                {editingTask ? (
                  <div className="card" style={{ backgroundColor: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ margin: 0 }}>Edit Task TSK-{editingTask.id}</h4>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className={`btn ${taskDetailTab === "General" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("General")} style={{ padding: "4px 12px", fontSize: "12px" }}>General</button>
                        {editingTask.type === "MCQ" && (
                          <button className={`btn ${taskDetailTab === "MCQ" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("MCQ")} style={{ padding: "4px 12px", fontSize: "12px" }}>MCQs ({editingTask.mcqs.length})</button>
                        )}
                        {editingTask.type === "Coding" && (
                          <button className={`btn ${taskDetailTab === "Coding" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("Coding")} style={{ padding: "4px 12px", fontSize: "12px" }}>Coding</button>
                        )}
                      </div>
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setAllTasks(allTasks.map(t => t.id === editingTask.id ? editingTask : t));
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
                            <input className="form-control" type="text" value={editingTask.deadline} onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})} />
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

                      {taskDetailTab === "MCQ" && editingTask.type === "MCQ" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
                          {editingTask.mcqs.length > 0 ? editingTask.mcqs.map((mcq, mi) => (
                            <div key={mcq.id || mi} style={{ backgroundColor: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Q{mi + 1}. Question</label>
                              <input className="form-control" style={{ marginBottom: "10px" }} value={mcq.question}
                                onChange={e => setEditingTask({ ...editingTask, mcqs: editingTask.mcqs.map((q, qi) => qi === mi ? { ...q, question: e.target.value } : q) })} />
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                {mcq.options && mcq.options.map((opt, oi) => (
                                  <div key={oi} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                    <span style={{ fontSize: "11px", width: "20px" }}>{["A","B","C","D"][oi] || oi}.</span>
                                    <input className="form-control" style={{ fontSize: "12px", padding: "4px 8px" }} value={opt}
                                      onChange={e => setEditingTask({ ...editingTask, mcqs: editingTask.mcqs.map((q, qi) => qi === mi ? { ...q, options: q.options.map((o, oii) => oii === oi ? e.target.value : o) } : q) })} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )) : <p style={{fontSize:"13px", color:"#666"}}>No MCQs configured for this task.</p>}
                        </div>
                      )}

                      {taskDetailTab === "Coding" && editingTask.type === "Coding" && (
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
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "10px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingTask(null)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                ) : viewingTask ? (
                  <div className="card" style={{ backgroundColor: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button className="btn btn-secondary" style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setViewingTask(null)}><ArrowLeft size={16} /> Back</button>
                        <h4 style={{ margin: 0 }}>View Task TSK-{viewingTask.id}: {viewingTask.title}</h4>
                        <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "12px", marginLeft: "8px" }} onClick={() => { setEditingTask(viewingTask); setViewingTask(null); setTaskDetailTab("General"); }}>Edit Task</button>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {viewingTask.type === "MCQ" && (
                          <button className={`btn ${taskDetailTab === "MCQ" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("MCQ")} style={{ padding: "4px 12px", fontSize: "12px" }}>MCQs ({viewingTask.mcqs.length})</button>
                        )}
                        {viewingTask.type === "Coding" && (
                          <button className={`btn ${taskDetailTab === "Coding" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTaskDetailTab("Coding")} style={{ padding: "4px 12px", fontSize: "12px" }}>Coding Challenge</button>
                        )}
                      </div>
                    </div>
                    
                    {taskDetailTab === "MCQ" && viewingTask.type === "MCQ" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "500px", overflowY: "auto", paddingRight: "8px" }}>
                        {viewingTask.mcqs.length > 0 ? viewingTask.mcqs.map((mcq, mi) => (
                          <div key={mcq.id || mi} style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Q{mi + 1}. {mcq.question}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                              {mcq.options && mcq.options.map((opt, oi) => (
                                <div key={oi} style={{ fontSize: "13px", padding: "8px 12px", borderRadius: "6px", backgroundColor: oi === mcq.answer ? "#dcfce7" : "#f1f5f9", border: `1px solid ${oi === mcq.answer ? "#86efac" : "transparent"}` }}>
                                  <span style={{ fontWeight: 600, marginRight: "8px" }}>{["A","B","C","D"][oi] || oi}.</span> {opt} {oi === mcq.answer && <span style={{ float: "right", color: "#16a34a", display: "flex" }}><CheckCircle2 size={16} /></span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )) : <p style={{fontSize:"13px", color:"#666"}}>No MCQs configured for this task.</p>}
                      </div>
                    )}

                    {taskDetailTab === "Coding" && viewingTask.type === "Coding" && (
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
                        <tr><th>ID</th><th>Day</th><th>Task Title</th><th>Difficulty</th><th>Deadline</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {(detailSubTab === "MCQ" ? mcqTasks : codingTasks).map((t) => (
                          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => { setViewingTask(t); setTaskDetailTab(t.type); }} className="hover-row">
                            <td style={{ color: "#6b7280", fontSize: "12px" }}>TSK-{t.id}</td>
                            <td>Day {t.day_number}</td>
                            <td><b>{t.title}</b></td>
                            <td><span className={`badge ${t.difficulty === "Hard" ? "badge-danger" : t.difficulty === "Medium" ? "badge-warning" : "badge-success"}`}>{t.difficulty}</span></td>
                            <td>{t.deadline}</td>
                            <td><span className={`badge ${t.status === "Completed" ? "badge-success" : t.status === "Active" ? "badge-primary" : "badge-secondary"}`} style={{ fontSize: "10px" }}>{t.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(detailSubTab === "MCQ" ? mcqTasks : codingTasks).length === 0 && (
                      <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>
                        No {detailSubTab === "MCQ" ? "MCQ" : "Coding"} Tasks found for this domain.
                      </div>
                    )}
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
              <div className="table-container" style={{ margin: 0, flex: 1, overflowY: "auto" }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 16px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)" }}>ID</th>
                      <th style={{ padding: "12px 16px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)" }}>Title</th>
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
                      currentAirdrops.map(airdrop => (
                        <tr key={airdrop.id} onClick={() => setSelectedAirdrop(airdrop)} style={{ cursor: "pointer" }} className="hover-row">
                          <td style={{ padding: "12px 16px", fontWeight: "600", color: "#475569" }}>{airdrop.id}</td>
                          <td style={{ padding: "12px 16px", fontWeight: "500", color: "#1e293b" }}>{airdrop.title ? (airdrop.title.length > 60 ? airdrop.title.substring(0, 60) + "..." : airdrop.title) : "No Title"}</td>
                          <td style={{ padding: "12px 16px", color: "#b91c1c", fontWeight: "600" }}>{Math.max(0, ...airdrop.points.map(Number))} pts</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span className={`badge ${airdrop.status === 'APPROVED' || airdrop.status === 'Active' || airdrop.status === 'ACTIVE' ? 'badge-primary' : airdrop.status === 'FINALIZED' || airdrop.status === 'Completed' || airdrop.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                              {airdrop.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6b7280" }}>{airdrop.timeLimit}s</td>
                        </tr>
                      ))
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

                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Time Limit (Seconds) <span style={{ color: "#ef4444" }}>*</span></label>
                          <input 
                            type="number" 
                            required 
                            min="10"
                            placeholder="e.g. 60" 
                            className="form-control" 
                            style={{ width: "100%", margin: 0, maxWidth: "200px" }} 
                            value={newAirdrop.timeLimit} 
                            onChange={(e) => setNewAirdrop({...newAirdrop, timeLimit: e.target.value})} 
                          />
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
                  <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Back to Tickets</button>
                  <h3 style={{ margin: 0 }}>Ticket {selectedTicket.id}</h3>
                  <span className={`badge ${selectedTicket.status === 'resolved' || selectedTicket.status === 'Resolved' ? 'badge-success' : selectedTicket.status === 'In Progress' || selectedTicket.status === 'in_progress' ? 'badge-warning' : 'badge-primary'}`} style={{ backgroundColor: selectedTicket.status === 'resolved' || selectedTicket.status === 'Resolved' ? '#d1fae5' : selectedTicket.status === 'In Progress' || selectedTicket.status === 'in_progress' ? '#fef3c7' : '#fee2e2', color: selectedTicket.status === 'resolved' || selectedTicket.status === 'Resolved' ? '#065f46' : selectedTicket.status === 'In Progress' || selectedTicket.status === 'in_progress' ? '#92400e' : '#991b1b', textTransform: 'capitalize' }}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {selectedTicket.status !== "resolved" && selectedTicket.status !== "Resolved" && selectedTicket.status !== "closed" && selectedTicket.status !== "Closed" && (
                    <button className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }} onClick={async () => {
                      try {
                        await api.patch(`/tickets/${selectedTicket.id}`, { action: "resolve", resolution: "Resolved by mentor" });
                        setSelectedTicket({ ...selectedTicket, status: "resolved" });
                        fetchTickets();
                      } catch (err) {
                        alert("Failed to resolve ticket");
                      }
                    }}>Mark as Resolved</button>
                  )}
                </div>
              </div>

              <div className="dashboard-grid-half" style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>User</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.user}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Domain</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.domain}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Filed On</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.date}</div>
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
                  {!(selectedTicket.messages?.length > 0) ? (
                    <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>No comments yet.</p>
                  ) : (
                    selectedTicket.messages.map((comment, idx) => (
                      <div key={idx} style={{ padding: "12px", backgroundColor: comment.sender_role === "Admin" || comment.sender_role === "Super Admin" ? "#eff6ff" : "#f3f4f6", borderRadius: "8px", border: `1px solid ${comment.sender_role === "Admin" || comment.sender_role === "Super Admin" ? "#bfdbfe" : "#e5e7eb"}` }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: comment.sender_role === "Admin" || comment.sender_role === "Super Admin" ? "#1d4ed8" : "#374151", marginBottom: "4px" }}>{comment.sender_name || comment.sender_role}</div>
                        <div style={{ fontSize: "13px", color: "#1f2937" }}>{comment.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleReplyTicket} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
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
                  {ticketsList.map((ticket) => (
                    <tr key={ticket.id}>
                      <td><span style={{ fontWeight: 600, color: "#1f2937" }}>{ticket.id}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ticket.user}</div>
                      </td>
                      <td><span style={{ color: "#4b5563" }}>{ticket.title}</span></td>
                      <td>
                        <span className={`badge ${ticket.status === 'Resolved' ? 'badge-success' : ticket.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`} style={{ backgroundColor: ticket.status === 'Resolved' ? '#d1fae5' : ticket.status === 'In Progress' ? '#fef3c7' : '#fee2e2', color: ticket.status === 'Resolved' ? '#065f46' : ticket.status === 'In Progress' ? '#92400e' : '#991b1b' }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td><span style={{ fontSize: "12px", color: "#6b7280" }}>{ticket.date}</span></td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => setSelectedTicket(ticket)}>View Details</button>
                      </td>
                    </tr>
                  ))}
                  {ticketsList.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No tickets assigned to you.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "My Profile":
        return <MentorProfile />;
      default:
        return null;
    }
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "var(--background-color, #f8fafc)", display: "flex", flexDirection: "column" }}>
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
            { id: "Overview", icon: <LayoutDashboard size={18} /> },
            { id: "Cohort", icon: <Users size={18} /> },
                        { id: "Evaluations", icon: <CheckCircle size={18} /> },
            { id: "Tickets", icon: <Headset size={18} /> },
            { id: "Programs", icon: <BookOpen size={18} /> },
            { id: "Bonus Airdrops", icon: <Coins size={18} /> },
            { id: "Breakout Rooms", icon: <Video size={18} /> },
            { id: "My Profile", icon: <User size={18} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
              style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#ecfdf5", color: "#047857", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold", cursor: "pointer", userSelect: "none" }}
            >
              DM
            </div>
            
            {isProfileDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "170px", zIndex: 100, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: "var(--bg-surface-elevated, #f8fafc)" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Dr. Ananya Menon</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted, #64748b)" }}>ananya@proedu.com</p>
                </div>
                <button
                  onClick={() => { setActiveTab("My Profile"); setIsProfileDropdownOpen(false); }}
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

      <main style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column", padding: "16px 24px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease-out", paddingRight: "8px" }}>
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
                onClick={() => setActiveTab("Breakout Rooms")}
                style={{ background: "none", border: "none", color: "#b5bac1", cursor: "pointer", fontSize: "16px", padding: "2px 4px" }}
                title="Maximize to full meeting screen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab("Breakout Rooms")}
            style={{ padding: "20px 16px", textAlign: "center", backgroundColor: "#111214", cursor: "pointer" }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#5865f2", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "18px", margin: "0 auto 8px auto", boxShadow: "0 0 12px rgba(88,101,242,0.5)" }}>
              An
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#dbdee1", display: "block" }}>Ananya (You)</span>
            <span style={{ fontSize: "11px", color: "#949ba4", marginTop: "2px", display: "block" }}>Click widget to return to Breakout Rooms</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: "#2b2d31", gap: "8px" }}>
            <button onClick={() => setActiveTab("Breakout Rooms")} style={{ flex: 1, backgroundColor: "#5865f2", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <span>Return</span> <Maximize2 size={14} />
            </button>
            <button onClick={() => { setIsMeetingActive(false); setActiveTab("Overview"); }} style={{ backgroundColor: "#da373c", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
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
