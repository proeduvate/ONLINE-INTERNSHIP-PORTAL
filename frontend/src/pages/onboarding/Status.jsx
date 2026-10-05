import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Onboarding.css";

export default function Status() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fetch if appId is passed in URL or localStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get("appId") || localStorage.getItem("last_application_id") || "";
    if (idFromUrl) {
      setSearchInput(idFromUrl);
      handleFetchStatus(idFromUrl);
    }
  }, [location.search]);

  const handleFetchStatus = async (idToFetch) => {
    const cleanId = (idToFetch || "").trim();
    if (!cleanId) return;

    setLoading(true);
    setError("");
    setStatusResult(null);

    try {
      const baseUrl = process.env.REACT_APP_API_BASE || "https://online-internship-portal.onrender.com";
      const response = await axios.get(`${baseUrl}/api/v1/onboarding/status/${cleanId}`);
      setStatusResult(response.data);
      localStorage.setItem("last_application_id", response.data.applicationId);
    } catch (err) {
      setError(err.response?.data?.detail || "Application ID not found. Please check your ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/onboarding/status?appId=${encodeURIComponent(searchInput.trim())}`);
  };

  const rawStatus = statusResult?.status || "";

  // Helper logic for stepper colors & icons based on backend status enum
  const getStepState = (stepNumber) => {
    if (!rawStatus) return { state: "pending", icon: stepNumber, color: "#94a3b8" };

    const isRejected = ["REJECTED", "INTERVIEW_FAILED"].includes(rawStatus);
    const isPaymentRejected = rawStatus === "PAYMENT_REJECTED";

    switch (stepNumber) {
      case 1: // Application Received
        if (isRejected) return { state: "complete", icon: "✓", color: "#10b981", labelColor: "#047857" };
        return { state: "complete", icon: "✓", color: "#10b981", labelColor: "#047857" };

      case 2: // Approval / Review
        if (isRejected) return { state: "failed", icon: "✕", color: "#ef4444", labelColor: "#b91c1c" };
        if (rawStatus === "PENDING_REVIEW" || rawStatus === "INTERVIEW_SCHEDULED") {
          return { state: "active", icon: "2", color: "#f59e0b", labelColor: "#b45309" };
        }
        return { state: "complete", icon: "✓", color: "#10b981", labelColor: "#047857" };

      case 3: // Payment
        if (isPaymentRejected) return { state: "failed", icon: "✕", color: "#ef4444", labelColor: "#b91c1c" };
        if (["PAYMENT_REQUIRED", "PAYMENT_PENDING", "ELIGIBLE_FOR_PAYMENT", "INTERVIEW_PASSED", "ACCEPTED"].includes(rawStatus)) {
          return { state: "active", icon: "3", color: "#f59e0b", labelColor: "#b45309" };
        }
        if (rawStatus === "PAYMENT_SUBMITTED") {
          return { state: "active", icon: "3", color: "#2563eb", labelColor: "#1d4ed8" };
        }
        if (["PAYMENT_VERIFIED", "DOCUMENTS_PENDING", "DOCUMENTS_GENERATED", "DOCUMENTS_UPLOADED", "ACCOUNT_CREATION_PENDING", "ACCOUNT_CREATED", "ACTIVE", "ONBOARDING_COMPLETED"].includes(rawStatus)) {
          return { state: "complete", icon: "✓", color: "#10b981", labelColor: "#047857" };
        }
        return { state: "pending", icon: "3", color: "#e2e8f0", labelColor: "#64748b" };

      case 4: // Documents & Credentials
        if (["DOCUMENTS_PENDING", "DOCUMENTS_GENERATED", "DOCUMENTS_UPLOADED"].includes(rawStatus)) {
          return { state: "active", icon: "4", color: "#2563eb", labelColor: "#1d4ed8" };
        }
        if (["ACCOUNT_CREATION_PENDING", "ACCOUNT_ACTIVATION_PENDING", "ACCOUNT_CREATED", "ACTIVE", "ONBOARDING_COMPLETED"].includes(rawStatus)) {
          return { state: "complete", icon: "✓", color: "#10b981", labelColor: "#047857" };
        }
        return { state: "pending", icon: "4", color: "#e2e8f0", labelColor: "#64748b" };

      default:
        return { state: "pending", icon: stepNumber, color: "#e2e8f0", labelColor: "#64748b" };
    }
  };

  const step1 = getStepState(1);
  const step2 = getStepState(2);
  const step3 = getStepState(3);
  const step4 = getStepState(4);

  return (
    <div className="onboarding-page-wrapper">
      <div className="onboarding-container" style={{ maxWidth: "640px", padding: "24px" }}>
        
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "#0f172a" }}>Track Application Status</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Enter your Application ID to view your real-time onboarding status.</p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={onSearchSubmit} style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="e.g. APP-6 or APP-2026-00125"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              fontFamily: "monospace",
              outline: "none"
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !searchInput.trim()}
            style={{ padding: "10px 20px", fontSize: "14px", fontWeight: "600" }}
          >
            {loading ? "Searching..." : "Track Status"}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px" }}>
            ⚠️ <strong>Error:</strong> {error}
          </div>
        )}

        {/* Result Card with Dynamic Stepper */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner-border text-primary" role="status" style={{ width: "2rem", height: "2rem" }}></div>
            <h4 style={{ color: "#2563eb", marginTop: "12px", fontSize: "15px" }}>Fetching latest status...</h4>
          </div>
        ) : statusResult ? (
          <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            
            {/* Top Details Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: "0", fontSize: "17px", color: "#0f172a", fontWeight: 700 }}>{statusResult.name}</h3>
                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>{statusResult.track}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Application ID</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{statusResult.applicationId}</span>
              </div>
            </div>

            {/* Visual Dynamic Progress Stepper */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                
                {/* Step 1: Applied */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: step1.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", margin: "0 auto 6px auto" }}>
                    {step1.icon}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: step1.labelColor, display: "block" }}>Applied</span>
                </div>

                {/* Step 2: Approval / Review */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: step2.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", margin: "0 auto 6px auto" }}>
                    {step2.icon}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: step2.labelColor, display: "block" }}>Review</span>
                </div>

                {/* Step 3: Payment */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: step3.color, color: step3.state === "pending" ? "#64748b" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", margin: "0 auto 6px auto" }}>
                    {step3.icon}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: step3.labelColor, display: "block" }}>Payment</span>
                </div>

                {/* Step 4: Documents & Credentials */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: step4.color, color: step4.state === "pending" ? "#64748b" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", margin: "0 auto 6px auto" }}>
                    {step4.icon}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: step4.labelColor, display: "block" }}>Documents</span>
                </div>

              </div>
            </div>

            {/* Status Message Box */}
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>
                💡 <strong>Current Status:</strong> {statusResult.message}
              </p>
            </div>

            {/* Dynamic Action Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {["PAYMENT_REQUIRED", "PAYMENT_PENDING", "ELIGIBLE_FOR_PAYMENT", "PAYMENT_SUBMITTED"].includes(rawStatus) && (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/onboarding/payment?appId=${statusResult.applicationId}`)}
                  style={{ padding: "9px 18px", fontSize: "13px", fontWeight: "bold" }}
                >
                  Payment Details →
                </button>
              )}

              {["PAYMENT_VERIFIED", "DOCUMENTS_PENDING", "DOCUMENTS_GENERATED", "ACCOUNT_CREATION_PENDING", "ACCOUNT_CREATED", "ACTIVE", "ONBOARDING_COMPLETED"].includes(rawStatus) && (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/onboarding/documents?appId=${statusResult.applicationId}`)}
                  style={{ padding: "9px 18px", fontSize: "13px", fontWeight: "bold", backgroundColor: "#0284c7", borderColor: "#0284c7" }}
                >
                  My Documents & Sign →
                </button>
              )}

              {["ONBOARDING_COMPLETED", "ACCOUNT_CREATED", "ACTIVE"].includes(rawStatus) && (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/login")}
                  style={{ padding: "9px 18px", fontSize: "13px", fontWeight: "bold", backgroundColor: "#10b981", borderColor: "#10b981" }}
                >
                  Intern Login →
                </button>
              )}
            </div>

          </div>
        ) : !loading && !error ? (
          <div style={{ textAlign: "center", padding: "30px 20px", border: "2px dashed #cbd5e1", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🔍</span>
            <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, color: "#334155" }}>No Application Selected</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Type your Application ID above (e.g., APP-6) and click "Track Status".</p>
          </div>
        ) : null}

      </div>
    </div>
  );
}
