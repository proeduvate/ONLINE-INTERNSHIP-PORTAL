import React, { useState } from 'react';
import { mockOnboardingService } from '../../services/mockOnboardingService';
import './Onboarding.css'; // Will create this next

export default function Apply() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        college: '',
        department: '',
        degree: '',
        currentYear: '',
        domain: '',
        duration: '',
        resume: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState(null);

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

    if (submitted) {
        return (
            <div className="onboarding-container success-state">
                <h2>✓ Application Submitted Successfully</h2>
                <p>Your internship application has been submitted for review.</p>
                <div className="status-box">
                    <p><strong>Application ID:</strong> {applicationId}</p>
                    <p><strong>Current Status:</strong> Under Review</p>
                </div>
                <p>You will receive further instructions once your application has been reviewed.</p>
                <button onClick={() => window.location.href = '/onboarding/status'}>View Application Status</button>
            </div>
        );
    }

    return (
        <div className="onboarding-container">
            <div className="stepper">
                <span className={step >= 1 ? 'active' : ''}>1 Personal</span>
                <span> &rarr; </span>
                <span className={step >= 2 ? 'active' : ''}>2 Academic</span>
                <span> &rarr; </span>
                <span className={step >= 3 ? 'active' : ''}>3 Internship</span>
                <span> &rarr; </span>
                <span className={step >= 4 ? 'active' : ''}>4 Resume</span>
                <span> &rarr; </span>
                <span className={step >= 5 ? 'active' : ''}>5 Review</span>
            </div>

            <form onSubmit={handleSubmit} className="onboarding-form">
                {step === 1 && (
                    <div className="form-step">
                        <h3>Step 1 — Personal Details</h3>
                        <label>
                            Full Name *
                            <input required name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
                        </label>
                        <label>
                            Email *
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
                        </label>
                        <label>
                            Phone Number *
                            <input required name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" />
                        </label>
                        <button type="button" onClick={handleNext}>Next</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="form-step">
                        <h3>Step 2 — Academic Details</h3>
                        <label>
                            College / Institution *
                            <input required name="college" value={formData.college} onChange={handleChange} />
                        </label>
                        <label>
                            Department *
                            <input required name="department" value={formData.department} onChange={handleChange} />
                        </label>
                        <label>
                            Current Year *
                            <select required name="currentYear" value={formData.currentYear} onChange={handleChange}>
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </label>
                        <div className="button-group">
                            <button type="button" onClick={handleBack}>Back</button>
                            <button type="button" onClick={handleNext}>Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="form-step">
                        <h3>Step 3 — Internship Details</h3>
                        <label>
                            Internship Domain *
                            <select required name="domain" value={formData.domain} onChange={handleChange}>
                                <option value="">Select Domain ▼</option>
                                <option value="Full Stack Development">Full Stack Development</option>
                                <option value="AI / ML">AI / ML</option>
                                <option value="Data Science">Data Science</option>
                            </select>
                        </label>
                        <div className="button-group">
                            <button type="button" onClick={handleBack}>Back</button>
                            <button type="button" onClick={handleNext}>Next</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="form-step">
                        <h3>Step 4 — Resume Upload</h3>
                        <div className="upload-box">
                            <p>Drag & drop your file here or</p>
                            <input type="file" required onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                            <p className="hint">PDF recommended</p>
                            {formData.resume && <p className="success-text">✓ Resume selected: {formData.resume.name}</p>}
                        </div>
                        <div className="button-group">
                            <button type="button" onClick={handleBack}>Back</button>
                            <button type="button" onClick={handleNext}>Next</button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="form-step review-step">
                        <h3>Step 5 — Review</h3>
                        
                        <div className="review-section">
                            <h4>Personal Information</h4>
                            <p>Name: {formData.name}</p>
                            <p>Email: {formData.email}</p>
                            <button type="button" onClick={() => setStep(1)} className="edit-link">Edit</button>
                        </div>
                        
                        <div className="review-section">
                            <h4>Academic Information</h4>
                            <p>College: {formData.college}</p>
                            <button type="button" onClick={() => setStep(2)} className="edit-link">Edit</button>
                        </div>

                        <label className="confirm-checkbox">
                            <input type="checkbox" required /> I confirm that all information provided is accurate.
                        </label>

                        <div className="button-group">
                            <button type="button" onClick={handleBack}>Back</button>
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
