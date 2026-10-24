import api from '../api/axios';

export const ONBOARDING_STATUSES = {
    PENDING_REVIEW: "PENDING_REVIEW",
    INTERVIEW_REQUIRED: "INTERVIEW_REQUIRED",
    INTERVIEW_SCHEDULED: "INTERVIEW_SCHEDULED",
    INTERVIEW_PASSED: "INTERVIEW_PASSED",
    INTERVIEW_FAILED: "INTERVIEW_FAILED",
    INTERVIEW_NOT_REQUIRED: "INTERVIEW_NOT_REQUIRED",
    ELIGIBLE_FOR_PAYMENT: "ELIGIBLE_FOR_PAYMENT",
    PAYMENT_PENDING: "PAYMENT_PENDING",
    PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
    PAYMENT_VERIFIED: "PAYMENT_VERIFIED",
    PAYMENT_REJECTED: "PAYMENT_REJECTED",
    DOCUMENTS_PENDING: "DOCUMENTS_PENDING",
    MENTOR_ASSIGNMENT_PENDING: "MENTOR_ASSIGNMENT_PENDING",
    MENTOR_ASSIGNED: "MENTOR_ASSIGNED",
    DOCUMENTS_GENERATED: "DOCUMENTS_GENERATED",
    DOCUMENTS_SENT: "DOCUMENTS_SENT",
    DOCUMENTS_UPLOADED: "DOCUMENTS_UPLOADED",
    ACCOUNT_CREATION_PENDING: "ACCOUNT_CREATION_PENDING",
    ACCOUNT_ACTIVATION_PENDING: "ACCOUNT_ACTIVATION_PENDING",
    ACCOUNT_CREATED: "ACCOUNT_CREATED",
    ACTIVE: "ACTIVE",
    ONBOARDING_COMPLETED: "ONBOARDING_COMPLETED",
    APPLICATION_REJECTED: "APPLICATION_REJECTED",
};

export const mockOnboardingService = {
    async submitApplication(data) {
        const res = await api.post('/api/v1/onboarding/apply', data);
        return res.data;
    },

    async getApplicationStatus(id) {
        const res = await api.get(`/api/v1/onboarding/status/${id}`);
        return res.data;
    },

    async adminGetApplications() {
        try {
            const res = await api.get('/api/v1/onboarding/applications');
            if (Array.isArray(res.data)) {
                return res.data.map(app => ({
                    ...app,
                    applicationId: app.applicationId || (app.id ? `APP-${app.id}` : 'APP-UNKNOWN'),
                    id: app.id || app.applicationId,
                    name: app.name || "Applicant",
                    domain: app.domain || "General",
                    status: app.status || "PENDING_REVIEW"
                }));
            }
        } catch (err) {
            console.error("Backend onboarding applications fetch error:", err);
        }
        try {
            const res2 = await api.get('/api/v1/applications');
            if (Array.isArray(res2.data)) {
                return res2.data.map(app => ({
                    ...app,
                    applicationId: app.applicationId || (app.id ? `APP-${app.id}` : 'APP-UNKNOWN'),
                    id: app.id || app.applicationId,
                    name: app.name || "Applicant",
                    domain: app.domain || "General",
                    status: app.status || "PENDING_REVIEW"
                }));
            }
        } catch (e) {
            // ignore fallback error
        }
        return [];
    },

    async adminGetApplication(id) {
        try {
            const res = await api.get(`/api/v1/onboarding/applications/${id}`);
            return res.data;
        } catch (err) {
            const res2 = await api.get(`/api/v1/onboarding/status/${id}`);
            return res2.data;
        }
    },

    async adminUpdateStatus(id, newStatus) {
        const res = await api.post(`/api/v1/onboarding/applications/${id}/status`, { status: newStatus });
        return res.data;
    }
};
