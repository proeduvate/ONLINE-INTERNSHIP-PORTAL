import api from '../api/axios';

export const onboardingApi = {
    apply: async (data) => {
        const response = await api.post('/api/v1/onboarding/apply', data);
        return response.data;
    },
    getStatus: async () => {
        const response = await api.get('/api/v1/onboarding/status');
        return response.data;
    },
    getDomains: async () => {
        const response = await api.get('/api/v1/onboarding/domains');
        return response.data;
    }
};
