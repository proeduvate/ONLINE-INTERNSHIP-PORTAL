import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import './Onboarding.css';
import SignatureCanvas from 'react-signature-canvas';

export default function Documents() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [documentToSign, setDocumentToSign] = useState("");
    const [signing, setSigning] = useState(false);
    const sigCanvas = useRef({});

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

    const openSignModal = (type) => {
        setDocumentToSign(type);
        setShowSignatureModal(true);
    };

    const handleSignSubmit = async () => {
        if (sigCanvas.current.isEmpty()) {
            alert("Please draw your signature first.");
            return;
        }
        
        setSigning(true);
        try {
            const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            
            await api.post(`/api/v1/onboarding/${applicationId}/sign-document-inline`, {
                document_type: documentToSign,
                signature_base64: signatureDataUrl
            });
            
            alert(`${documentToSign === 'offer_letter' ? 'Offer Letter' : 'Terms & Conditions'} signed successfully!`);
            setShowSignatureModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Signature failed", error);
            alert("Failed to save signature: " + (error.response?.data?.detail || error.message));
        } finally {
            setSigning(false);
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
                                    <p>✅ You have successfully signed and uploaded your documents.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '500' }}>Offer Letter:</span>
                                        {statusData.signed_offer_letter_url ? (
                                            <span style={{ color: 'var(--success-color)' }}>✅ Signed</span>
                                        ) : (
                                            <button className="btn btn-primary" onClick={() => openSignModal('offer_letter')}>Sign Offer Letter</button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '500' }}>Terms & Conditions:</span>
                                        {statusData.signed_tc_url ? (
                                            <span style={{ color: 'var(--success-color)' }}>✅ Signed</span>
                                        ) : (
                                            <button className="btn btn-primary" onClick={() => openSignModal('tc')}>Sign Terms & Conditions</button>
                                        )}
                                    </div>
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
            
            {showSignatureModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px', color: 'black' }}>
                        <h3 style={{ marginBottom: '10px' }}>Sign {documentToSign === 'offer_letter' ? 'Offer Letter' : 'Terms & Conditions'}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Please draw your signature below:</p>
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9', cursor: 'crosshair', marginBottom: '15px' }}>
                            <SignatureCanvas 
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{width: 500, height: 200, className: 'sigCanvas'}} 
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => {if(sigCanvas.current) sigCanvas.current.clear()}} disabled={signing}>Clear</button>
                            <button className="btn btn-secondary" onClick={() => setShowSignatureModal(false)} disabled={signing}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSignSubmit} disabled={signing}>{signing ? 'Saving...' : 'Save Signature'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
