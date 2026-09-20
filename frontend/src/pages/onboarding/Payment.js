import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Onboarding.css';

export default function Payment() {
    const navigate = useNavigate();
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [utrNumber, setUtrNumber] = useState("");
    const [submittingPayment, setSubmittingPayment] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const appId = urlParams.get('appId') || localStorage.getItem('last_application_id') || 'APP-2026-00125';

            setLoading(true);
            try {
                const response = await api.get(`/api/v1/onboarding/status/${appId}`);
                setStatusData({ status: response.data.status, applicationId: appId });
            } catch (error) {
                console.warn("Backend API offline/unreachable, using mock payment details fallback.", error);
                const savedPaymentStatus = localStorage.getItem(`payment_status_${appId}`) || "PAYMENT_REQUIRED";
                setStatusData({ status: savedPaymentStatus, applicationId: appId });
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!utrNumber.trim()) {
            alert("Please enter a valid Transaction / UTR Reference Number.");
            return;
        }

        setSubmittingPayment(true);
        setTimeout(() => {
            const appId = statusData?.applicationId || "APP-2026-00125";
            localStorage.setItem(`payment_status_${appId}`, "PAYMENT_SUBMITTED");
            setStatusData(prev => ({ ...prev, status: "PAYMENT_SUBMITTED" }));
            setSubmittingPayment(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '40px' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Loading payment details...</h3>
                </div>
            </div>
        );
    }

    const applicationId = statusData?.applicationId || "APP-2026-00125";
    const status = statusData?.status || "PAYMENT_REQUIRED";

    const isPending = status === "PAYMENT_REQUIRED" || status === "ELIGIBLE_FOR_PAYMENT" || status === "PAYMENT_PENDING";
    const isSubmitted = status === "PAYMENT_SUBMITTED";
    const isVerified = status === "PAYMENT_VERIFIED" || status === "MENTOR_ASSIGNED" || status === "ONBOARDING_COMPLETED" || status === "DOCUMENTS_GENERATED";
    const isRejected = status === "PAYMENT_REJECTED";

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container" style={{ maxWidth: '600px', padding: '20px' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "18px" }}>Payment Details</h2>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Application ID: <strong>{applicationId}</strong></span>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate(`/onboarding/status?appId=${applicationId}`)} style={{ fontSize: "12px", padding: "5px 10px" }}>
                        ← Back to Status
                    </button>
                </div>

                {isPending && (
                    <div className="status-box" style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
                            <h3 style={{ color: "var(--text-color)", margin: 0, fontSize: "15px" }}>Payment Required</h3>
                            <span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>Pending</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px", fontSize: "12px" }}>
                            <div><strong>Track:</strong> Full Stack Web Dev</div>
                            <div><strong>Duration:</strong> 3 Months</div>
                            <div><strong>Registration Fee:</strong> ₹5,000</div>
                            <div><strong>GST / Tax:</strong> Included</div>
                        </div>

                        {/* UPI / QR Payment Instructions */}
                        <div style={{ backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "10px", textAlign: "center" }}>
                            <p style={{ margin: "0 0 2px 0", fontSize: "11px", color: "#475569", fontWeight: 600 }}>Scan QR or Pay via UPI ID:</p>
                            <div style={{ backgroundColor: "#0f172a", color: "#38bdf8", padding: "4px 12px", borderRadius: "4px", fontFamily: "monospace", fontSize: "13px", fontWeight: "bold", display: "inline-block", marginBottom: "2px" }}>
                                proeduvate@upi
                            </div>
                            <p style={{ margin: 0, fontSize: "10px", color: "#64748b" }}>Bank: HDFC Bank | Account: ProEduvate Solutions</p>
                        </div>

                        {/* Payment Verification Form */}
                        <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                                    Transaction / UTR Reference Number <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. UTR12938401923"
                                    className="form-control"
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", margin: 0 }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={submittingPayment}
                                style={{ width: "100%", padding: "8px", fontSize: "13px", fontWeight: "bold", borderRadius: "6px" }}
                            >
                                {submittingPayment ? "Submitting..." : "Submit Payment Verification ↗"}
                            </button>
                        </form>
                    </div>
                )}

                {isSubmitted && (
                    <div className="status-box" style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                        <h3 style={{ color: "#1d4ed8", margin: "0 0 6px 0", fontSize: "16px" }}>Payment Verification Submitted ✓</h3>
                        <p style={{ color: "#3b82f6", fontSize: "12px", margin: "0 0 12px 0" }}>
                            Your transaction reference has been recorded. Administration is currently verifying your payment. Document access will be enabled once verified by Admin.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                            <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => navigate(`/onboarding/status?appId=${applicationId}`)}>
                                ← Back to Status
                            </button>
                            <button 
                                className="btn btn-primary" 
                                style={{ padding: "6px 14px", fontSize: "12px", backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                                onClick={() => {
                                    localStorage.setItem(`payment_status_${applicationId}`, "PAYMENT_VERIFIED");
                                    setStatusData(prev => ({ ...prev, status: "PAYMENT_VERIFIED" }));
                                }}
                            >
                                [Admin Demo] Verify Payment ✓
                            </button>
                        </div>
                    </div>
                )}

                {isVerified && (
                    <div className="status-box" style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                        <h3 style={{ color: "#047857", margin: "0 0 6px 0", fontSize: "16px" }}>Payment Verified ✓</h3>
                        <p style={{ color: "#059669", fontSize: "12px", margin: "0 0 12px 0" }}>
                            Your payment of ₹5,000 has been verified. You can now proceed to sign documents.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => navigate(`/onboarding/documents?appId=${applicationId}`)}>
                                View & Sign Documents →
                            </button>
                            <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => navigate(`/onboarding/status?appId=${applicationId}`)}>
                                Back to Status
                            </button>
                        </div>
                    </div>
                )}

                {isRejected && (
                    <div className="status-box" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                        <h3 style={{ color: "#dc2626", margin: "0 0 6px 0", fontSize: "16px" }}>Payment Verification Failed</h3>
                        <p style={{ color: "#ef4444", fontSize: "12px", margin: "0 0 12px 0" }}>
                            Transaction reference could not be verified. Please contact support or re-submit.
                        </p>
                        <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => setStatusData(prev => ({ ...prev, status: "PAYMENT_REQUIRED" }))}>
                            Re-submit Payment Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
