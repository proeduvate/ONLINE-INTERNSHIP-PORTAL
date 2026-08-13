import { useState } from "react";
import "../styles/Dashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  // State Mock Data
  const [usersList, setUsersList] = useState([
    { id: "INT001", name: "John Doe", role: "Intern", college: "MIT", domain: "Artificial Intelligence", mentor: "Dr. Sakthi", progress: "60%", attendance: "95%", status: "Active" },
    { id: "INT002", name: "Raj Patel", role: "Intern", college: "Stanford", domain: "Data Science", mentor: "Dr. Sakthi", progress: "80%", attendance: "90%", status: "Active" },
    { id: "INT003", name: "Anu Sharma", role: "Intern", college: "IIT", domain: "Cyber Security", mentor: "Dr. Sakthi", progress: "75%", attendance: "88%", status: "Active" },
    { id: "MNT101", name: "Dr. Sakthi", role: "Mentor", college: "-", domain: "AI/DS/Cyber", mentor: "-", progress: "-", attendance: "98%", status: "Active" },
  ]);

  const [domains] = useState([
    { name: "Artificial Intelligence", duration: "12 Weeks", interns: 14, mentors: 2, status: "Active" },
    { name: "Data Science", duration: "8 Weeks", interns: 12, mentors: 2, status: "Active" },
    { name: "Cyber Security", duration: "10 Weeks", interns: 8, mentors: 1, status: "Active" },
    { name: "Web Development", duration: "8 Weeks", interns: 10, mentors: 3, status: "Active" },
    { name: "UI UX Design", duration: "6 Weeks", interns: 6, mentors: 2, status: "Active" },
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

  // Form inputs
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Intern", college: "", domain: "", mentor: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", difficulty: "Medium", deadline: "", domain: "" });
  const [newCurriculum, setNewCurriculum] = useState({ day: "", topic: "", resources: "", domain: "Web Development" });
  const [newMeeting, setNewMeeting] = useState({ title: "", time: "", mentor: "", link: "" });

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

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return alert("Please specify task title.");
    const created = {
      id: tasks.length + 1,
      title: newTask.title,
      difficulty: newTask.difficulty,
      deadline: newTask.deadline || "TBD",
      domain: newTask.domain || "General",
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

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>
            {/* Top Row: Quick Profile Card */}
            <div className="card" style={{ display: "flex", gap: "20px", alignItems: "center", padding: "16px 24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#2563EB", color: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", fontWeight: "bold" }}>
                A
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px" }}>Super Administrator</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Email: admin@gmail.com | Status: <b>Online</b></p>
              </div>
            </div>

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
                <span className="stat-title">Average Performance</span>
                <span className="stat-value">78%</span>
                <span className="stat-desc">Based on AI & Mentor scores</span>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
              <div className="card" style={{ margin: 0 }}>
                <h3>Recent Evaluation Timeline</h3>
                <p style={{ marginBottom: "12px" }}>📍 Intern <b>John Doe</b> scored 85% in "React To-Do App" tasks (AI: 90%, Mentor: 80%) - 1 hour ago</p>
                <p style={{ marginBottom: "12px" }}>📍 Intern <b>Raj Patel</b> submitted code for "Predictive Neural Network" - 3 hours ago</p>
                <p style={{ marginBottom: "0px" }}>📍 Mentor <b>Dr. Sakthi</b> scheduled a review meeting with Interns - 4 hours ago</p>
              </div>

              <div className="card" style={{ margin: 0 }}>
                <h3>System Config Settings</h3>
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px" }}>SMTP Host</label>
                  <input className="form-control" type="text" defaultValue="smtp.internportal.com" style={{ padding: "6px 10px", fontSize: "12px" }} />
                </div>
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px" }}>Autopilot Mode</label>
                  <select className="form-control" style={{ padding: "6px 10px", fontSize: "12px" }}>
                    <option>Strict (AI + Mentor)</option>
                    <option>AI-Only Auto-pass</option>
                  </select>
                </div>
                <button onClick={() => alert("Settings Saved!")} className="btn btn-primary" style={{ width: "100%", padding: "6px", fontSize: "12px" }}>Save Config</button>
              </div>
            </div>

            <div className="card" style={{ marginTop: "24px" }}>
              <h3>Completion Analytics</h3>
              <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb", textAlign: "center" }}>
                <p style={{ fontWeight: 600, color: "#2563EB", marginBottom: "8px" }}>📊 Overall Completion Rates</p>
                <div style={{ height: "20px", background: "#E5E7EB", borderRadius: "10px", overflow: "hidden", margin: "10px 0" }}>
                  <div style={{ width: "78%", background: "#2563EB", height: "100%" }}></div>
                </div>
                <span>78% of all interns have completed daily curriculum milestones.</span>
              </div>
            </div>
          </>
        );

      case "Users":
        return (
          <div className="card">
            <h3>User Base Management</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>Add, filter, and deactivate program mentors and interns.</p>
            
            {/* Add User Form */}
            <form onSubmit={handleAddUser} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              <input 
                className="form-control" 
                type="text" 
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
              <input 
                className="form-control" 
                type="text" 
                placeholder="College / Dept"
                value={newUser.college}
                onChange={(e) => setNewUser({...newUser, college: e.target.value})}
              />
              <input 
                className="form-control" 
                type="text" 
                placeholder="Domain"
                value={newUser.domain}
                onChange={(e) => setNewUser({...newUser, domain: e.target.value})}
              />
              <input 
                className="form-control" 
                type="text" 
                placeholder="Mentor Name (if Intern)"
                value={newUser.mentor}
                onChange={(e) => setNewUser({...newUser, mentor: e.target.value})}
              />
              <select 
                className="form-control" 
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="Intern">Intern</option>
                <option value="Mentor">Mentor</option>
              </select>
              <button type="submit" className="btn btn-primary">Add User</button>
            </form>

            {/* Users Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>College/Dept</th>
                    <th>Domain</th>
                    <th>Mentor</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td><b>{user.name}</b></td>
                      <td><span className="badge" style={{ backgroundColor: user.role === "Intern" ? "#eff6ff" : "#ecfdf5", color: user.role === "Intern" ? "#2563eb" : "#10b981" }}>{user.role}</span></td>
                      <td>{user.college}</td>
                      <td>{user.domain}</td>
                      <td>{user.mentor}</td>
                      <td>{user.progress}</td>
                      <td>
                        <span className={`badge badge-${user.status === "Active" ? "success" : "danger"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => toggleUserStatus(user.id)} className={`btn ${user.status === "Active" ? "btn-danger" : "btn-primary"}`} style={{ padding: "4px 8px", fontSize: "12px" }}>
                          {user.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Programs":
        return (
          <div>
            {/* Row 1: Active Domains Grid */}
            <div className="card">
              <h3>Active Internship Domains</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {domains.map((dom, i) => (
                  <div key={i} className="card" style={{ border: "1px solid #E5E7EB", margin: 0, padding: "16px" }}>
                    <h4 style={{ color: "#2563EB", fontWeight: "600", marginBottom: "6px", fontSize: "14px" }}>{dom.name}</h4>
                    <p style={{ fontSize: "12px", margin: "2px 0" }}>Duration: {dom.duration}</p>
                    <p style={{ fontSize: "12px", margin: "2px 0" }}>Interns: {dom.interns} | Mentors: {dom.mentors}</p>
                    <span className="badge badge-success" style={{ marginTop: "8px", fontSize: "10px" }}>{dom.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Curriculum Creator */}
            <div className="card">
              <h3>Curriculum Uplink Manager</h3>
              <form onSubmit={handleUploadCurriculum} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <input className="form-control" type="text" placeholder="Day (e.g. Day 3)" value={newCurriculum.day} onChange={(e) => setNewCurriculum({...newCurriculum, day: e.target.value})} />
                <input className="form-control" type="text" placeholder="Topic Title" value={newCurriculum.topic} onChange={(e) => setNewCurriculum({...newCurriculum, topic: e.target.value})} />
                <input className="form-control" type="text" placeholder="Resource Links" value={newCurriculum.resources} onChange={(e) => setNewCurriculum({...newCurriculum, resources: e.target.value})} />
                <select className="form-control" value={newCurriculum.domain} onChange={(e) => setNewCurriculum({...newCurriculum, domain: e.target.value})}>
                  <option value="Web Development">Web Development</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </select>
                <button type="submit" className="btn btn-primary">Upload Topic</button>
              </form>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Day</th><th>Topic</th><th>Resources</th><th>Domain</th></tr>
                  </thead>
                  <tbody>
                    {curriculumList.map((cur, i) => (
                      <tr key={i}><td>{cur.day}</td><td><b>{cur.topic}</b></td><td>{cur.resources}</td><td>{cur.domain}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 3: Tasks Configuration */}
            <div className="card">
              <h3>Task Configurations & Assignments</h3>
              <form onSubmit={handleCreateTask} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <input className="form-control" type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                <input className="form-control" type="date" value={newTask.deadline} onChange={(e) => setNewTask({...newTask, deadline: e.target.value})} />
                <select className="form-control" value={newTask.difficulty} onChange={(e) => setNewTask({...newTask, difficulty: e.target.value})}>
                  <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                </select>
                <select className="form-control" value={newTask.domain} onChange={(e) => setNewTask({...newTask, domain: e.target.value})}>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Web Development">Web Development</option>
                </select>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </form>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>ID</th><th>Task Title</th><th>Difficulty</th><th>Deadline</th><th>Domain</th></tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id}><td>{t.id}</td><td><b>{t.title}</b></td><td>{t.difficulty}</td><td>{t.deadline}</td><td>{t.domain}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 4: Review Meetings scheduling */}
            <div className="card">
              <h3>Review Meetings Planner</h3>
              <form onSubmit={handleScheduleMeeting} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <input className="form-control" type="text" placeholder="Meeting Topic" value={newMeeting.title} onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})} />
                <input className="form-control" type="text" placeholder="Time (e.g. 2026-08-09 2:00 PM)" value={newMeeting.time} onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})} />
                <input className="form-control" type="text" placeholder="Zoom Join URL" value={newMeeting.link} onChange={(e) => setNewMeeting({...newMeeting, link: e.target.value})} />
                <button type="submit" className="btn btn-primary">Schedule Meeting</button>
              </form>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>ID</th><th>Topic</th><th>Scheduled Time</th><th>Mentor</th><th>Zoom Action</th></tr>
                  </thead>
                  <tbody>
                    {meetings.map((meet) => (
                      <tr key={meet.id}><td>{meet.id}</td><td><b>{meet.title}</b></td><td>{meet.time}</td><td>{meet.mentor}</td><td><a href={meet.link} target="_blank" rel="noreferrer">Open Zoom</a></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                    <th>Attendance Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Raj Patel</b></td>
                    <td>Data Science</td>
                    <td>80%</td>
                    <td>90%</td>
                    <td>
                      <button onClick={() => alert("Certificate generated for Raj Patel! Verification Key: CERT-DS-884")} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        Generate & Email
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td><b>Anu Sharma</b></td>
                    <td>Cyber Security</td>
                    <td>75%</td>
                    <td>88%</td>
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

      default:
        return null;
    }
  };

  return (
    <div className="container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div>
          <h2>Admin Panel</h2>
          <ul>
            {[
              "Overview",
              "Users",
              "Programs",
              "Credentials"
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
            Role: <b>Administrator</b>
          </span>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}