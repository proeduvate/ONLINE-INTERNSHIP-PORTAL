import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Onboarding.css';

export default function Documents() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [offerFile, setOfferFile] = useState(null);
    const [tcFile, setTcFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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
                const response = await api.get(`/api/v1/onboarding/applications/${appId}`);
                setStatusData({ 
                    status: response.data.status, 
                    applicationId: appId,
                    offer_letter_url: response.data.offer_letter_url,
                    tc_url: response.data.tc_url,
                    signed_offer_letter_url: response.data.signed_offer_letter_url,
                    signed_tc_url: response.data.signed_tc_url
                });
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
        "ACCOUNT_ACTIVATION_PENDING",
        "DOCUMENTS_UPLOADED",
        "ACTIVE",
        "ACCOUNT_CREATED",
        "ONBOARDING_COMPLETED"
    ].includes(status);

    const handleUpload = async () => {
        if (!offerFile || !tcFile) {
            alert("Please select both signed files before uploading.");
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('offer_letter', offerFile);
        formData.append('terms_conditions', tcFile);

        try {
            await api.post(`/api/v1/onboarding/${applicationId}/upload-signed-documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Signed documents uploaded successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed: " + (error.response?.data?.detail || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container">
                <h2>Your Internship Documents</h2>

                {documentsReady ? (
                    <div className="status-box">
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}><strong>Intern ID:</strong> <span style={{ color: 'var(--text-color)' }}>INT-2026-{applicationId.split('-').pop()}</span></p>
                        
                        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                            <h4 style={{ color: 'var(--success-color)', marginBottom: '8px' }}>✓ Offer Letter</h4>
                            <div className="flex gap-4" style={{ marginTop: '16px' }}>
                                {statusData.offer_letter_url ? (
                                    <button type="button" className="btn btn-secondary" onClick={() => window.open(statusData.offer_letter_url, "_blank")}>Download Offer Letter</button>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Not Available Yet</span>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                            <h4 style={{ color: 'var(--success-color)', marginBottom: '8px' }}>✓ Terms & Conditions</h4>
                            <div className="flex gap-4" style={{ marginTop: '16px' }}>
                                {statusData.tc_url ? (
                                    <button type="button" className="btn btn-secondary" onClick={() => window.open(statusData.tc_url, "_blank")}>Download T&C</button>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Not Available Yet</span>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', padding: '20px', border: '1px solid var(--primary-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                            <h3 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Upload Signed Documents</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Please print, sign, scan, and upload the signed copies of your offer letter and T&C.</p>
                            
                            {statusData.signed_offer_letter_url && statusData.signed_tc_url ? (
                                <div style={{ color: 'var(--success-color)' }}>
                                    <p>✅ You have successfully uploaded your signed documents.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px' }}>Signed Offer Letter (PDF):</label>
                                        <input type="file" accept="application/pdf" onChange={e => setOfferFile(e.target.files[0])} className="input-field" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px' }}>Signed Terms & Conditions (PDF):</label>
                                        <input type="file" accept="application/pdf" onChange={e => setTcFile(e.target.files[0])} className="input-field" />
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        style={{ marginTop: '10px', alignSelf: 'flex-start' }}
                                    >
                                        {uploading ? "Uploading..." : "Submit Signed Documents"}
                                    </button>
                                </div>
                            )}
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
