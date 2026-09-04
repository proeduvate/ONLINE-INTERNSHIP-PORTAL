import React, { useState } from "react";
import axios from "axios";
import "./Onboarding.css"; // Reuse existing onboarding styles if needed

export default function Status() {
  const [appId, setAppId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appId.trim()) return;
    
    setLoading(true);
    setError("");
    setStatusResult(null);

    try {
      const baseUrl = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
      const response = await axios.get(`${baseUrl}/api/v1/onboarding/status/${appId.trim()}`);
      setStatusResult(response.data.status);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Application not found. Please check the Application ID.");
      } else {
        setError("An error occurred while fetching the status.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container" style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div className="onboarding-card">
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Track Application Status</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label htmlFor="appId">Application ID</label>
            <input
              type="text"
              id="appId"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="e.g. APP-0001"
              required
              className="form-control"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ padding: "0.75rem", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#ffe6e6", color: "#d9534f", borderRadius: "4px" }}>
            {error}
          </div>
        )}

        {statusResult && (
          <div style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "#e6f4ea", border: "1px solid #c3e6cb", borderRadius: "4px", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#155724" }}>Status Found</h3>
            <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#28a745" }}>
              {statusResult.replace(/_/g, ' ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
