import React, { useState, useEffect } from "react";

export default function MCQAssessment({ day, onComplete, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(60);
  
  useEffect(() => {
    fetchStartMcq();
  }, [day]);

  useEffect(() => {
    // Only run timer if we have questions, no result yet, and not loading
    if (!loading && !error && !result && questions.length > 0) {
      if (timeLeft > 0) {
        const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timerId);
      } else if (timeLeft === 0) {
        // Auto-submit when time is up
        handleSubmit();
      }
    }
  }, [timeLeft, loading, error, result, questions.length]);

  const fetchStartMcq = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Check result first
      const resResult = await fetch(`http://localhost:8000/mcq/day/${day}/result`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (resResult.ok) {
        const resultData = await resResult.json();
        if (resultData.status === "submitted") {
           setResult(resultData);
           setLoading(false);
           return;
        }
      }

      // Start or resume IN_PROGRESS
      const resStart = await fetch(`http://localhost:8000/mcq/day/${day}/start`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!resStart.ok) {
        const err = await resStart.json();
        setError(err.detail || "Failed to start assessment");
        setLoading(false);
        return;
      }
      
      const data = await resStart.json();
      setAttemptData(data);
      setQuestions(data.questions);
      setLoading(false);
    } catch (err) {
      setError("An error occurred connecting to the server.");
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/mcq/day/${day}/submit`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          attempt_id: attemptData.attempt_id,
          answers: answers
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to submit assessment");
        return;
      }
      
      const resultData = await res.json();
      setResult(resultData);
      if (onComplete) onComplete(resultData);
    } catch (err) {
      alert("Error submitting answers");
    }
  };

  const handleOptionSelect = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading Assessment...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--danger-dark)" }}>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={onBack}>Back to Dashboard</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="card" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ color: "var(--primary-dark)" }}>MCQ Assessment Result</h2>
        <h3 style={{ margin: "10px 0" }}>Day {result.day}: {result.topic}</h3>
        
        <div style={{ fontSize: "32px", fontWeight: "bold", margin: "20px 0" }}>
          {result.score} / {result.total_questions}
        </div>
        <div style={{ fontSize: "24px", color: result.percentage >= 70 ? "var(--success-color)" : "var(--warning-color)", marginBottom: "20px" }}>
          {result.percentage.toFixed(1)}%
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px", fontSize: "16px" }}>
          <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>✓ Correct: {result.correct_answers}</span>
          <span style={{ color: "var(--danger-dark)", fontWeight: "bold" }}>✗ Incorrect: {result.wrong_answers}</span>
        </div>
        
        <button className="btn btn-primary" onClick={() => onComplete && onComplete(result)}>Return to Dashboard</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>No questions available for this day.</div>;
  }

  const currentQ = questions[currentIdx];

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-gray)", paddingBottom: "10px" }}>
        <h3 style={{ margin: 0 }}>Day {attemptData?.day}: {attemptData?.topic}</h3>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ 
            fontSize: "16px", 
            fontWeight: "bold", 
            color: timeLeft <= 10 ? "var(--danger-color)" : "var(--primary-dark)",
            background: timeLeft <= 10 ? "var(--bg-red-light)" : "var(--bg-blue-lightest)",
            padding: "4px 12px",
            borderRadius: "16px"
          }}>
            ⏱️ {formatTime(timeLeft)}
          </span>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>Question {currentIdx + 1} of {questions.length}</span>
        </div>
      </div>
      
      <div style={{ marginBottom: "24px", fontSize: "16px" }}>
        <b>{currentIdx + 1}.</b> {currentQ.question}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "30px" }}>
        {Object.entries(currentQ.options).map(([key, text]) => {
          const isSelected = answers[currentQ.id] === key;
          return (
            <button 
              key={key}
              onClick={() => handleOptionSelect(currentQ.id, key)}
              style={{
                textAlign: "left",
                padding: "16px",
                borderRadius: "8px",
                border: isSelected ? "2px solid var(--primary-color)" : "1px solid var(--border-gray-dark)",
                backgroundColor: isSelected ? "var(--bg-blue-lightest)" : "var(--card-bg)",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontWeight: "bold", marginRight: "12px", color: isSelected ? "var(--primary-dark)" : "var(--text-gray-muted)" }}>{key}.</span> 
              {text}
            </button>
          );
        })}
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button 
          className="btn btn-secondary" 
          disabled={currentIdx === 0} 
          onClick={() => setCurrentIdx(prev => prev - 1)}
        >
          Previous
        </button>
        
        {currentIdx < questions.length - 1 ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setCurrentIdx(prev => prev + 1)}
          >
            Next
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ backgroundColor: "var(--success-color)", borderColor: "var(--success-color)" }}
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
}
