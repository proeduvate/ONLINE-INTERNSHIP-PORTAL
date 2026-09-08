import React, { useState } from 'react';
import { mockOnboardingService } from '../../services/mockOnboardingService';
import './Onboarding.css';

export default function Apply() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        college: '',
        department: '',
        currentYear: '',
        domain: '',
        resume: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState('');

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await mockOnboardingService.submitApplication(formData);
            setApplicationId(result.applicationId);
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting application", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { num: 1, label: "Personal" },
        { num: 2, label: "Academic" },
        { num: 3, label: "Track" },
        { num: 4, label: "Resume" },
        { num: 5, label: "Review" }
    ];

    if (submitted) {
        return (
            <div className="onboarding-container success-state">
                <div className="success-icon-badge">✓</div>
                <h2>Application Submitted Successfully</h2>
                <p>Your internship application has been submitted and is now under administrative review.</p>
                <div className="status-card">
                    <div className="status-row">
                        <span>Application ID</span>
                        <strong>{applicationId}</strong>
                    </div>
                    <div className="status-row">
                        <span>Status</span>
                        <span className="badge badge-pending">Under Review</span>
                    </div>
                </div>
                <p className="subtext">You will receive notifications once your application status changes.</p>
                <button className="btn-primary" onClick={() => window.location.href = '/onboarding/status'}>
                    View Application Status &rarr;
                </button>
            </div>
        );
    }

    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <h2>Apply for Internship</h2>
                <p>Complete the application form below to start your internship journey with ProEduvate.</p>
            </div>

            <div className="stepper-bar">
                {steps.map((s, idx) => {
                    const isActive = step === s.num;
                    const isCompleted = step > s.num;
                    return (
                        <React.Fragment key={s.num}>
                            <div className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                <div className="step-badge">{isCompleted ? '✓' : s.num}</div>
                                <span className="step-label">{s.label}</span>
                            </div>
                            {idx < steps.length - 1 && <div className={`step-connector ${step > s.num ? 'active' : ''}`} />}
                        </React.Fragment>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="onboarding-form">
                {step === 1 && (
                    <div className="form-step">
                        <div className="step-header">
                            <h3>Step 1 — Personal Information</h3>
                            <span className="step-counter">Step 1 of 5</span>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="name">
                                Full Name <span className="required-star">*</span>
                            </label>
                            <input 
                                id="name"
                                type="text"
                                required 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="e.g. Sakthi Saravanan" 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address <span className="required-star">*</span>
                            </label>
                            <input 
                                id="email"
                                type="email" 
                                required 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="e.g. sakthi@example.com" 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">
                                Phone Number <span className="required-star">*</span>
                            </label>
                            <input 
                                id="phone"
                                type="tel" 
                                required 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="e.g. +91 98765 43210" 
                            />
                        </div>

                        <div className="button-group right">
                            <button type="button" className="btn-primary" onClick={handleNext}>
                                Next Step &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="form-step">
                        <div className="step-header">
                            <h3>Step 2 — Academic Details</h3>
                            <span className="step-counter">Step 2 of 5</span>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="college">
                                College / Institution <span className="required-star">*</span>
                            </label>
                            <input 
                                id="college"
                                type="text"
                                required 
                                name="college" 
                                value={formData.college} 
                                onChange={handleChange} 
                                placeholder="e.g. Anna University" 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="department">
                                Department / Major <span className="required-star">*</span>
                            </label>
                            <input 
                                id="department"
                                type="text"
                                required 
                                name="department" 
                                value={formData.department} 
                                onChange={handleChange} 
                                placeholder="e.g. Computer Science Engineering" 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="currentYear">
                                Current Year of Study <span className="required-star">*</span>
                            </label>
                            <select 
                                id="currentYear"
                                required 
                                name="currentYear" 
                                value={formData.currentYear} 
                                onChange={handleChange}
                            >
                                <option value="">Select Year of Study</option>
                                <option value="1">1st Year (Freshman)</option>
                                <option value="2">2nd Year (Sophomore)</option>
                                <option value="3">3rd Year (Junior)</option>
                                <option value="4">4th Year (Senior)</option>
                            </select>
                        </div>

                        <div className="button-group space-between">
                            <button type="button" className="btn-secondary" onClick={handleBack}>
                                &larr; Back
                            </button>
                            <button type="button" className="btn-primary" onClick={handleNext}>
                                Next Step &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="form-step">
                        <div className="step-header">
                            <h3>Step 3 — Select Internship Domain</h3>
                            <span className="step-counter">Step 3 of 5</span>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="domain">
                                Internship Track <span className="required-star">*</span>
                            </label>
                            <select 
                                id="domain"
                                required 
                                name="domain" 
                                value={formData.domain} 
                                onChange={handleChange}
                            >
                                <option value="">Select Internship Track</option>
                                <option value="Full Stack Development">Full Stack Development</option>
                                <option value="AI / ML">AI / ML Engineering</option>
                                <option value="Data Science">Data Science & Analytics</option>
                            </select>
                        </div>

                        <div className="domain-card-preview">
                            {formData.domain ? (
                                <div className="track-info-box">
                                    <h4>🎯 {formData.domain}</h4>
                                    <p>Comprehensive 3-month hands-on industry internship program with live projects, mentor feedback, and certification.</p>
                                </div>
                            ) : (
                                <p className="hint-text">Select a domain from the dropdown above to view track details.</p>
                            )}
                        </div>

                        <div className="button-group space-between">
                            <button type="button" className="btn-secondary" onClick={handleBack}>
                                &larr; Back
                            </button>
                            <button type="button" className="btn-primary" onClick={handleNext}>
                                Next Step &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="form-step">
                        <div className="step-header">
                            <h3>Step 4 — Resume Upload</h3>
                            <span className="step-counter">Step 4 of 5</span>
                        </div>
                        
                        <div className="upload-dropzone">
                            <div className="upload-icon">📄</div>
                            <h4>Upload your latest Resume / CV</h4>
                            <p className="upload-desc">Drag and drop your document here, or click to browse</p>
                            <input 
                                type="file" 
                                required={!formData.resume} 
                                onChange={handleFileChange} 
                                accept=".pdf,.doc,.docx" 
                                className="file-input-hidden"
                                id="resume-file"
                            />
                            <label htmlFor="resume-file" className="btn-outline-upload">
                                Browse File
                            </label>
                            <span className="hint">Supported Formats: PDF, DOC, DOCX (Max 5MB)</span>
                            {formData.resume && (
                                <div className="file-selected-card">
                                    <span className="file-icon">✓</span>
                                    <div className="file-details">
                                        <strong>{formData.resume.name}</strong>
                                        <span>{(formData.resume.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="button-group space-between">
                            <button type="button" className="btn-secondary" onClick={handleBack}>
                                &larr; Back
                            </button>
                            <button type="button" className="btn-primary" onClick={handleNext}>
                                Review & Submit &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="form-step review-step">
                        <div className="step-header">
                            <h3>Step 5 — Review & Submit</h3>
                            <span className="step-counter">Step 5 of 5</span>
                        </div>
                        
                        <div className="review-cards">
                            <div className="review-card">
                                <div className="review-card-header">
                                    <h4>Personal Details</h4>
                                    <button type="button" onClick={() => setStep(1)} className="btn-link">Edit</button>
                                </div>
                                <div className="review-grid">
                                    <div><span>Name:</span> <strong>{formData.name || '—'}</strong></div>
                                    <div><span>Email:</span> <strong>{formData.email || '—'}</strong></div>
                                    <div><span>Phone:</span> <strong>{formData.phone || '—'}</strong></div>
                                </div>
                            </div>
                            
                            <div className="review-card">
                                <div className="review-card-header">
                                    <h4>Academic Details</h4>
                                    <button type="button" onClick={() => setStep(2)} className="btn-link">Edit</button>
                                </div>
                                <div className="review-grid">
                                    <div><span>College:</span> <strong>{formData.college || '—'}</strong></div>
                                    <div><span>Department:</span> <strong>{formData.department || '—'}</strong></div>
                                    <div><span>Year:</span> <strong>{formData.currentYear ? `${formData.currentYear} Year` : '—'}</strong></div>
                                </div>
                            </div>

                            <div className="review-card">
                                <div className="review-card-header">
                                    <h4>Internship Track & Resume</h4>
                                    <button type="button" onClick={() => setStep(3)} className="btn-link">Edit</button>
                                </div>
                                <div className="review-grid">
                                    <div><span>Selected Track:</span> <strong>{formData.domain || '—'}</strong></div>
                                    <div><span>Resume File:</span> <strong>{formData.resume ? formData.resume.name : 'No file uploaded'}</strong></div>
                                </div>
                            </div>
                        </div>

                        <label className="checkbox-label">
                            <input type="checkbox" required /> 
                            <span>I certify that all information provided in this application is accurate and truthful.</span>
                        </label>

                        <div className="button-group space-between">
                            <button type="button" className="btn-secondary" onClick={handleBack}>
                                &larr; Back
                            </button>
                            <button type="submit" className="btn-primary btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting Application...' : 'Submit Application ✓'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
