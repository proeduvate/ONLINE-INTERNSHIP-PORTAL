import React, { useState } from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';
import '../../styles/Dashboard.css';
import { scenarioData } from './DailyScenario';

const DailyScenarioCalendar = ({ onStartScenario }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [submittedMap, setSubmittedMap] = useState(() => {
    const saved = localStorage.getItem("intern_daily_scenarios_submitted");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem("intern_daily_scenarios_submitted");
      if (saved) {
        try { setSubmittedMap(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener("daily_scenario_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("daily_scenario_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const completedDays = Object.keys(submittedMap).map(Number);
  const maxCompleted = completedDays.length > 0 ? Math.max(...completedDays) : 0;
  const currentDay = Math.min(30, maxCompleted + 1);

  const getDayStatus = (day) => {
    if (submittedMap[day]) return 'completed';
    if (day === currentDay) return 'current';
    if (day < currentDay && !submittedMap[day]) return 'missed';
    return 'upcoming';
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div style={{ background: "var(--bg-surface, #ffffff)", padding: "12px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Activity Calendar</h3>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
        {days.map(day => {
          const status = getDayStatus(day);
          
          const bg = status === "completed" ? "var(--success-bg, #f0fdf4)" : (status === "missed" ? "var(--bg-surface-elevated, #f8fafc)" : (status === "current" ? "var(--warning-bg, #fef3c7)" : "var(--bg-surface, #ffffff)"));
          const borderColor = status === "completed" ? "var(--success-border, #bbf7d0)" : (status === "missed" ? "var(--border-color, #e2e8f0)" : (status === "current" ? "var(--warning-border, #fde68a)" : "var(--border-color, #e2e8f0)"));
          const iconColor = status === "completed" ? "var(--success-color, #16a34a)" : (status === "missed" ? "var(--text-muted, #94a3b8)" : (status === "current" ? "var(--warning-color, #d97706)" : "var(--text-muted, #cbd5e1)"));
          
          return (
            <div key={day} style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: "4px", padding: "6px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
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
      
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "4px", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Check size={10} strokeWidth={3} color="var(--success)" /> Done</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><CircleDot size={10} strokeWidth={3} color="var(--warning)" /> Present</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Circle size={10} strokeWidth={3} color="var(--text-muted)" /> Missed</span>
      </div>
    </div>
  );
};

export default DailyScenarioCalendar;
