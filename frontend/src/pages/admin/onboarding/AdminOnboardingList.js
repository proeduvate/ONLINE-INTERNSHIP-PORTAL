import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../../onboarding/Onboarding.css';

export default function AdminOnboardingList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            setLoading(true);
            try {
                const response = await api.get("/api/v1/onboarding/applications");
                setApplications(response.data);
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
                            {(applications || []).map(app => {
                                const displayId = app.applicationId || (app.id ? `APP-${app.id}` : 'APP-UNKNOWN');
                                const targetParam = app.applicationId || app.id;
                                const rawStatus = (app.status || 'PENDING_REVIEW').toString();
                                const isPending = rawStatus.includes('PENDING');
                                const isSuccess = rawStatus.includes('VERIFIED') || rawStatus.includes('PASSED') || rawStatus.includes('COMPLETED') || rawStatus.includes('ACTIVE');
                                const badgeClass = `badge ${isPending ? 'badge-warning' : (isSuccess ? 'badge-success' : 'badge-danger')}`;

                                return (
                                    <tr key={displayId}>
                                        <td>{displayId}</td>
                                        <td><strong style={{ color: 'var(--text-color)' }}>{app.name || 'Unnamed Candidate'}</strong></td>
                                        <td>{app.domain || 'General'}</td>
                                        <td>
                                            <span className={badgeClass}>
                                                {rawStatus.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => window.location.href = `/admin/onboarding/${targetParam}`}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
