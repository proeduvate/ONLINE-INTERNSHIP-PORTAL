import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  AlertTriangle,
  Lock,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  Loader2
} from "lucide-react";

import api from '../../api/axios';

export default function DailyScenario({ onBackToDashboard, domainName = 'Frontend' }) {
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [decisionResult, setDecisionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCurrentScenario();
  }, []);

  const fetchCurrentScenario = async () => {
    setLoading(true);
    try {
      const res = await api.get('/simulation/intern/current');
      if (res.data) {
        setCurrentScenario(res.data);
        setIsCompleted(res.data.completed || false);
        setDecisionResult(res.data.decisionResult || null);
        if (res.data.decisionResult && res.data.decisionResult.selected_choice) {
          setSelectedOptionId(res.data.decisionResult.selected_choice);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load today's workplace simulation.");
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handleSubmitDecision = async () => {
    if (!selectedOptionId) {
      alert("Please select an option before submitting your decision.");
      return;
    }
    
    try {
      const res = await api.post('/simulation/decision', {
        scenario_id: currentScenario.scenario_id,
        choice_id: selectedOptionId
      });
      
      setDecisionResult(res.data);
      if (res.data.day_completed) {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit decision: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 96px)" }}>
        <Loader2 size={48} color="#2563eb" style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (errorMsg || !currentScenario) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 96px)" }}>
        <div style={{ textAlign: "center", color: "#b91c1c" }}>
          <AlertTriangle size={48} style={{ margin: "0 auto 16px auto" }} />
          <h3>{errorMsg || "No scenario available."}</h3>
        </div>
      </div>
    );
  }

  const selectedDay = currentScenario.day;
  const completedCount = currentScenario.scenario_number - 1 + (isCompleted ? 1 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", height: "calc(100vh - 96px)", overflowY: "auto", paddingBottom: "20px" }}>
      
      {/* Hero Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)",
        borderRadius: "12px",
        padding: "14px 20px",
        color: "var(--text-primary, #0f172a)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(191, 219, 254, 0.4)",
        border: "1px solid #bfdbfe"
      }}>
        <svg style={{ position: "absolute", right: "0", bottom: 0, height: "100%", width: "50%", opacity: 0.35, pointerEvents: "none" }} viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
          <path d="M0 200 L140 60 L240 160 L350 10 L400 200 Z" fill="#0284c7" />
          <path d="M100 200 L250 40 L340 130 L400 200 Z" fill="#0369a1" opacity="0.7" />
        </svg>
        
        <div style={{ position: "absolute", right: "24px", top: "8px", opacity: 0.12, transform: "rotate(-10deg)", pointerEvents: "none" }}>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block" }}>Learn</span>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block", marginLeft: "10px" }}>Build</span>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block", marginLeft: "20px" }}>Grow</span>
        </div>

        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{ width: "44px", height: "44px", background: "var(--bg-surface, #ffffff)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)", flexShrink: 0 }}>
            <Briefcase size={22} color="#2563eb" />
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1d4ed8", display: "block", marginBottom: "2px" }}>
              Day {selectedDay} of 30 &bull; Workplace Simulation
            </span>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 2px 0", color: "var(--text-primary, #0f172a)", letterSpacing: "-0.02em" }}>
              Real-World Workplace Simulation
            </h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#334155", maxWidth: "600px", lineHeight: "1.4" }}>
              Analyze realistic engineering situations, choose your technical path, and receive instant feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
        
        {/* Left Column: Workplace Scenario Main Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px", border: "1px solid var(--border-color)" }}>
            
            {/* Title Header */}
            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--text-dark)" }}>
                  {currentScenario.title}
                </h3>
                <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", color: "#475569", fontWeight: "600" }}>
                  {currentScenario.subtitle}
                </span>
              </div>
            </div>

            {/* SITUATION Callout Card */}
            <div style={{
              backgroundColor: "#f0f9ff",
              borderLeft: "4px solid #0284c7",
              borderRadius: "0 12px 12px 0",
              padding: "20px 24px",
              borderTop: "1px solid #e0f2fe",
              borderRight: "1px solid #e0f2fe",
              borderBottom: "1px solid #e0f2fe"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "800", color: "#0284c7", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                <Briefcase size={16} /> SITUATION BRIEFING
              </div>
              <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary, #0f172a)", lineHeight: "1.65", fontWeight: 400 }}>
                {currentScenario.situation}
              </p>
            </div>

            {/* If NOT completed yet */}
            {!isCompleted ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-dark)", margin: 0, lineHeight: "1.5" }}>
                  {currentScenario.question}
                </h4>

                {/* Options List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {currentScenario.choices.map((option) => {
                    const isSelected = selectedOptionId === option.id;

                    return (
                      <div
                        key={option.id}
                        onClick={() => setSelectedOptionId(option.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "14px",
                          padding: "16px 20px",
                          borderRadius: "12px",
                          border: isSelected ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                          backgroundColor: isSelected ? "#eff6ff" : "var(--card-bg)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: isSelected ? "0 2px 8px rgba(59, 130, 246, 0.15)" : "none"
                        }}
                      >
                        <input
                          type="radio"
                          name={`scenario-day-${selectedDay}`}
                          checked={isSelected}
                          onChange={() => setSelectedOptionId(option.id)}
                          style={{ marginTop: "3px", accentColor: "#2563eb", width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "14px", color: isSelected ? "#1e40af" : "var(--text-color)", fontWeight: isSelected ? 600 : 400, lineHeight: "1.5", flex: 1 }}>
                          {option.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitDecision}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "700",
                    marginTop: "8px",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
                  }}
                >
                  Submit Decision &rarr;
                </button>
              </div>
            ) : (
              /* IF COMPLETED: Feedback view */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Status Banner */}
                <div style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: decisionResult?.feedback_type === "success" ? "#f0fdf4" : decisionResult?.feedback_type === "warning" ? "#fffbeb" : "#fef2f2",
                  border: "1px solid",
                  borderColor: decisionResult?.feedback_type === "success" ? "#86efac" : decisionResult?.feedback_type === "warning" ? "#fde68a" : "#fca5a5",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  {decisionResult?.feedback_type === "success" ? <CheckCircle2 size={24} color="#16a34a" /> : decisionResult?.feedback_type === "warning" ? <AlertTriangle size={24} color="#d97706" /> : <XCircle size={24} color="#dc2626" />}
                  <div>
                    <h4 style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "800",
                      color: decisionResult?.feedback_type === "success" ? "#15803d" : decisionResult?.feedback_type === "warning" ? "#b45309" : "#b91c1c"
                    }}>
                      {decisionResult?.feedback_type === "success" ? "[SUCCESS] EXCELLENT DECISION" : decisionResult?.feedback_type === "warning" ? "[WARNING] SUBOPTIMAL APPROACH" : "POOR DECISION"}
                    </h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                      Your decision has been logged for Day {selectedDay}.
                    </p>
                  </div>
                </div>

                {/* WHAT HAPPENED & WHY Box */}
                <div style={{
                  backgroundColor: "var(--bg-light)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "20px 24px"
                }}>
                  <h4 style={{
                    margin: "0 0 10px 0",
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "var(--text-dark)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <Lightbulb size={16} color="#eab308" /> WHAT HAPPENED & WHY
                  </h4>
                  <div style={{ whiteSpace: "pre-line", fontSize: "14px", color: "var(--text-dark)", lineHeight: "1.7", fontWeight: 400 }}>
                    {decisionResult?.feedback}
                    
                    {decisionResult?.consequence && (
                      <div style={{ marginTop: "12px", fontStyle: "italic", color: "#475569" }}>
                        Consequence: {decisionResult.consequence}
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion Action Box */}
                <div style={{
                  backgroundColor: "linear-gradient(to right, #f8fafc, #f1f5f9)",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontWeight: "700", fontSize: "15px" }}>
                    <CheckCircle size={20} /> Day {selectedDay} Simulation Complete
                  </div>
                  
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                    {onBackToDashboard && (
                      <button
                        onClick={onBackToDashboard}
                        className="btn btn-secondary"
                        style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "600" }}
                      >
                        Return to Dashboard
                      </button>
                    )}

                    {decisionResult?.next_scenario ? (
                      <button
                        onClick={() => fetchCurrentScenario()}
                        className="btn btn-primary"
                        style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "600" }}
                      >
                        Next Scenario &rarr;
                      </button>
                    ) : (
                       <button
                        className="btn btn-primary"
                        disabled
                        style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "600", opacity: 0.6 }}
                      >
                        Next Scenario &rarr;
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Right Column: Sidebar Stats & Guidance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Simulation Progress Card */}
          <div className="card" style={{ padding: "20px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "var(--text-dark)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} color="#3b82f6" /> Simulation Progress
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Completed Scenarios</span>
                  <span style={{ color: "#2563eb" }}>{completedCount} / 30</span>
                </div>
                <div style={{ height: "8px", width: "100%", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(completedCount / 30) * 100}%`, background: "linear-gradient(to right, #3b82f6, #6366f1)", borderRadius: "4px" }}></div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Current Day</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary, #0f172a)", marginTop: "2px" }}>Day {selectedDay}</div>
                </div>
                <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Streak</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>{completedCount} Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidance Card */}
          <div className="card" style={{ padding: "20px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#15803d", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lightbulb size={18} /> Workplace Engineering Tip
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#166534", lineHeight: "1.6" }}>
              Real-world engineering decisions involve trade-offs between speed, maintainability, and user experience. Always evaluate long-term impacts before writing code.
            </p>
          </div>

          {/* Rules & Guidelines Card */}
          <div className="card" style={{ padding: "20px", background: "#fffbeb", border: "1px solid #fde68a" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#b45309", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} color="#b45309" /> Simulation Rules
            </h4>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#92400e", fontSize: "13px", lineHeight: "1.6" }}>
              <li><b>Daily Rhythm:</b> 1 scenario unlocks per day at 12:00 AM Midnight.</li>
              <li><b>Instant Feedback:</b> Detailed explanation follows every submitted decision.</li>
              <li><b>Impact:</b> Choices shape the scenario context for upcoming days.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
