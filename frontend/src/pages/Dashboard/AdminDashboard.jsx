import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from "recharts";
import { LayoutDashboard, Users, BookOpen, Award, Bell, Search, Filter, ClipboardCheck, LifeBuoy, Gift, TrendingUp, Medal, LogOut, Menu, AlertTriangle, Calendar, GraduationCap, FileText, Receipt, CheckCircle2, MessageSquare, Target, BarChart3, ShieldCheck, LineChart, UserPlus, Layers, Headset, Coins, ListOrdered, User } from "lucide-react";
import AdminAnalytics from "./AdminAnalytics";
import AdminAirdropDetails from "./AdminAirdropDetails";
import AdminLeaderboard from "./AdminLeaderboard";
import AdminProfile from "./AdminProfile";
import AdminOnboardingList from "../../features/onboarding/admin/AdminOnboardingList";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import "../../styles/Dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
  };

  const mockNotifications = [
    { id: 1, text: "New intern registered", time: "5 mins ago" },
    { id: 2, text: "New support ticket created", time: "1 hour ago" },
    { id: 3, text: "Weekly performance report is ready", time: "2 hours ago" }
  ];

  // Bonus Airdrops State
  const [bonusAirdrops, setBonusAirdrops] = useState([]);
  const [selectedAirdrop, setSelectedAirdrop] = useState(null);
  const [refixAirdropModal, setRefixAirdropModal] = useState(null);
  const [refixStartDate, setRefixStartDate] = useState("");
  const [refixStartTime, setRefixStartTime] = useState("");
  const [refixEndDate, setRefixEndDate] = useState("");
  const [refixEndTime, setRefixEndTime] = useState("");

  const transformAirdrops = (data) => {
    return data.map(a => {
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
        rawEndTime: a.end_time,
        mcqOptions: a.task_config?.options,
        correctAnswer: a.task_config?.correct_answer,
        matchPairs: a.task_config?.pairs ? Object.entries(a.task_config.pairs).map(([k, v]) => ({ key: k, value: v })) : [],
        arrangeItems: a.task_config?.correct_sequence || []
      };
    });
  };

  const fetchAirdrops = async () => {
    try {
      const res = await api.get('/bonus-airdrops');
      setBonusAirdrops(transformAirdrops(res.data));
    } catch (err) {
      console.error("Failed to fetch airdrops:", err);
    }
  };

  const handleApproveAirdrop = async (id, newStartTime = null, newEndTime = null) => {
    try {
      const payload = {};
      if (newStartTime) payload.new_start_time = newStartTime;
      if (newEndTime) payload.new_end_time = newEndTime;
      
      await api.post(`/bonus-airdrops/admin/${id}/approve`, payload);
      alert("Airdrop published successfully!");
      fetchAirdrops();
      setSelectedAirdrop(null);
    } catch (error) {
      console.error("Failed to approve airdrop:", error);
      alert("Failed to approve airdrop: " + (error.response?.data?.detail || error.message));
    }
  };

  // State Mock Data
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [ticketsList, setTicketsList] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, tasksRes, statsRes, ticketsRes, domainsRes, airdropsRes] = await Promise.all([
          api.get('/users').catch(err => { console.error('Failed to fetch users:', err); return { data: [] }; }),
          api.get('/tasks').catch(err => { console.error('Failed to fetch tasks:', err); return { data: [] }; }),
          api.get('/admin/dashboard').catch(err => { console.error('Failed to fetch stats:', err); return { data: null }; }),
          api.get('/tickets').catch(err => { console.error('Failed to fetch tickets:', err); return { data: [] }; }),
          api.get('/domains').catch(err => { console.error('Failed to fetch domains:', err); return { data: [] }; }),
          api.get('/bonus-airdrops').catch(err => { console.error('Failed to fetch airdrops:', err); return { data: [] }; })
        ]);
        
        if (airdropsRes.data) {
          setBonusAirdrops(transformAirdrops(airdropsRes.data));
        }

        const domainMap = {};
        if (domainsRes && domainsRes.data) {
          domainsRes.data.forEach(d => { domainMap[d.id] = d.name; });
        }

        if (usersRes.data && usersRes.data.length > 0) {
          setUsersList(usersRes.data.map((user) => ({
            ...user,
            mentor: user.mentor_id ? "Assigned" : "Unassigned",
            domain: user.domain_id ? (domainMap[user.domain_id] || "Unknown") : "Unassigned",
            progress: "0%", 
            attendance: "N/A", 
            status: "Active"
          })));
        } else {
          setUsersList([]);
        }
        
        if (tasksRes.data) {
          setTasks(tasksRes.data.map(t => ({
            id: t.id,
            title: t.title,
            difficulty: t.difficulty || "Medium",
            deadline: `${t.deadline_days} Days`,
            domain: domainMap[t.domain_id] || "Unknown",  
            status: "Active",
            task_type: t.task_type || "curriculum",
            domain_id: t.domain_id
          })));
        }
        
        if (statsRes.data) {
          setDashboardStats(statsRes.data);
        }
        if (ticketsRes.data) {
          setTicketsList(ticketsRes.data.map(ticket => ({
            ...ticket,
            user: ticket.creator_name || `User ID: ${ticket.created_by}`,
            role: "Intern", // Defaulting as role isn't returned
            date: new Date(ticket.created_at).toLocaleDateString()
          })));
        }
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchDashboardData();
  }, []);

  const [domainsList, setDomainsList] = useState([
    { name: "Frontend", duration: "12 Weeks", interns: 14, mentors: 2, status: "Active" },
    { name: "Python", duration: "8 Weeks", interns: 12, mentors: 2, status: "Active" },
    { name: "Fullstack", duration: "10 Weeks", interns: 8, mentors: 1, status: "Active" },
    { name: "Java", duration: "8 Weeks", interns: 10, mentors: 3, status: "Active" },
    { name: "UI/UX", duration: "6 Weeks", interns: 6, mentors: 2, status: "Active" },
    { name: "AI/ML", duration: "10 Weeks", interns: 0, mentors: 0, status: "Active" },
    { name: "Data Analytics", duration: "8 Weeks", interns: 0, mentors: 0, status: "Active" },
  ]);

  // (tasks are populated from the backend on load)

  const [curriculumList, setCurriculumList] = useState([
    { day: "Day 1", topic: "Introduction to React", resources: "Video Link, Documentation PDF", domain: "Web Development" },
    { day: "Day 2", topic: "State and Props", resources: "Github Repo, Slides PDF", domain: "Web Development" },
  ]);

  const [meetings, setMeetings] = useState([
    { id: 1, title: "Mid-Term Review Meeting", time: "2026-08-08 10:00 AM", mentor: "Dr. Sakthi", link: "https://zoom.us/mock" },
  ]);

  // Chart Data
  const progressData = dashboardStats?.batch_progress || [];
  
  const domainData = usersList.reduce((acc, user) => {
    if (user.role && user.role.toLowerCase() === 'intern') {
      const d = user.domain || 'Unassigned';
      const existing = acc.find(item => item.name === d);
      if (existing) existing.value += 1;
      else acc.push({ name: d, value: 1 });
    }
    return acc;
  }, []);
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Form inputs
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Intern", college: "", domain: "", mentor: "" });
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [newMentor, setNewMentor] = useState({ name: "", email: "", domain: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", difficulty: "Medium", deadline: "", domain: "" });
  const [newCurriculum, setNewCurriculum] = useState({ day: "", topic: "", resources: "", domain: "Web Development" });
  const [newMeeting, setNewMeeting] = useState({ title: "", time: "", mentor: "", link: "" });
  
  // Onboarding state
  const [onboardingSubTab, setOnboardingSubTab] = useState("Resume");
  const [onboardingCandidates, setOnboardingCandidates] = useState([
    { id: "C001", name: "Alice Smith", domain: "Data Science", stage: "Resume", resumeLink: "#" },
    { id: "C002", name: "Bob Jones", domain: "Web Development", stage: "Interview", resumeLink: "#" },
    { id: "C003", name: "Charlie Brown", domain: "Cyber Security", stage: "Payment", resumeLink: "#" }
  ]);
  const [viewedDocs, setViewedDocs] = useState({});
  const [activeDocument, setActiveDocument] = useState(null);

  // Programs sub-tab state
  const [programsSubTab, setProgramsSubTab] = useState("Domains");
  const [selectedProgramDomain, setSelectedProgramDomain] = useState(null);
  const [detailSubTab, setDetailSubTab] = useState("Curriculum");
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [newDomain, setNewDomain] = useState({ name: "", duration: "" });

  // Users sub-tab state
  const [usersSubTab, setUsersSubTab] = useState("Interns"); // Interns, Mentors
  const [selectedBatch, setSelectedBatch] = useState("");
  const [internPage, setInternPage] = useState(1);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Tickets state
  // (ticketsList is initialized in the hook above)
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");
  const [assignedMentor, setAssignedMentor] = useState("");

  const refreshTickets = async () => {
    try {
      const ticketsRes = await api.get('/tickets');
      if (ticketsRes.data) {
        const updatedList = ticketsRes.data.map(ticket => ({
          ...ticket,
          user: ticket.creator_name || `User ID: ${ticket.created_by}`,
          role: "Intern",
          date: new Date(ticket.created_at).toLocaleDateString()
        }));
        setTicketsList(updatedList);
        if (selectedTicket) {
          const updated = updatedList.find(t => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error("Failed to refresh tickets", err);
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim()) return;
    try {
      await api.patch(`/tickets/${selectedTicket.id}`, { action: "message", message: ticketReply });
      setTicketReply("");
      await refreshTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  const handleUpdateTicketStatus = async (status) => {
    try {
      const action = status === "Resolved" ? "resolve" : "close";
      const payload = { action };
      
      if (action === "resolve") {
        const resolution = window.prompt("Enter resolution details (optional):") || "Resolved by admin";
        payload.resolution = resolution;
      } else if (action === "close") {
        const reason = window.prompt("Enter closure reason (optional):") || "Closed by admin";
        payload.closure_reason = reason;
      }

      await api.patch(`/tickets/${selectedTicket.id}`, payload);
      await refreshTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleAssignMentor = async () => {
    if (!assignedMentor) return alert("Please select a mentor.");
    try {
      await api.patch(`/tickets/${selectedTicket.id}`, { action: "assign", assigned_to: parseInt(assignedMentor) });
      setAssignedMentor("");
      alert("Mentor assigned successfully!");
      await refreshTickets();
    } catch (err) {
      console.error(err);
      alert("Failed to assign mentor");
    }
  };


  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name) return alert("Please specify user name.");
    const roleIdPrefix = newUser.role === "Intern" ? "INT" : "MNT";
    const randomId = roleIdPrefix + Math.floor(100 + Math.random() * 900);
    const added = {
      id: randomId,
      name: newUser.name,
      role: newUser.role,
      college: newUser.role === "Intern" ? newUser.college || "N/A" : "-",
      domain: newUser.domain || "General",
      mentor: newUser.role === "Intern" ? newUser.mentor || "Unassigned" : "-",
      progress: newUser.role === "Intern" ? "0%" : "-",
      attendance: "100%",
      status: "Active"
    };
    setUsersList([...usersList, added]);
    alert("User added successfully!");
    setNewUser({ name: "", email: "", role: "Intern", college: "", domain: "", mentor: "" });
  };

  const handleAddMentor = (e) => {
    e.preventDefault();
    if (!newMentor.name || !newMentor.email) return alert("Please specify name and email.");
    const added = {
      id: "MNT" + Math.floor(100 + Math.random() * 900),
      name: newMentor.name,
      role: "Mentor",
      college: "-",
      domain: newMentor.domain || "General",
      mentor: "-",
      progress: "-",
      attendance: "100%",
      status: "Active"
    };
    setUsersList([...usersList, added]);
    alert("Verification link sent to mentor's email!");
    setNewMentor({ name: "", email: "", domain: "" });
    setShowMentorModal(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return alert("Please specify task title.");
    try {
      const res = await api.post('/tasks', {
        title: newTask.title,
        description: newTask.description || "Task description",
        difficulty: newTask.difficulty,
        deadline_days: 7, // using a default
        domain_name: selectedProgramDomain || newTask.domain || "Web Development",
        day_number: tasks.length + 1
      });
      const created = {
        id: res.data.id,
        title: res.data.title,
        difficulty: res.data.difficulty || "Medium",
        deadline: `${res.data.deadline_days} Days`,
        domain: selectedProgramDomain || newTask.domain || "Web Development",
        status: "Active"
      };
      setTasks([...tasks, created]);
      alert("New task created and assigned successfully!");
      setNewTask({ title: "", description: "", difficulty: "Medium", deadline: "", domain: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create task: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleUploadCurriculum = (e) => {
    e.preventDefault();
    if (!newCurriculum.day || !newCurriculum.topic) return alert("Fill day & topic.");
    setCurriculumList([...curriculumList, newCurriculum]);
    alert("Curriculum content uploaded!");
    setNewCurriculum({ day: "", topic: "", resources: "", domain: "Web Development" });
  };

  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    if (!newMeeting.title) return alert("Enter meeting title.");
    const scheduled = {
      id: meetings.length + 1,
      title: newMeeting.title,
      time: newMeeting.time || "Immediate",
      mentor: newMeeting.mentor || "Dr. Sakthi",
      link: newMeeting.link || "https://zoom.us/mock"
    };
    setMeetings([...meetings, scheduled]);
    alert("Meeting scheduled!");
    setNewMeeting({ title: "", time: "", mentor: "", link: "" });
  };

  const toggleUserStatus = (id) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Deactivated" : "Active" } : u));
  };

  const moveCandidateStage = (id, newStage) => {
    setOnboardingCandidates(onboardingCandidates.map(c => c.id === id ? { ...c, stage: newStage } : c));
  };

  const enrollCandidate = (id) => {
    const candidate = onboardingCandidates.find(c => c.id === id);
    if (!candidate) return;
    const newIntern = {
      id: "INT" + Math.floor(100 + Math.random() * 900),
      name: candidate.name,
      role: "Intern",
      college: "N/A",
      domain: candidate.domain,
      mentor: "Unassigned",
      progress: "0%",
      attendance: "100%",
      status: "Active"
    };
    setUsersList([...usersList, newIntern]);
    setOnboardingCandidates(onboardingCandidates.filter(c => c.id !== id));
    alert(`${candidate.name} has been enrolled successfully!`);
  };

  const handleAddDomain = (e) => {
    e.preventDefault();
    if (!newDomain.name || !newDomain.duration) return alert("Fill all fields.");
    const added = {
      name: newDomain.name,
      duration: newDomain.duration,
      interns: 0,
      mentors: 0,
      status: "Active"
    };
    setDomainsList([...domainsList, added]);
    alert("New Domain Added Successfully!");
    setNewDomain({ name: "", duration: "" });
    setShowDomainModal(false);
  };

  const filteredUsers = usersList.filter(u => 
    (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.domain || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Analytics":
        return <AdminAnalytics usersList={usersList} />;
      case "Leaderboard":
        return <AdminLeaderboard usersList={usersList} />;
      case "Overview":
        return (
          <>
            <div className="grid">
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <span className="stat-title">Total Interns</span>
                <span className="stat-value">{dashboardStats?.total_interns || 0}</span>
                <span className="stat-desc">{dashboardStats?.active_interns || 0} Active / {dashboardStats ? dashboardStats.total_interns - dashboardStats.active_interns : 0} Inactive</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <span className="stat-title">Total Mentors</span>
                <span className="stat-value">{dashboardStats?.total_mentors || 0}</span>
                <span className="stat-desc">Assigned across domains</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <span className="stat-title">Active Domains</span>
                <span className="stat-value">{dashboardStats?.active_domains || 0}</span>
                <span className="stat-desc">In curriculum</span>
              </div>
              <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <span className="stat-title">Avg Performance</span>
                <span className="stat-value">{dashboardStats?.avg_performance || 0}%</span>
                <span className="stat-desc">Based on evaluations</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div className="card animate-slide-up" style={{ margin: 0, paddingBottom: "16px", animationDelay: '0.5s', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Batch-wise Progress Trend</h3>
                <div style={{ flex: 1, minHeight: "260px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dx={-10} />
                      <Tooltip 
                        cursor={{fill: '#f3f4f6'}} 
                        contentStyle={{ backgroundColor: 'var(--bg-surface, #ffffff)', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {(() => {
                        const batches = new Set();
                        progressData.forEach(d => {
                          Object.keys(d).filter(k => k !== 'name').forEach(k => batches.add(k));
                        });
                        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
                        return Array.from(batches).map((b, i) => (
                          <Bar key={b} dataKey={b} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
                        ));
                      })()}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card animate-slide-up" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%", animationDelay: '0.6s' }}>
                <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Intern Distribution by Domain</h3>
                <div style={{ flex: 1, padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: "260px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={domainData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar name="Interns" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-surface, #ffffff)', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="animate-slide-up" style={{ margin: 0, paddingBottom: 0, display: "flex", flexDirection: "column", height: "100%", animationDelay: '0.7s' }}>
                <AdminLeaderboard usersList={usersList} isOverview={true} />
              </div>

              <div className="card animate-slide-up" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff5f5", borderColor: "#fecaca", animationDelay: '0.8s', minHeight: '300px' }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}><AlertTriangle size={18} /> Active Support Tickets</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto", minHeight: 0, paddingRight: '4px' }}>
                  {ticketsList.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No support tickets</div>
                  ) : (
                    ticketsList.filter(t => t.status !== "resolved" && t.status !== "closed").slice(0, 3).map(ticket => (
                      <div key={ticket.id} style={{ backgroundColor: "var(--bg-surface, #ffffff)", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>TKT-{ticket.id}</span>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>Intern: <b>{ticket.creator_name || ticket.created_by}</b></span>
                        </div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#1f2937", fontWeight: 500 }}>{ticket.title}</p>
                        <span style={{ fontSize: "11px", color: "#b91c1c", textTransform: "capitalize" }}>{ticket.status} • {new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case "Users":
        const interns = filteredUsers.filter(u => u.role && u.role.toLowerCase() === "intern");
        const mentors = filteredUsers.filter(u => u.role && u.role.toLowerCase() === "mentor");
        
        // Group interns by college (batch)
        const batches = {};
        interns.forEach(intern => {
          const batchKey = intern.college || "Unassigned Batch";
          if (!batches[batchKey]) {
            batches[batchKey] = [];
          }
          batches[batchKey].push(intern);
        });

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {selectedIntern ? (
              <div className="card" style={{ margin: 0, padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "24px", height: "calc(100vh - 100px)", overflowY: "auto", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
                  <button onClick={() => setSelectedIntern(null)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    &larr; Back
                  </button>
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 style={{ margin: 0, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "12px", fontSize: "22px" }}>
                        {selectedIntern.name}
                        <span className={`badge badge-${selectedIntern.status === "Active" ? "success" : "danger"}`} style={{ fontSize: "12px", padding: "4px 8px" }}>{selectedIntern.status}</span>
                      </h2>
                      <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", display: "flex", gap: "12px" }}>
                        <span>ID: {selectedIntern.id}</span>
                        <span>•</span>
                        <span>{selectedIntern.domain}</span>
                        <span>•</span>
                        <span>{selectedIntern.college}</span>
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Assigned Mentor</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "16px", fontWeight: 600, color: "var(--text-color)" }}>{selectedIntern.mentor}</p>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                  <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h4 style={{ margin: 0, color: "#475569", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <TrendingUp size={16} /> Performance Overview
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ color: "var(--text-color)", fontWeight: 600, fontSize: "14px" }}>Progress</span>
                          <span style={{ fontWeight: 700, color: "#10b981", fontSize: "14px" }}>{selectedIntern.progress}</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "var(--border-color, #e2e8f0)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: selectedIntern.progress, height: "100%", backgroundColor: "#10b981" }}></div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px dashed #cbd5e1" }}>
                        <span style={{ color: "var(--text-color)", fontWeight: 600, fontSize: "14px" }}>Internship Duration</span>
                        <span style={{ fontWeight: 600, color: "var(--text-muted, #64748b)", fontSize: "14px" }}>Week 4 of 8</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fff5f5", border: "1px solid #fecaca", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ margin: 0, color: "#b91c1c", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <AlertTriangle size={16} /> Active Tickets / Issues
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                      {ticketsList.filter(t => t.status !== "Resolved").slice(0, 2).map(ticket => (
                        <div 
                          key={ticket.id}
                          onClick={() => {
                            setActiveTab("tickets");
                            setSelectedTicket(ticket);
                          }}
                          style={{ backgroundColor: "var(--bg-surface, #ffffff)", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform 0.1s" }}
                          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                            <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>{ticket.id}</span>
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>{ticket.date}</span>
                          </div>
                          <p style={{ margin: "0", fontSize: "13px", color: "#1f2937", fontWeight: 500 }}>{ticket.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: "10px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Recent Activity</h4>
                  <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", marginTop: "6px" }}></div>
                      <div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#1f2937" }}>Submitted task <b>"React Core Concepts"</b></p>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>1 day ago</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6", marginTop: "6px" }}></div>
                      <div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#1f2937" }}>Attended <b>Mid-Term Review Meeting</b> with {selectedIntern.mentor}</p>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedMentor ? (
              <div className="card" style={{ margin: 0, padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "24px", height: "calc(100vh - 100px)", overflowY: "auto", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px" }}>
                  <button onClick={() => setSelectedMentor(null)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    &larr; Back
                  </button>
                  <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 style={{ margin: 0, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "12px", fontSize: "22px" }}>
                        {selectedMentor.name}
                        <span className={`badge badge-${selectedMentor.status === "Active" ? "success" : "danger"}`} style={{ fontSize: "12px", padding: "4px 8px" }}>{selectedMentor.status}</span>
                      </h2>
                      <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "14px", display: "flex", gap: "12px" }}>
                        <span>ID: {selectedMentor.id}</span>
                        <span>•</span>
                        <span>{selectedMentor.domain}</span>
                        <span>•</span>
                        <span>Mentor</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                  <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "var(--bg-surface-elevated, #f8fafc)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h4 style={{ margin: 0, color: "#475569", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Users size={16} /> Mentorship Overview
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-color)", fontWeight: 600, fontSize: "14px" }}>Assigned Interns</span>
                        <span style={{ fontWeight: 700, color: "var(--primary-color)", fontSize: "16px" }}>12</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px dashed #cbd5e1" }}>
                        <span style={{ color: "var(--text-color)", fontWeight: 600, fontSize: "14px" }}>Avg Intern Progress</span>
                        <span style={{ fontWeight: 600, color: "#10b981", fontSize: "14px" }}>78%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fff5f5", border: "1px solid #fecaca", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ margin: 0, color: "#b91c1c", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar size={16} /> Upcoming Meetings
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                      <div style={{ backgroundColor: "var(--bg-surface, #ffffff)", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>Week 4 Review</span>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>Today, 2:00 PM</span>
                        </div>
                        <p style={{ margin: "0", fontSize: "13px", color: "#1f2937", fontWeight: 500 }}>Group session with all assigned interns via Zoom.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Sub navigation bar for Users */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {["Interns", "Mentors"].map((tab) => (
                      <button 
                        key={tab} 
                        onClick={() => setUsersSubTab(tab)} 
                        className={`btn ${usersSubTab === tab ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "8px 16px", borderRadius: "20px" }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                      <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                      <input type="text" placeholder={`Search ${usersSubTab.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-control" style={{ paddingLeft: "32px", width: "220px", marginBottom: 0 }} />
                    </div>
                    {usersSubTab === "Mentors" && (
                      <button className="btn btn-primary" style={{ padding: "8px 12px" }} onClick={() => setShowMentorModal(true)}>Add Mentor</button>
                    )}
                  </div>
                </div>

                {usersSubTab === "Interns" ? (
              <div style={{ display: "flex", gap: "24px", alignItems: "stretch", height: "calc(100vh - 170px)", overflow: "hidden" }}>
                {/* Left Pane - Batches List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "260px", flexShrink: 0, overflowY: "auto", paddingRight: "4px", height: "100%", paddingBottom: "20px", boxSizing: "border-box" }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", position: "sticky", top: 0, background: "var(--bg-surface-elevated, #f8fafc)", padding: "4px 0", zIndex: 10 }}>Batches (Colleges)</h4>
                  {Object.keys(batches).map((batch) => {
                    const batchInterns = batches[batch];
                    const activeCount = batchInterns.filter(i => i.status === "Active").length;
                    
                    return (
                      <div
                        key={batch}
                        onClick={() => { setSelectedBatch(batch); setInternPage(1); }}
                        style={{
                          padding: "16px",
                          borderRadius: "12px",
                          border: (selectedBatch || (Object.keys(batches).length > 0 ? Object.keys(batches)[0] : "")) === batch ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                          backgroundColor: (selectedBatch || (Object.keys(batches).length > 0 ? Object.keys(batches)[0] : "")) === batch ? "#f5f3ff" : "var(--card-bg)",
                          cursor: "pointer",
                          boxShadow: "var(--shadow-sm)",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-color)", display: "flex", alignItems: "center", gap: "6px" }}><GraduationCap size={16} color="var(--primary-color)" /> {batch}</span>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--primary-color)", background: "#eff6ff", padding: "2px 8px", borderRadius: "10px" }}>{activeCount} Active</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Total Headcount: <b>{batchInterns.length}</b>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Pane - Detail Interns List */}
                {(() => {
                  const actualSelectedBatch = selectedBatch || (Object.keys(batches).length > 0 ? Object.keys(batches)[0] : "");
                  const batchInterns = batches[actualSelectedBatch] || [];
                  const itemsPerPage = 10;
                  const totalPages = Math.ceil(batchInterns.length / itemsPerPage) || 1;
                  const paginatedInterns = batchInterns.slice((internPage - 1) * itemsPerPage, internPage * itemsPerPage);

                  return (
                    <div className="card" style={{ margin: 0, padding: "20px", flex: 1, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", overflow: "hidden", height: "100%", boxSizing: "border-box" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
                        <h3 style={{ fontSize: "16px", margin: 0, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                          <GraduationCap size={20} /> {actualSelectedBatch} Batch Directory
                        </h3>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Showing {paginatedInterns.length} of {batchInterns.length} Interns
                        </span>
                      </div>
                      
                      <div className="table-container" style={{ marginTop: 0, flex: 1, overflowY: "auto", minHeight: 0 }}>
                        <table className="table">
                          <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Domain</th>
                              <th>Mentor</th>
                              <th>Progress</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedInterns.length === 0 ? (
                              <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No interns found.</td>
                              </tr>
                            ) : (
                              paginatedInterns.map((user) => (
                                <tr 
                                  key={user.id}
                                  onClick={() => setSelectedIntern(user)}
                                  style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated, #f8fafc)"}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                  <td style={{ color: "#6b7280", fontSize: "12px" }}>{user.id}</td>
                                  <td><b>{user.name}</b></td>
                                  <td>{user.domain}</td>
                                  <td>{user.mentor}</td>
                                  <td>{user.progress}</td>
                                  <td>
                                    <span className={`badge badge-${user.status === "Active" ? "success" : "danger"}`}>
                                      {user.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 4px 8px 4px', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          Page <b>{internPage}</b> of <b>{totalPages}</b>
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => setInternPage(p => Math.max(1, p - 1))}
                            disabled={internPage === 1}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Previous
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => setInternPage(p => Math.min(totalPages, p + 1))}
                            disabled={internPage === totalPages}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="card" style={{ margin: 0 }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Mentor Registry</h3>
                <div className="table-container" style={{ marginTop: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Domain</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentors.map((user) => (
                        <tr 
                          key={user.id}
                          onClick={() => setSelectedMentor(user)}
                          style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated, #f8fafc)"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <td style={{ color: "#6b7280", fontSize: "12px" }}>{user.id}</td>
                          <td><b>{user.name}</b></td>
                          <td>{user.domain}</td>
                          <td>
                            <span className={`badge badge-${user.status === "Active" ? "success" : "danger"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => toggleUserStatus(user.id)} className={`btn ${user.status === "Active" ? "btn-secondary" : "btn-primary"}`} style={{ padding: "4px 8px", fontSize: "12px" }}>
                              {user.status === "Active" ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </>
          )}
            {showMentorModal && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div className="card" style={{ width: "400px", margin: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0 }}>Add New Mentor</h3>
                    <button onClick={() => setShowMentorModal(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}>&times;</button>
                  </div>
                  <form onSubmit={handleAddMentor} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", fontWeight: 600 }}>Name</label>
                      <input className="form-control" type="text" placeholder="Dr. Jane Smith" value={newMentor.name} onChange={(e) => setNewMentor({...newMentor, name: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", fontWeight: 600 }}>Email ID</label>
                      <input className="form-control" type="email" placeholder="jane@example.com" value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", fontWeight: 600 }}>Domain</label>
                      <input className="form-control" type="text" placeholder="Data Science" value={newMentor.domain} onChange={(e) => setNewMentor({...newMentor, domain: e.target.value})} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: "8px", padding: "10px" }}>Send Verification Link</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "Programs":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {selectedProgramDomain === null ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Active Internship Domains</h3>
                  <button className="btn btn-primary" onClick={() => setShowDomainModal(true)}>Add Domain</button>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginTop: "10px" }}>
                  {domainsList.map((dom, i) => (
                    <div 
                      key={i} 
                      className="card" 
                      onClick={() => setSelectedProgramDomain(dom.name)}
                      style={{ border: "1px solid #E5E7EB", margin: 0, padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", cursor: "pointer", transition: "transform 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <h4 style={{ color: "#2563EB", fontWeight: "600", marginBottom: "8px", fontSize: "16px" }}>{dom.name}</h4>
                      <p style={{ fontSize: "13px", margin: "4px 0", color: "#4b5563" }}>Duration: {dom.duration}</p>
                      <p style={{ fontSize: "13px", margin: "4px 0", color: "#4b5563" }}>Interns: {dom.interns} | Mentors: {dom.mentors}</p>
                      <span className="badge badge-success" style={{ marginTop: "12px", fontSize: "11px", display: "inline-block" }}>{dom.status}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <button onClick={() => setSelectedProgramDomain(null)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                    &larr; Back
                  </button>
                  <h3 style={{ margin: 0, fontSize: "20px", color: "#1f2937" }}>Program Details - {selectedProgramDomain}</h3>
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button 
                    className={`btn ${detailSubTab === "Curriculum" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setDetailSubTab("Curriculum")}
                  >Curriculum</button>
                  <button 
                    className={`btn ${detailSubTab === "Code Assessments" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setDetailSubTab("Code Assessments")}
                  >Code Assessments</button>
                  <button 
                    className={`btn ${detailSubTab === "MCQs" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setDetailSubTab("MCQs")}
                  >MCQs</button>
                </div>

                {detailSubTab === "Curriculum" && (
                  <div className="table-container" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                    <table className="table">
                      <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                        <tr><th>ID</th><th>Title</th><th>Difficulty</th><th>Deadline</th></tr>
                      </thead>
                      <tbody>
                        {tasks.filter(t => t.domain === selectedProgramDomain && t.task_type === 'curriculum').map((t) => (
                          <tr key={t.id}>
                            <td style={{ color: "#6b7280", fontSize: "12px" }}>TSK-{t.id}</td>
                            <td><b>{t.title}</b></td>
                            <td><span className={`badge ${t.difficulty === 'Hard' ? 'badge-danger' : t.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}`}>{t.difficulty}</span></td>
                            <td>{t.deadline}</td>
                          </tr>
                        ))}
                        {tasks.filter(t => t.domain === selectedProgramDomain && t.task_type === 'curriculum').length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No curriculum tasks assigned to this domain yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {detailSubTab === "Code Assessments" && (
                  <div className="table-container" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                    <table className="table">
                      <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                        <tr><th>ID</th><th>Title</th><th>Difficulty</th><th>Deadline</th></tr>
                      </thead>
                      <tbody>
                        {tasks.filter(t => t.domain === selectedProgramDomain && t.task_type === 'coding').map((t) => (
                          <tr key={t.id}>
                            <td style={{ color: "#6b7280", fontSize: "12px" }}>TSK-{t.id}</td>
                            <td><b>{t.title}</b></td>
                            <td><span className={`badge ${t.difficulty === 'Hard' ? 'badge-danger' : t.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}`}>{t.difficulty}</span></td>
                            <td>{t.deadline}</td>
                          </tr>
                        ))}
                        {tasks.filter(t => t.domain === selectedProgramDomain && t.task_type === 'coding').length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No coding assessments assigned to this domain yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {detailSubTab === "MCQs" && (
                  <div className="table-container" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
                    <table className="table">
                      <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                        <tr><th>ID</th><th>Title</th><th>Difficulty</th><th>Deadline</th></tr>
                      </thead>
                      <tbody>
                        {tasks.filter(t => t.domain === selectedProgramDomain && t.task_type === 'mcq').map((t) => (
                          <tr key={t.id}>
                            <td style={{ color: "#6b7280", fontSize: "12px" }}>TSK-{t.id}</td>
                            <td><b>{t.title}</b></td>
                            <td><span className={`badge ${t.difficulty === 'Hard' ? 'badge-danger' : t.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}`}>{t.difficulty}</span></td>
                            <td>{t.deadline}</td>
                          </tr>
                        ))}
                        {tasks.filter(t => t.domain === selectedProgramDomain && t.task_type === 'mcq').length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No MCQs assigned to this domain yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Add Domain Modal */}
            {showDomainModal && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div className="card" style={{ width: "400px", margin: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0 }}>Add Internship Domain</h3>
                    <button onClick={() => setShowDomainModal(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}>&times;</button>
                  </div>
                  <form onSubmit={handleAddDomain} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", fontWeight: 600 }}>Domain Name</label>
                      <input className="form-control" type="text" placeholder="Cloud Computing" value={newDomain.name} onChange={(e) => setNewDomain({...newDomain, name: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", fontWeight: 600 }}>Duration</label>
                      <input className="form-control" type="text" placeholder="8 Weeks" value={newDomain.duration} onChange={(e) => setNewDomain({...newDomain, duration: e.target.value})} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: "8px", padding: "10px" }}>Add Domain</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "Credentials":
        return (
          <div className="card">
            <h3>Certificate Credentials Panel</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Generate professional verification-keyed certificates for graduating intern cohorts.</p>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Intern Name</th>
                    <th>Domain</th>
                    <th>Final Average Grade</th>
                    <th>Leaderboard Ranking</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Raj Patel</b></td>
                    <td>Data Science</td>
                    <td><span style={{ color: "#10b981", fontWeight: 600 }}>80%</span></td>
                    <td><span className="badge badge-success" style={{ padding: "4px 8px", fontSize: "13px" }}>#1</span></td>
                    <td>
                      <button onClick={() => alert("Certificate generated for Raj Patel! Verification Key: CERT-DS-884")} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        Generate & Email
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td><b>Anu Sharma</b></td>
                    <td>Cyber Security</td>
                    <td><span style={{ color: "#10b981", fontWeight: 600 }}>75%</span></td>
                    <td><span className="badge badge-warning" style={{ padding: "4px 8px", fontSize: "13px" }}>#5</span></td>
                    <td>
                      <button onClick={() => alert("Certificate generated for Anu Sharma! Verification Key: CERT-CS-122")} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        Generate & Email
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Onboarding":
        return <AdminOnboardingList />;

      case "Tickets":
        if (selectedTicket) {
          return (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Back to Tickets</button>
                  <h3 style={{ margin: 0 }}>Ticket {selectedTicket.id}</h3>
                  <span className={`badge ${selectedTicket.status === 'Resolved' ? 'badge-success' : selectedTicket.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`} style={{ backgroundColor: selectedTicket.status === 'Resolved' ? '#d1fae5' : selectedTicket.status === 'In Progress' ? '#fef3c7' : '#fee2e2', color: selectedTicket.status === 'Resolved' ? '#065f46' : selectedTicket.status === 'In Progress' ? '#92400e' : '#991b1b' }}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <select className="form-control" value={assignedMentor} onChange={(e) => setAssignedMentor(e.target.value)} style={{ width: "200px", marginBottom: 0 }}>
                      <option value="">Select Mentor to Assign</option>
                      {usersList.filter(u => u.role?.toLowerCase() === "mentor").map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <button onClick={handleAssignMentor} className="btn btn-secondary">Assign Mentor</button>
                  </div>
                  {selectedTicket.status !== "Resolved" && selectedTicket.status !== "Closed" && (
                    <button className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }} onClick={() => handleUpdateTicketStatus("Resolved")}>Mark as Resolved</button>
                  )}
                  {selectedTicket.status !== "Closed" && (
                    <button className="btn btn-secondary" style={{ color: "#b91c1c", borderColor: "#fca5a5", backgroundColor: "#fef2f2" }} onClick={() => handleUpdateTicketStatus("Closed")}>Close Ticket</button>
                  )}
                </div>
              </div>

              <div className="dashboard-grid-half" style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>User</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.user} ({selectedTicket.role})</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Domain</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.domain}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Branch / University</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.branch}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Filed On</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{selectedTicket.date}</div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Assigned To</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>
                    {selectedTicket.assigned_to ? `User ID: ${selectedTicket.assigned_to}` : "Unassigned"}
                  </div>
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
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Manage issues and support requests filed by Interns and Mentors.</p>
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
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>{ticket.role}</div>
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
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Bonus Airdrops":
        if (selectedAirdrop) {
          return <AdminAirdropDetails airdrop={selectedAirdrop} onBack={() => setSelectedAirdrop(null)} />;
        }
        return (
          <div className="card" style={{ backgroundColor: "transparent", border: "none", boxShadow: "none", padding: 0 }}>

            <div className="card" style={{ padding: "0", overflow: "hidden" }}>
              <div className="table-container" style={{ margin: 0 }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 16px" }}>ID</th>
                      <th style={{ padding: "12px 16px" }}>Title</th>
                      <th style={{ padding: "12px 16px" }}>Task Type</th>
                      <th style={{ padding: "12px 16px" }}>Points</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px" }}>Time Limit</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusAirdrops.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No airdrops available.</td>
                      </tr>
                    ) : (
                      [...bonusAirdrops].reverse().map(airdrop => (
                        <tr 
                          key={airdrop.id} 
                          onClick={() => setSelectedAirdrop(airdrop)} 
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated, #f8fafc)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: "12px 16px", fontWeight: "600", color: "#475569" }}>{airdrop.id}</td>
                          <td style={{ padding: "12px 16px", fontWeight: "500", color: "#1e293b" }}>{airdrop.title || "-"}</td>
                          <td style={{ padding: "12px 16px", color: "#64748b" }}>{airdrop.taskType || "-"}</td>
                          <td style={{ padding: "12px 16px", color: "#b91c1c", fontWeight: "600" }}>{Math.max(0, ...(Array.isArray(airdrop.points) ? airdrop.points : [airdrop.points]).map(Number))} pts</td>
                          <td style={{ padding: "12px 16px" }}>
                            {airdrop.status === "PENDING_APPROVAL" ? (
                              <span className="badge badge-warning">PENDING_APPROVAL</span>
                            ) : airdrop.status === "ENDED" ? (
                              <span className="badge badge-error" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>ENDED</span>
                            ) : (
                              <span className={`badge ${airdrop.status === 'APPROVED' || airdrop.status === 'PUBLISHED' ? 'badge-success' : 'badge-primary'}`} style={airdrop.status === 'PUBLISHED' ? { backgroundColor: "#dcfce7", color: "#166534" } : {}}>
                                {airdrop.status}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6b7280" }}>{airdrop.timeLimit}s</td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            {airdrop.status === "PENDING_APPROVAL" && (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#10b981", borderColor: "#10b981" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  let isExpired = false;
                                  if (airdrop.rawEndTime) {
                                    const endDateTime = new Date(airdrop.rawEndTime);
                                    if (new Date() > endDateTime) {
                                      isExpired = true;
                                    }
                                  }
                                  if (isExpired) {
                                    setRefixStartDate(airdrop.startDate || "");
                                    setRefixStartTime(airdrop.startTime || "");
                                    setRefixEndDate(airdrop.endDate || "");
                                    setRefixEndTime(airdrop.endTime || "");
                                    setRefixAirdropModal(airdrop);
                                  } else {
                                    handleApproveAirdrop(airdrop.id);
                                  }
                                }}
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "Profile":
        return <AdminProfile />;
      default:
        return null;
    }
  };

  const navItems = [
    { id: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "Analytics", icon: <LineChart size={18} /> },
    { id: "Onboarding", icon: <UserPlus size={18} /> },
    { id: "Users", icon: <Users size={18} /> },
    { id: "Programs", icon: <Layers size={18} /> },
    { id: "Credentials", icon: <ShieldCheck size={18} /> },
    { id: "Tickets", icon: <Headset size={18} /> },
    { id: "Bonus Airdrops", icon: <Coins size={18} /> },
    { id: "Leaderboard", icon: <ListOrdered size={18} /> }
  ];

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
          <span style={{ fontSize: "12px", fontWeight: 600, backgroundColor: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "12px" }}>
            Admin Panel
          </span>
        </div>

        {/* Module Access Navigation Hub (Monolithic Pill Bar) */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--bg-light, #f1f5f9)", padding: "4px", borderRadius: "28px" }}>
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "Bonus Airdrops") setSelectedAirdrop(null);
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
              style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold", cursor: "pointer", userSelect: "none" }}
            >
              SA
            </div>
            
            {isProfileDropdownOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", minWidth: "150px", zIndex: 100, overflow: "hidden" }}>
                <button 
                  onClick={() => { setActiveTab("Profile"); setIsProfileDropdownOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", color: "#475569", cursor: "pointer", textAlign: "left", fontSize: "14px", fontWeight: "500", transition: "background-color 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User size={16} /> Profile
                </button>
                <div style={{ height: "1px", backgroundColor: "#e2e8f0", width: "100%" }}></div>
                <button 
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", color: "#dc2626", cursor: "pointer", textAlign: "left", fontSize: "14px", fontWeight: "500", transition: "background-color 0.2s" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Content (Full Width) */}
      <main style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column", padding: "16px 24px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease-out", paddingRight: "8px" }}>
          {renderContent()}
        </div>
      </main>

      {refixAirdropModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1050 }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "24px", backgroundColor: "white", borderRadius: "12px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Refix Airdrop Time</h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>The original time for this Airdrop has passed. Please set a new start and end time before publishing.</p>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>New Start Time</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="date" className="form-control" value={refixStartDate} onChange={e => setRefixStartDate(e.target.value)} />
                <input type="time" className="form-control" value={refixStartTime} onChange={e => setRefixStartTime(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>New End Time</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="date" className="form-control" value={refixEndDate} onChange={e => setRefixEndDate(e.target.value)} />
                <input type="time" className="form-control" value={refixEndTime} onChange={e => setRefixEndTime(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setRefixAirdropModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!refixStartDate || !refixStartTime || !refixEndDate || !refixEndTime) {
                  alert("Please fill all date and time fields.");
                  return;
                }
                const newStart = new Date(`${refixStartDate}T${refixStartTime}:00`);
                const newEnd = new Date(`${refixEndDate}T${refixEndTime}:00`);
                if (newEnd <= newStart) {
                  alert("End time must be after start time.");
                  return;
                }
                handleApproveAirdrop(refixAirdropModal.id, newStart.toISOString(), newEnd.toISOString());
                setRefixAirdropModal(null);
              }}>Approve & Publish</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
