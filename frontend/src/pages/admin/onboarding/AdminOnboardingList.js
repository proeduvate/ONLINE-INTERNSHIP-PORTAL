import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, Eye, RefreshCw } from 'lucide-react';

export default function AdminOnboardingList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const fetchApps = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/v1/onboarding/applications");
            setApplications(response.data);
        } catch (error) {
            console.error("Error fetching applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const filteredApps = applications.filter(app => {
        const query = searchQuery.toLowerCase();
        return (
            (app.name && app.name.toLowerCase().includes(query)) ||
            (app.domain && app.domain.toLowerCase().includes(query)) ||
            (app.status && app.status.toLowerCase().includes(query)) ||
            (String(app.id).includes(query)) ||
            (app.applicationId && app.applicationId.toLowerCase().includes(query))
        );
    });

    const getStatusBadge = (status) => {
        const s = status || '';
        let badgeClass = 'badge-primary';
        let bg = '#eff6ff';
        let color = '#1d4ed8';

        if (s.includes('VERIFIED') || s.includes('PASSED') || s.includes('COMPLETED') || s.includes('ACTIVE')) {
            badgeClass = 'badge-success';
            bg = '#d1fae5';
            color = '#065f46';
        } else if (s.includes('PENDING') || s.includes('SCHEDULED') || s.includes('SUBMITTED')) {
            badgeClass = 'badge-warning';
            bg = '#fef3c7';
            color = '#92400e';
        } else if (s.includes('FAILED') || s.includes('REJECTED')) {
            badgeClass = 'badge-danger';
            bg = '#fee2e2';
            color = '#991b1b';
        }

        return (
            <span className={`badge ${badgeClass}`} style={{ backgroundColor: bg, color: color, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                {s.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="card" style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                        Onboarding Pipeline
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        Manage candidate applications, interview schedules, and document verification.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name, ID, or domain..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '36px', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        onClick={fetchApps}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 14px', borderRadius: '8px' }}
                        title="Refresh applications"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>APP ID</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Intern Name</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Email</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Domain</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>College</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Status</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    Loading onboarding applications...
                                </td>
                            </tr>
                        ) : filteredApps.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No onboarding applications found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredApps.map(app => (
                                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>
                                        {app.applicationId || `#${app.id}`}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                        {app.name}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                                        {app.email || 'N/A'}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                                        {app.domain}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                                        {app.college || 'N/A'}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {getStatusBadge(app.status)}
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                            onClick={() => navigate(`/admin/onboarding/${app.id}`)}
                                        >
                                            <Eye size={14} /> View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
