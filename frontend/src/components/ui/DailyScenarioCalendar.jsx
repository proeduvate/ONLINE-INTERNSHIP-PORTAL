import React, { useState } from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';
import '../../styles/Dashboard.css';
import { scenarioData } from './DailyScenario';

const DailyScenarioCalendar = ({ onStartScenario, currentDay = 5, attendedDays = [1, 4, 6, 8, 9] }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  const missedDays = Array.from({ length: currentDay - 1 }, (_, i) => i + 1).filter(d => !attendedDays.includes(d));

  const getDayStatus = (day) => {
    if (day === currentDay) return 'current';
    if (attendedDays.includes(day)) return 'completed';
    if (missedDays.includes(day)) return 'missed';
    return 'upcoming';
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div style={{ background: "var(--bg-surface, #ffffff)", padding: "12px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Activity Calendar</h3>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "4px" }}>
        {days.map(day => {
          const status = getDayStatus(day);
          
          const bg = status === "completed" ? "#f0fdf4" : (status === "missed" ? "var(--bg-surface-elevated, #f8fafc)" : (status === "current" ? "#fef3c7" : "var(--bg-surface, #ffffff)"));
          const borderColor = status === "completed" ? "#bbf7d0" : (status === "missed" ? "var(--border-color, #e2e8f0)" : (status === "current" ? "#fde68a" : "var(--border-color, #e2e8f0)"));
          const iconColor = status === "completed" ? "#16a34a" : (status === "missed" ? "#94a3b8" : (status === "current" ? "#d97706" : "#cbd5e1"));
          
          return (
            <div 
              key={day} 
              style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: "4px", padding: "14px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", cursor: "pointer", transition: "transform 0.1s" }}
              onClick={() => onStartScenario && onStartScenario(day)}
            >
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>{day}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
                {status === "completed" && <Check size={8} strokeWidth={4} />}
                {status === "missed" && <Circle size={8} strokeWidth={4} />}
                {status === "current" && <CircleDot size={8} strokeWidth={3} />}
                {status === "upcoming" && "\u00A0"}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "4px", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted, #64748b)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Check size={10} strokeWidth={3} color="#16a34a" /> Done</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><CircleDot size={10} strokeWidth={3} color="#d97706" /> Present</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Circle size={10} strokeWidth={3} color="#94a3b8" /> Missed</span>
      </div>
    </div>
  );
};

export default DailyScenarioCalendar;
