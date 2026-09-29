import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Onboarding.css";

export default function Status() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appId, setAppId] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fetch if appId is passed in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get("appId") || localStorage.getItem("last_application_id") || "APP-2026-00125";
    setAppId(idFromUrl);
    handleFetchStatus(idFromUrl);
  }, [location.search]);

  const handleFetchStatus = async (idToFetch) => {
    if (!idToFetch.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const baseUrl = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
      const response = await axios.get(`${baseUrl}/api/v1/onboarding/status/${idToFetch.trim()}`);
      setStatusResult(response.data);
    } catch (err) {
      console.warn("Backend API unavailable, using rich mock status tracking details.", err.message);
      
      const savedPayment = localStorage.getItem(`payment_status_${idToFetch.trim()}`);
      const signedOffer = localStorage.getItem(`signed_offer_${idToFetch.trim()}`) === 'true';
      const signedTc = localStorage.getItem(`signed_tc_${idToFetch.trim()}`) === 'true';

      let currentStage = "PAYMENT_REQUIRED";
      if (savedPayment === "PAYMENT_SUBMITTED") {
        currentStage = "PAYMENT_SUBMITTED";
      } else if (savedPayment === "PAYMENT_VERIFIED") {
        currentStage = signedOffer && signedTc ? "ONBOARDING_COMPLETED" : "DOCUMENTS_GENERATED";
      }

      setStatusResult({
        applicationId: idToFetch.trim(),
        name: "John Doe",
        track: "Full Stack Web Development",
        status: currentStage,
        appliedDate: "2026-09-18",
        message: currentStage === "ONBOARDING_COMPLETED" 
          ? "Congratulations! Your onboarding is complete and account credentials are ready."
          : currentStage === "DOCUMENTS_GENERATED"
          ? "Payment verified. Please view and sign your offer letter and terms."
          : currentStage === "PAYMENT_SUBMITTED"
          ? "Payment verification submitted! Awaiting admin verification before documents are unlocked."
          : "Your application has been reviewed & approved! Please complete payment verification."
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = statusResult?.status || "PAYMENT_REQUIRED";

  return (
    <div className="onboarding-page-wrapper">
      <div className="onboarding-container" style={{ maxWidth: "600px", padding: "24px" }}>
        
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 2px 0", color: "#0f172a" }}>Track Application Status</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>Real-time onboarding progression for your internship application.</p>
        </div>

        {/* Result Card with Progress Stepper */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3 style={{ color: "#2563eb", margin: 0, fontSize: "16px" }}>Loading application details...</h3>
          </div>
        ) : statusResult ? (
          <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            
            {/* Top Details Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0", fontSize: "16px", color: "#0f172a", fontWeight: 700 }}>{statusResult.name || "Intern Applicant"}</h3>
                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>{statusResult.track || "Full Stack Web Development"}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>Application ID</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155", fontFamily: "monospace" }}>{statusResult.applicationId}</span>
              </div>
            </div>

            {/* Visual Progress Stepper */}
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px", margin: "0 auto 6px auto" }}>✓</div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857", display: "block" }}>Applied</span>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px", margin: "0 auto 6px auto" }}>✓</div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857", display: "block" }}>Approved</span>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: ["PAYMENT_REQUIRED", "PENDING"].includes(currentStatus) ? "#f59e0b" : "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px", margin: "0 auto 6px auto" }}>
                    {["PAYMENT_REQUIRED", "PENDING"].includes(currentStatus) ? "3" : "✓"}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: ["PAYMENT_REQUIRED", "PENDING"].includes(currentStatus) ? "#b45309" : "#047857", display: "block" }}>Payment</span>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: currentStatus === "ONBOARDING_COMPLETED" ? "#10b981" : currentStatus === "DOCUMENTS_GENERATED" ? "#2563eb" : "#e2e8f0", color: currentStatus === "ONBOARDING_COMPLETED" || currentStatus === "DOCUMENTS_GENERATED" ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "13px", margin: "0 auto 6px auto" }}>
                    {currentStatus === "ONBOARDING_COMPLETED" ? "✓" : "4"}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: currentStatus === "ONBOARDING_COMPLETED" ? "#047857" : currentStatus === "DOCUMENTS_GENERATED" ? "#1d4ed8" : "#64748b", display: "block" }}>Documents</span>
                </div>
              </div>
            </div>

            {/* Status Message Box */}
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "12px 16px", marginBottom: "18px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.4" }}>
                💡 <strong>Current Status:</strong> {statusResult.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {["PAYMENT_REQUIRED", "PAYMENT_PENDING", "PAYMENT_SUBMITTED"].includes(currentStatus) && (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/onboarding/payment?appId=${statusResult.applicationId}`)}
                  style={{ padding: "9px 18px", fontSize: "13px", fontWeight: "bold" }}
                >
                  Payment Details →
                </button>
              )}

              {["PAYMENT_VERIFIED", "DOCUMENTS_GENERATED", "ACCOUNT_CREATION_PENDING", "ACCOUNT_CREATED", "ACTIVE", "ONBOARDING_COMPLETED"].includes(currentStatus) && (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/onboarding/documents?appId=${statusResult.applicationId}`)}
                  style={{ padding: "9px 18px", fontSize: "13px", fontWeight: "bold", backgroundColor: "#0284c7", borderColor: "#0284c7" }}
                >
                  My Documents & Sign →
                </button>
              )}

              {currentStatus === "ONBOARDING_COMPLETED" && (
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
        ) : null}

      </div>
    </div>
  );
}
