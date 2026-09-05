import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Onboarding.css';

export default function Documents() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const appId = urlParams.get('appId');
            if (!appId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/api/v1/onboarding/status/${appId}`);
                setStatusData({ status: response.data.status, applicationId: appId });
            } catch (error) {
                console.error("Error fetching status", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    if (loading) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Loading document details...</h3>
                </div>
            </div>
        );
    }

    if (!statusData) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--danger-color)' }}>Unable to load document details.</h3>
                </div>
            </div>
        );
    }

    const { status, applicationId } = statusData;
    const documentsReady = [
        "DOCUMENTS_GENERATED", 
        "DOCUMENTS_SENT", 
        "ACCOUNT_CREATION_PENDING",
        "ACCOUNT_CREATED",
        "ONBOARDING_COMPLETED"
    ].includes(status);

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container">
                <h2>Your Internship Documents</h2>

                {documentsReady ? (
                    <div className="status-box">
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}><strong>Intern ID:</strong> <span style={{ color: 'var(--text-color)' }}>INT-2026-{applicationId.split('-').pop()}</span></p>
                        
                        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                            <h4 style={{ color: 'var(--success-color)', marginBottom: '8px' }}>✓ Offer Letter</h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Generated on: 15/08/2026</p>
                            <div className="flex gap-4" style={{ marginTop: '16px' }}>
                                <button type="button" className="btn btn-primary" onClick={() => alert("Viewing Offer Letter (Mock)")}>View</button>
                                <button type="button" className="btn btn-secondary" onClick={() => alert("Downloading Offer Letter (Mock)")}>Download</button>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                            <h4 style={{ color: 'var(--success-color)', marginBottom: '8px' }}>✓ Terms & Conditions</h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Generated on: 15/08/2026</p>
                            <div className="flex gap-4" style={{ marginTop: '16px' }}>
                                <button type="button" className="btn btn-primary" onClick={() => alert("Viewing T&C (Mock)")}>View</button>
                                <button type="button" className="btn btn-secondary" onClick={() => alert("Downloading T&C (Mock)")}>Download</button>
                            </div>
                        </div>
                        
                        <button className="btn btn-secondary" style={{ marginTop: '30px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                    </div>
                ) : (
                    <div className="status-box">
                        <p style={{ color: 'var(--text-muted)' }}>Your documents are being prepared. Please wait until your mentor assignment is complete.</p>
                        
                        <ul style={{ color: 'var(--text-muted)', marginTop: '20px', listStyleType: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li><span style={{ display: 'inline-block', width: '20px' }}>○</span> Intern ID</li>
                            <li><span style={{ display: 'inline-block', width: '20px' }}>○</span> Offer Letter</li>
                            <li><span style={{ display: 'inline-block', width: '20px' }}>○</span> Terms & Conditions</li>
                        </ul>
                        
                        <button className="btn btn-secondary" style={{ marginTop: '30px' }} onClick={() => window.location.href='/onboarding/status'}>Back to Status</button>
                    </div>
                )}
            </div>
        </div>
    );
}
