import React, { useState } from 'react';
import api from '../../api/axios';
import './Onboarding.css';

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
        semester: '',
        currentCgpa: '',
        arrearCount: '',
        domain: '',
        duration: '',
        githubId: '',
        linkedin: '',
        resume: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState(null);

    const validateStep = () => {
        if (step === 1) {
            if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) return false;
        } else if (step === 2) {
            if (!formData.college.trim() || !formData.department.trim() || !formData.currentYear || !formData.semester || !formData.currentCgpa.trim() || !formData.arrearCount.trim()) return false;
        } else if (step === 3) {
            if (!formData.domain) return false;
        } else if (step === 4) {
            if (!formData.resume || !formData.githubId.trim()) return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
        } else {
            alert("Please fill in all required fields before proceeding.");
        }
    };
    
    const handleBack = () => setStep(prev => prev - 1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'currentYear') {
                newData.semester = '';
            }
            return newData;
        });
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formPayload = new FormData();
            formPayload.append("name", formData.name);
            formPayload.append("email", formData.email);
            formPayload.append("phone", formData.phone);
            formPayload.append("college", formData.college);
            formPayload.append("department", formData.department);
            formPayload.append("degree", formData.degree || "Bachelors"); 
            formPayload.append("graduation_year", parseInt(formData.currentYear) + 2024); // roughly
            formPayload.append("domain", formData.domain);
            if (formData.resume) {
                formPayload.append("resume", formData.resume);
            }

            const response = await fetch("http://127.0.0.1:8000/api/v1/onboarding/apply", {
                method: "POST",
                body: formPayload,
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to submit application");
            }
            
            const data = await response.json();
            setApplicationId(data.application_id);
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting application", error);
            alert("Error submitting application: " + (error.response?.data?.detail || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container success-state">
                    <h2>✓ Application Submitted</h2>
                    <p>Your internship application has been sent for review.</p>
                    <div className="status-box">
                        <p><strong>Application ID:</strong> {applicationId}</p>
                        <p><strong>Current Status:</strong> Under Review</p>
                    </div>
                    <p>You will receive further instructions once your application has been reviewed.</p>
                    <button className="btn btn-primary" onClick={() => window.location.href = '/onboarding/status'} style={{ marginTop: '20px' }}>
                        View Application Status
                    </button>
                </div>
            </div>
        );
    }

    const steps = ["Personal", "Academic", "Internship", "Resume", "Review"];

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src="/logo.png" alt="Proeduvate Logo" style={{ height: "32px", width: "auto" }} />
                        <div>
                            <h2 style={{ margin: 0 }}>Internship Application</h2>
                            <p className="subtitle" style={{ margin: "4px 0 0 0" }}>Apply for our internship program</p>
                        </div>
                    </div>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => window.location.href = '/onboarding/status'}
                        style={{ fontSize: "13px", padding: "8px 16px" }}
                    >
                        Track Application
                    </button>
                </div>
                <div className="stepper">
                    {steps.map((label, index) => {
                        const stepNumber = index + 1;
                        let stepClass = "stepper-step";
                        if (step > stepNumber) stepClass += " completed";
                        else if (step === stepNumber) stepClass += " active";
                        return (
                            <div key={label} className={stepClass}>
                                <div className="stepper-circle">{step > stepNumber ? "✓" : stepNumber}</div>
                                <div className="stepper-label">{label}</div>
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    {step === 1 && (
                        <div className="form-step">
                            <h3>Personal Details</h3>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input required className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input required className="form-control" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input required className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" />
                            </div>
                            <div className="flex justify-between" style={{ marginTop: '30px' }}>
                                <div></div>
                                <button type="button" className="btn btn-primary" onClick={handleNext}>Next &rarr;</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-step">
                            <h3>Academic Details</h3>
                            <div className="form-group">
                                <label>College / Institution *</label>
                                <input required className="form-control" name="college" value={formData.college} onChange={handleChange} placeholder="Enter college name" />
                            </div>
                            <div className="form-group">
                                <label>Department *</label>
                                <input required className="form-control" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" />
                            </div>
                            <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Current Year *</label>
                                    <select required className="form-control" name="currentYear" value={formData.currentYear} onChange={handleChange}>
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Semester *</label>
                                    <select required className="form-control" name="semester" value={formData.semester} onChange={handleChange} disabled={!formData.currentYear}>
                                        <option value="">Select Semester</option>
                                        {formData.currentYear === '1' && (
                                            <>
                                                <option value="1">1st Semester</option>
                                                <option value="2">2nd Semester</option>
                                            </>
                                        )}
                                        {formData.currentYear === '2' && (
                                            <>
                                                <option value="3">3rd Semester</option>
                                                <option value="4">4th Semester</option>
                                            </>
                                        )}
                                        {formData.currentYear === '3' && (
                                            <>
                                                <option value="5">5th Semester</option>
                                                <option value="6">6th Semester</option>
                                            </>
                                        )}
                                        {formData.currentYear === '4' && (
                                            <>
                                                <option value="7">7th Semester</option>
                                                <option value="8">8th Semester</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Current CGPA *</label>
                                    <input required className="form-control" name="currentCgpa" value={formData.currentCgpa} onChange={handleChange} placeholder="e.g. 8.5" type="number" step="0.01" min="0" max="10" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Arrear Count *</label>
                                    <input required className="form-control" name="arrearCount" value={formData.arrearCount} onChange={handleChange} placeholder="0 if none" type="number" min="0" />
                                </div>
                            </div>
                            <div className="flex justify-between" style={{ marginTop: '30px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleBack}>&larr; Back</button>
                                <button type="button" className="btn btn-primary" onClick={handleNext}>Next &rarr;</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="form-step">
                            <h3>Internship Details</h3>
                            <div className="form-group">
                                <label>Internship Domain *</label>
                                <select required className="form-control" name="domain" value={formData.domain} onChange={handleChange}>
                                    <option value="">Select Domain ▼</option>
                                    <option value="Full Stack Development">Full Stack Development</option>
                                    <option value="AI / ML">AI / ML</option>
                                    <option value="Data Science">Data Science</option>
                                </select>
                            </div>
                            <div className="flex justify-between" style={{ marginTop: '30px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleBack}>&larr; Back</button>
                                <button type="button" className="btn btn-primary" onClick={handleNext}>Next &rarr;</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="form-step">
                            <h3>Links & Resume</h3>
                            <div className="form-group">
                                <label>GitHub ID *</label>
                                <input required className="form-control" name="githubId" value={formData.githubId} onChange={handleChange} placeholder="e.g. username" />
                            </div>
                            <div className="form-group">
                                <label>LinkedIn Profile (Optional)</label>
                                <input className="form-control" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                            </div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-color)' }}>Resume Upload *</label>
                            <div className="upload-box" onClick={() => document.getElementById('resumeUpload').click()}>
                                <p style={{ fontWeight: 600, color: 'var(--text-color)' }}>Click or Drag & Drop your file here</p>
                                <input id="resumeUpload" type="file" required onChange={handleFileChange} accept=".pdf,.doc,.docx" style={{ display: 'none' }} />
                                <p className="hint">PDF format is recommended</p>
                                {formData.resume && <p className="success-text">✓ {formData.resume.name}</p>}
                            </div>
                            <div className="flex justify-between" style={{ marginTop: '30px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleBack}>&larr; Back</button>
                                <button type="button" className="btn btn-primary" onClick={handleNext}>Next &rarr;</button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="form-step review-step">
                            <h3>Review Your Application</h3>
                            
                            <div className="review-section">
                                <h4>Personal Information</h4>
                                <p>{formData.name}</p>
                                <p>{formData.email}</p>
                                <button type="button" onClick={() => setStep(1)} className="edit-link">Edit</button>
                            </div>
                            
                            <div className="review-section">
                                <h4>Academic Information</h4>
                                <p>{formData.college}</p>
                                <p>Year: {formData.currentYear}, Semester: {formData.semester}</p>
                                <p>CGPA: {formData.currentCgpa}, Arrears: {formData.arrearCount}</p>
                                <button type="button" onClick={() => setStep(2)} className="edit-link">Edit</button>
                            </div>
                            
                            <div className="review-section">
                                <h4>Links & Resume</h4>
                                <p>GitHub: {formData.githubId}</p>
                                {formData.linkedin && <p>LinkedIn: {formData.linkedin}</p>}
                                <p>Resume: {formData.resume ? formData.resume.name : 'None'}</p>
                                <button type="button" onClick={() => setStep(4)} className="edit-link">Edit</button>
                            </div>

                            <label className="confirm-checkbox">
                                <input type="checkbox" required /> 
                                I confirm that all information provided is accurate and true.
                            </label>

                            <div className="flex justify-between" style={{ marginTop: '40px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleBack}>&larr; Back</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
