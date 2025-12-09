import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const sequinApi = {
    listDatabases: async () => {
        const response = await axios.get(`${API_URL}/sequin/databases`);
        return response.data;
    },
    listSinks: async () => {
        const response = await axios.get(`${API_URL}/sequin/sinks`);
        return response.data;
    },
    createSink: async (data: any) => {
        const response = await axios.post(`${API_URL}/sequin/sinks`, data);
        return response.data;
    },
    createBackfill: async (sinkId: string, data: any) => {
        const response = await axios.post(`${API_URL}/sequin/sinks/${sinkId}/backfills`, data);
        return response.data;
    }
};
