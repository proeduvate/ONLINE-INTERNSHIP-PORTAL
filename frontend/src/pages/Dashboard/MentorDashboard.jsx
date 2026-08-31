import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import "../../styles/Dashboard.css";
import BreakoutRoomsApp from "../breakout-rooms/BreakoutRoomsApp";

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

  useEffect(() => {
    const storedAirdrops = localStorage.getItem("app_bonus_airdrops");
    if (storedAirdrops) {
      setBonusAirdrops(JSON.parse(storedAirdrops));
    }
  }, []);

  const handleCreateAirdrop = (e) => {
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

    const newAirdropObj = {
      id: bonusAirdrops.length > 0 ? Math.max(...bonusAirdrops.map(a => a.id)) + 1 : 1,
      title: newAirdrop.title,
      taskType: newAirdrop.taskType,
      question: newAirdrop.taskType === "Match the Following"
        ? "Match the following pairs correctly."
        : newAirdrop.taskType === "Arrange in Order"
        ? "Arrange the items in the correct sequence."
        : newAirdrop.question,
      correctAnswer: newAirdrop.taskType === "Match the Following"
        ? JSON.stringify(newAirdrop.matchPairs)
        : newAirdrop.taskType === "Arrange in Order"
        ? JSON.stringify(newAirdrop.arrangeItems)
        : newAirdrop.correctAnswer,
      mcqOptions: newAirdrop.taskType === "Multiple Choice" ? newAirdrop.mcqOptions : null,
      matchPairs: newAirdrop.taskType === "Match the Following" ? newAirdrop.matchPairs : null,
      arrangeItems: newAirdrop.taskType === "Arrange in Order" ? newAirdrop.arrangeItems : null,
      startMode: newAirdrop.startMode,
      startDate: newAirdrop.startDate,
      startTime: `${newAirdrop.startTimeHour}:${newAirdrop.startTimeMinute} ${newAirdrop.startTimeAmPm}`,
      endDate: newAirdrop.endDate,
      endTime: `${newAirdrop.endTimeHour}:${newAirdrop.endTimeMinute} ${newAirdrop.endTimeAmPm}`,
      winners: newAirdrop.winners,
      points: newAirdrop.points.map(p => p || "0"),
      timeLimit: newAirdrop.timeLimit || "60",
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString()
    };

    const updatedAirdrops = [...bonusAirdrops, newAirdropObj];
    setBonusAirdrops(updatedAirdrops);
    localStorage.setItem("app_bonus_airdrops", JSON.stringify(updatedAirdrops));

    setShowAirdropModal(false);
    setNewAirdrop(defaultAirdropState);
    alert("Bonus Airdrop created and sent to Admin for approval!");
  };

  // State Mock Data
  const [assignedInterns] = useState([
    { id: "INT001", name: "John Doe", progress: "60%", attendance: "95%", score: "82%", weakAreas: "CSS layouts, Async operations", batch: "Batch A" },
    { id: "INT002", name: "Raj Patel", progress: "80%", attendance: "90%", score: "88%", weakAreas: "Python pandas, Data visualization", batch: "Batch A" },
    { id: "INT003", name: "Anu Sharma", progress: "75%", attendance: "88%", score: "79%", weakAreas: "Buffer overflow details", batch: "Batch A" },
    { id: "INT004", name: "Sara Smith", progress: "90%", attendance: "98%", score: "94%", weakAreas: "None", batch: "Batch B" },
    { id: "INT005", name: "Mike Johnson", progress: "50%", attendance: "80%", score: "72%", weakAreas: "React Hooks", batch: "Batch B" },
  ]);

  const [selectedBatch, setSelectedBatch] = useState("Batch A");

  const [submissions, setSubmissions] = useState([
    { id: 1, intern: "John Doe", task: "React To-Do App", code: "const todoList = []; function add() { ... }", aiScore: "85%", aiFeedback: "Good structure. Suggestions: Use key attribute in list rendering.", status: "Pending", mentorFeedback: "", score: "" },
    { id: 2, intern: "Raj Patel", task: "Predictive Model Python", code: "import pandas as pd\nmodel.fit(X, y)", aiScore: "92%", aiFeedback: "Optimized hyperparameters. Suggestions: Include residual analysis plots.", status: "Pending", mentorFeedback: "", score: "" }
  ]);

  const [meetings, setMeetings] = useState([
    { id: 1, title: "Anu Weekly Review", time: "Today, 3:00 PM", status: "Upcoming" },
    { id: 2, title: "Raj Weekly Review", time: "Tomorrow, 10:00 AM", status: "Scheduled" }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { sender: "John Doe", text: "Hello mentor, when is my React code evaluation meeting?", time: "10:15 AM" },
    { sender: "You", text: "Hi John, I will schedule it for tomorrow at 2:00 PM.", time: "10:30 AM" }
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedInternForChat, setSelectedInternForChat] = useState(null);

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
    { day: "Day 6",  topic: "Supervised Learning â€“ Regression", resources: "Slides, Colab Notebook" },
    { day: "Day 7",  topic: "Supervised Learning â€“ Classification", resources: "Github Repo, Slides PDF" },
    { day: "Day 8",  topic: "Model Evaluation & Metrics",       resources: "Scikit-learn Docs, Quiz" },
    { day: "Day 9",  topic: "Feature Engineering",              resources: "Kaggle Notebook, PDF" },
    { day: "Day 10", topic: "Unsupervised Learning â€“ Clustering", resources: "K-Means Lab, Video" },
    { day: "Day 11", topic: "Dimensionality Reduction (PCA)",   resources: "Slides, Code Exercise" },
    { day: "Day 12", topic: "Decision Trees & Random Forests",  resources: "Scikit-learn Guide, Notebook" },
    { day: "Day 13", topic: "Support Vector Machines",          resources: "Research Paper, Lab" },
    { day: "Day 14", topic: "Neural Networks â€“ Basics",         resources: "3Blue1Brown Video, PDF" },
    { day: "Day 15", topic: "Mid-term Assessment",              resources: "Assessment Portal" },
    { day: "Day 16", topic: "Deep Learning with TensorFlow",    resources: "TF Docs, Colab" },
    { day: "Day 17", topic: "CNN â€“ Image Classification",       resources: "Fast.ai, CIFAR Dataset" },
    { day: "Day 18", topic: "RNN & LSTM â€“ Sequence Models",     resources: "Andrej Karpathy Blog, Code" },
    { day: "Day 19", topic: "NLP â€“ Text Processing",            resources: "NLTK Docs, Notebook" },
    { day: "Day 20", topic: "Transformers & Attention",         resources: "Hugging Face Tutorial" },
    { day: "Day 21", topic: "Transfer Learning",                resources: "Keras Guide, Pretrained Models" },
    { day: "Day 22", topic: "Model Deployment â€“ Flask API",     resources: "Flask Docs, Postman" },
    { day: "Day 23", topic: "Docker & Cloud Basics",            resources: "Docker Tutorial, AWS Guide" },
    { day: "Day 24", topic: "MLOps Fundamentals",               resources: "MLflow Docs, Video" },
    { day: "Day 25", topic: "Project Planning & Architecture",  resources: "Project Template, Rubric" },
    { day: "Day 26", topic: "Project â€“ Data Collection & EDA",  resources: "Dataset Links, EDA Checklist" },
    { day: "Day 27", topic: "Project â€“ Model Training",         resources: "Training Guide, GPU Colab" },
    { day: "Day 28", topic: "Project â€“ Evaluation & Tuning",    resources: "Hyperparameter Tuning Docs" },
    { day: "Day 29", topic: "Project â€“ Deployment & Demo",      resources: "Deployment Checklist, Hosting" },
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

  const handleReviewSubmission = (id, action, score, feedback) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id 
        ? { ...sub, status: action === "Approve" ? "Approved" : "Rejected", score: score, mentorFeedback: feedback } 
        : sub
    ));
    alert(`Submission has been ${action === "Approve" ? "Approved" : "Rejected"}!`);
  };

  const handleCreateMeeting = (title, time) => {
    if (!title || !time) return alert("Fill in title & time!");
    setMeetings([...meetings, { id: meetings.length + 1, title, time, status: "Scheduled" }]);
    alert("Meeting created!");
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
                <span style={{ fontSize: "28px" }}>💬</span>
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
              <span style={{ fontSize: "28px" }}>📅</span>
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
              <div className="stat-card">
                <span className="stat-title">Assigned Interns</span>
                <span className="stat-value">{assignedInterns.length}</span>
                <span className="stat-desc">Tracking active progression</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Pending Reviews</span>
                <span className="stat-value">{submissions.filter(s => s.status === "Pending").length}</span>
                <span className="stat-desc">Awaiting your feedback & score</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Meetings Today</span>
                <span className="stat-value">1</span>
                <span className="stat-desc">Review meeting at 3:00 PM</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Average Performance</span>
                <span className="stat-value">83%</span>
                <span className="stat-desc">Calculated score of assigned cohort</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="card" style={{ margin: 0, paddingBottom: 0 }}>
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Review Backlog Tracker</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={backlogData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} dx={-10} />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Submitted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Evaluated" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff5f5", borderColor: "#fecaca" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: "8px" }}>âš ï¸ At-Risk Interns</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto" }}>
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700 }}>Mike Johnson</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Batch B</span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#475569" }}>Low progress (50%) and struggles with React Hooks.</p>
                    <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "#dc2626", borderColor: "#fca5a5", width: "100%", marginTop: "6px" }}>Schedule Intervention</button>
                  </div>
                  
                  <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 700 }}>Anu Sharma</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>Batch A</span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#475569" }}>Missing assignments and attendance dropping.</p>
                    <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", color: "#dc2626", borderColor: "#fca5a5", width: "100%", marginTop: "6px" }}>Send Message</button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
              <div className="card" style={{ marginBottom: 0 }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Upcoming Schedule</h3>
                <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#1f2937" }}>React Code Review</h4>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Today, 2:00 PM - 3:00 PM</span>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: "10px" }}>Meeting</span>
                  </div>
                  <div style={{ borderTop: "1px solid #e5e7eb" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#1f2937" }}>Final Project Submissions</h4>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Tomorrow, 11:59 PM</span>
                    </div>
                    <span className="badge badge-danger" style={{ fontSize: "10px" }}>Deadline</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Batch Leaderboard</h3>
                  <select 
                    value={selectedBatch} 
                    onChange={(e) => setSelectedBatch(e.target.value)} 
                    style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #e5e7eb", outline: "none", backgroundColor: "#f9fafb" }}
                  >
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                  </select>
                </div>
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="table" style={{ margin: 0, fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "8px 12px" }}>Rank</th>
                        <th style={{ padding: "8px 12px" }}>Intern Name</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...assignedInterns]
                        .filter(intern => intern.batch === selectedBatch)
                        .sort((a, b) => parseInt(b.score) - parseInt(a.score))
                        .map((intern, index) => (
                        <tr key={intern.id}>
                          <td style={{ padding: "8px 12px" }}>
                            {index === 0 ? "ðŸ¥‡" : index === 1 ? "ðŸ¥ˆ" : index === 2 ? "ðŸ¥‰" : `#${index + 1}`}
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{intern.name}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right" }}><span className="badge badge-primary">{intern.score}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              {submissions.filter(s => s.status === "Pending").length === 0 ? (
                <p><b>ðŸŽ‰ All submissions have been evaluated!</b></p>
              ) : (
                submissions.filter(s => s.status === "Pending").map(sub => {
                  let tempScore = "";
                  let tempFeedback = "";
                  return (
                    <div key={sub.id} className="card" style={{ border: "1px solid #E5E7EB", background: "#ffffff", marginBottom: "16px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {/* Left Side: Intern Details & AI Analysis */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#4f46e5", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "16px" }}>
                              {sub.intern.split(" ")[0][0]}{sub.intern.split(" ")[1] ? sub.intern.split(" ")[1][0] : ""}
                            </div>
                            <div>
                              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>{sub.intern}</h4>
                              <div style={{ fontSize: "13px", color: "#6b7280" }}>Task: <span style={{ fontWeight: 600, color: "#374151" }}>{sub.task}</span></div>
                            </div>
                          </div>
                          
                          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "#1E3A8A" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, marginBottom: "4px", fontSize: "13px" }}>
                              <span>ðŸ¤–</span> AI Evaluation: {sub.aiScore}
                            </div>
                            <div style={{ lineHeight: "1.5" }}>{sub.aiFeedback}</div>
                          </div>
                        </div>

                        {/* Right Side: GitHub, Inputs & Actions */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div style={{ alignSelf: "flex-end" }}>
                            <a href="https://github.com/mock-intern/repo" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "#24292e", color: "#ffffff", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600", transition: "opacity 0.2s" }}>
                              <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true" fill="currentColor">
                                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                              </svg>
                              View on GitHub
                            </a>
                          </div>

                          <div style={{ marginTop: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px" }}>
                              <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4b5563", marginBottom: "4px" }}>Final Score</label>
                                <input className="form-control" placeholder="e.g. 85%" onChange={(e) => { tempScore = e.target.value; }} style={{ margin: 0 }} />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#4b5563", marginBottom: "4px" }}>Mentor Feedback</label>
                                <input className="form-control" placeholder="Constructive remarks..." onChange={(e) => { tempFeedback = e.target.value; }} style={{ margin: 0 }} />
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleReviewSubmission(sub.id, "Reject", "0%", tempFeedback || "Needs rework")} className="btn btn-secondary" style={{ color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "#fef2f2", padding: "8px 24px" }}>Reject</button>
                              <button onClick={() => handleReviewSubmission(sub.id, "Approve", tempScore || "80%", tempFeedback || "Approved")} className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981", padding: "8px 24px" }}>Approve</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
                  <div className="card" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
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
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingTask(null)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                ) : viewingTask ? (
                  <div className="card" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button className="btn btn-secondary" style={{ padding: "4px 8px" }} onClick={() => setViewingTask(null)}>← Back</button>
                        <h4 style={{ margin: 0 }}>View Task TSK-{viewingTask.id}: {viewingTask.title}</h4>
                        <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "12px", marginLeft: "8px" }} onClick={() => { setEditingTask(viewingTask); setViewingTask(null); setTaskDetailTab("General"); }}>Edit Task</button>
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
                                  <span style={{ fontWeight: 600, marginRight: "8px" }}>{["A","B","C","D"][oi]}.</span> {opt} {oi === mcq.answer && <span style={{ float: "right" }}>✅</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {taskDetailTab === "Coding" && (
                      <div style={{ padding: "16px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <h5 style={{ margin: "0 0 12px", fontSize: "16px" }}>💻 {viewingTask.codingQuestion.title}</h5>
                        <div style={{ fontSize: "14px", marginBottom: "16px", lineHeight: "1.5" }}>{viewingTask.codingQuestion.description}</div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>Starter Code:</div>
                        <pre style={{ backgroundColor: "#1e293b", color: "#f8fafc", padding: "16px", borderRadius: "8px", fontSize: "13px", overflowX: "auto", margin: "0 0 16px 0", fontFamily: "monospace" }}>
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
                          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => { setViewingTask(t); setTaskDetailTab("MCQ"); }} className="hover-row">
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
      case "Bonus Airdrops":
        return (
          <div style={{ position: "relative", height: "100%" }}>
            
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
                    </tr>
                  </thead>
                  <tbody>
                    {bonusAirdrops.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No airdrops created yet.</td>
                      </tr>
                    ) : (
                      [...bonusAirdrops].reverse().map(airdrop => (
                        <tr key={airdrop.id}>
                          <td style={{ padding: "12px 16px", fontWeight: "600", color: "#475569" }}>{airdrop.id}</td>
                          <td style={{ padding: "12px 16px" }}>{airdrop.question.length > 60 ? airdrop.question.substring(0, 60) + "..." : airdrop.question}</td>
                          <td style={{ padding: "12px 16px", color: "#b91c1c", fontWeight: "600" }}>{Math.max(0, ...airdrop.points.map(Number))} pts</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span className={`badge ${airdrop.status === 'APPROVED' ? 'badge-primary' : airdrop.status === 'FINALIZED' ? 'badge-success' : 'badge-warning'}`}>
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
            </div>

            {showAirdropModal && (
              <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
                <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  
                  {/* Modal Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                        🏆
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>Create New Bonus Airdrop</h3>
                        <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>Create a time-bound bonus challenge for interns.</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setShowAirdropModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#475569"} onMouseLeave={(e) => e.target.style.color = "#94a3b8"}>✕</button>
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
                      <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                          <span style={{ fontSize: "16px" }}>📋</span>
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
                                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "#64748b", backgroundColor: "#ffffff" }}>
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
                                <span style={{ color: "#94a3b8", fontWeight: "bold" }}>➔</span>
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
                                  <button type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }} onClick={() => {
                                    const updated = newAirdrop.matchPairs.filter((_, i) => i !== idx);
                                    setNewAirdrop({...newAirdrop, matchPairs: updated});
                                  }}>🗑️</button>
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
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", width: "20px" }}>{idx + 1}.</span>
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
                                  <button type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }} onClick={() => {
                                    const updated = newAirdrop.arrangeItems.filter((_, i) => i !== idx);
                                    setNewAirdrop({...newAirdrop, arrangeItems: updated});
                                  }}>🗑️</button>
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
                          <span style={{ fontSize: "16px" }}>🕒</span>
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>Timing & Start Mode</h4>
                        </div>

                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Start Mode <span style={{ color: "#ef4444" }}>*</span></label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                          {/* Fixed Start Time Option */}
                          <div 
                            style={{ 
                              border: newAirdrop.startMode === "Fixed Start Time" ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                              borderRadius: "10px",
                              padding: "12px 16px",
                              cursor: "pointer",
                              display: "flex",
                              gap: "12px",
                              alignItems: "flex-start",
                              backgroundColor: newAirdrop.startMode === "Fixed Start Time" ? "#f5f3ff" : "#ffffff",
                              transition: "all 0.2s"
                            }}
                            onClick={() => setNewAirdrop({...newAirdrop, startMode: "Fixed Start Time"})}
                          >
                            <input 
                              type="radio" 
                              checked={newAirdrop.startMode === "Fixed Start Time"} 
                              readOnly 
                              style={{ marginTop: "4px", accentColor: "#4f46e5" }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>Fixed Start Time</div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>All eligible interns start at the same time</div>
                            </div>
                          </div>

                          {/* Flexible Start Option */}
                          <div 
                            style={{ 
                              border: newAirdrop.startMode === "Flexible Start" ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                              borderRadius: "10px",
                              padding: "12px 16px",
                              cursor: "pointer",
                              display: "flex",
                              gap: "12px",
                              alignItems: "flex-start",
                              backgroundColor: newAirdrop.startMode === "Flexible Start" ? "#f5f3ff" : "#ffffff",
                              transition: "all 0.2s"
                            }}
                            onClick={() => setNewAirdrop({...newAirdrop, startMode: "Flexible Start"})}
                          >
                            <input 
                              type="radio" 
                              checked={newAirdrop.startMode === "Flexible Start"} 
                              readOnly 
                              style={{ marginTop: "4px", accentColor: "#4f46e5" }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>Flexible Start</div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Interns can start anytime in the window</div>
                            </div>
                          </div>
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
                              <span style={{ color: "#64748b" }}>:</span>
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
                              <span style={{ color: "#64748b" }}>:</span>
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
                          <span style={{ fontSize: "16px" }}>🎁</span>
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
                            <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "4px" }}>Exact number of winners to be selected</span>
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
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px", borderTop: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
                      <button type="button" className="btn btn-secondary" style={{ padding: "10px 20px" }} onClick={() => setShowAirdropModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>Create Airdrop</button>
                    </div>
                  </form>
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
      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', gap: '10px', marginBottom: '30px' }}>
            {isSidebarOpen && <h2>Mentor Panel</h2>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>â˜°</button>
          </div>
          <ul>
            {[
              { id: "Overview", icon: "ðŸ“Š" },
              { id: "Cohort", icon: "ðŸ‘¥" },
              { id: "Evaluations", icon: "ðŸ“" },
              { id: "Programs", icon: "ðŸ“…" },
              { id: "Bonus Airdrops", icon: "ðŸŽ" },
              { id: "Breakout Rooms", icon: "ðŸ’¬" }
            ].map((tab) => (
              <li
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                title={!isSidebarOpen ? tab.id : ""}
              >
                <span>{tab.icon}</span>
                {isSidebarOpen && <span className="sidebar-text">{tab.id}</span>}
              </li>
            ))}
          </ul>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          {isSidebarOpen ? "Logout" : "ðŸšª"}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main" style={(activeTab === "Breakout Rooms" && isMeetingActive) ? { padding: 0, overflow: 'hidden', position: 'relative' } : {}}>
        {(activeTab !== "Breakout Rooms" || !isMeetingActive) ? (
          <div className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>☰</button>}
              <h2>{activeTab}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {activeTab === "Bonus Airdrops" && (
                <button className="btn btn-primary" onClick={() => setShowAirdropModal(true)}>+ Create Airdrop</button>
              )}
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>
                Role: <b>Mentor</b>
              </span>
            </div>
          </div>
        ) : (
          !isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2000, background: '#ffffff', border: '1px solid #e3e5e8', borderRadius: '4px', cursor: 'pointer', fontSize: '20px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              ☰
            </button>
          )
        )}

        {isMeetingActive && (
          <div style={{ display: activeTab === "Breakout Rooms" ? "block" : "none", height: "100%", width: "100%", position: activeTab === "Breakout Rooms" ? "absolute" : "relative", inset: 0, zIndex: 10 }}>
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
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#f2f3f5" }}>LIVE â€¢ {activeMeetingRoom}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button 
                onClick={() => setActiveTab("Breakout Rooms")}
                style={{ background: "none", border: "none", color: "#b5bac1", cursor: "pointer", fontSize: "16px", padding: "2px 4px" }}
                title="Maximize to full meeting screen"
              >
                â›¶
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
              <span>Return</span> â›¶
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
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          {/* Chat Header */}
          <div style={{ padding: "12px 16px", backgroundColor: "#1e293b", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", backgroundColor: "#10b981", borderRadius: "50%" }}></div>
              Chat with {selectedInternForChat}
            </div>
            <button onClick={() => setSelectedInternForChat(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "4px" }}>âœ–</button>
          </div>

          {/* Chat Messages */}
          <div style={{ flexGrow: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc" }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8", display: "block", marginBottom: "4px", textAlign: msg.sender === "You" ? "right" : "left" }}>
                  {msg.sender === "You" ? "" : `${msg.sender} â€¢ `}{msg.time}
                </span>
                <div style={{ 
                  backgroundColor: msg.sender === "You" ? "#3b82f6" : "#ffffff", 
                  color: msg.sender === "You" ? "#ffffff" : "#1e293b", 
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
          <form onSubmit={handleSendChatMessage} style={{ display: "flex", padding: "12px", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={currentMessage} 
              onChange={(e) => setCurrentMessage(e.target.value)} 
              style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "20px", padding: "8px 16px", fontSize: "13px", outline: "none", backgroundColor: "#f8fafc" }} 
            />
            <button type="submit" style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "600", cursor: "pointer", marginLeft: "12px" }}>Send</button>
          </form>
        </div>
      )}

    </div>
  );
}
