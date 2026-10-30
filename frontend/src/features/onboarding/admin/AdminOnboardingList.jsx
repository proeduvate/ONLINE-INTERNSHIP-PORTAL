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

    const filteredApps = (applications || []).filter(app => {
        if (!app) return false;
        const name = String(app.name || "").toLowerCase();
        const appId = String(app.applicationId || (app.id ? `APP-${app.id}` : "") || "").toLowerCase();
        const domain = String(app.domain || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || appId.includes(query) || domain.includes(query);
    });

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
                            paginatedApps.map(app => {
                                const displayId = app.applicationId || (app.id ? `APP-${app.id}` : 'APP-UNKNOWN');
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
                                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => window.location.href = `/admin/onboarding/${displayId}`}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
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
