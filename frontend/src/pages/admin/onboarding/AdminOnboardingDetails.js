import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../../services/mockOnboardingService';
import '../../onboarding/Onboarding.css';

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
                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', marginLeft: '8px' }}>View Resume</button>
                        </p>
                    </div>
                </div>

                <div className="status-box" style={{ marginTop: '24px', border: '1px solid var(--primary-color)' }}>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Admin Actions</h3>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {app.status === ONBOARDING_STATUSES.PENDING_REVIEW && (
                            <>
                                <button className="btn btn-primary" onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_REQUIRED)}>Require Interview</button>
                                <button className="btn btn-secondary" onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT)}>Skip Interview (Eligible)</button>
                            </>
                        )}

                        {app.status === ONBOARDING_STATUSES.INTERVIEW_REQUIRED && (
                            <button className="btn btn-primary" onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_SCHEDULED)}>Schedule Interview</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                            <>
                                <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_PASSED)}>Mark Passed</button>
                                <button className="btn" style={{ backgroundColor: 'var(--danger-color)', color: 'white' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_FAILED)}>Mark Failed</button>
                            </>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.INTERVIEW_PASSED && (
                            <button className="btn btn-primary" onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT)}>Move to Payment Stage</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && (
                            <>
                                <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_VERIFIED)}>Verify Payment</button>
                                <button className="btn" style={{ backgroundColor: 'var(--danger-color)', color: 'white' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_REJECTED)}>Reject Payment</button>
                            </>
                        )}

                        {app.status === ONBOARDING_STATUSES.PAYMENT_VERIFIED && (
                            <button className="btn btn-primary" onClick={() => handleAction(ONBOARDING_STATUSES.MENTOR_ASSIGNED)}>Assign Mentor</button>
                        )}
                        
                        {app.status === ONBOARDING_STATUSES.MENTOR_ASSIGNED && (
                            <button className="btn btn-primary" onClick={() => handleAction(ONBOARDING_STATUSES.ACCOUNT_CREATED)}>Generate Docs & Create Account</button>
                        )}

                        {app.status === ONBOARDING_STATUSES.ACCOUNT_CREATED && (
                            <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: 'white' }} onClick={() => handleAction(ONBOARDING_STATUSES.ONBOARDING_COMPLETED)}>Complete Onboarding</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
