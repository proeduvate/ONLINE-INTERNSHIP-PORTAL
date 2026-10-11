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

export const mockOnboardingService = {
    async submitApplication(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const appId = "APP-2026-" + Math.floor(10000 + Math.random() * 90000);
                const newApp = { ...data, applicationId: appId, status: ONBOARDING_STATUSES.PENDING_REVIEW };
                mockApplicationData = newApp;
                currentApplicationStatus = ONBOARDING_STATUSES.PENDING_REVIEW;
                try {
                    const saved = localStorage.getItem("app_onboarding_applications");
                    const list = saved ? JSON.parse(saved) : [];
                    localStorage.setItem("app_onboarding_applications", JSON.stringify([newApp, ...list]));
                } catch (e) {
                    console.error(e);
                }
                resolve({
                    applicationId: appId,
                    status: currentApplicationStatus
                });
            }, 1000);
        });
    },

    async getApplicationStatus() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const appId = mockApplicationData?.applicationId || localStorage.getItem("last_application_id") || "APP-2026-00125";
                resolve({
                    applicationId: appId,
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
                try {
                    const saved = localStorage.getItem("app_onboarding_applications");
                    resolve(saved ? JSON.parse(saved) : []);
                } catch {
                    resolve([]);
                }
            }, 500);
        });
    },

    async adminGetApplication(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const saved = localStorage.getItem("app_onboarding_applications");
                    const apps = saved ? JSON.parse(saved) : [];
                    const found = apps.find(a => a.applicationId === id);
                    resolve(found || null);
                } catch {
                    resolve(null);
                }
            }, 300);
        });
    },

    async adminUpdateStatus(id, newStatus) {
        return new Promise((resolve) => {
            setTimeout(() => {
                currentApplicationStatus = newStatus;
                try {
                    const saved = localStorage.getItem("app_onboarding_applications");
                    const apps = saved ? JSON.parse(saved) : [];
                    const updated = apps.map(a => a.applicationId === id ? { ...a, status: newStatus } : a);
                    localStorage.setItem("app_onboarding_applications", JSON.stringify(updated));
                } catch (e) {
                    console.error(e);
                }
                resolve({ success: true, status: newStatus });
            }, 500);
        });
    }
};
