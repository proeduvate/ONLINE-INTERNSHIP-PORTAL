import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../../services/mockOnboardingService';
import { ArrowLeft, User, Briefcase, Settings } from 'lucide-react';
import '../../../pages/Dashboard/Dashboard.css';

export default function AdminOnboardingDetails({ appId }) {
    const { id: paramId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const pathParts = location.pathname.split('/');
    const targetId = appId || paramId || (pathParts.length > 3 ? pathParts[3] : null);

    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mentors, setMentors] = useState([]);
    const [selectedMentorId, setSelectedMentorId] = useState('');

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const baseUrl = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
                const response = await axios.get(`${baseUrl}/api/v1/users?role=mentor`);
                setMentors(response.data || []);
            } catch (error) {
                console.error("Error fetching mentors:", error);
            }
        };
        fetchMentors();
    }, []);

    useEffect(() => {
        const fetchApp = async () => {
            if (!targetId || targetId === "undefined") {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await mockOnboardingService.adminGetApplication(targetId);
                setApp(data);
                if (data?.assigned_mentor_id) {
                    setSelectedMentorId(data.assigned_mentor_id.toString());
                }
            } catch (error) {
                console.error("Error fetching onboarding details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [targetId]);

    const handleAction = async (newStatus) => {
        if (!targetId) return;
        await mockOnboardingService.adminUpdateStatus(targetId, newStatus);
        const data = await mockOnboardingService.adminGetApplication(targetId);
        setApp(data);
    };

    const handleAssignMentor = async () => {
        if (!selectedMentorId) {
            alert("Please select a mentor from the dropdown list first.");
            return;
        }
        try {
            const baseUrl = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
            await axios.post(`${baseUrl}/api/v1/onboarding/${targetId}/assign-mentor`, { mentor_id: parseInt(selectedMentorId) });
            await mockOnboardingService.adminUpdateStatus(targetId, "MENTOR_ASSIGNED");
            const data = await mockOnboardingService.adminGetApplication(targetId);
            setApp(data);
            alert("Mentor assigned successfully!");
        } catch (err) {
            console.error("Error assigning mentor", err);
            alert("Failed to assign mentor: " + (err.response?.data?.detail || err.message));
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
        <div style={{ padding: '16px 48px 32px 48px', width: '100%', boxSizing: 'border-box', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Top Header Card */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px 24px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => navigate('/admin/onboarding')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#475569', backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div style={{ width: '1px', height: '32px', backgroundColor: '#e2e8f0' }}></div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application Overview</p>
                        <h2 style={{ fontSize: '24px', margin: 0, color: '#0f172a', fontWeight: '700', letterSpacing: '-0.5px' }}>
                            {app.applicationId}
                        </h2>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={
                        `badge ${app.status.includes('PENDING') ? 'badge-warning' : (app.status.includes('VERIFIED') || app.status.includes('PASSED') || app.status.includes('COMPLETED') ? 'badge-success' : 'badge-danger')}`
                    } style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px', fontWeight: '600' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor', marginRight: '8px', opacity: 0.8 }}></span>
                        {app.status.replace(/_/g, ' ')}
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Left Column - Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Intern Information Card */}
                    <div className="card" style={{ padding: '32px', margin: 0, border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                                <User size={20} color="#3b82f6" />
                            </div>
                            Candidate Profile
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Full Name</span> 
                                <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{app.name}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Email Address</span> 
                                <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '15px' }}>{app.email}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Phone Number</span> 
                                <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '15px' }}>{app.phone}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>College / University</span> 
                                <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '15px' }}>{app.college}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Assigned Mentor</span> 
                                <span style={{ fontWeight: '600', color: app.assigned_mentor_name ? '#047857' : '#64748b', fontSize: '15px' }}>
                                    {app.assigned_mentor_name ? `👤 ${app.assigned_mentor_name}` : 'Not assigned yet'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Internship Information Card */}
                    <div className="card" style={{ padding: '32px', margin: 0, border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                            <div style={{ padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                                <Briefcase size={20} color="#10b981" />
                            </div>
                            Internship Details
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Applied Domain</span> 
                                <span style={{ fontWeight: '600', color: '#0f172a', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', width: 'fit-content', fontSize: '14px' }}>{app.domain}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>Submitted Resume</span> 
                                {(app.resume || app.resume_url) ? (
                                    <a 
                                        href={
                                            (app.resume || app.resume_url).startsWith('http') 
                                                ? (app.resume || app.resume_url) 
                                                : `http://127.0.0.1:8000/uploads/resumes/${app.resume || app.resume_url}`
                                        } 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#0f172a', width: 'fit-content', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                    >
                                        📄 View Resume
                                    </a>
                                ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>No resume uploaded</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>GitHub Profile</span> 
                                {(app.github_url || app.github) ? (
                                    <a 
                                        href={
                                            (app.github_url || app.github).startsWith('http') 
                                                ? (app.github_url || app.github) 
                                                : `https://github.com/${app.github_url || app.github}`
                                        } 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px', textDecoration: 'underline' }}
                                    >
                                        {app.github_url || app.github}
                                    </a>
                                ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Not provided</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>LinkedIn Profile</span> 
                                {(app.linkedin_url || app.linkedin) ? (
                                    <a 
                                        href={
                                            (app.linkedin_url || app.linkedin).startsWith('http') 
                                                ? (app.linkedin_url || app.linkedin) 
                                                : `https://linkedin.com/in/${app.linkedin_url || app.linkedin}`
                                        } 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ color: '#2563eb', fontWeight: '600', fontSize: '14px', textDecoration: 'underline' }}
                                    >
                                        {app.linkedin_url || app.linkedin}
                                    </a>
                                ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Not provided</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions */}
                <div className="card" style={{ padding: '32px', margin: 0, border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', marginBottom: '24px', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                        <div style={{ padding: '8px', backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
                            <Settings size={20} color="#a855f7" />
                        </div>
                        Action Center
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                            Current application stage requires your attention. Select an action below to proceed.
                        </p>

                        {app.status === ONBOARDING_STATUSES.PENDING_REVIEW && (
                            <>
                                <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_REQUIRED || "INTERVIEW_REQUIRED")}>Require Interview</button>
                                <button className="btn btn-secondary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#334155' }} onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || "ELIGIBLE_FOR_PAYMENT")}>Skip Interview (Eligible for Payment)</button>
                            </>
                        )}

                        {app.status === ONBOARDING_STATUSES.INTERVIEW_REQUIRED && (
                            <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_SCHEDULED || "INTERVIEW_SCHEDULED")}>Schedule Interview</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                            <>
                                <button className="btn" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_PASSED || "INTERVIEW_PASSED")}>Mark Passed</button>
                                <button className="btn btn-danger" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_FAILED || "INTERVIEW_FAILED")}>Mark Failed</button>
                            </>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.INTERVIEW_PASSED && (
                            <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || "ELIGIBLE_FOR_PAYMENT")}>Move to Payment Stage</button>
                        )}

                        {["ELIGIBLE_FOR_PAYMENT", "PAYMENT_PENDING", "PAYMENT_REQUIRED", "ACCEPTED"].includes(app.status) && (
                            <>
                                <button 
                                    className="btn" 
                                    style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none' }} 
                                    onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_VERIFIED || "PAYMENT_VERIFIED")}
                                >
                                    Verify Payment & Move to Docs ✓
                                </button>
                                <button 
                                    className="btn btn-danger" 
                                    style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#ef4444', color: 'white', border: 'none' }} 
                                    onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_REJECTED || "PAYMENT_REJECTED")}
                                >
                                    Reject Payment ✕
                                </button>
                            </>
                        )}

                        {app.status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && (
                            <>
                                <button className="btn" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_VERIFIED || "PAYMENT_VERIFIED")}>Verify Payment ✓</button>
                                <button className="btn btn-danger" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_REJECTED || "PAYMENT_REJECTED")}>Reject Payment ✕</button>
                            </>
                        )}

                        {["PAYMENT_VERIFIED", "DOCUMENTS_PENDING", "MENTOR_ASSIGNED"].includes(app.status) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Assign Mentor to Candidate:</label>
                                <select
                                    value={selectedMentorId}
                                    onChange={(e) => setSelectedMentorId(e.target.value)}
                                    style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', outline: 'none', backgroundColor: 'white' }}
                                >
                                    <option value="">-- Choose a Mentor --</option>
                                    {mentors.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({m.college || m.email})
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '10px', width: '100%', fontSize: '13px', borderRadius: '6px', fontWeight: '600', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }} 
                                    onClick={handleAssignMentor}
                                >
                                    {app.assigned_mentor_name ? "Update Assigned Mentor ✓" : "Assign Mentor & Proceed ✓"}
                                </button>
                            </div>
                        )}
                        
                        {["MENTOR_ASSIGNED", "DOCUMENTS_GENERATED", "DOCUMENTS_UPLOADED", "ACCOUNT_CREATION_PENDING"].includes(app.status) && (
                            <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.ACCOUNT_CREATED || "ACCOUNT_CREATED")}>Generate Docs & Create Account</button>
                        )}

                        {["ACCOUNT_CREATED", "ACCOUNT_ACTIVATION_PENDING"].includes(app.status) && (
                            <button className="btn" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.ONBOARDING_COMPLETED || "ONBOARDING_COMPLETED")}>Complete Onboarding</button>
                        )}

                        {["ONBOARDING_COMPLETED", "ACTIVE"].includes(app.status) && (
                            <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "8px", textAlign: "center", color: "#047857", fontWeight: "600", fontSize: "14px" }}>
                                ✓ Onboarding Completed & Account Active
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
