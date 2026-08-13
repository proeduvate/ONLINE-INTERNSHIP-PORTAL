import React, { useState, useEffect } from 'react';
import { mockOnboardingService } from '../../../services/mockOnboardingService';
import '../../onboarding/Onboarding.css';

export default function AdminOnboardingList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            setLoading(true);
            try {
                const data = await mockOnboardingService.adminGetApplications();
                setApplications(data);
            } catch (error) {
                console.error("Error fetching applications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    if (loading) {
        return (
            <div className="onboarding-page-wrapper">
                <div className="onboarding-container" style={{ maxWidth: '900px', textAlign: 'center', padding: '60px' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Loading applications...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-page-wrapper">
            <div className="onboarding-container" style={{ maxWidth: '1000px' }}>
                <h2>Onboarding Applications</h2>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input type="text" className="form-control" placeholder="Search applications by name or ID..." style={{ maxWidth: '400px' }} />
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Intern Name</th>
                                <th>Domain</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.applicationId}>
                                    <td>{app.applicationId}</td>
                                    <td><strong style={{ color: 'var(--text-color)' }}>{app.name}</strong></td>
                                    <td>{app.domain}</td>
                                    <td>
                                        <span className={
                                            `badge ${app.status.includes('PENDING') ? 'badge-warning' : (app.status.includes('VERIFIED') || app.status.includes('PASSED') || app.status.includes('COMPLETED') ? 'badge-success' : 'badge-danger')}`
                                        }>
                                            {app.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => window.location.href = `/admin/onboarding/${app.applicationId}`}>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
