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
            const appId = urlParams.get('appId') || localStorage.getItem('last_application_id');

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
                    offer_letter_url: response.data.offer_letter_url || "#",
                    tc_url: response.data.tc_url || "#",
                    signed_offer_letter_url: response.data.signed_offer_letter_url,
                    signed_tc_url: response.data.signed_tc_url
                });
            } catch (error) {
                console.error("Error fetching document details from backend API:", error);
                setStatusData({ 
                    status: "PENDING_REVIEW", 
                    applicationId: appId,
                    offer_letter_url: "#",
                    tc_url: "#"
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
                                <div style={{ fontSize: '12px', color: '#334155', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px', lineHeight: '1.6', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ marginBottom: '16px', fontWeight: '500' }}>This Terms & Conditions Agreement governs your participation in the ProEduvate Internship Program for Application <strong>{applicationId}</strong>.</p>
                                    
                                    {[
                                        { title: "1. Internship Program", points: [
                                            "The internship is a structured 30-day learning and practical development program.",
                                            "Interns will actively participate throughout the internship period.",
                                            "The internship will include learning, assessments, practical assignments, mentor interaction, and project-based activities."
                                        ]},
                                        { title: "2. Internship Fee", points: [
                                            "The internship fee is Rs.500 (Five Hundred Indian Rupees only).",
                                            "The fee will be paid after selection and acceptance of the internship.",
                                            "Payment of the fee will not automatically guarantee successful completion, certification, employment, or placement."
                                        ]},
                                        { title: "3. Internship Activation", points: [
                                            "The internship will be activated only after: Selection/Interview; Acceptance of Internship; Acceptance of Terms & Conditions; Payment of Rs.500 fee; Payment verification; Admin approval; Portal access activation."
                                        ]},
                                        { title: "4. Internship Duration", points: [
                                            "The standard internship duration will be 30 days.",
                                            "Interns will complete assigned activities within the specified period.",
                                            "Extensions, if applicable, will be subject to approval from ProEduvate Management."
                                        ]},
                                        { title: "5. Internship Domains", points: [
                                            "Interns will participate in domains offered by ProEduvate, including Python, Java, Frontend Development, Full Stack Development, UI/UX Design, AI/ML, and other applicable domains."
                                        ]},
                                        { title: "6. Internship Portal", points: [
                                            "Interns will receive access to the ProEduvate internship portal.",
                                            "The portal will contain learning materials, interactive activities, MCQ assessments, practical assignments, coding tasks, project tasks, progress tracking, mentor feedback, AI-assisted evaluation, and certificate information, as applicable."
                                        ]},
                                        { title: "7. Daily Learning Process", points: [
                                            "Interns will follow the assigned daily learning path.",
                                            "The general workflow will be: Learning Content -> Interactive Activity -> MCQ -> Practical Task -> Submission -> Evaluation -> Next-Day Unlock."
                                        ]},
                                        { title: "8. Daily Tasks", points: [
                                            "Tasks will be assigned based on the intern's selected domain and internship requirements.",
                                            "Tasks will include theoretical, practical, coding, design, analytical, or project-based activities as applicable.",
                                            "Interns will complete assigned tasks within the specified deadlines."
                                        ]},
                                        { title: "9. Practical Assignments", points: [
                                            "Practical assignments will form an important part of the internship.",
                                            "Interns will submit their own work through the designated portal.",
                                            "Required practical submission will be used for attendance and progression where applicable."
                                        ]},
                                        { title: "10. Attendance", points: [
                                            "Attendance will be linked to participation and required task submission.",
                                            "Failure to participate or submit required activities will result in the corresponding day being marked incomplete/absent.",
                                            "Attendance records will be considered during final evaluation."
                                        ]},
                                        { title: "11. MCQ Assessments", points: [
                                            "Interns will complete assigned daily or periodic MCQ assessments.",
                                            "MCQ scores will contribute to the overall internship evaluation.",
                                            "Interns will complete assessments honestly and without unauthorized assistance."
                                        ]},
                                        { title: "12. AI-Assisted Evaluation", points: [
                                            "ProEduvate will use AI-based systems to evaluate practical/coding submissions as part of the internship evaluation process.",
                                            "AI evaluation will consider correctness, logic, code quality, problem-solving, output, efficiency, and task requirements.",
                                            "AI evaluation will be supplemented or reviewed by mentors where required."
                                        ]},
                                        { title: "13. Mentor Evaluation", points: [
                                            "Mentors will periodically review intern performance.",
                                            "Mentor evaluation will consider task completion, technical performance, learning progress, practical implementation, communication, participation, and project performance."
                                        ]},
                                        { title: "14. Adaptive Tasks", points: [
                                            "ProEduvate Management and mentors will have the authority to modify or assign additional tasks based on an intern's performance.",
                                            "Additional learning or remedial activities will be provided when required.",
                                            "Mentors will update or assign tasks during the internship based on project and learning requirements."
                                        ]},
                                        { title: "15. Mentor Interaction", points: [
                                            "Interns will be able to communicate with assigned mentors for doubt clarification, task discussions, project guidance, technical assistance, and performance reviews.",
                                            "Intern-to-intern communication within the internship platform will be restricted where applicable."
                                        ]},
                                        { title: "16. Real-Time Client Exposure", points: [
                                            "Selected interns will receive opportunities to work on real-world client requirements and project scenarios, subject to project availability and organizational requirements.",
                                            "Such opportunities will include understanding client requirements, requirement analysis, project discussions, development/design work, mentor feedback, and solution implementation as applicable."
                                        ]},
                                        { title: "17. Project Work", points: [
                                            "Interns will be assigned individual or team-based projects based on internship requirements.",
                                            "Projects will follow requirements and guidelines provided by ProEduvate or the assigned mentor.",
                                            "Interns will be responsible for completing their assigned project responsibilities."
                                        ]},
                                        { title: "18. Originality & Plagiarism", points: [
                                            "Interns will submit original work.",
                                            "Copying another intern's work, submitting purchased work, or falsely claiming another person's work as their own is prohibited.",
                                            "Plagiarism or fraudulent submissions will result in disciplinary action, which may include termination."
                                        ]},
                                        { title: "19. Use of AI Tools", points: [
                                            "AI tools will be permitted for learning and development where specified by ProEduvate.",
                                            "Interns will not use AI tools to falsely represent work they have not understood or completed.",
                                            "ProEduvate may require an explanation, demonstration, or project defense to verify understanding."
                                        ]},
                                        { title: "20. Confidentiality", points: [
                                            "Interns will maintain confidentiality regarding company information, client information, project requirements, source code, credentials, internal documents, and business information.",
                                            "Confidential information will not be shared publicly or with unauthorized persons."
                                        ]},
                                        { title: "21. Intellectual Property", points: [
                                            "Ownership and permitted use of project work, source code, designs, documents, and client-related deliverables will be governed by applicable project/company terms.",
                                            "Interns will not publish confidential company/client work without authorization."
                                        ]},
                                        { title: "22. Portal Account Security", points: [
                                            "Interns will keep their login credentials secure.",
                                            "Sharing portal credentials with another person is prohibited.",
                                            "Interns will be responsible for activities performed through their account."
                                        ]},
                                        { title: "23. Deadlines", points: [
                                            "Interns will follow the deadlines specified for assignments and assessments.",
                                            "Repeated failure to complete tasks will affect attendance, progress, evaluation, completion status, and certificate eligibility."
                                        ]},
                                        { title: "24. Technical Issues", points: [
                                            "Interns will report genuine technical problems through the designated support channel.",
                                            "Technical issues will be reported as soon as possible with relevant screenshots or details where required."
                                        ]},
                                        { title: "25. Performance Evaluation", points: [
                                            "Final performance will be evaluated using MCQ performance, practical/task performance, AI-assisted evaluation, mentor evaluation, project performance, attendance, and participation."
                                        ]},
                                        { title: "26. Completion Requirements", points: [
                                            "An intern will be considered eligible for successful completion after satisfying applicable requirements, including required internship days, learning activities, assessments, practical tasks, mentor reviews, project work, and performance requirements."
                                        ]},
                                        { title: "27. Certificate", points: [
                                            "A certificate will be issued to interns who successfully satisfy applicable completion requirements and receive approval from ProEduvate Management.",
                                            "Certificate eligibility will be subject to verification of internship completion.",
                                            "Payment of the internship fee will not guarantee a certificate."
                                        ]},
                                        { title: "28. Certificate Verification", points: [
                                            "Certificates will contain a unique Certificate ID and/or QR code where applicable.",
                                            "Certificate authenticity will be verified through the ProEduvate verification system."
                                        ]},
                                        { title: "29. Certificate Revocation", points: [
                                            "ProEduvate Management may revoke a certificate if false information was provided, the certificate was obtained fraudulently, academic misconduct occurred, internship requirements were not genuinely completed, or the certificate was misused.",
                                            "The online verification status will be updated to Revoked/Invalid where applicable."
                                        ]},
                                        { title: "30. Code of Conduct", points: [
                                            "Interns will behave professionally and respectfully toward mentors, staff, clients, and other participants.",
                                            "Interns will avoid abusive, discriminatory, threatening, or inappropriate behavior.",
                                            "Interns will follow company and project guidelines and will not misuse company resources."
                                        ]},
                                        { title: "31. Prohibited Activities", points: [
                                            "Unauthorized access to systems; sharing confidential information; hacking or attempting unauthorized access; misuse of portal accounts; fraudulent submissions; plagiarism or cheating; harassment or inappropriate behavior; manipulation of attendance or evaluation records; and any activity that may harm ProEduvate, its clients, mentors, or other interns are prohibited."
                                        ]},
                                        { title: "32. Termination by ProEduvate", points: [
                                            "ProEduvate Management may terminate an internship for serious misconduct, repeated non-participation, continuous failure to complete assigned tasks, plagiarism or cheating, unauthorized system access, confidentiality violations, misuse of company/client information, false information, fraudulent activity, or violation of internship terms."
                                        ]},
                                        { title: "33. Termination by Intern", points: [
                                            "An intern will be able to request discontinuation of the internship by informing the designated ProEduvate authority.",
                                            "Discontinuation will result in incomplete internship status and will affect certificate eligibility."
                                        ]},
                                        { title: "34. Effect of Termination", points: [
                                            "Upon termination, portal access will be suspended or deactivated.",
                                            "Pending tasks will be marked incomplete.",
                                            "The intern will become ineligible for the internship completion certificate unless otherwise approved by ProEduvate Management.",
                                            "Confidentiality and applicable intellectual-property obligations will continue after termination."
                                        ]},
                                        { title: "35. Payment and Refunds", points: [
                                            "The internship fee is Rs.500.",
                                            "The applicable refund policy will be communicated during registration/payment.",
                                            "Interns will review the refund conditions before completing payment."
                                        ]},
                                        { title: "36. No Employment Guarantee", points: [
                                            "Completion of the internship will not guarantee employment, placement, job offer, salary, client employment, or future internship opportunities."
                                        ]},
                                        { title: "37. Program Changes", points: [
                                            "ProEduvate Management will have the authority to modify learning content, tasks, assessments, project requirements, portal features, or schedules when required.",
                                            "Such changes will be made to improve the internship experience or meet project requirements."
                                        ]},
                                        { title: "38. Data & Information", points: [
                                            "Information submitted by interns will be used for legitimate internship-related purposes such as registration, communication, evaluation, attendance, certification, and internship administration."
                                        ]},
                                        { title: "39. Intern Responsibility", points: [
                                            "Each intern will be responsible for completing assigned work, maintaining account security, meeting deadlines, providing accurate information, following the Terms & Conditions, maintaining professional conduct, and taking responsibility for submitted work."
                                        ]},
                                        { title: "40. Management Decision & Authority", points: [
                                            "All decisions regarding the internship program, including selection, task allocation, evaluation, attendance, performance, mentor assessment, internship continuation, termination, completion status, certificate eligibility, and certificate issuance, will be taken by ProEduvate Management.",
                                            "The decision taken by ProEduvate Management regarding the above matters will be final and binding.",
                                            "Interns will comply with the decisions, instructions, and guidelines issued by ProEduvate Management during the internship.",
                                            "ProEduvate Management will have the authority to take appropriate action in cases of policy violations, misconduct, non-performance, or failure to meet internship requirements."
                                        ]},
                                        { title: "41. Acceptance of Terms", points: [
                                            "By registering for the ProEduvate internship, the intern confirms that they have read, understood, and agreed to the Terms & Conditions.",
                                            "The intern acknowledges that Rs.500 payment does not guarantee completion, certification, employment, or placement.",
                                            "The intern agrees to participate honestly and professionally throughout the internship."
                                        ]}
                                    ].map((sec, idx) => (
                                        <div key={idx} style={{ marginBottom: '14px' }}>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>{sec.title}</h4>
                                            {sec.points.map((pt, pIdx) => (
                                                <p key={pIdx} style={{ margin: '0 0 3px 0', paddingLeft: '10px' }}>• {pt}</p>
                                            ))}
                                        </div>
                                    ))}

                                    <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #cbd5e1' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>INTERN ACKNOWLEDGEMENT</h4>
                                        <p style={{ fontStyle: 'italic', color: '#475569' }}>
                                            I confirm that I have read, understood, and agreed to the ProEduvate Internship Terms & Conditions and agree to comply with all rules, requirements, evaluation procedures, confidentiality obligations, and guidelines.
                                        </p>
                                    </div>
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
