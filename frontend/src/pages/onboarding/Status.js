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
    // eslint-disable-next-line no-unused-vars
    const handleDevChange = async (e) => {
        mockOnboardingService.__devSetStatus(e.target.value);
        await fetchStatus();
    };

    if (loading) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Loading your onboarding status...</h3>
                </div>
            </div>
        );
    }

    if (!statusData) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--danger-color)' }}>Unable to load your onboarding status.</h3>
                </div>
            </div>
        );
    }

    const { status, applicationId } = statusData;

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container">
                <h2>Application Status</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}><strong>Application ID:</strong> <span style={{ color: 'var(--text-color)' }}>{applicationId}</span></p>

                <div className="status-timeline" style={{ paddingLeft: '24px', borderLeft: '3px solid var(--border-color)' }}>
                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-32px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--success-color)', border: '4px solid var(--card-bg)' }}></div>
                        <h3 style={{ color: 'var(--success-color)', fontSize: '18px', marginBottom: '8px' }}>Application Submitted</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Your application was received.</p>
                    </div>
                    
                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-32px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: status === ONBOARDING_STATUSES.PENDING_REVIEW ? 'var(--primary-color)' : (status !== ONBOARDING_STATUSES.PENDING_REVIEW ? 'var(--success-color)' : 'var(--border-color)'), border: '4px solid var(--card-bg)' }}></div>
                        <h3 style={{ color: status === ONBOARDING_STATUSES.PENDING_REVIEW ? 'var(--primary-color)' : (status !== ONBOARDING_STATUSES.PENDING_REVIEW ? 'var(--success-color)' : 'var(--text-muted)'), fontSize: '18px', marginBottom: '8px' }}>
                            Application Review
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{status === ONBOARDING_STATUSES.PENDING_REVIEW ? 'Currently being reviewed by our admin team.' : 'Review completed.'}</p>
                    </div>

                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-32px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: status.includes('INTERVIEW') ? 'var(--primary-color)' : (status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || status.includes('PAYMENT') || status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--border-color)'), border: '4px solid var(--card-bg)' }}></div>
                        <h3 style={{ color: status.includes('INTERVIEW') ? 'var(--primary-color)' : (status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || status.includes('PAYMENT') || status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--text-muted)'), fontSize: '18px', marginBottom: '8px' }}>
                            Interview
                        </h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {status === ONBOARDING_STATUSES.INTERVIEW_REQUIRED && <p>Your application requires an interview. Waiting for scheduling.</p>}
                            {status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                                <div className="status-box">
                                    <p><strong>Interview Scheduled</strong></p>
                                    <p>Date: Mock Date</p>
                                    <p>Time: Mock Time</p>
                                    <button className="btn btn-primary" style={{ marginTop: '15px' }}>Join Interview (Mock)</button>
                                </div>
                            )}
                            {status === ONBOARDING_STATUSES.INTERVIEW_PASSED && <p>Congratulations! You have passed the interview.</p>}
                            {status === ONBOARDING_STATUSES.INTERVIEW_FAILED && <p style={{color: 'var(--danger-color)'}}>Interview Failed. Please contact administration.</p>}
                            {status === ONBOARDING_STATUSES.INTERVIEW_NOT_REQUIRED && <p>Interview Not Required. You can proceed directly to payment.</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-32px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: status.includes('PAYMENT') || status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT ? 'var(--primary-color)' : (status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--border-color)'), border: '4px solid var(--card-bg)' }}></div>
                        <h3 style={{ color: status.includes('PAYMENT') || status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT ? 'var(--primary-color)' : (status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--text-muted)'), fontSize: '18px', marginBottom: '8px' }}>Payment</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {(status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || status === ONBOARDING_STATUSES.PAYMENT_PENDING) && (
                                <div className="status-box">
                                    <p><strong>Payment Required</strong></p>
                                    <p>Amount: ₹5,000</p>
                                    <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => window.location.href='/onboarding/payment'}>Submit Payment Details</button>
                                </div>
                            )}
                            {status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && <p>Payment Submitted. The administration team is currently verifying your payment.</p>}
                            {status === ONBOARDING_STATUSES.PAYMENT_VERIFIED && <p>Payment Verified ✓</p>}
                            {status === ONBOARDING_STATUSES.PAYMENT_REJECTED && <p style={{color: 'var(--danger-color)'}}>Payment Verification Failed. Please contact administration.</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-32px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: status.includes('MENTOR') ? 'var(--primary-color)' : (status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--border-color)'), border: '4px solid var(--card-bg)' }}></div>
                        <h3 style={{ color: status.includes('MENTOR') ? 'var(--primary-color)' : (status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--text-muted)'), fontSize: '18px', marginBottom: '8px' }}>Mentor Assignment</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {status === ONBOARDING_STATUSES.MENTOR_ASSIGNMENT_PENDING && <p>Waiting for mentor assignment...</p>}
                            {status === ONBOARDING_STATUSES.MENTOR_ASSIGNED && <p>Mentor Assigned ✓</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: '10px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-32px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: status.includes('ACCOUNT') ? 'var(--primary-color)' : (status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--border-color)'), border: '4px solid var(--card-bg)' }}></div>
                        <h3 style={{ color: status.includes('ACCOUNT') ? 'var(--primary-color)' : (status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? 'var(--success-color)' : 'var(--text-muted)'), fontSize: '18px', marginBottom: '8px' }}>Account Creation</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {status === ONBOARDING_STATUSES.ACCOUNT_CREATION_PENDING && <p>Your account is being prepared.</p>}
                            {status === ONBOARDING_STATUSES.ACCOUNT_CREATED && <p>Your account is ready! Activation instructions have been sent to your email.</p>}
                        </div>
                    </div>
                </div>
                
                {status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED && (
                    <div className="success-state" style={{ marginTop: '40px' }}>
                        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>🎉 Welcome to the Internship Portal!</h2>
                        <p style={{ marginBottom: '24px' }}>Your onboarding has been successfully completed.</p>
                        <button className="btn btn-primary" onClick={() => window.location.href='/login'}>Go to Login</button>
                    </div>
                )}
            </div>
        </div>
    );
}
