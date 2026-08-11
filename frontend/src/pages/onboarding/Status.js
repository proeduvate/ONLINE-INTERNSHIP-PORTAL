import React, { useEffect, useState } from 'react';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../services/mockOnboardingService';
import './Onboarding.css';

export default function Status() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const result = await mockOnboardingService.getApplicationStatus();
            setStatusData(result);
        } catch (error) {
            console.error("Error fetching status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // Developer utility for testing
    const handleDevChange = async (e) => {
        mockOnboardingService.__devSetStatus(e.target.value);
        await fetchStatus();
    };

    if (loading) {
        return <div className="onboarding-container">Loading your onboarding status...</div>;
    }

    if (!statusData) {
        return <div className="onboarding-container">Unable to load your onboarding status.</div>;
    }

    const { status, applicationId } = statusData;

    return (
        <div className="onboarding-container">
            <div className="dev-tools" style={{ padding: '10px', background: '#ffe', border: '1px solid #ccc', marginBottom: '20px' }}>
                <strong>Development Mode (Status Switcher): </strong>
                <select value={status} onChange={handleDevChange}>
                    {Object.values(ONBOARDING_STATUSES).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <h2>Application Status</h2>
            <p><strong>Application ID:</strong> {applicationId}</p>

            <div className="status-timeline" style={{ marginTop: '30px', paddingLeft: '20px', borderLeft: '2px solid #ccc' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#28a745' }}>✓ Application Submitted</h3>
                    <p>Your application was received.</p>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: status === ONBOARDING_STATUSES.PENDING_REVIEW ? '#0056b3' : (status !== ONBOARDING_STATUSES.PENDING_REVIEW ? '#28a745' : '#888') }}>
                        {status === ONBOARDING_STATUSES.PENDING_REVIEW ? '●' : '✓'} Application Review
                    </h3>
                    <p>{status === ONBOARDING_STATUSES.PENDING_REVIEW ? 'Currently being reviewed by our admin team.' : 'Review completed.'}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: status.includes('INTERVIEW') ? '#0056b3' : (status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || status.includes('PAYMENT') || status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#28a745' : '#888') }}>
                        ○ Interview
                    </h3>
                    {status === ONBOARDING_STATUSES.INTERVIEW_REQUIRED && <p>Your application requires an interview. Waiting for scheduling.</p>}
                    {status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                        <div className="status-box">
                            <p><strong>Interview Scheduled</strong></p>
                            <p>Date: Mock Date</p>
                            <p>Time: Mock Time</p>
                            <button>Join Interview (Mock)</button>
                        </div>
                    )}
                    {status === ONBOARDING_STATUSES.INTERVIEW_PASSED && <p>Congratulations! You have passed the interview.</p>}
                    {status === ONBOARDING_STATUSES.INTERVIEW_FAILED && <p style={{color: 'red'}}>Interview Failed. Please contact administration.</p>}
                    {status === ONBOARDING_STATUSES.INTERVIEW_NOT_REQUIRED && <p>Interview Not Required. You can proceed directly to payment.</p>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: status.includes('PAYMENT') || status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT ? '#0056b3' : (status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#28a745' : '#888') }}>○ Payment</h3>
                    {(status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || status === ONBOARDING_STATUSES.PAYMENT_PENDING) && (
                        <div className="status-box">
                            <p><strong>Payment Required</strong></p>
                            <p>Amount: ₹5,000</p>
                            <button onClick={() => window.location.href='/onboarding/payment'}>Submit Payment Details</button>
                        </div>
                    )}
                    {status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && <p>Payment Submitted. The administration team is currently verifying your payment.</p>}
                    {status === ONBOARDING_STATUSES.PAYMENT_VERIFIED && <p>Payment Verified ✓</p>}
                    {status === ONBOARDING_STATUSES.PAYMENT_REJECTED && <p style={{color: 'red'}}>Payment Verification Failed. Please contact administration.</p>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: status.includes('MENTOR') ? '#0056b3' : (status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#28a745' : '#888') }}>○ Mentor Assignment</h3>
                    {status === ONBOARDING_STATUSES.MENTOR_ASSIGNMENT_PENDING && <p>Waiting for mentor assignment...</p>}
                    {status === ONBOARDING_STATUSES.MENTOR_ASSIGNED && <p>Mentor Assigned ✓</p>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: status.includes('ACCOUNT') ? '#0056b3' : (status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#28a745' : '#888') }}>○ Account Creation</h3>
                    {status === ONBOARDING_STATUSES.ACCOUNT_CREATION_PENDING && <p>Your account is being prepared.</p>}
                    {status === ONBOARDING_STATUSES.ACCOUNT_CREATED && <p>Your account is ready! Activation instructions have been sent to your email.</p>}
                </div>
            </div>
            
            {status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED && (
                <div className="success-state">
                    <h2>🎉 Welcome to the Internship Portal!</h2>
                    <p>Your onboarding has been successfully completed.</p>
                    <button onClick={() => window.location.href='/login'}>Go to Login</button>
                </div>
            )}
        </div>
    );
}
