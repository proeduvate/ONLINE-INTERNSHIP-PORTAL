import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../../services/mockOnboardingService';
import '../../onboarding/Onboarding.css';

export default function AdminOnboardingDetails() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchApp();
    }, [id]);

    const handleAction = async (newStatus) => {
        await mockOnboardingService.adminUpdateStatus(id, newStatus);
        fetchApp();
    };

    if (loading) return <div className="onboarding-container">Loading application details...</div>;
    if (!app) return <div className="onboarding-container">Application not found.</div>;

    return (
        <div className="onboarding-container" style={{ maxWidth: '800px' }}>
            <button onClick={() => window.location.href='/admin/onboarding'} style={{ marginBottom: '20px', background: '#ccc', color: '#333' }}>&larr; Back to List</button>
            
            <h2>Application: {app.applicationId}</h2>
            <div style={{ padding: '4px 10px', display: 'inline-block', borderRadius: '12px', backgroundColor: '#e2e3e5', fontWeight: 'bold', marginBottom: '20px' }}>
                Status: {app.status}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="status-box">
                    <h3>Intern Information</h3>
                    <p><strong>Name:</strong> {app.name}</p>
                    <p><strong>Email:</strong> {app.email}</p>
                    <p><strong>Phone:</strong> {app.phone}</p>
                    <p><strong>College:</strong> {app.college}</p>
                </div>
                
                <div className="status-box">
                    <h3>Internship Information</h3>
                    <p><strong>Domain:</strong> {app.domain}</p>
                    <p><strong>Resume:</strong> <button style={{ padding: '2px 8px', fontSize: '12px' }}>View Resume</button></p>
                </div>
            </div>

            <div className="status-box" style={{ marginTop: '20px', backgroundColor: '#fdfdfd', border: '1px solid #ddd' }}>
                <h3>Admin Actions</h3>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                    {app.status === ONBOARDING_STATUSES.PENDING_REVIEW && (
                        <>
                            <button onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_REQUIRED)}>Require Interview</button>
                            <button onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT)}>Skip Interview (Eligible)</button>
                        </>
                    )}

                    {app.status === ONBOARDING_STATUSES.INTERVIEW_REQUIRED && (
                        <button onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_SCHEDULED)}>Schedule Interview</button>
                    )}

                    {app.status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                        <>
                            <button style={{ backgroundColor: '#28a745' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_PASSED)}>Mark Passed</button>
                            <button style={{ backgroundColor: '#dc3545' }} onClick={() => handleAction(ONBOARDING_STATUSES.INTERVIEW_FAILED)}>Mark Failed</button>
                        </>
                    )}
                    
                    {app.status === ONBOARDING_STATUSES.INTERVIEW_PASSED && (
                        <button onClick={() => handleAction(ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT)}>Move to Payment Stage</button>
                    )}

                    {app.status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && (
                        <>
                            <button style={{ backgroundColor: '#28a745' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_VERIFIED)}>Verify Payment</button>
                            <button style={{ backgroundColor: '#dc3545' }} onClick={() => handleAction(ONBOARDING_STATUSES.PAYMENT_REJECTED)}>Reject Payment</button>
                        </>
                    )}

                    {app.status === ONBOARDING_STATUSES.PAYMENT_VERIFIED && (
                        <button onClick={() => handleAction(ONBOARDING_STATUSES.MENTOR_ASSIGNED)}>Assign Mentor</button>
                    )}
                    
                    {app.status === ONBOARDING_STATUSES.MENTOR_ASSIGNED && (
                        <button onClick={() => handleAction(ONBOARDING_STATUSES.ACCOUNT_CREATED)}>Generate Docs & Create Account</button>
                    )}

                    {app.status === ONBOARDING_STATUSES.ACCOUNT_CREATED && (
                        <button style={{ backgroundColor: '#28a745' }} onClick={() => handleAction(ONBOARDING_STATUSES.ONBOARDING_COMPLETED)}>Complete Onboarding</button>
                    )}
                </div>
            </div>
        </div>
    );
}
