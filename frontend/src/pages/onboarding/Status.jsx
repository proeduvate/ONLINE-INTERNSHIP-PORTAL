import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, CircleDot, PartyPopper } from 'lucide-react';
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
            <div className="dev-tools" style={{ padding: '12px 16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '24px', color: '#92400e' }}>
                <strong>Dev Sandbox (Simulate Status): </strong>
                <select value={status} onChange={handleDevChange} style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d97706' }}>
                    {Object.values(ONBOARDING_STATUSES).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <h2>Application Status</h2>
            <p><strong>Application ID:</strong> {applicationId}</p>

            <div className="status-timeline" style={{ marginTop: '28px', paddingLeft: '24px', borderLeft: '3px solid #e2e8f0' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#16a34a', fontSize: '1.1rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={20} /> Application Submitted</h3>
                    <p style={{ margin: 0, color: '#64748b' }}>Your application was received.</p>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: status === ONBOARDING_STATUSES.PENDING_REVIEW ? '#2563eb' : (status !== ONBOARDING_STATUSES.PENDING_REVIEW ? '#16a34a' : '#94a3b8'), fontSize: '1.1rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {status === ONBOARDING_STATUSES.PENDING_REVIEW ? <CircleDot size={20} /> : <CheckCircle2 size={20} />} Application Review
                    </h3>
                    <p style={{ margin: 0, color: '#64748b' }}>{status === ONBOARDING_STATUSES.PENDING_REVIEW ? 'Currently being reviewed by our administrative team.' : 'Review completed.'}</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: status.includes('INTERVIEW') ? '#2563eb' : (status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || status.includes('PAYMENT') || status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#16a34a' : '#94a3b8'), fontSize: '1.1rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Circle size={20} /> Interview Stage
                    </h3>
                    {status === ONBOARDING_STATUSES.INTERVIEW_REQUIRED && <p style={{ margin: 0, color: '#64748b' }}>Your application requires an interview. Waiting for scheduling.</p>}
                    {status === ONBOARDING_STATUSES.INTERVIEW_SCHEDULED && (
                        <div className="status-box">
                            <p style={{ fontWeight: 600 }}>Interview Scheduled</p>
                            <p>Date: September 10, 2026</p>
                            <p>Time: 10:00 AM IST</p>
                            <button style={{ marginTop: '12px' }}>Join Interview Link</button>
                        </div>
                    )}
                    {status === ONBOARDING_STATUSES.INTERVIEW_PASSED && <p style={{ margin: 0, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>Passed interview step <CheckCircle2 size={16} /></p>}
                    {status === ONBOARDING_STATUSES.INTERVIEW_FAILED && <p style={{ margin: 0, color: '#dc2626' }}>Interview not cleared. Please contact support.</p>}
                    {status === ONBOARDING_STATUSES.INTERVIEW_NOT_REQUIRED && <p style={{ margin: 0, color: '#64748b' }}>Interview step waived. Proceed to payment.</p>}
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: status.includes('PAYMENT') || status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT ? '#2563eb' : (status.includes('MENTOR') || status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#16a34a' : '#94a3b8'), fontSize: '1.1rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Circle size={20} /> Payment Verification
                    </h3>
                    {(status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT || status === ONBOARDING_STATUSES.PAYMENT_PENDING) && (
                        <div className="status-box">
                            <p style={{ fontWeight: 600 }}>Payment Required</p>
                            <p>Program Fee: ₹5,000</p>
                            <button style={{ marginTop: '12px' }} onClick={() => window.location.href='/onboarding/payment'}>Submit Payment Details</button>
                        </div>
                    )}
                    {status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED && <p style={{ margin: 0, color: '#2563eb' }}>Payment Submitted. Admin verification in progress.</p>}
                    {status === ONBOARDING_STATUSES.PAYMENT_VERIFIED && <p style={{ margin: 0, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>Payment Verified <CheckCircle2 size={16} /></p>}
                    {status === ONBOARDING_STATUSES.PAYMENT_REJECTED && <p style={{ margin: 0, color: '#dc2626' }}>Payment verification failed. Please contact admin.</p>}
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: status.includes('MENTOR') ? '#2563eb' : (status.includes('ACCOUNT') || status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#16a34a' : '#94a3b8'), fontSize: '1.1rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Circle size={20} /> Mentor Assignment
                    </h3>
                    {status === ONBOARDING_STATUSES.MENTOR_ASSIGNMENT_PENDING && <p style={{ margin: 0, color: '#64748b' }}>Waiting for mentor assignment...</p>}
                    {status === ONBOARDING_STATUSES.MENTOR_ASSIGNED && <p style={{ margin: 0, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>Mentor Assigned <CheckCircle2 size={16} /></p>}
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: status.includes('ACCOUNT') ? '#2563eb' : (status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED ? '#16a34a' : '#94a3b8'), fontSize: '1.1rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Circle size={20} /> Account Creation
                    </h3>
                    {status === ONBOARDING_STATUSES.ACCOUNT_CREATION_PENDING && <p style={{ margin: 0, color: '#64748b' }}>Your student account is being initialized.</p>}
                    {status === ONBOARDING_STATUSES.ACCOUNT_CREATED && <p style={{ margin: 0, color: '#16a34a' }}>Account active! Credentials emailed.</p>}
                </div>
            </div>
            
            {status === ONBOARDING_STATUSES.ONBOARDING_COMPLETED && (
                <div className="success-state" style={{ marginTop: '32px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><PartyPopper size={32} color="#10b981" /> Welcome to ProEduvate Internship!</h2>
                    <p style={{ marginBottom: '20px' }}>Your onboarding process is complete.</p>
                    <button onClick={() => window.location.href='/login'}>Go to Login</button>
                </div>
            )}
        </div>
    );
}
