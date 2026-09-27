import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { ArrowLeft, User, Mail, Phone, School, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ONBOARDING_STATUSES } from '../../../services/mockOnboardingService';

export default function AdminOnboardingDetails({ id: propId }) {
    const params = useParams();
    const id = propId || params.id;
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [meetLink, setMeetLink] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [paymentFormLink, setPaymentFormLink] = useState('');
    const [mentors, setMentors] = useState([]);
    const [selectedMentorId, setSelectedMentorId] = useState('');

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/v1/users?role=mentor`);
                setMentors(response.data);
            } catch (error) {
                console.error("Error fetching mentors", error);
            }
        };
        fetchMentors();
    }, []);

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
        } catch (error) { }
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
            
            if (isRequired) {
                try {
                    const templateParams = {
                        intern_name: app.name,
                        to_email: app.email,
                        meet_link: meetLink,
                        scheduled_time: new Date(scheduledTime).toLocaleString()
                    };
                    await emailjs.send(
                        'service_tcpvv7r',
                        'template_mpcare4',
                        templateParams,
                        'AUbUjQbyafx3K-_aP'
                    );
                    alert("Interview scheduled and email sent successfully");
                } catch (e) {
                    console.error("Failed to send email", e);
                    alert("Interview scheduled, but failed to send email.");
                }
            }
            
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

    const getStatusBadge = (status) => {
        const s = status || '';
        let bg = '#eff6ff';
        let color = '#1d4ed8';

        if (s.includes('VERIFIED') || s.includes('PASSED') || s.includes('COMPLETED') || s.includes('ACTIVE')) {
            bg = '#d1fae5';
            color = '#065f46';
        } else if (s.includes('PENDING') || s.includes('SCHEDULED') || s.includes('SUBMITTED')) {
            bg = '#fef3c7';
            color = '#92400e';
        } else if (s.includes('FAILED') || s.includes('REJECTED')) {
            bg = '#fee2e2';
            color = '#991b1b';
        }

        return (
            <span style={{ backgroundColor: bg, color: color, padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600, display: 'inline-block' }}>
                {s.replace(/_/g, ' ')}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="card" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: 'var(--primary-color, #2563eb)' }}>Loading application details...</h3>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="card" style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: '#ef4444' }}>Application not found.</h3>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/onboarding')} style={{ marginTop: '16px' }}>
                    &larr; Back to Onboarding List
                </button>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/onboarding')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px' }}
                    >
                        <ArrowLeft size={16} /> Back to List
                    </button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                            Application: {app.applicationId || `#${app.id}`}
                        </h2>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Candidate: {app.name}</span>
                    </div>
                </div>

                <div>
                    {getStatusBadge(app.status)}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="#2563eb" /> Intern Information
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                        <p style={{ margin: 0, color: '#64748b' }}><strong style={{ color: '#334155' }}>Name:</strong> {app.name}</p>
                        <p style={{ margin: 0, color: '#64748b' }}><strong style={{ color: '#334155' }}>Email:</strong> {app.email}</p>
                        <p style={{ margin: 0, color: '#64748b' }}><strong style={{ color: '#334155' }}>Phone:</strong> {app.phone || 'N/A'}</p>
                        <p style={{ margin: 0, color: '#64748b' }}><strong style={{ color: '#334155' }}>College:</strong> {app.college || 'N/A'}</p>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <School size={16} color="#2563eb" /> Internship Information
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                        <p style={{ margin: 0, color: '#64748b' }}><strong style={{ color: '#334155' }}>Domain:</strong> {app.domain}</p>
                        <p style={{ margin: 0, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#334155' }}>Resume:</strong>
                            {app.resume && app.resume !== "#" ? (
                                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => window.open(app.resume, "_blank")}>View Resume</button>
                            ) : (
                                <span style={{ color: '#94a3b8' }}>Not Provided</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#2563eb" /> Documents & Contracts
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '13px' }}>
                    <div style={{ padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ display: 'block', color: '#334155', marginBottom: '4px' }}>Offer Letter (Generated):</strong>
                        {app.offer_letter_url ? <a href={app.offer_letter_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>View Generated PDF</a> : <span style={{ color: '#94a3b8' }}>Not generated</span>}
                    </div>
                    <div style={{ padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ display: 'block', color: '#334155', marginBottom: '4px' }}>T&C (Generated):</strong>
                        {app.tc_url ? <a href={app.tc_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>View Generated PDF</a> : <span style={{ color: '#94a3b8' }}>Not generated</span>}
                    </div>
                    <div style={{ padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ display: 'block', color: '#334155', marginBottom: '4px' }}>Signed Offer Letter (Intern):</strong>
                        {app.signed_offer_letter_url ? <a href={app.signed_offer_letter_url} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 600 }}>View Uploaded PDF</a> : <span style={{ color: '#94a3b8' }}>Not uploaded</span>}
                    </div>
                    <div style={{ padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ display: 'block', color: '#334155', marginBottom: '4px' }}>Signed T&C (Intern):</strong>
                        {app.signed_tc_url ? <a href={app.signed_tc_url} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 600 }}>View Uploaded PDF</a> : <span style={{ color: '#94a3b8' }}>Not uploaded</span>}
                    </div>
                </div>

                {(app.status === ONBOARDING_STATUSES.ACCOUNT_CREATION_PENDING || app.offer_letter_url) && (
                    <div style={{ marginTop: '16px' }}>
                        <button className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={async () => {
                            try {
                                const response = await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/generate-documents`);
                                if (response.data.urls) {
                                    const templateParams = {
                                        intern_name: app.name,
                                        to_email: app.email,
                                        document_link: response.data.urls.offer_letter_url
                                    };
                                    await emailjs.send(
                                        'service_tcpvv7r',
                                        'template_mpcare4',
                                        templateParams,
                                        'AUbUjQbyafx3K-_aP'
                                    );
                                }
                                alert("Documents regenerated and sent successfully");
                                refreshApp();
                            } catch (e) {
                                console.error(e);
                                alert("Failed to regenerate documents: " + (e.response?.data?.detail || e.message));
                            }
                        }}>Regenerate & Resend Documents</button>
                    </div>
                )}
            </div>

            <div style={{ padding: '20px', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#f0fdf4' }}>
                <h4 style={{ color: '#1e40af', margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Admin Workflow Actions</h4>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {app.status === ONBOARDING_STATUSES.PENDING_REVIEW && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <input type="text" placeholder="Meet Link (e.g. https://meet.google.com/...)" className="form-control" value={meetLink} onChange={e => setMeetLink(e.target.value)} style={{ flex: 1, minWidth: '220px' }} />
                                <input type="datetime-local" className="form-control" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ width: '220px' }} />
                                <button className="btn btn-primary" onClick={() => handleInterviewDecision(true)}>Require Interview & Schedule</button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                                <input type="text" placeholder="Google Form Payment Link" className="form-control" value={paymentFormLink} onChange={e => setPaymentFormLink(e.target.value)} style={{ flex: 1, minWidth: '220px' }} />
                                <button className="btn btn-secondary" onClick={() => handleInterviewDecision(false)}>Skip Interview & Send Payment Link</button>
                            </div>
                        </div>
                    )}

                    {app.status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <input type="text" placeholder="Google Form Payment Link" className="form-control" value={paymentFormLink} onChange={e => setPaymentFormLink(e.target.value)} style={{ flex: 1, minWidth: '220px' }} />
                                <button className="btn" style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }} onClick={() => handleInterviewResult(true)}>Mark Passed & Send Payment Link</button>
                            </div>
                            <div>
                                <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }} onClick={() => handleInterviewResult(false)}>Mark Failed</button>
                            </div>
                        </div>
                    )}

                    {app.status === ONBOARDING_STATUSES.INTERVIEW_PASSED && (
                        <button className="btn btn-primary" onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_PENDING)}>Move to Payment Stage</button>
                    )}

                    {app.status === ONBOARDING_STATUSES.PAYMENT_PENDING && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="btn" style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }} onClick={() => handlePaymentVerify(true)}>Payment Completed / Verified</button>
                            <button className="btn btn-secondary" onClick={() => alert("Payment reminder sent to intern.")}>Send Reminder for Clear Payment</button>
                        </div>
                    )}

                    {app.status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button className="btn" style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }} onClick={() => handlePaymentVerify(true)}>Verify Payment</button>
                            <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }} onClick={() => handlePaymentVerify(false)}>Reject Payment</button>
                        </div>
                    )}

                    {app.status === ONBOARDING_STATUSES.DOCUMENTS_PENDING && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <select className="form-control" value={selectedMentorId} onChange={e => setSelectedMentorId(e.target.value)} style={{ width: '220px' }}>
                                <option value="">Select Mentor</option>
                                {mentors.map(mentor => (
                                    <option key={mentor.id} value={mentor.id}>{mentor.name} ({mentor.email})</option>
                                ))}
                            </select>
                            <button className="btn btn-primary" onClick={async () => {
                                if (!selectedMentorId) {
                                    alert("Please select a mentor first.");
                                    return;
                                }
                                try {
                                    await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/assign-mentor`, { mentor_id: parseInt(selectedMentorId) });
                                    alert("Mentor assigned successfully");
                                    refreshApp();
                                } catch (e) {
                                    console.error(e);
                                    alert("Failed to assign mentor: " + (e.response?.data?.detail || e.message));
                                }
                            }}>Assign Mentor</button>
                            <button className="btn btn-secondary" onClick={async () => {
                                try {
                                    const response = await axios.post(`http://127.0.0.1:8000/api/v1/onboarding/${id}/generate-documents`);

                                    if (response.data.urls) {
                                        const templateParams = {
                                            intern_name: app.name,
                                            to_email: app.email,
                                            document_link: response.data.urls.offer_letter_url
                                        };

                                        await emailjs.send(
                                            'service_tcpvv7r',
                                            'template_mpcare4',
                                            templateParams,
                                            'AUbUjQbyafx3K-_aP'
                                        );
                                    }

                                    alert("Documents generated and sent successfully");
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
                        <p style={{ color: '#64748b', margin: 0 }}>Waiting for intern to activate account...</p>
                    )}

                    {app.status === ONBOARDING_STATUSES.DOCUMENTS_UPLOADED && (
                        <button className="btn" style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }} onClick={() => handleAction(ONBOARDING_STATUSES.ACTIVE)}>Mark as Active / Complete Onboarding</button>
                    )}

                    {app.status === ONBOARDING_STATUSES.ACTIVE && (
                        <p style={{ color: '#059669', fontWeight: 'bold', margin: 0 }}>Intern is active and onboarding is complete.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
