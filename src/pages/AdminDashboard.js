import { useState } from "react";
import "../styles/Dashboard.css";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");

  const handleLogout = () => {
    window.location.href = "/"; // redirect to login page
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return (
          <div className="grid">
            <div className="card">
              <h3>Total Interns</h3>
              <p>50</p>
            </div>

            <div className="card">
              <h3>Completed</h3>
              <p>30</p>
            </div>

            <div className="card">
              <h3>Mentors</h3>
              <p>10</p>
            </div>
          </div>
        );

      case "Users":
        return (
          <div className="card">
            <h3>Add Intern / Mentor</h3>

            <input type="text" placeholder="Name" />
            <select>
              <option>Intern</option>
              <option>Mentor</option>
            </select>

            <button className="btn">Add User</button>
          </div>
        );

      case "Tasks":
        return (
          <div className="card">
            <h3>Upload Task</h3>

            <input type="text" placeholder="Task Title" />
            <textarea placeholder="Task Description"></textarea>

            <button className="btn">Upload Task</button>
          </div>
        );

      case "Analytics":
        return (
          <div className="card">
            <h3>Analytics Overview</h3>
            <p>Total Interns: 50</p>
            <p>Completed: 30</p>
            <p>Average Score: 78%</p>
          </div>
        );

      case "Certificates":
        return (
          <div className="card">
            <h3>Certificates</h3>
            <button className="btn">Generate Certificates</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>Admin Panel</h2>

        <ul>
          {["Dashboard", "Users", "Tasks", "Analytics", "Certificates"].map(
            (item) => (
              <li
                key={item}
                className={active === item ? "active" : ""}
                onClick={() => setActive(item)}
              >
                {item}
              </li>
            )
          )}
        </ul>

        {/* ✅ Logout moved to bottom */}
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="main">
        <div className="header">
          <h2>{active}</h2>
        </div>

        {renderContent()}
      </div>

    </div>
  );
}