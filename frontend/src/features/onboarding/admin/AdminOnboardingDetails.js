import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../../services/mockOnboardingService';
import { ArrowLeft, User, Briefcase, Settings } from 'lucide-react';
import '../../../pages/Dashboard/Dashboard.css';

export default function AdminOnboardingDetails() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApp = async () => {
            setLoading(true);
            try {
                const data = await mockOnboardingService.adminGetApplication(id);
                setApp(data);
            } catch (error) {
                console.error("Error fetching", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [id]);

    const handleAction = async (newStatus) => {
        await mockOnboardingService.adminUpdateStatus(id, newStatus);
        const data = await mockOnboardingService.adminGetApplication(id);
        setApp(data);
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
                        onClick={() => window.location.href='/admin/onboarding'}
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
                                <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#0f172a', width: 'fit-content', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    View Document
                                </button>
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
                                <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_REQUIRED)}>Require Interview</button>
                                <button className="btn btn-secondary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#334155' }} onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT)}>Skip Interview (Eligible)</button>
                            </>
                        )}

                        {app.status === ONBOARDING_STATUSES.INTERVIEW_REQUIRED && (
                            <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_SCHEDULED)}>Schedule Interview</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                            <>
                                <button className="btn" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_PASSED)}>Mark Passed</button>
                                <button className="btn btn-danger" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_FAILED)}>Mark Failed</button>
                            </>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.INTERVIEW_PASSED && (
                            <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT)}>Move to Payment Stage</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && (
                            <>
                                <button className="btn" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_VERIFIED)}>Verify Payment</button>
                                <button className="btn btn-danger" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_REJECTED)}>Reject Payment</button>
                            </>
                        )}

                        {app.status === ONBOARDING_STATUSES.PAYMENT_VERIFIED && (
                            <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.MENTOR_ASSIGNED)}>Assign Mentor</button>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.MENTOR_ASSIGNED && (
                            <button className="btn btn-primary" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', fontWeight: '600', backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.ACCOUNT_CREATED)}>Generate Docs & Create Account</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.ACCOUNT_CREATED && (
                            <button className="btn" style={{ padding: '12px', width: '100%', fontSize: '14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', fontWeight: '600', border: 'none' }} onClick={() => handleAction(ONBOARDING_STATUSES.ONBOARDING_COMPLETED)}>Complete Onboarding</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
