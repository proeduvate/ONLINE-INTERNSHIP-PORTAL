import { useState } from "react";
import "../styles/Dashboard.css";

export default function InternDashboard() {
  const [active, setActive] = useState("Dashboard");

  const handleLogout = () => {
    window.location.href = "/"; // redirect to login page
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return (
          <>
            <div className="grid">
              <div className="card">Completed Tasks: 12</div>
              <div className="card">Pending Tasks: 3</div>
              <div className="card">Attendance: 90%</div>
              <div className="card">Score: 85%</div>
            </div>

            <div className="card">
              <h3>Today's Task</h3>
              <p>Build a simple React To-Do App.</p>
            </div>

            <div className="card">
              <h3>Progress</h3>
              <p>Day 12 / 30 completed</p>
            </div>
          </>
        );

      case "Learning":
        return (
          <div className="card">
            <h3>Learning Content</h3>
            <p>Access videos, notes, and resources here.</p>
          </div>
        );

      case "Tasks":
        return (
          <div className="card">
            <h3>Your Tasks</h3>
            <p>Submit and track your daily tasks.</p>
          </div>
        );

      case "Progress":
        return (
          <div className="card">
            <h3>Progress</h3>
            <p>Track your overall internship progress.</p>
          </div>
        );

      case "Attendance":
        return (
          <div className="card">
            <h3>Attendance</h3>
            <p>Your attendance is automatically tracked.</p>
          </div>
        );

      case "Mentor":
        return (
          <div className="card">
            <h3>Mentor Chat</h3>
            <p>Communicate with your mentor.</p>
          </div>
        );

      case "Certificate":
        return (
          <div className="card">
            <h3>Certificate</h3>
            <p>Download your certificate after completion.</p>
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
        <h2>Intern Panel</h2>

        <ul>
          {[
            "Dashboard",
            "Learning",
            "Tasks",
            "Progress",
            "Attendance",
            "Mentor",
            "Certificate",
          ].map((item) => (
            <li
              key={item}
              className={active === item ? "active" : ""}
              onClick={() => setActive(item)}
            >
              {item}
            </li>
          ))}
        </ul>

        {/* ✅ Logout at bottom */}
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