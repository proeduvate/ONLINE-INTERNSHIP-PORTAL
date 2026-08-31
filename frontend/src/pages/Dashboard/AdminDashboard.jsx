import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from "recharts";
import { LayoutDashboard, Users, BookOpen, Award, Bell, Search, Filter, ClipboardCheck, LifeBuoy, Gift, TrendingUp, Medal } from "lucide-react";
import AdminAnalytics from "./AdminAnalytics";
import AdminAirdropDetails from "./AdminAirdropDetails";
import AdminLeaderboard from "./AdminLeaderboard";
import "../../styles/Dashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Bonus Airdrops State
  const [bonusAirdrops, setBonusAirdrops] = useState([]);
  const [selectedAirdrop, setSelectedAirdrop] = useState(null);

  useEffect(() => {
    const storedAirdrops = localStorage.getItem("app_bonus_airdrops");
    if (storedAirdrops) {
      setBonusAirdrops(JSON.parse(storedAirdrops));
    }
  }, []);

  const handleApproveAirdrop = (id) => {
    const updatedAirdrops = bonusAirdrops.map(a => 
      a.id === id ? { ...a, status: "APPROVED" } : a
    );
    setBonusAirdrops(updatedAirdrops);
    localStorage.setItem("app_bonus_airdrops", JSON.stringify(updatedAirdrops));
  };

  // State Mock Data
  // State Mock Data
  const [usersList, setUsersList] = useState([
    // Mentors
    { id: "MNT101", name: "Dr. Sakthi", role: "Mentor", college: "-", domain: "AI/DS/Cyber", mentor: "-", progress: "-", attendance: "98%", status: "Active" },
    { id: "MNT102", name: "Dr. Alice", role: "Mentor", college: "-", domain: "Web Development", mentor: "-", progress: "-", attendance: "95%", status: "Active" },
    
    // Batch MIT (12 interns)
    { id: "INT001", name: "John Doe", role: "Intern", college: "MIT", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "60%", attendance: "95%", status: "Active" },
    { id: "INT004", name: "Emily Watson", role: "Intern", college: "MIT", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "45%", attendance: "92%", status: "Active" },
    { id: "INT005", name: "Michael Chang", role: "Intern", college: "MIT", domain: "Data Science", mentor: "Dr. Sakthi", progress: "70%", attendance: "88%", status: "Active" },
    { id: "INT006", name: "Sarah Connor", role: "Intern", college: "MIT", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "85%", attendance: "96%", status: "Active" },
    { id: "INT007", name: "David Miller", role: "Intern", college: "MIT", domain: "Web Development", mentor: "Dr. Alice", progress: "90%", attendance: "99%", status: "Active" },
    { id: "INT008", name: "Jessica Taylor", role: "Intern", college: "MIT", domain: "UI UX Design", mentor: "Dr. Alice", progress: "50%", attendance: "91%", status: "Active" },
    { id: "INT009", name: "Daniel Anderson", role: "Intern", college: "MIT", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "30%", attendance: "85%", status: "Active" },
    { id: "INT010", name: "Sophia Martinez", role: "Intern", college: "MIT", domain: "Data Science", mentor: "Dr. Sakthi", progress: "65%", attendance: "94%", status: "Active" },
    { id: "INT011", name: "James Wilson", role: "Intern", college: "MIT", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "40%", attendance: "87%", status: "Active" },
    { id: "INT012", name: "Isabella Thomas", role: "Intern", college: "MIT", domain: "Web Development", mentor: "Dr. Alice", progress: "80%", attendance: "95%", status: "Active" },
    { id: "INT013", name: "Robert Jackson", role: "Intern", college: "MIT", domain: "UI UX Design", mentor: "Dr. Alice", progress: "75%", attendance: "93%", status: "Active" },
    { id: "INT014", name: "Mia White", role: "Intern", college: "MIT", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "55%", attendance: "90%", status: "Active" },

    // Batch Stanford (11 interns)
    { id: "INT002", name: "Raj Patel", role: "Intern", college: "Stanford", domain: "Data Science", mentor: "Dr. Sakthi", progress: "80%", attendance: "90%", status: "Active" },
    { id: "INT015", name: "William Davies", role: "Intern", college: "Stanford", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "60%", attendance: "95%", status: "Active" },
    { id: "INT016", name: "Olivia Johnson", role: "Intern", college: "Stanford", domain: "Data Science", mentor: "Dr. Sakthi", progress: "70%", attendance: "91%", status: "Active" },
    { id: "INT017", name: "Liam Smith", role: "Intern", college: "Stanford", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "50%", attendance: "89%", status: "Active" },
    { id: "INT018", name: "Emma Jones", role: "Intern", college: "Stanford", domain: "Web Development", mentor: "Dr. Alice", progress: "85%", attendance: "97%", status: "Active" },
    { id: "INT019", name: "Noah Brown", role: "Intern", college: "Stanford", domain: "UI UX Design", mentor: "Dr. Alice", progress: "40%", attendance: "86%", status: "Active" },
    { id: "INT020", name: "Ava Miller", role: "Intern", college: "Stanford", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "75%", attendance: "93%", status: "Active" },
    { id: "INT021", name: "Lucas Garcia", role: "Intern", college: "Stanford", domain: "Data Science", mentor: "Dr. Sakthi", progress: "65%", attendance: "92%", status: "Active" },
    { id: "INT022", name: "Sophia Rodriguez", role: "Intern", college: "Stanford", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "90%", attendance: "98%", status: "Active" },
    { id: "INT023", name: "Mason Martinez", role: "Intern", college: "Stanford", domain: "Web Development", mentor: "Dr. Alice", progress: "55%", attendance: "90%", status: "Active" },
    { id: "INT024", name: "Charlotte Hernandez", role: "Intern", college: "Stanford", domain: "UI UX Design", mentor: "Dr. Alice", progress: "80%", attendance: "96%", status: "Active" },

    // Batch IIT (11 interns)
    { id: "INT003", name: "Anu Sharma", role: "Intern", college: "IIT", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "75%", attendance: "88%", status: "Active" },
    { id: "INT025", name: "Rahul Verma", role: "Intern", college: "IIT", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "50%", attendance: "92%", status: "Active" },
    { id: "INT026", name: "Priya Patel", role: "Intern", college: "IIT", domain: "Data Science", mentor: "Dr. Sakthi", progress: "85%", attendance: "96%", status: "Active" },
    { id: "INT027", name: "Amit Singh", role: "Intern", college: "IIT", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "60%", attendance: "90%", status: "Active" },
    { id: "INT028", name: "Neha Gupta", role: "Intern", college: "IIT", domain: "Web Development", mentor: "Dr. Alice", progress: "70%", attendance: "93%", status: "Active" },
    { id: "INT029", name: "Vikram Reddy", role: "Intern", college: "IIT", domain: "UI UX Design", mentor: "Dr. Alice", progress: "45%", attendance: "87%", status: "Active" },
    { id: "INT030", name: "Anjali Das", role: "Intern", college: "IIT", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "80%", attendance: "95%", status: "Active" },
    { id: "INT031", name: "Rohan Bose", role: "Intern", college: "IIT", domain: "Data Science", mentor: "Dr. Sakthi", progress: "35%", attendance: "85%", status: "Active" },
    { id: "INT032", name: "Shreya Ghoshal", role: "Intern", college: "IIT", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "95%", attendance: "99%", status: "Active" },
    { id: "INT033", name: "Aditya Roy", role: "Intern", college: "IIT", domain: "Web Development", mentor: "Dr. Alice", progress: "65%", attendance: "91%", status: "Active" },
    { id: "INT034", name: "Riya Sen", role: "Intern", college: "IIT", domain: "UI UX Design", mentor: "Dr. Alice", progress: "75%", attendance: "94%", status: "Active" },

    // Batch Harvard (12 interns)
    { id: "INT035", name: "Ethan Hunt", role: "Intern", college: "Harvard", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "65%", attendance: "94%", status: "Active" },
    { id: "INT036", name: "Grace Kelly", role: "Intern", college: "Harvard", domain: "Data Science", mentor: "Dr. Sakthi", progress: "80%", attendance: "96%", status: "Active" },
    { id: "INT037", name: "Jack Reacher", role: "Intern", college: "Harvard", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "55%", attendance: "90%", status: "Active" },
    { id: "INT038", name: "Julia Roberts", role: "Intern", college: "Harvard", domain: "Web Development", mentor: "Dr. Alice", progress: "85%", attendance: "98%", status: "Active" },
    { id: "INT039", name: "Tom Cruise", role: "Intern", college: "Harvard", domain: "UI UX Design", mentor: "Dr. Alice", progress: "40%", attendance: "85%", status: "Active" },
    { id: "INT040", name: "Brad Pitt", role: "Intern", college: "Harvard", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "70%", attendance: "92%", status: "Active" },
    { id: "INT041", name: "Angelina Jolie", role: "Intern", college: "Harvard", domain: "Data Science", mentor: "Dr. Sakthi", progress: "60%", attendance: "91%", status: "Active" },
    { id: "INT042", name: "Leonardo DiCaprio", role: "Intern", college: "Harvard", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "75%", attendance: "93%", status: "Active" },
    { id: "INT043", name: "Kate Winslet", role: "Intern", college: "Harvard", domain: "Web Development", mentor: "Dr. Alice", progress: "90%", attendance: "99%", status: "Active" },
    { id: "INT044", name: "Johnny Depp", role: "Intern", college: "Harvard", domain: "UI UX Design", mentor: "Dr. Alice", progress: "50%", attendance: "88%", status: "Active" },
    { id: "INT045", name: "Natalie Portman", role: "Intern", college: "Harvard", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "80%", attendance: "97%", status: "Active" },
    { id: "INT046", name: "Matt Damon", role: "Intern", college: "Harvard", domain: "Data Science", mentor: "Dr. Sakthi", progress: "45%", attendance: "89%", status: "Active" },

    // Batch Berkeley (12 interns)
    { id: "INT047", name: "Harry Potter", role: "Intern", college: "Berkeley", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "95%", attendance: "99%", status: "Active" },
    { id: "INT048", name: "Hermione Granger", role: "Intern", college: "Berkeley", domain: "Data Science", mentor: "Dr. Sakthi", progress: "100%", attendance: "100%", status: "Active" },
    { id: "INT049", name: "Ron Weasley", role: "Intern", college: "Berkeley", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "40%", attendance: "85%", status: "Active" },
    { id: "INT050", name: "Albus Dumbledore", role: "Intern", college: "Berkeley", domain: "Web Development", mentor: "Dr. Alice", progress: "90%", attendance: "98%", status: "Active" },
    { id: "INT051", name: "Severus Snape", role: "Intern", college: "Berkeley", domain: "UI UX Design", mentor: "Dr. Alice", progress: "85%", attendance: "95%", status: "Active" },
    { id: "INT052", name: "Draco Malfoy", role: "Intern", college: "Berkeley", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "60%", attendance: "91%", status: "Active" },
    { id: "INT053", name: "Luna Lovegood", role: "Intern", college: "Berkeley", domain: "Data Science", mentor: "Dr. Sakthi", progress: "75%", attendance: "94%", status: "Active" },
    { id: "INT054", name: "Neville Longbottom", role: "Intern", college: "Berkeley", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "55%", attendance: "89%", status: "Active" },
    { id: "INT055", name: "Rubeus Hagrid", role: "Intern", college: "Berkeley", domain: "Web Development", mentor: "Dr. Alice", progress: "50%", attendance: "87%", status: "Active" },
    { id: "INT056", name: "Ginny Weasley", role: "Intern", college: "Berkeley", domain: "UI UX Design", mentor: "Dr. Alice", progress: "70%", attendance: "92%", status: "Active" },
    { id: "INT057", name: "Sirius Black", role: "Intern", college: "Berkeley", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "80%", attendance: "96%", status: "Active" },
    { id: "INT058", name: "Remus Lupin", role: "Intern", college: "Berkeley", domain: "Data Science", mentor: "Dr. Sakthi", progress: "65%", attendance: "90%", status: "Active" },
  ]);

  const [domainsList, setDomainsList] = useState([
    { name: "Artificial Intelligence", duration: "12 Weeks", interns: 14, mentors: 2, status: "Active" },
    { name: "Data Science", duration: "8 Weeks", interns: 12, mentors: 2, status: "Active" },
    { name: "Cyber Security", duration: "10 Weeks", interns: 8, mentors: 1, status: "Active" },
    { name: "Web Development", duration: "8 Weeks", interns: 10, mentors: 3, status: "Active" },
    { name: "UI UX Design", duration: "6 Weeks", interns: 6, mentors: 2, status: "Active" },
    { name: "Cloud Computing", duration: "10 Weeks", interns: 0, mentors: 0, status: "Active" },
    { name: "Mobile App Dev", duration: "8 Weeks", interns: 0, mentors: 0, status: "Active" },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Build a Simple Neural Network", difficulty: "Hard", deadline: "2026-08-12", domain: "Artificial Intelligence", status: "Active" },
    { id: 2, title: "React Component Lifecycle", difficulty: "Medium", deadline: "2026-08-10", domain: "Web Development", status: "Active" },
  ]);

  const [curriculumList, setCurriculumList] = useState([
    { day: "Day 1", topic: "Introduction to React", resources: "Video Link, Documentation PDF", domain: "Web Development" },
    { day: "Day 2", topic: "State and Props", resources: "Github Repo, Slides PDF", domain: "Web Development" },
  ]);

  const [meetings, setMeetings] = useState([
    { id: 1, title: "Mid-Term Review Meeting", time: "2026-08-08 10:00 AM", mentor: "Dr. Sakthi", link: "https://zoom.us/mock" },
  ]);

  // Chart Data
  const progressData = [
    { name: "Week 1", MIT: 25, Stanford: 18, IIT: 30, Harvard: 20, Berkeley: 22 },
    { name: "Week 2", MIT: 45, Stanford: 38, IIT: 50, Harvard: 42, Berkeley: 40 },
    { name: "Week 3", MIT: 60, Stanford: 55, IIT: 65, Harvard: 58, Berkeley: 62 },
    { name: "Week 4", MIT: 85, Stanford: 78, IIT: 80, Harvard: 75, Berkeley: 82 },
  ];
  
  const domainData = [
    { name: "AI", value: 14 },
    { name: "Data Sci", value: 12 },
    { name: "Cyber Sec", value: 8 },
    { name: "Web Dev", value: 10 },
    { name: "UI/UX", value: 6 },
  ];
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
  const [selectedBatch, setSelectedBatch] = useState("MIT");
  const [internPage, setInternPage] = useState(1);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Tickets state
  const [ticketsList, setTicketsList] = useState([
    { id: "TKT-1042", user: "John Doe", role: "Intern", domain: "Artificial Intelligence", branch: "MIT", title: "Environment setup failing on local machine during Docker build.", description: "When I run docker-compose up, it fails with a port conflict error. Details in logs.", status: "Waiting on Support", date: "2 hours ago", comments: [] },
    { id: "TKT-1045", user: "Raj Patel", role: "Intern", domain: "Data Science", branch: "Stanford", title: "Need clarification on the API structure for Week 4 assignments.", description: "The documentation for the external API endpoints seems outdated. Can someone confirm?", status: "In Progress", date: "5 hours ago", comments: [{ author: "Admin", text: "We are checking this with the curriculum team." }] },
    { id: "TKT-0985", user: "Sarah Connor", role: "Intern", domain: "Cyber Security", branch: "Berkeley", title: "Missing lecture notes for Day 5", description: "The PDF link for Day 5 lecture is broken.", status: "Resolved", date: "1 week ago", comments: [{ author: "Admin", text: "Fixed the link. Please check again." }] }
  ]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState("");

  const handleReplyTicket = (e) => {
    e.preventDefault();
    if (!ticketReply.trim()) return;
    
    const updatedTickets = ticketsList.map(t => {
      if (t.id === selectedTicket.id) {
        const updatedT = {
          ...t,
          comments: [...t.comments, { author: "Super Admin", text: ticketReply }]
        };
        setSelectedTicket(updatedT);
        return updatedT;
      }
      return t;
    });
    setTicketsList(updatedTickets);
    setTicketReply("");
  };

  const handleUpdateTicketStatus = (status) => {
    const updatedTickets = ticketsList.map(t => {
      if (t.id === selectedTicket.id) {
        const updatedT = { ...t, status: status };
        setSelectedTicket(updatedT);
        return updatedT;
      }
      return t;
    });
    setTicketsList(updatedTickets);
  };

  const handleLogout = () => {
    alert("Logged out successfully.");
    window.location.href = "/login";
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

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return alert("Please specify task title.");
    const created = {
      id: tasks.length + 1,
      title: newTask.title,
      difficulty: newTask.difficulty,
      deadline: newTask.deadline || "TBD",
      domain: selectedProgramDomain || newTask.domain || "General",
      status: "Active"
    };
    setTasks([...tasks, created]);
    alert("New task created and assigned successfully!");
    setNewTask({ title: "", description: "", difficulty: "Medium", deadline: "", domain: "" });
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

  const filteredUsers = usersList.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.domain.toLowerCase().includes(searchQuery.toLowerCase()));

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
              <div className="stat-card">
                <span className="stat-title">Total Interns</span>
                <span className="stat-value">50</span>
                <span className="stat-desc">48 Active / 2 Deactivated</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Total Mentors</span>
                <span className="stat-value">10</span>
                <span className="stat-desc">Assigned across 5 domains</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Active Domains</span>
                <span className="stat-value">5</span>
                <span className="stat-desc">AI, DS, CS, Web Dev, UI/UX</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Avg Performance</span>
                <span className="stat-value">78%</span>
                <span className="stat-desc">Based on evaluations</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="card" style={{ margin: 0, paddingBottom: 0 }}>
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Batch-wise Progress Trend</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={progressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dx={-10} />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}} 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="MIT" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Stanford" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="IIT" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Harvard" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Berkeley" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Intern Distribution by Domain</h3>
                <div style={{ flex: 1, padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height={190}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={domainData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar name="Interns" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ margin: 0, paddingBottom: 0, display: "flex", flexDirection: "column", height: "100%" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Top Performers</span>
                  <Award size={18} color="#f59e0b" />
                </h3>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", marginRight: "12px" }}>HP</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>Harry Potter</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>Artificial Intelligence</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#10b981" }}>98%</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Score</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", marginRight: "12px" }}>HG</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>Hermione Granger</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>Data Science</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#10b981" }}>96%</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Score</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", marginRight: "12px" }}>DM</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>David Miller</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>Web Development</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#10b981" }}>92%</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Score</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", marginRight: "12px" }}>SC</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "13px", color: "#0f172a", fontWeight: 600 }}>Sarah Connor</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>Cyber Security</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#10b981" }}>89%</div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>Score</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>⚠️ Active Support Tickets</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>TKT-1042</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Intern: <b>John Doe</b></span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#1f2937", fontWeight: 500 }}>Environment setup failing on local machine during Docker build.</p>
                    <span style={{ fontSize: "11px", color: "#b91c1c" }}>Waiting on Support • 2 hours ago</span>
                  </div>
                  
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>TKT-1045</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Intern: <b>Raj Patel</b></span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#1f2937", fontWeight: 500 }}>Need clarification on the API structure for Week 4 assignments.</p>
                    <span style={{ fontSize: "11px", color: "#d97706" }}>In Progress • 5 hours ago</span>
                  </div>
                  
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>TKT-1048</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Mentor: <b>Dr. Sakthi</b></span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#1f2937", fontWeight: 500 }}>Unable to access GitHub repository for batch MIT-04.</p>
                    <span style={{ fontSize: "11px", color: "#b91c1c" }}>Waiting on Support • 1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "Users":
        const interns = filteredUsers.filter(u => u.role === "Intern");
        const mentors = filteredUsers.filter(u => u.role === "Mentor");
        
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
                  <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h4 style={{ margin: 0, color: "#475569", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      📈 Performance Overview
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ color: "var(--text-color)", fontWeight: 600, fontSize: "14px" }}>Progress</span>
                          <span style={{ fontWeight: 700, color: "#10b981", fontSize: "14px" }}>{selectedIntern.progress}</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: selectedIntern.progress, height: "100%", backgroundColor: "#10b981" }}></div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px dashed #cbd5e1" }}>
                        <span style={{ color: "var(--text-color)", fontWeight: 600, fontSize: "14px" }}>Internship Duration</span>
                        <span style={{ fontWeight: 600, color: "#64748b", fontSize: "14px" }}>Week 4 of 8</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#fff5f5", border: "1px solid #fecaca", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ margin: 0, color: "#b91c1c", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      ⚠️ Active Tickets / Issues
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                      {ticketsList.filter(t => t.status !== "Resolved").slice(0, 2).map(ticket => (
                        <div 
                          key={ticket.id}
                          onClick={() => {
                            setActiveTab("tickets");
                            setSelectedTicket(ticket);
                          }}
                          style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform 0.1s" }}
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
                  <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h4 style={{ margin: 0, color: "#475569", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                      👥 Mentorship Overview
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
                      📅 Upcoming Meetings
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                      <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
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
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", position: "sticky", top: 0, background: "#f8fafc", padding: "4px 0", zIndex: 10 }}>Batches (Colleges)</h4>
                  {["MIT", "Stanford", "IIT", "Harvard", "Berkeley"].map((batch) => {
                    const batchInterns = filteredUsers.filter(u => u.role === "Intern" && u.college === batch);
                    const activeCount = batchInterns.filter(i => i.status === "Active").length;
                    
                    return (
                      <div
                        key={batch}
                        onClick={() => { setSelectedBatch(batch); setInternPage(1); }}
                        style={{
                          padding: "16px",
                          borderRadius: "12px",
                          border: selectedBatch === batch ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                          backgroundColor: selectedBatch === batch ? "#f5f3ff" : "var(--card-bg)",
                          cursor: "pointer",
                          boxShadow: "var(--shadow-sm)",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-color)" }}>🎓 {batch}</span>
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
                  const batchInterns = interns.filter(u => u.college === selectedBatch);
                  const itemsPerPage = 10;
                  const totalPages = Math.ceil(batchInterns.length / itemsPerPage) || 1;
                  const paginatedInterns = batchInterns.slice((internPage - 1) * itemsPerPage, internPage * itemsPerPage);

                  return (
                    <div className="card" style={{ margin: 0, padding: "20px", flex: 1, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", overflow: "hidden", height: "100%", boxSizing: "border-box" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
                        <h3 style={{ fontSize: "16px", margin: 0, color: "var(--primary-color)" }}>
                          🎓 {selectedBatch} Batch Directory
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
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
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
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
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
                        {/* Render custom user-uploaded curriculum first */}
                        {curriculumList.filter(c => c.domain === selectedProgramDomain).map((cur, i) => (
                          <tr key={`custom-${i}`}>
                            <td style={{ width: "80px", fontWeight: "600", color: "#4b5563" }}>{cur.day}</td>
                            <td><b>{cur.topic}</b></td>
                            <td>{cur.resources}</td>
                            <td><span className="badge badge-success" style={{ fontSize: "10px" }}>Active</span></td>
                          </tr>
                        ))}
                        
                        {/* Render generated 30 days mock curriculum */}
                        {[...Array(30)].map((_, i) => {
                          if (curriculumList.some(c => c.domain === selectedProgramDomain && c.day.toLowerCase() === `day ${i+1}`)) return null;
                          
                          return (
                          <tr key={i}>
                            <td style={{ width: "80px", fontWeight: "600", color: "#4b5563" }}>Day {i + 1}</td>
                            <td><b>{i === 0 ? `Intro to ${selectedProgramDomain}` : i === 14 ? "Mid-term Assessment" : i === 29 ? "Final Project Submission" : `Advanced Concepts Part ${i}`}</b></td>
                            <td>{i === 0 ? "Setup Guide, Documentation" : "Reading Materials, Lab Exercise"}</td>
                            <td><span className={`badge ${i < 10 ? "badge-success" : i === 10 ? "badge-warning" : "badge-secondary"}`} style={{ fontSize: "10px" }}>{i < 10 ? "Completed" : i === 10 ? "In Progress" : "Upcoming"}</span></td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {detailSubTab === "Tasks" && (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr><th>ID</th><th>Task Title</th><th>Difficulty</th><th>Deadline</th></tr>
                      </thead>
                      <tbody>
                        {tasks.filter(t => t.domain === selectedProgramDomain).map((t) => (
                          <tr key={t.id}>
                            <td style={{ color: "#6b7280", fontSize: "12px" }}>TSK-{t.id}</td>
                            <td><b>{t.title}</b></td>
                            <td><span className={`badge ${t.difficulty === 'Hard' ? 'badge-danger' : t.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}`}>{t.difficulty}</span></td>
                            <td>{t.deadline}</td>
                          </tr>
                        ))}
                        {tasks.filter(t => t.domain === selectedProgramDomain).length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No tasks assigned to this domain yet.</td></tr>
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
        const currentCandidates = onboardingCandidates.filter(c => c.stage === onboardingSubTab);
        return (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
              {["Resume", "Interview", "Payment"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setOnboardingSubTab(tab)} 
                  className={`btn ${onboardingSubTab === tab ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "8px 16px", borderRadius: "20px" }}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Domain</th>
                    {onboardingSubTab === "Resume" && <th>Resume</th>}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCandidates.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No candidates in this stage.</td></tr>
                  ) : currentCandidates.map((c) => (
                    <tr key={c.id}>
                      <td><b>{c.name}</b></td>
                      <td><span className="badge badge-success">{c.domain}</span></td>
                      {onboardingSubTab === "Resume" && (
                        <td>
                          <button onClick={(e) => { e.preventDefault(); setActiveDocument({ type: 'Resume', candidate: c }); setViewedDocs({...viewedDocs, [`${c.id}-resume`]: true }); }} style={{ color: "#2563eb", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}>View Resume</button>
                        </td>
                      )}
                      <td>
                        {onboardingSubTab === "Resume" && viewedDocs[`${c.id}-resume`] && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => moveCandidateStage(c.id, "Interview")} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>Require Interview</button>
                            <button onClick={() => moveCandidateStage(c.id, "Payment")} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>Skip to Payment</button>
                          </div>
                        )}
                        {onboardingSubTab === "Interview" && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => setOnboardingCandidates(onboardingCandidates.filter(cand => cand.id !== c.id))} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", color: "#dc2626", borderColor: "#fecaca" }}>Decline</button>
                            <button onClick={() => moveCandidateStage(c.id, "Payment")} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#10b981", borderColor: "#10b981" }}>Approve</button>
                          </div>
                        )}
                        {onboardingSubTab === "Payment" && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => { setActiveDocument({ type: 'PaymentProof', candidate: c }); setViewedDocs({...viewedDocs, [`${c.id}-payment`]: true }); }} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>View Proof</button>
                            {viewedDocs[`${c.id}-payment`] && (
                              <button onClick={() => enrollCandidate(c.id)} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#10b981", borderColor: "#10b981" }}>Verify Payment & Enroll</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal for viewing documents */}
            {activeDocument && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
                <div className="card" style={{ width: "500px", margin: 0, minHeight: "300px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0 }}>
                      {activeDocument.type === 'Resume' ? `Resume: ${activeDocument.candidate.name}` :
                       activeDocument.type === 'Interview' ? `Interview Results: ${activeDocument.candidate.name}` :
                       `Payment Proof: ${activeDocument.candidate.name}`}
                    </h3>
                    <button onClick={() => setActiveDocument(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}>&times;</button>
                  </div>
                  
                  <div style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", border: "1px dashed #d1d5db" }}>
                    {activeDocument.type === 'Resume' && <p style={{ color: "#6b7280", textAlign: "center" }}>📄 [PDF Mock]<br/>Resume document loaded for {activeDocument.candidate.name}.</p>}
                    {activeDocument.type === 'Interview' && (
                      <div style={{ textAlign: "center" }}>
                        <h4 style={{ color: "#10b981", marginBottom: "8px", fontSize: "24px" }}>Status: Passed</h4>
                        <p style={{ color: "#4b5563", margin: "8px 0", fontSize: "16px" }}>Technical Score: <strong>85/100</strong></p>
                        <p style={{ color: "#4b5563", margin: "8px 0", fontSize: "16px" }}>Communication: <strong>Excellent</strong></p>
                      </div>
                    )}
                    {activeDocument.type === 'PaymentProof' && (
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>🧾</p>
                        <p style={{ color: "#10b981", margin: "0 0 8px 0", fontWeight: "bold", fontSize: "18px" }}>Transaction Successful</p>
                        <p style={{ color: "#4b5563", margin: 0 }}>Amount: $500.00</p>
                      </div>
                    )}
                  </div>
                  
                  <button className="btn btn-primary" onClick={() => setActiveDocument(null)} style={{ marginTop: "16px", alignSelf: "flex-end" }}>Close & Continue</button>
                </div>
              </div>
            )}
          </div>
        );

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
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }} onClick={() => handleUpdateTicketStatus("Resolved")}>Mark as Resolved</button>
                  <button className="btn btn-secondary" style={{ color: "#b91c1c", borderColor: "#fca5a5", backgroundColor: "#fef2f2" }} onClick={() => handleUpdateTicketStatus("Rejected")}>Reject Ticket</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
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
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#1f2937" }}>{selectedTicket.title}</h4>
                <div style={{ padding: "16px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>
                  {selectedTicket.description}
                </div>
              </div>

              <div>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Comments & Updates</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {selectedTicket.comments.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>No comments yet.</p>
                  ) : (
                    selectedTicket.comments.map((comment, idx) => (
                      <div key={idx} style={{ padding: "12px", backgroundColor: comment.author === "Super Admin" ? "#eff6ff" : "#f3f4f6", borderRadius: "8px", border: `1px solid ${comment.author === "Super Admin" ? "#bfdbfe" : "#e5e7eb"}` }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: comment.author === "Super Admin" ? "#1d4ed8" : "#374151", marginBottom: "4px" }}>{comment.author}</div>
                        <div style={{ fontSize: "13px", color: "#1f2937" }}>{comment.text}</div>
                      </div>
                    ))
                  )}
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
                      <th style={{ padding: "12px 16px" }}>Question</th>
                      <th style={{ padding: "12px 16px" }}>Points</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px" }}>Time Limit</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusAirdrops.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No airdrops available.</td>
                      </tr>
                    ) : (
                      [...bonusAirdrops].reverse().map(airdrop => (
                        <tr 
                          key={airdrop.id} 
                          onClick={() => setSelectedAirdrop(airdrop)} 
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: "12px 16px", fontWeight: "600", color: "#475569" }}>{airdrop.id}</td>
                          <td style={{ padding: "12px 16px" }}>{airdrop.question.length > 50 ? airdrop.question.substring(0, 50) + "..." : airdrop.question}</td>
                          <td style={{ padding: "12px 16px", color: "#b91c1c", fontWeight: "600" }}>{Math.max(0, ...airdrop.points.map(Number))} pts</td>
                          <td style={{ padding: "12px 16px" }}>
                            {airdrop.status === "PENDING_APPROVAL" ? (
                              <span className="badge badge-warning">PENDING_APPROVAL</span>
                            ) : (
                              <span className={`badge ${airdrop.status === 'APPROVED' ? 'badge-primary' : 'badge-success'}`}>
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
                                  handleApproveAirdrop(airdrop.id);
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

      default:
        return null;
    }
  };

  const navItems = [
    { id: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "Analytics", icon: <TrendingUp size={18} /> },
    { id: "Onboarding", icon: <ClipboardCheck size={18} /> },
    { id: "Users", icon: <Users size={18} /> },
    { id: "Programs", icon: <BookOpen size={18} /> },
    { id: "Credentials", icon: <Award size={18} /> },
    { id: "Tickets", icon: <LifeBuoy size={18} /> },
    { id: "Bonus Airdrops", icon: <Gift size={18} /> },
    { id: "Leaderboard", icon: <Medal size={18} /> }
  ];

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
            {navItems.map((item) => (
              <li
                key={item.id}
                className={activeTab === item.id ? "active" : ""}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "Bonus Airdrops") setSelectedAirdrop(null);
                }}
                title={!isSidebarOpen ? item.id : ""}
              >
                <span>{item.icon}</span>
                {isSidebarOpen && <span className="sidebar-text" style={{ marginLeft: "12px" }}>{item.id}</span>}
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
        <div className="header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>☰</button>}
            <h2 style={{ margin: 0 }}>{activeTab}</h2>
          </div>
          
          {/* Top right profile & actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#6B7280" />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
            </div>
            <div style={{ height: '32px', width: '1px', backgroundColor: '#e5e7eb' }}></div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: 'flex-end' }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: '#1f2937' }}>Super Admin</span>
                <span style={{ fontSize: "12px", color: "#6B7280" }}>admin@gmail.com</span>
              </div>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#2563eb", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px", fontWeight: "bold" }}>
                SA
              </div>
            </div>
          </div>
        </div>

        <div className="main-content-scroll">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}