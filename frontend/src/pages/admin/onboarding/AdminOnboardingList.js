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
        return <div className="onboarding-container">Loading applications...</div>;
    }

    return (
        <div className="onboarding-container" style={{ maxWidth: '900px' }}>
            <h2>Onboarding Applications</h2>
            <div style={{ marginBottom: '20px' }}>
                <input type="text" placeholder="Search applications..." style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Intern Name</th>
                        <th style={{ padding: '10px' }}>Domain</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map(app => (
                        <tr key={app.applicationId} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{app.applicationId}</td>
                            <td style={{ padding: '10px' }}>{app.name}</td>
                            <td style={{ padding: '10px' }}>{app.domain}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '12px',
                                    backgroundColor: app.status.includes('PENDING') ? '#fff3cd' : (app.status.includes('VERIFIED') || app.status.includes('PASSED') ? '#d4edda' : '#e2e3e5'),
                                    color: app.status.includes('PENDING') ? '#856404' : (app.status.includes('VERIFIED') || app.status.includes('PASSED') ? '#155724' : '#383d41')
                                }}>
                                    {app.status.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <button style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => alert("Details mock page - replace with real route /admin/onboarding/" + app.applicationId)}>View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
