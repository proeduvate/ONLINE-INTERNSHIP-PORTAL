import React, { useState, useEffect } from "react";
import { API_BASE } from "../../../services/apiClient";

export default function SimulationView({ onComplete, onExit }) {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCurrentScenario = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setSelectedChoice("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/simulation/intern/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.detail || "Failed to load simulation.");
      } else {
        const data = await res.json();
        setScenario(data);
      }
    } catch (e) {
      setError("Network error loading simulation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentScenario();
  }, []);

  const handleSubmit = async () => {
    if (!selectedChoice) return;
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/simulation/decision`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scenario_id: scenario.scenario_id, // use actual ID returned by backend
          choice_id: selectedChoice
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        let errorMessage = "Submission failed.";
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => err.msg || "Invalid input").join(", ");
        } else if (data.detail) {
          errorMessage = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        }
        setError(errorMessage);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError("Network error submitting decision.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (result && result.day_completed) {
      if (onComplete) onComplete();
    } else {
      fetchCurrentScenario();
    }
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading workplace simulation...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button className="btn btn-secondary" onClick={onExit}>Return to Dashboard</button>
      </div>
    );
  }

  if (!scenario) return null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>
            DAY {scenario.day} OF 30
          </span>
          <h2 style={{ margin: "4px 0 0 0" }}>REAL-WORLD WORKPLACE SIMULATION</h2>
        </div>
        <button className="btn btn-secondary" onClick={onExit}>Exit</button>
      </div>

      <div className="card" style={{ padding: "30px", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#111827" }}>{scenario.simulation_title}</h3>
        <p style={{ margin: "0 0 24px 0", color: "#6b7280", fontWeight: "600" }}>
          Scenario {scenario.scenario_number} of {scenario.total_scenarios}
        </p>

        <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #3b82f6", marginBottom: "24px" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", textTransform: "uppercase", color: "#3b82f6" }}>Situation</h4>
          <p style={{ margin: 0, color: "#1f2937", lineHeight: "1.6" }}>{scenario.situation}</p>
        </div>

        {!result ? (
          <div>
            <h4 style={{ margin: "0 0 16px 0", color: "#111827" }}>{scenario.question}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {scenario.choices.map((choice) => (
                <label 
                  key={choice.id}
                  style={{ 
                    display: "flex", 
                    alignItems: "flex-start", 
                    padding: "16px", 
                    border: `1px solid ${selectedChoice === choice.id ? "#3b82f6" : "#e5e7eb"}`, 
                    borderRadius: "8px", 
                    cursor: "pointer",
                    backgroundColor: selectedChoice === choice.id ? "#eff6ff" : "white",
                    transition: "all 0.2s"
                  }}
                >
                  <input 
                    type="radio" 
                    name="choice" 
                    value={choice.id}
                    checked={selectedChoice === choice.id}
                    onChange={(e) => setSelectedChoice(e.target.value)}
                    style={{ marginTop: "4px", marginRight: "12px" }}
                  />
                  <span style={{ color: "#374151", lineHeight: "1.5" }}>{choice.text}</span>
                </label>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleSubmit} 
              disabled={!selectedChoice || submitting}
              style={{ marginTop: "24px", width: "100%", padding: "12px" }}
            >
              {submitting ? "Submitting..." : "Submit Decision"}
            </button>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.5s" }}>
            {(() => {
              const isMax = result.feedback_type === "Excellent";
              const isGood = result.feedback_type === "Good";
              const colorBase = isMax ? "#10b981" : isGood ? "#3b82f6" : "#f59e0b";
              const bgBase = isMax ? "#f0fdf4" : isGood ? "#eff6ff" : "#fffbeb";
              const borderBase = isMax ? "#bbf7d0" : isGood ? "#bfdbfe" : "#fde68a";
              const textDark = isMax ? "#166534" : isGood ? "#1e3a8a" : "#92400e";
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colorBase, fontWeight: "bold", fontSize: "18px", marginBottom: "16px", textTransform: "uppercase" }}>
                    {isMax ? "✓ EXCELLENT DECISION" : isGood ? "ℹ GOOD DECISION" : "⚠ NEEDS IMPROVEMENT"}
                  </div>
                  
                  <div style={{ backgroundColor: bgBase, padding: "20px", borderRadius: "8px", border: `1px solid ${borderBase}`, marginBottom: "24px" }}>
                    <p style={{ margin: "0", color: textDark, fontWeight: "bold", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>WHAT HAPPENED & WHY</p>
                    <p style={{ margin: "12px 0 0 0", color: textDark, lineHeight: "1.6", whiteSpace: "pre-line" }}>{result.consequence}</p>
                  </div>
                </>
              );
            })()}

            {result.day_completed ? (
              <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
                <h3 style={{ color: "#111827", margin: "0 0 8px 0" }}>DAY {scenario.day} COMPLETED ✓</h3>
                <p style={{ color: "#475569", margin: "0 0 16px 0" }}>Your decisions will influence future workplace situations.</p>
                <button className="btn btn-primary" onClick={handleNext} style={{ padding: "10px 24px" }}>Return to Dashboard</button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleNext} style={{ width: "100%", padding: "12px" }}>
                Continue to Next Scenario →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
