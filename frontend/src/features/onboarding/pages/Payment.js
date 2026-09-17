import React, { useState, useEffect } from 'react';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../services/mockOnboardingService';
import './Onboarding.css';

// Centralized configuration for the Google form
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
        // Dev mock utility to transition state
        mockOnboardingService.__devSetStatus(ONBOARDING_STATUSES.PAYMENT_SUBMITTED);
        // Open the google form in a new tab
        window.open(PAYMENT_FORM_URL, '_blank');
        // Refresh local status
        const result = await mockOnboardingService.getApplicationStatus();
        setStatusData(result);
    };

    if (loading) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Loading payment details...</h3>
                </div>
            </div>
        );
    }

    if (!statusData) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--danger-color)' }}>Unable to load payment details.</h3>
                </div>
            </div>
        );
    }

    const { status } = statusData;

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container">
                <h2>Payment Details</h2>

                {status === ONBOARDING_STATUSES.PAYMENT_PENDING || status === ONBOARDING_STATUSES.ELIGIBLE_FOR_PAYMENT ? (
                    <div className="status-box">
                        <h3 style={{ color: 'var(--text-color)', marginBottom: '16px' }}>Payment Required</h3>
                        <p><strong>Internship:</strong> Full Stack Development</p>
                        <p><strong>Duration:</strong> 3 Months</p>
                        <p><strong>Amount:</strong> ₹5,000</p>
                        <p><strong>Payment Status:</strong> <span style={{ color: 'var(--warning-color)', fontWeight: 600 }}>Pending</span></p>
                        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Please complete the payment submission using the form below.</p>
                        
                        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={handlePaymentSubmit}>Submit Payment Details ↗</button>
                    </div>
                ) : status === ONBOARDING_STATUSES.PAYMENT_SUBMITTED ? (
                    <div className="status-box">
                        <h3 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Payment Submitted ✓</h3>
                        <p>Your payment details have been submitted.</p>
                        <p style={{ color: 'var(--text-muted)' }}>The administration team is currently verifying your payment.</p>
                        <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                    </div>
                ) : status === ONBOARDING_STATUSES.PAYMENT_VERIFIED ? (
                    <div className="status-box">
                        <h3 style={{ color: 'var(--success-color)', marginBottom: '16px' }}>Payment Verified ✓</h3>
                        <p>Your payment has been successfully verified.</p>
                        <p style={{ color: 'var(--text-muted)' }}>Next: Mentor Assignment</p>
                        <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                    </div>
                ) : status === ONBOARDING_STATUSES.PAYMENT_REJECTED ? (
                    <div className="status-box">
                        <h3 style={{ color: 'var(--danger-color)', marginBottom: '16px' }}>Payment Verification Failed</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Please contact the administration team for further clarification.</p>
                    </div>
                ) : (
                    <div className="status-box">
                        <p style={{ color: 'var(--text-muted)' }}>You are not currently eligible for the payment stage, or your onboarding has progressed past this point.</p>
                        <button className="btn btn-secondary" style={{ marginTop: '20px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                    </div>
                )}
            </div>
        </div>
    );
}
