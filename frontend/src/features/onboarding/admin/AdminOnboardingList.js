import React, { useState, useEffect } from 'react';
import { mockOnboardingService } from '../../../services/mockOnboardingService';

export default function AdminOnboardingList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const itemsPerPage = 10;

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
            <div className="card" style={{ padding: '40px', textAlign: 'center', margin: 0 }}>
                <h3 style={{ color: 'var(--primary-color)' }}>Loading applications...</h3>
            </div>
        );
    }

    const filteredApps = applications.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
    const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="card" style={{ margin: 0, padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Onboarding Applications</h3>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by name, ID, or domain..." 
                    style={{ maxWidth: '300px', marginBottom: 0 }} 
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to page 1 on search
                    }}
                />
            </div>

            <div className="table-container" style={{ flex: 1, marginTop: 0 }}>
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
                        {paginatedApps.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No applications found.</td>
                            </tr>
                        ) : (
                            paginatedApps.map(app => (
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 4px', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Page <b>{currentPage}</b> of <b>{totalPages}</b>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                        Previous
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
