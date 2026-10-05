// mockOnboardingService.js

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
    MENTOR_ASSIGNMENT_PENDING: "MENTOR_ASSIGNMENT_PENDING",
    MENTOR_ASSIGNED: "MENTOR_ASSIGNED",
    DOCUMENTS_GENERATED: "DOCUMENTS_GENERATED",
    DOCUMENTS_SENT: "DOCUMENTS_SENT",
    ACCOUNT_CREATION_PENDING: "ACCOUNT_CREATION_PENDING",
    ACCOUNT_CREATED: "ACCOUNT_CREATED",
    ONBOARDING_COMPLETED: "ONBOARDING_COMPLETED",
    APPLICATION_REJECTED: "APPLICATION_REJECTED",
};

let currentApplicationStatus = ONBOARDING_STATUSES.PENDING_REVIEW;
let mockApplicationData = null;

export const mockOnboardingService = {
    async submitApplication(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockApplicationData = { ...data, applicationId: "APP-2026-00125" };
                currentApplicationStatus = ONBOARDING_STATUSES.PENDING_REVIEW;
                resolve({
                    applicationId: "APP-2026-00125",
                    status: currentApplicationStatus
                });
            }, 1000);
        });
    },

    async getApplicationStatus() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    applicationId: mockApplicationData?.applicationId || "APP-2026-00125",
                    status: currentApplicationStatus
                });
            }, 500);
        });
    },

    // Developer utility to force state changes without backend
    __devSetStatus(newStatus) {
        currentApplicationStatus = newStatus;
    },

    async adminGetApplications() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { applicationId: "APP-2026-00125", name: "Sakthi", email: "intern@example.com", domain: "Full Stack Development", status: ONBOARDING_STATUSES.PENDING_REVIEW },
                    { applicationId: "APP-2026-00126", name: "John Doe", email: "john@example.com", domain: "Data Science", status: ONBOARDING_STATUSES.PAYMENT_PENDING },
                    { applicationId: "APP-2026-00127", name: "Jane Smith", email: "jane@example.com", domain: "AI / ML", status: ONBOARDING_STATUSES.INTERVIEW_REQUIRED },
                ]);
            }, 500);
        });
    },

    async adminGetApplication(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ 
                    applicationId: id, 
                    name: "Sakthi", 
                    email: "intern@example.com", 
                    phone: "1234567890",
                    college: "ABC Tech",
                    department: "Computer Science",
                    domain: "Full Stack Development", 
                    status: currentApplicationStatus // tie it to dev status for easy testing
                });
            }, 300);
        });
    },

    async adminUpdateStatus(id, newStatus) {
        return new Promise((resolve) => {
            setTimeout(() => {
                currentApplicationStatus = newStatus;
                resolve({ success: true, status: newStatus });
            }, 500);
        });
    }
};
