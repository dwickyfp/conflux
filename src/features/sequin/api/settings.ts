import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1'; // Should be environmental variable in real app

export const settingsApi = {
    getSettings: async () => {
        const response = await axios.get(`${API_URL}/settings/`);
        return response.data;
    },
    updateSettings: async (settings: { sequin_url: string; sequin_token?: string; kafka_url: string }) => {
        const response = await axios.post(`${API_URL}/settings/`, settings);
        return response.data;
    },
    testConnection: async () => {
        const response = await axios.post(`${API_URL}/settings/test-connection`);
        return response.data;
    },
};
