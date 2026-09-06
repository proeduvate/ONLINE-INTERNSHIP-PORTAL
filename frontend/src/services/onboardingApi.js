import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const onboardingApi = {
    apply: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/onboarding/apply`, data);
        return response.data;
    },
    getStatus: async () => {
        const response = await axios.get(`${API_BASE_URL}/onboarding/status`);
        return response.data;
    },
    getDomains: async () => {
        const response = await axios.get(`${API_BASE_URL}/onboarding/domains`);
        return response.data;
    }
};
