import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [domains, setDomains] = useState([]);
  
  // Form fields for onboarding
  const [onboardName, setOnboardName] = useState("");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [onboardPassword, setOnboardPassword] = useState("");
  const [onboardRole, setOnboardRole] = useState("intern");
  const [onboardCollege, setOnboardCollege] = useState("");
  const [onboardDomain, setOnboardDomain] = useState("");
  const [onboardMentor, setOnboardMentor] = useState("");
  const [onboardStart, setOnboardStart] = useState("2026-06-24");
  const [onboardEnd, setOnboardEnd] = useState("2026-07-24");

  // Form fields for Domain
  const [domName, setDomName] = useState("");
  const [domDesc, setDomDesc] = useState("");

  // Form fields for Task
  const [taskDomain, setTaskDomain] = useState("");
  const [taskDay, setTaskDay] = useState(1);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskVideo, setTaskVideo] = useState("https://www.youtube.com/embed/SqcY0GlETPk");
  const [taskDoc, setTaskDoc] = useState("https://react.dev/learn");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskResources, setTaskResources] = useState("");
  const [taskMCQs, setTaskMCQs] = useState("");
  const [taskPrompt, setTaskPrompt] = useState("");
  const [taskSolution, setTaskSolution] = useState("");
  const [taskTestCases, setTaskTestCases] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const adminName = localStorage.getItem("name") || "Administrator";

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchMentors = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users?role=mentor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMentors(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/domains`);
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
        if (data.length > 0) {
          setOnboardDomain(data[0].id);
          setTaskDomain(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // Auth Validation
    if (!token || localStorage.getItem("role") !== "admin") {
      navigate("/");
      return;
    }
    
    fetchAnalytics();
    fetchUsers();
    fetchMentors();
    fetchDomains();
  }, [token, active, navigate, fetchAnalytics, fetchUsers, fetchMentors, fetchDomains]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    const payload = {
      name: onboardName,
      email: onboardEmail,
      password: onboardPassword,
      role: onboardRole,
      college: onboardRole === "intern" ? onboardCollege : null,
      domain_id: onboardRole === "intern" ? parseInt(onboardDomain) : null,
      mentor_id: onboardRole === "intern" && onboardMentor ? parseInt(onboardMentor) : null,
      start_date: onboardStart,
      end_date: onboardEnd
    };

    try {
      const res = await fetch(`${API_BASE}/admin/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("User onboarded successfully!");
        setOnboardName("");
        setOnboardEmail("");
        setOnboardPassword("");
        fetchUsers();
        fetchMentors();
      } else {
        const err = await res.json();
        alert("Onboard failed: " + (err.detail || "Check input details"));
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleCreateDomain = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/domains`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: domName, description: domDesc })
      });
      if (res.ok) {
        alert("Domain created!");
        setDomName("");
        setDomDesc("");
        fetchDomains();
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const payload = {
      domain_id: parseInt(taskDomain),
      day_number: parseInt(taskDay),
      title: taskTitle,
      description: taskDesc,
      video_url: taskVideo,
      document_url: taskDoc,
      notes: taskNotes,
      resources: taskResources,
      mcq_questions: taskMCQs || null,
      coding_prompt: taskPrompt || null,
      coding_solution: taskSolution || null,
      test_cases: taskTestCases || null,
      deadline_days: 1
    };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Daily task created successfully!");
        setTaskTitle("");
        setTaskDesc("");
        setTaskPrompt("");
        setTaskSolution("");
        setTaskTestCases("");
      } else {
        alert("Failed to create task");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("User removed.");
        fetchUsers();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return (
          <>
            <div className="grid">
              <div className="metric-card">
                <div className="metric-title">Total Interns</div>
                <div className="metric-value">{analytics?.total_interns || 0}</div>
              </div>
              <div className="metric-card" style={{ borderColor: "rgba(255, 46, 99, 0.4)" }}>
                <div className="metric-title" style={{ color: "var(--accent)" }}>Active Mentors</div>
                <div className="metric-value">{analytics?.total_mentors || 0}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Tech Domains</div>
                <div className="metric-value">{analytics?.total_domains || 0}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">System Average Grade</div>
                <div className="metric-value">{analytics?.system_average_score || 0}%</div>
              </div>
            </div>

            <div className="card">
              <h3>Top Performing Interns</h3>
              <table>
                <thead>
                  <tr>
                    <th>Intern ID</th>
                    <th>Name</th>
                    <th>College</th>
                    <th>Domain</th>
                    <th>Progress</th>
                    <th>Attendance</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.intern_rankings?.map((i) => (
                    <tr key={i.id}>
                      <td><code style={{color: "var(--primary)"}}>{i.intern_id || "INT-2026-000"}</code></td>
                      <td><b>{i.name}</b></td>
                      <td>{i.college}</td>
                      <td><span className="badge badge-info">{i.domain}</span></td>
                      <td>{i.progress}%</td>
                      <td>{i.attendance}%</td>
                      <td><b>{i.total_score} pts</b></td>
                    </tr>
                  ))}
                  {(!analytics?.intern_rankings || analytics.intern_rankings.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{textAlign: "center"}}>No interns ranked yet. Seeding or submission needed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case "Users":
        return (
          <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", alignItems: "start" }}>
            <div className="card">
              <h3>Onboard User</h3>
              <form onSubmit={handleOnboard}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={onboardName} onChange={(e) => setOnboardName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={onboardEmail} onChange={(e) => setOnboardEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={onboardPassword} onChange={(e) => setOnboardPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>System Role</label>
                  <select value={onboardRole} onChange={(e) => setOnboardRole(e.target.value)}>
                    <option value="intern">Intern</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>

                {onboardRole === "intern" && (
                  <>
                    <div className="form-group">
                      <label>College / University</label>
                      <input type="text" value={onboardCollege} onChange={(e) => setOnboardCollege(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Allocate Domain</label>
                      <select value={onboardDomain} onChange={(e) => setOnboardDomain(e.target.value)}>
                        {domains.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Assign Mentor</label>
                      <select value={onboardMentor} onChange={(e) => setOnboardMentor(e.target.value)}>
                        <option value="">No Mentor</option>
                        {mentors.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" value={onboardStart} onChange={(e) => setOnboardStart(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" value={onboardEnd} onChange={(e) => setOnboardEnd(e.target.value)} />
                    </div>
                  </>
                )}

                <button type="submit" className="btn" style={{ width: "100%" }}>Create User</button>
              </form>
            </div>

            <div className="card">
              <h3>Active Users Directory</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Info</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><b>{u.name}</b></td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === "admin" ? "badge-error" : (u.role === "mentor" ? "badge-warning" : "badge-success")}`}>{u.role}</span></td>
                      <td>{u.role === "intern" ? `${u.college} | ID: ${u.intern_id}` : "System Access"}</td>
                      <td>
                        {u.role !== "admin" && (
                          <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }}>Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Tasks":
        return (
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
            <div className="card">
              <h3>Upload Structured Task</h3>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label>Tech Domain</label>
                  <select value={taskDomain} onChange={(e) => setTaskDomain(e.target.value)}>
                    {domains.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Curriculum Day Number (1 - 30)</label>
                  <input type="number" min="1" max="30" value={taskDay} onChange={(e) => setTaskDay(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Task Title</label>
                  <input type="text" value={taskTitle} placeholder="React hooks basics" onChange={(e) => setTaskTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Problem Description</label>
                  <textarea rows="4" value={taskDesc} placeholder="Detail the guidelines for the task" onChange={(e) => setTaskDesc(e.target.value)} required></textarea>
                </div>
                <div className="form-group">
                  <label>Video Tutorial URL (Embed link)</label>
                  <input type="text" value={taskVideo} onChange={(e) => setTaskVideo(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Reading Documentation Link</label>
                  <input type="text" value={taskDoc} onChange={(e) => setTaskDoc(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Study Notes</label>
                  <textarea rows="3" value={taskNotes} placeholder="Brief summary notes" onChange={(e) => setTaskNotes(e.target.value)}></textarea>
                </div>
                <div className="form-group">
                  <label>Extra Resources (Comma separated)</label>
                  <input type="text" value={taskResources} placeholder="Link1, Link2" onChange={(e) => setTaskResources(e.target.value)} />
                </div>
                <button type="submit" className="btn" style={{ width: "100%" }}>Publish Task</button>
              </form>
            </div>

            <div className="card">
              <h3>AI Assessment Setup</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Add assessments below linked to the task details. MCQ and Coding schemas will feed the AI grading analyzer.
              </p>
              <div className="form-group">
                <label>MCQ Questions JSON schema</label>
                <textarea 
                  rows="5" 
                  value={taskMCQs} 
                  placeholder='[{"id": 1, "question": "What is React?", "options": ["Library", "Language"], "correct_option": "Library"}]' 
                  onChange={(e) => setTaskMCQs(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Coding Console Starter Prompt</label>
                <textarea 
                  rows="4" 
                  value={taskPrompt} 
                  placeholder="def sum(a,b):&#10;    # Write code here" 
                  onChange={(e) => setTaskPrompt(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Test Cases JSON schema</label>
                <textarea 
                  rows="4" 
                  value={taskTestCases} 
                  placeholder='[{"input": "2,3", "expected": "5"}]' 
                  onChange={(e) => setTaskTestCases(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Expected Logic Output / Ideal Solution</label>
                <textarea 
                  rows="4" 
                  value={taskSolution} 
                  placeholder="def sum(a,b):&#10;    return a+b" 
                  onChange={(e) => setTaskSolution(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        );

      case "Domains":
        return (
          <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", alignItems: "start" }}>
            <div className="card">
              <h3>Create Domain</h3>
              <form onSubmit={handleCreateDomain}>
                <div className="form-group">
                  <label>Domain Name</label>
                  <input type="text" value={domName} placeholder="Machine Learning" onChange={(e) => setDomName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="4" value={domDesc} placeholder="What skills does this cover?" onChange={(e) => setDomDesc(e.target.value)} required></textarea>
                </div>
                <button type="submit" className="btn" style={{ width: "100%" }}>Create Domain</button>
              </form>
            </div>

            <div className="card">
              <h3>Existing Technology Domains</h3>
              <table>
                <thead>
                  <tr>
                    <th>Domain ID</th>
                    <th>Domain Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map(d => (
                    <tr key={d.id}>
                      <td><code style={{color:"var(--primary)"}}>{d.id}</code></td>
                      <td><b>{d.name}</b></td>
                      <td>{d.description}</td>
                    </tr>
                  ))}
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
      <div className="sidebar">
        <h2>Antigravity <span>Portal</span></h2>

        <ul>
          <li className={active === "Dashboard" ? "active" : ""} onClick={() => setActive("Dashboard")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"/></svg>
            Dashboard
          </li>
          <li className={active === "Users" ? "active" : ""} onClick={() => setActive("Users")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            User Directory
          </li>
          <li className={active === "Tasks" ? "active" : ""} onClick={() => setActive("Tasks")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Curriculum / Tasks
          </li>
          <li className={active === "Domains" ? "active" : ""} onClick={() => setActive("Domains")}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            Tech Domains
          </li>
        </ul>

        <button className="sidebar-logout" onClick={handleLogout}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
      </div>

      <div className="main">
        <div className="header">
          <div>
            <h2>Admin Control Center</h2>
            <p style={{fontSize: "13px", color:"var(--text-muted)"}}>System overview and administrative settings</p>
          </div>
          <div className="user-badge">
            <div style={{ textAlign: "right" }}>
              <div>{adminName}</div>
              <div style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "bold", textTransform: "uppercase" }}>System Admin</div>
            </div>
            <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" alt="avatar" />
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}