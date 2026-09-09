import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../services/mockOnboardingService';
import './Onboarding.css';

const PAYMENT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc...mock-url.../viewform";

export default function Payment() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchStatus();
    }, []);

    const handlePaymentSubmit = async () => {
        mockOnboardingService.__devSetStatus(ONBOARDING_STATUSES.PAYMENT_SUBMITTED);
        window.open(PAYMENT_FORM_URL, '_blank');
        const result = await mockOnboardingService.getApplicationStatus();
        setStatusData(result);
    };

    if (loading) {
        return <div className="onboarding-container">Loading payment details...</div>;
    }

    if (!statusData) {
        return <div className="onboarding-container">Unable to load payment details.</div>;
    }

    const { status } = statusData;

    return (
        <div className="onboarding-container">
            <h2>Payment Details</h2>
            <p style={{ marginBottom: '24px' }}>Complete your program fee submission to proceed with mentor assignment.</p>

            {status === ONBOARDING_STATUSES.PAYMENT_PENDING || status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT ? (
                <div className="status-box">
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a' }}>Payment Required</h3>
                    <p><strong>Internship Track:</strong> Full Stack Development</p>
                    <p><strong>Duration:</strong> 3 Months</p>
                    <p><strong>Amount:</strong> ₹5,000</p>
                    <p><strong>Status:</strong> <span style={{ color: '#d97706', fontWeight: 600 }}>Pending</span></p>
                    <p style={{ marginTop: '16px', color: '#475569' }}>Please submit payment confirmation details using the link below.</p>
                    
                    <button style={{ marginTop: '20px' }} onClick={handlePaymentSubmit}>Submit Payment Details ↗</button>
                </div>
            ) : status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED ? (
                <div className="status-box">
                    <h3 style={{ color: '#2563eb', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={20} /> Payment Submitted</h3>
                    <p>Your payment details have been submitted.</p>
                    <p>The administrative team is currently verifying your payment transaction.</p>
                    <button style={{ marginTop: '20px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                </div>
            ) : status === ONBOARDING_STATUSES.PAYMENT_VERIFIED ? (
                <div className="status-box">
                    <h3 style={{ color: '#16a34a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={20} /> Payment Verified</h3>
                    <p>Your payment has been verified.</p>
                    <p style={{ fontWeight: 500, color: '#0f172a' }}>Next step: Mentor Assignment</p>
                    <button style={{ marginTop: '20px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                </div>
            ) : status === ONBOARDING_STATUSES.PAYMENT_REJECTED ? (
                <div className="status-box">
                    <h3 style={{ color: '#dc2626', margin: '0 0 12px 0' }}>Payment Verification Failed</h3>
                    <p>Please contact the administration team for resolution.</p>
                </div>
            ) : (
                <div className="status-box">
                    <p>You are not currently eligible for the payment stage, or your onboarding has already progressed past this stage.</p>
                    <button style={{ marginTop: '20px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                </div>
            )}
        </div>
    );
}
