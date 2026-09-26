import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import { Check, Circle, Target } from 'lucide-react';

const DailyScenarioCalendar = ({ onStartScenario, curriculumData = [], currentDay = 1, completedDays = [] }) => {
  const getDayStatus = (day) => {
    if (completedDays.includes(day)) return 'completed';
    const task = curriculumData.find(t => t.day === day);
    if (task) {
      if (task.status === 'completed') return 'completed';
      if (task.status === 'current') return 'current';
    }
    if (day === currentDay) return 'current';
    if (day < currentDay) return 'missed';
    return 'upcoming';
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="activity-calendar-widget">
      <h3 className="activity-calendar-title">Activity Calendar</h3>

      <div className="activity-calendar-grid">
        {days.map(day => {
          const status = getDayStatus(day);
          return (
            <div
              key={day}
              className={`activity-calendar-day ${status}`}
              onClick={() => onStartScenario(day)}
              style={{ cursor: 'pointer', padding: '8px 0', minHeight: '60px' }}
            >
              <span className="day-number">{day}</span>
              <div className="day-icon-wrapper" style={{ marginTop: '2px' }}>
                {status === 'completed' && <Check size={14} color="#16a34a" strokeWidth={3} />}
                {status === 'missed' && <Circle size={12} color="#94a3b8" strokeWidth={2} />}
                {status === 'upcoming' && <Circle size={12} color="#94a3b8" strokeWidth={2} opacity={0.3} />}
                {status === 'current' && <Target size={14} color="#f59e0b" strokeWidth={2.5} />}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '4px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Check size={12} color="#16a34a" strokeWidth={3} /> Done
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Target size={12} color="#f59e0b" strokeWidth={2.5} /> Present
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Circle size={12} color="#94a3b8" strokeWidth={2} /> Missed
        </div>
      </div>
    </div>
  );
};

export default DailyScenarioCalendar;
