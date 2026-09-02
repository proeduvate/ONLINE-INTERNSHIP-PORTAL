import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import { scenarioData } from './DailyScenario';

const DailyScenarioCalendar = ({ onStartScenario, curriculumData = [], currentDay = 1 }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  const attendedDaysCount = curriculumData.filter(t => t.status === 'completed').length;
  const missedDaysCount = curriculumData.filter(t => t.day < currentDay && t.status !== 'completed').length;

  const getDayStatus = (day) => {
    if (day === currentDay) return 'current';
    const task = curriculumData.find(t => t.day === day);
    if (task) {
      if (task.status === 'completed') return 'completed';
      if (day < currentDay) return 'missed';
      return 'upcoming';
    }
    if (day < currentDay) return 'missed'; 
    return 'upcoming';
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="daily-scenario-calendar card">
      <div className="calendar-header">
        <h3>Daily Scenario Activity</h3>
        <div className="calendar-stats">
          <span className="stat-badge completed">{attendedDaysCount} Completed</span>
          <span className="stat-badge missed">{missedDaysCount} Missed</span>
          <span className="stat-badge current">Day {currentDay}</span>
        </div>
      </div>

      <div className="calendar-grid">
        {days.map(day => {
          const status = getDayStatus(day);
          return (
            <div 
              key={day} 
              className={`calendar-day ${status} ${selectedDay === day ? 'selected' : ''}`}
              onClick={() => setSelectedDay(selectedDay === day ? null : day)}
            >
              <span className="day-number">{day}</span>
              {status === 'completed' && <span className="day-icon">✓</span>}
              {status === 'missed' && <span className="day-icon">×</span>}
              {status === 'upcoming' && <span className="day-icon">🔒</span>}
              {status === 'current' && <span className="day-icon">🔥</span>}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="calendar-day-details">
          <h4>Day {selectedDay} Details</h4>
          {(() => {
             const scenario = scenarioData.find(s => s.day === selectedDay);
             const task = curriculumData.find(t => t.day === selectedDay);
             if (scenario || task) {
                return (
                  <>
                    <p className="scenario-title">{task ? task.topic : scenario.title}</p>
                    <p className="scenario-situation">{task ? task.desc : scenario.situation.substring(0, 100) + '...'}</p>
                    <button className="btn btn-primary" onClick={() => onStartScenario(selectedDay)}>
                      {getDayStatus(selectedDay) === 'current' ? 'Start Scenario' : 'Review Scenario'}
                    </button>
                  </>
                );
             } else {
                return <p>No scenario data available for this day.</p>;
             }
          })()}
        </div>
      )}

      <div className="calendar-legend">
        <div className="legend-item"><span className="legend-color completed"></span> Completed</div>
        <div className="legend-item"><span className="legend-color missed"></span> Missed</div>
        <div className="legend-item"><span className="legend-color current"></span> Today</div>
        <div className="legend-item"><span className="legend-color upcoming"></span> Locked</div>
      </div>
    </div>
  );
};

export default DailyScenarioCalendar;
