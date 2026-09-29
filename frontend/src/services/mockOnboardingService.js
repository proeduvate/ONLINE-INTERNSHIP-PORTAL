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

let currentApplicationStatus = ONBOARDING_STATUSES.PENDING_REVIEW;
let mockApplicationData = null;

const fallbackApps = [
    { applicationId: "APP-2026-00125", name: "Sakthi", email: "intern@example.com", domain: "Full Stack Development", status: ONBOARDING_STATUSES.PENDING_REVIEW },
    { applicationId: "APP-2026-00126", name: "John Doe", email: "john@example.com", domain: "Data Science", status: ONBOARDING_STATUSES.PAYMENT_PENDING },
    { applicationId: "APP-2026-00127", name: "Jane Smith", email: "jane@example.com", domain: "AI / ML", status: ONBOARDING_STATUSES.INTERVIEW_REQUIRED },
];

export const mockOnboardingService = {
    async submitApplication(data) {
        mockApplicationData = { ...data, applicationId: "APP-2026-00125" };
        currentApplicationStatus = ONBOARDING_STATUSES.PENDING_REVIEW;
        return {
            applicationId: "APP-2026-00125",
            status: currentApplicationStatus
        };
    },

    async getApplicationStatus() {
        return {
            applicationId: mockApplicationData?.applicationId || "APP-2026-00125",
            status: currentApplicationStatus
        };
    },

    __devSetStatus(newStatus) {
        currentApplicationStatus = newStatus;
    },

    async adminGetApplications() {
        try {
            const res = await api.get('/api/v1/onboarding/applications');
            if (Array.isArray(res.data) && res.data.length > 0) {
                return res.data;
            }
        } catch (err) {
            console.warn("Backend onboarding applications fetch error, using fallback data:", err);
        }
        return fallbackApps;
    },

    async adminGetApplication(id) {
        try {
            const res = await api.get(`/api/v1/onboarding/applications/${id}`);
            return res.data;
        } catch (err) {
            console.warn(`Backend onboarding application detail fetch error for ${id}, using fallback data:`, err);
            const found = fallbackApps.find(a => a.applicationId === id);
            return {
                applicationId: id,
                name: found?.name || "Sakthi",
                email: found?.email || "intern@example.com",
                phone: "1234567890",
                college: "ABC Tech",
                department: "Computer Science",
                domain: found?.domain || "Full Stack Development",
                status: found?.status || currentApplicationStatus
            };
        }
    },

    async adminUpdateStatus(id, newStatus) {
        try {
            await api.post(`/api/v1/onboarding/applications/${id}/status`, { status: newStatus });
            currentApplicationStatus = newStatus;
            return { success: true, status: newStatus };
        } catch (err) {
            console.warn(`Backend onboarding status update error for ${id}, updating local state:`, err);
            currentApplicationStatus = newStatus;
            return { success: true, status: newStatus };
        }
    }
};
