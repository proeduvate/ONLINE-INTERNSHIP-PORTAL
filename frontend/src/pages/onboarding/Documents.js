import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './Onboarding.css';
import SignatureCanvas from 'react-signature-canvas';

export default function Documents() {
    const navigate = useNavigate();
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [documentToSign, setDocumentToSign] = useState("");
    const [signing, setSigning] = useState(false);
    const sigCanvas = useRef({});

    // PDF Preview Modal state
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfType, setPdfType] = useState("offer_letter"); // offer_letter or tc

    useEffect(() => {
        const fetchStatus = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const appId = urlParams.get('appId') || localStorage.getItem('last_application_id') || 'APP-2026-00125';

            setLoading(true);
            try {
                const response = await api.get(`/api/v1/onboarding/applications/${appId}`);
                setStatusData({ 
                    status: response.data.status, 
                    applicationId: appId,
                    offer_letter_url: response.data.offer_letter_url || "#",
                    tc_url: response.data.tc_url || "#",
                    signed_offer_letter_url: response.data.signed_offer_letter_url,
                    signed_tc_url: response.data.signed_tc_url
                });
            } catch (error) {
                console.warn("Backend API offline/unreachable, using mock document details fallback.", error);
                const savedPayment = localStorage.getItem(`payment_status_${appId}`);
                const signedOffer = localStorage.getItem(`signed_offer_${appId}`) === 'true';
                const signedTc = localStorage.getItem(`signed_tc_${appId}`) === 'true';
                let mockStatus = savedPayment || "PAYMENT_REQUIRED";
                if (savedPayment === "PAYMENT_VERIFIED") {
                    mockStatus = "DOCUMENTS_GENERATED";
                }
                setStatusData({ 
                    status: mockStatus, 
                    applicationId: appId,
                    offer_letter_url: "#",
                    tc_url: "#",
                    signed_offer_letter_url: signedOffer ? "#" : null,
                    signed_tc_url: signedTc ? "#" : null
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const openSignModal = (type) => {
        setDocumentToSign(type);
        setShowSignatureModal(true);
    };

    const handleSignSubmit = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            alert("Please draw your signature first.");
            return;
        }
        
        setSigning(true);
        const appId = statusData?.applicationId || "APP-2026-00125";
        const signatureDataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');

        try {
            await api.post(`/api/v1/onboarding/${appId}/sign-document-inline`, {
                document_type: documentToSign,
                signature_base64: signatureDataUrl
            });
        } catch (error) {
            console.warn("Inline signature API call fallback, saving locally.", error);
        }

        // Save signature and updated document state locally
        if (documentToSign === 'offer_letter') {
            localStorage.setItem(`signed_offer_${appId}`, 'true');
            localStorage.setItem(`sig_offer_${appId}`, signatureDataUrl);
            setStatusData(prev => ({ ...prev, signed_offer_letter_url: "#" }));
        } else {
            localStorage.setItem(`signed_tc_${appId}`, 'true');
            localStorage.setItem(`sig_tc_${appId}`, signatureDataUrl);
            setStatusData(prev => ({ ...prev, signed_tc_url: "#" }));
        }

        setShowSignatureModal(false);
        setSigning(false);

        // Immediately show the signed PDF document preview!
        setPdfType(documentToSign);
        setShowPdfModal(true);
    };

    const openPdfViewer = (type) => {
        setPdfType(type);
        setShowPdfModal(true);
    };

    if (loading) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ textAlign: 'center', padding: '40px' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Loading document details...</h3>
                </div>
            </div>
        );
    }

    const applicationId = statusData?.applicationId || "APP-2026-00125";
    const currentStatus = statusData?.status || "PAYMENT_REQUIRED";
    const isPaymentVerified = ["PAYMENT_VERIFIED", "DOCUMENTS_GENERATED", "ACCOUNT_CREATION_PENDING", "ACCOUNT_CREATED", "ACTIVE", "ONBOARDING_COMPLETED"].includes(currentStatus);
    const isBothSigned = statusData?.signed_offer_letter_url && statusData?.signed_tc_url;
    const offerSignature = localStorage.getItem(`sig_offer_${applicationId}`);
    const tcSignature = localStorage.getItem(`sig_tc_${applicationId}`);

    if (!isPaymentVerified) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ maxWidth: '520px', padding: '24px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '20px', fontWeight: 'bold' }}>
                        🔒
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Document Access Locked</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                        Your onboarding documents will be unlocked once your payment of ₹5,000 has been completed and verified by the administration team.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 'bold' }} onClick={() => navigate(`/onboarding/payment?appId=${applicationId}`)}>
                            Go to Payment Details →
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/onboarding/status?appId=${applicationId}`)}>
                            Back to Status
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container" style={{ maxWidth: '600px', padding: '20px' }}>
                
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "18px" }}>Internship Documents</h2>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Application ID: <strong>{applicationId}</strong></span>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate(`/onboarding/status?appId=${applicationId}`)} style={{ fontSize: "12px", padding: "5px 10px" }}>
                        ← Back to Status
                    </button>
                </div>

                <div className="status-box" style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px' }}>
                        <strong>Intern ID:</strong> <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>INT-2026-{applicationId.split('-').pop()}</span>
                    </p>
                    
                    {/* Document 1: Offer Letter */}
                    <div style={{ marginTop: '6px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ color: '#1e293b', margin: '0 0 2px 0', fontSize: '13px' }}>Internship Offer Letter</h4>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>ProEduvate 3-Month Program</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => openPdfViewer('offer_letter')}>
                            {statusData?.signed_offer_letter_url ? "View Signed PDF" : "View PDF"}
                        </button>
                    </div>

                    {/* Document 2: Terms & Conditions */}
                    <div style={{ marginTop: '6px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ color: '#1e293b', margin: '0 0 2px 0', fontSize: '13px' }}>Terms & Conditions Agreement</h4>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Code of Conduct & Confidentiality</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => openPdfViewer('tc')}>
                            {statusData?.signed_tc_url ? "View Signed PDF" : "View PDF"}
                        </button>
                    </div>

                    {/* E-Signature Section */}
                    <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #2563eb', borderRadius: '8px', background: '#eff6ff' }}>
                        <h3 style={{ color: '#1d4ed8', margin: '0 0 2px 0', fontSize: '14px' }}>Digital Signature Verification</h3>
                        <p style={{ color: '#3b82f6', fontSize: '11px', margin: '0 0 8px 0' }}>
                            Please sign both documents online to complete your onboarding verification.
                        </p>
                        
                        {isBothSigned ? (
                            <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "8px 12px", borderRadius: "6px", color: "#047857", fontWeight: 600, fontSize: "12px", textAlign: "center" }}>
                                All documents have been digitally signed! Click above to view signed PDFs.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #dbeafe' }}>
                                    <span style={{ fontWeight: '600', fontSize: '12px' }}>Offer Letter:</span>
                                    {statusData?.signed_offer_letter_url ? (
                                        <button className="btn btn-secondary" style={{ padding: '3px 10px', fontSize: '11px', color: '#16a34a', borderColor: '#86efac' }} onClick={() => openPdfViewer('offer_letter')}>
                                            View Signed PDF
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '11px' }} onClick={() => openSignModal('offer_letter')}>Sign Offer Letter</button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #dbeafe' }}>
                                    <span style={{ fontWeight: '600', fontSize: '12px' }}>Terms & Conditions:</span>
                                    {statusData?.signed_tc_url ? (
                                        <button className="btn btn-secondary" style={{ padding: '3px 10px', fontSize: '11px', color: '#16a34a', borderColor: '#86efac' }} onClick={() => openPdfViewer('tc')}>
                                            View Signed PDF
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '11px' }} onClick={() => openSignModal('tc')}>Sign Terms & Conditions</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px', justifyContent: 'center' }}>
                        {isBothSigned && (
                            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ backgroundColor: '#10b981', borderColor: '#10b981', padding: '8px 16px', fontSize: '13px' }}>
                                Proceed to Intern Login →
                            </button>
                        )}
                        <button className="btn btn-secondary" onClick={() => navigate(`/onboarding/status?appId=${applicationId}`)} style={{ padding: '8px 16px', fontSize: '13px' }}>
                            Back to Status
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Draw Signature Modal */}
            {showSignatureModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '480px', color: 'black', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Sign {documentToSign === 'offer_letter' ? 'Offer Letter' : 'Terms & Conditions'}</h3>
                        <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 12px 0' }}>Draw your digital signature inside the box below:</p>
                        
                        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'crosshair', marginBottom: '14px', overflow: 'hidden' }}>
                            <SignatureCanvas 
                                ref={sigCanvas}
                                penColor="#0f172a"
                                canvasProps={{ width: 440, height: 140, className: 'sigCanvas' }} 
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { if(sigCanvas.current) sigCanvas.current.clear() }} disabled={signing}>Clear</button>
                            <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowSignatureModal(false)} disabled={signing}>Cancel</button>
                            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={handleSignSubmit} disabled={signing}>{signing ? 'Saving...' : 'Confirm Signature & View PDF'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Official PDF Document Viewer Modal */}
            {showPdfModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                        
                        {/* Modal Action Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', backgroundColor: '#0f172a', color: '#ffffff' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Official ProEduvate Document - {pdfType === 'offer_letter' ? 'Internship Offer Letter.pdf' : 'Terms_and_Conditions_Agreement.pdf'}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => window.print()}>
                                    Print
                                </button>
                                <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => alert("Downloading PDF document to your device...")}>
                                    Download
                                </button>
                                <button onClick={() => setShowPdfModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }}>✕</button>
                            </div>
                        </div>

                        {/* Document Content Paper */}
                        <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'serif', lineHeight: '1.6' }}>
                            
                            {/* ProEduvate Letterhead */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '24px' }}>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#2563eb', fontFamily: 'sans-serif', letterSpacing: '-0.5px' }}>ProEduvate</h1>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>EdTech Solutions & Innovation Portal</span>
                                </div>
                                <div style={{ textAlign: 'right', fontFamily: 'sans-serif', fontSize: '12px', color: '#475569' }}>
                                    <div>Ref: <strong>PRED-2026/OFF-{applicationId.split('-').pop()}</strong></div>
                                    <div>Date: <strong>September 20, 2026</strong></div>
                                </div>
                            </div>

                            {/* Document Title */}
                            <h2 style={{ textAlign: 'center', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a', margin: '0 0 20px 0', fontFamily: 'sans-serif', fontWeight: 800 }}>
                                {pdfType === 'offer_letter' ? 'OFFER OF INTERNSHIP' : 'INTERNSHIP CODE OF CONDUCT & CONFIDENTIALITY AGREEMENT'}
                            </h2>

                            {/* Offer Letter Body */}
                            {pdfType === 'offer_letter' ? (
                                <div style={{ fontSize: '13px' }}>
                                    <p>Dear <strong>John Doe</strong>,</p>
                                    <p>We are pleased to offer you an appointment for the position of <strong>Full Stack Web Development Intern</strong> at ProEduvate EdTech Solutions. We were greatly impressed by your qualifications during the selection process.</p>
                                    
                                    <p style={{ margin: '14px 0 6px 0', fontWeight: 700, fontFamily: 'sans-serif' }}>Key Terms of Internship:</p>
                                    <ul style={{ paddingLeft: '20px', margin: '0 0 14px 0' }}>
                                        <li><strong>Program Duration:</strong> 3 Months (September 20, 2026 – December 20, 2026)</li>
                                        <li><strong>Domain / Focus:</strong> Full Stack Web Development & Modern Frameworks</li>
                                        <li><strong>Mentorship:</strong> Assigned 1-on-1 industry mentor review & code evaluations</li>
                                        <li><strong>Credential:</strong> Verifiable 30-Day & Final Completion Certificate</li>
                                    </ul>

                                    <p>Please review and accept this offer letter by digitally signing below. We look forward to working with you!</p>
                                </div>
                            ) : (
                                <div style={{ fontSize: '13px' }}>
                                    <p>This Terms & Conditions Agreement governs your participation in the ProEduvate Internship Program for Application <strong>{applicationId}</strong>.</p>
                                    
                                    <p style={{ margin: '14px 0 6px 0', fontWeight: 700, fontFamily: 'sans-serif' }}>1. Confidentiality & Intellectual Property</p>
                                    <p style={{ margin: '0 0 10px 0' }}>All codebase, architectural designs, and materials provided during the internship remain the sole intellectual property of ProEduvate EdTech Solutions.</p>

                                    <p style={{ margin: '14px 0 6px 0', fontWeight: 700, fontFamily: 'sans-serif' }}>2. Code of Conduct & Attendance</p>
                                    <p style={{ margin: '0 0 10px 0' }}>Interns are expected to maintain minimum 85% attendance, submit daily scenarios on schedule, and adhere to professional collaboration standards.</p>
                                </div>
                            )}

                            {/* Signatures Area */}
                            <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontFamily: 'sans-serif' }}>
                                
                                {/* Company Signatory */}
                                <div>
                                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Authorized Signatory (ProEduvate)</div>
                                    <div style={{ fontSize: '16px', fontFamily: 'cursive', color: '#1e293b', fontWeight: 'bold' }}>Dr. Ananya Menon</div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Director of Engineering</div>
                                    <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>✓ Verified Seal #98234-PRED</div>
                                </div>

                                {/* Intern Signature Box */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Intern Digital Signature</div>
                                    
                                    {(pdfType === 'offer_letter' && offerSignature) || (pdfType === 'tc' && tcSignature) ? (
                                        <div>
                                            <img 
                                                src={pdfType === 'offer_letter' ? offerSignature : tcSignature} 
                                                alt="Intern Signature" 
                                                style={{ height: '40px', maxWidth: '160px', objectFit: 'contain', borderBottom: '1px solid #0f172a' }} 
                                            />
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>John Doe</div>
                                            <div style={{ fontSize: '10px', color: '#2563eb' }}>Signed digitally on Sep 20, 2026</div>
                                        </div>
                                    ) : (
                                        <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
                                            [ Pending Digital Signature ]
                                        </div>
                                    )}
                                </div>

                            </div>

                        </div>

                        {/* Footer Close Button */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowPdfModal(false)} style={{ padding: '6px 16px', fontSize: '13px' }}>
                                Close Preview
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
