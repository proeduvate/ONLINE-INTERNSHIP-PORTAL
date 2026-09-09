import React, { useState } from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';
import '../../styles/Dashboard.css';
import { scenarioData } from './DailyScenario';

const DailyScenarioCalendar = ({ onStartScenario }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  // Explicit mock data to keep the scenario fixed and consistent
  const currentDay = 5;
  const attendedDays = [1, 4, 6, 8, 9];
  const missedDays = [2, 3, 7, 10]; // Day 3 added explicitly

  const getDayStatus = (day) => {
    if (day === currentDay) return 'current';
    if (attendedDays.includes(day)) return 'completed';
    if (missedDays.includes(day)) return 'missed';
    return 'upcoming';
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div style={{ background: "#ffffff", padding: "16px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#0f172a", fontWeight: 800 }}>Activity Calendar</h3>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
        {days.map(day => {
          const status = getDayStatus(day);
          
          const bg = status === "completed" ? "#f0fdf4" : (status === "missed" ? "#f8fafc" : (status === "current" ? "#fef3c7" : "#ffffff"));
          const borderColor = status === "completed" ? "#bbf7d0" : (status === "missed" ? "#e2e8f0" : (status === "current" ? "#fde68a" : "#e2e8f0"));
          const iconColor = status === "completed" ? "#16a34a" : (status === "missed" ? "#94a3b8" : (status === "current" ? "#d97706" : "#cbd5e1"));
          
          return (
            <div key={day} style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: "6px", padding: "6px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{day}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
                {status === "completed" && <Check size={10} strokeWidth={4} />}
                {status === "missed" && <Circle size={10} strokeWidth={4} />}
                {status === "current" && <CircleDot size={10} strokeWidth={3} />}
                {status === "upcoming" && "\u00A0"}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "4px", fontSize: "0.65rem", fontWeight: 700, color: "#64748b" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Check size={10} strokeWidth={3} color="#16a34a" /> Done</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><CircleDot size={10} strokeWidth={3} color="#d97706" /> Present</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Circle size={10} strokeWidth={3} color="#94a3b8" /> Missed</span>
      </div>
    </div>
  );
};

export default DailyScenarioCalendar;
