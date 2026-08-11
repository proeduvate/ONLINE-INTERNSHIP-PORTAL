import React, { useState, useEffect } from 'react';
import { mockOnboardingService, ONBOARDING_STATUSES } from '../../services/mockOnboardingService';
import './Onboarding.css';

export default function Documents() {
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

    if (loading) {
        return <div className="onboarding-container">Loading document details...</div>;
    }

    if (!statusData) {
        return <div className="onboarding-container">Unable to load document details.</div>;
    }

    const { status, applicationId } = statusData;
    const documentsReady = [
        ONBOARDING_STATUSES.DOCUMENTS_GENERATED, 
        ONBOARDING_STATUSES.DOCUMENTS_SENT, 
        ONBOARDING_STATUSES.ACCOUNT_CREATION_PENDING,
        ONBOARDING_STATUSES.ACCOUNT_CREATED,
        ONBOARDING_STATUSES.ONBOARDING_COMPLETED
    ].includes(status);

    return (
        <div className="onboarding-container">
            <h2>Your Internship Documents</h2>

            {documentsReady ? (
                <div className="status-box">
                    <p><strong>Intern ID:</strong> INT-2026-{applicationId.split('-').pop()}</p>
                    
                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                        <h4 style={{ color: '#28a745' }}>✓ Offer Letter</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>Generated on: 15/08/2026</p>
                        <div className="button-group" style={{ justifyContent: 'flex-start', gap: '10px', marginTop: '10px' }}>
                            <button type="button" onClick={() => alert("Viewing Offer Letter (Mock)")}>View</button>
                            <button type="button" onClick={() => alert("Downloading Offer Letter (Mock)")}>Download</button>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                        <h4 style={{ color: '#28a745' }}>✓ Terms & Conditions</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>Generated on: 15/08/2026</p>
                        <div className="button-group" style={{ justifyContent: 'flex-start', gap: '10px', marginTop: '10px' }}>
                            <button type="button" onClick={() => alert("Viewing T&C (Mock)")}>View</button>
                            <button type="button" onClick={() => alert("Downloading T&C (Mock)")}>Download</button>
                        </div>
                    </div>
                    
                    <button style={{ marginTop: '30px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                </div>
            ) : (
                <div className="status-box">
                    <p>Your documents are being prepared. Please wait until your mentor assignment is complete.</p>
                    
                    <ul style={{ color: '#888', marginTop: '15px', listStyleType: 'none', paddingLeft: '0' }}>
                        <li>○ Intern ID</li>
                        <li>○ Offer Letter</li>
                        <li>○ Terms & Conditions</li>
                    </ul>
                    
                    <button style={{ marginTop: '20px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                </div>
            )}
        </div>
    );
}
