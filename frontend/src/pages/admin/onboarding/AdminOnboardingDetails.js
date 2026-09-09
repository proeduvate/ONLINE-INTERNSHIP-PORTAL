import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ONBOARDING_STATUSES } from '../../../services/mockOnboardingService'; // Keep for enum
import '../../onboarding/Onboarding.css';

export default function AdminOnboardingDetails() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [meetLink, setMeetLink] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [paymentFormLink, setPaymentFormLink] = useState('');

    useEffect(() => {
        const fetchApp = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/v1/onboarding/applications/${id}`);
                setApp(response.data);
            } catch (error) {
                console.error("Error fetching", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [id]);

    const handleAction = async (newStatus) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/applications/${id}/status`, { status: newStatus });
            refreshApp();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const refreshApp = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/v1/onboarding/applications/${id}`);
            setApp(response.data);
        } catch (error) {}
    };

    const handleInterviewDecision = async (isRequired) => {
        try {
            const data = { required: isRequired };
            if (isRequired) {
                if (!meetLink || !scheduledTime) {
                    alert("Please provide both meet link and scheduled time.");
                    return;
                }
                data.meet_link = meetLink;
                data.scheduled_time = scheduledTime;
            } else {
                if (!paymentFormLink) {
                    alert("Please provide the payment form link.");
                    return;
                }
                data.payment_form_link = paymentFormLink;
            }
            await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/interview`, data);
            refreshApp();
        } catch (error) {
            console.error("Error submitting decision", error);
        }
    };

    const handleInterviewResult = async (passed) => {
        try {
            const data = { passed };
            if (passed) {
                if (!paymentFormLink) {
                    alert("Please provide the payment form link.");
                    return;
                }
                data.payment_form_link = paymentFormLink;
            }
            await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/interview/result`, data);
            refreshApp();
        } catch (error) {
            console.error("Error submitting result", error);
        }
    };

    const handlePaymentVerify = async (verified) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/payment/verify`, { verified });
            refreshApp();
        } catch (error) {
            console.error("Error verifying payment", error);
        }
    };

    if (loading) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ maxWidth: '800px', textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Loading application details...</h3>
                </div>
            </div>
        );
    }
    
    if (!app) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ maxWidth: '800px', textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--danger-color)' }}>Application not found.</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container" style={{ maxWidth: '800px' }}>
                <button className="btn btn-secondary" onClick={() => window.location.href='/admin/onboarding'} style={{ marginBottom: '24px' }}>&larr; Back to List</button>
                
                <h2>Application: {app.applicationId}</h2>
                <div style={{ marginBottom: '24px' }}>
                    <span className={
                        `badge ${app.status.includes('PENDING') ? 'badge-warning' : (app.status.includes('VERIFIED') || app.status.includes('PASSED') || app.status.includes('COMPLETED') ? 'badge-success' : 'badge-danger')}`
                    }>
                        Status: {app.status.replace(/_/g, ' ')}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="status-box" style={{ background: 'var(--background-color)' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Intern Information</h3>
                        <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-color)' }}>Name:</strong> {app.name}</p>
                        <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-color)' }}>Email:</strong> {app.email}</p>
                        <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-color)' }}>Phone:</strong> {app.phone}</p>
                        <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-color)' }}>College:</strong> {app.college}</p>
                    </div>
                    
                    <div className="status-box" style={{ background: 'var(--background-color)' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Internship Information</h3>
                        <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-color)' }}>Domain:</strong> {app.domain}</p>
                        <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-color)' }}>Resume:</strong> 
                            {app.resume && app.resume !== "#" ? (
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', marginLeft: '8px' }} onClick={() => window.open(app.resume, "_blank")}>View Resume</button>
                            ) : (
                                <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>Not Provided</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="status-box" style={{ marginTop: '24px', border: '1px solid var(--primary-color)' }}>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Admin Actions</h3>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {app.status === ONBOARDING_STATUSES.PENDING_REVIEW && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="text" placeholder="Meet Link" className="input-field" value={meetLink} onChange={e => setMeetLink(e.target.value)} />
                                    <input type="datetime-local" className="input-field" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                                    <button className="btn btn-primary" onClick={() => handleInterviewDecision(true)}>Require Interview & Schedule</button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <input type="text" placeholder="Google Form Payment Link" className="input-field" value={paymentFormLink} onChange={e => setPaymentFormLink(e.target.value)} />
                                    <button className="btn btn-secondary" onClick={() => handleInterviewDecision(false)}>Skip Interview & Send Payment Link</button>
                                </div>
                            </div>
                        )}

                        {app.status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="text" placeholder="Google Form Payment Link" className="input-field" value={paymentFormLink} onChange={e => setPaymentFormLink(e.target.value)} />
                                    <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }} onClick={() => handleInterviewResult(true)}>Mark Passed & Send Payment Link</button>
                                </div>
                                <div>
                                    <button className="btn" style={{ backgroundColor: 'var(--danger-color)', color: 'white' }} onClick={() => handleInterviewResult(false)}>Mark Failed</button>
                                </div>
                            </div>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.INTERVIEW_PASSED && (
                            <button className="btn btn-primary" onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_PENDING)}>Move to Payment Stage</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.PAYMENT_PENDING && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }} onClick={() => handlePaymentVerify(true)}>Payment Completed / Verified</button>
                                <button className="btn btn-secondary" onClick={() => alert("Payment reminder sent to intern.")}>Send Reminder for Clear Payment</button>
                            </div>
                        )}

                        {app.status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && (
                            <>
                                <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }} onClick={() => handlePaymentVerify(true)}>Verify Payment</button>
                                <button className="btn" style={{ backgroundColor: 'var(--danger-color)', color: 'white' }} onClick={() => handlePaymentVerify(false)}>Reject Payment</button>
                            </>
                        )}

                        {app.status === ONBOARDING_STATUSES.DOCUMENTS_PENDING && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" onClick={async () => {
                                    try {
                                        await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/assign-mentor`, { mentor_id: 1 }); // Hardcoded for now
                                        alert("Mentor assigned successfully");
                                        refreshApp();
                                    } catch (e) { 
                                        console.error(e); 
                                        alert("Failed to assign mentor: " + (e.response?.data?.detail || e.message));
                                    }
                                }}>Assign Default Mentor</button>
                                <button className="btn btn-secondary" onClick={async () => {
                                    try {
                                        await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/generate-documents`);
                                        alert("Documents generated successfully");
                                        refreshApp();
                                    } catch (e) { 
                                        console.error(e); 
                                        alert("Failed to generate documents: " + (e.response?.data?.detail || e.message));
                                    }
                                }}>Generate & Send Documents</button>
                            </div>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.ACCOUNT_CREATION_PENDING && (
                            <button className="btn btn-primary" onClick={async () => {
                                try {
                                    await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/create-account`);
                                    refreshApp();
                                } catch (e) { console.error(e); }
                            }}>Create Account</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.ACCOUNT_ACTIVATION_PENDING && (
                            <p style={{ color: 'var(--text-muted)' }}>Waiting for intern to activate account...</p>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.DOCUMENTS_UPLOADED && (
                            <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }} onClick={() => handleAction(ONBOARDING_STATUSES.ACTIVE)}>Mark as Active / Complete Onboarding</button>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.ACTIVE && (
                            <p style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>Intern is active and onboarding is complete.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
