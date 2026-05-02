import { useState } from "react";
import "../styles/Dashboard.css";

export default function MentorDashboard() {
  const [active, setActive] = useState("Dashboard");

  const handleLogout = () => {
    window.location.href = "/"; // redirect to login page
  };

  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return (
          <div className="grid">
            <div className="card">Total Interns: 20</div>
            <div className="card">Pending Reviews: 5</div>
            <div className="card">Meetings Today: 2</div>
            <div className="card">Completed Reviews: 50</div>
          </div>
        );

      case "Interns":
        return (
          <div className="card">
            <h3>Intern List</h3>
            <p>John - Progress 60%</p>
            <p>Raj - Progress 80%</p>
            <p>Anu - Progress 75%</p>
          </div>
        );

      case "Reviews":
        return (
          <div className="card">
            <h3>Review Submissions</h3>
            <button className="btn">View Submissions</button>
          </div>
        );

      case "Meetings":
        return (
          <div className="card">
            <h3>Meetings</h3>
            <p>Schedule and manage review meetings.</p>
          </div>
        );

      case "Feedback":
        return (
          <div className="card">
            <h3>Give Feedback</h3>
            <textarea
              placeholder="Write feedback..."
              style={{
                width: "100%",
                height: "100px",
                padding: "10px",
                marginTop: "10px",
              }}
            />
            <button className="btn" style={{ marginTop: "10px" }}>
              Submit
            </button>
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
        <h2>Mentor Panel</h2>

        <ul>
          {["Dashboard", "Interns", "Reviews", "Meetings", "Feedback"].map(
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