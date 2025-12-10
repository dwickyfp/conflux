import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export type SequinDatabase = {
    id: string;
    name: string;
    hostname: string;
    port: number;
    database: string;
    username: string;
    password?: string;
    ssl: boolean;
    use_local_tunnel?: boolean;
    ipv6: boolean;
    pool_size?: number;
    queue_interval?: number;
    queue_target?: number;
    replication_slots?: {
        id?: string;
        publication_name: string;
        slot_name: string;
        status: string;
    }[];
};

export type SequinDatabaseCreate = {
    name: string;
    hostname: string;
    port?: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    use_local_tunnel?: boolean;
    ipv6?: boolean;
    replication_slots?: {
        publication_name: string;
        slot_name: string;
    }[];
};

export type SequinDatabaseUpdate = {
    name?: string;
    hostname?: string;
    port?: number;
    database?: string;
    username?: string;
    replication_slots?: {
        id?: string;
        publication_name?: string;
        slot_name?: string;
        status?: string;
    }[];
};

export const databasesApi = {
    list: async (): Promise<{ data: SequinDatabase[] }> => {
        const response = await axios.get(`${API_URL}/sequin/databases/`);
        return response.data;
    },
    get: async (id: string): Promise<SequinDatabase> => {
        const response = await axios.get(`${API_URL}/sequin/databases/${id}`);
        // Backend returns { data: ... } or just obj? 
        // My implementation: `return {"data": data}`.
        // So response.data is { data: { ... } }
        return response.data.data;
    },
    create: async (data: SequinDatabaseCreate): Promise<SequinDatabase> => {
        const response = await axios.post(`${API_URL}/sequin/databases/`, data);
        return response.data;
    },
    update: async (id: string, data: SequinDatabaseUpdate): Promise<SequinDatabase> => {
        const response = await axios.put(`${API_URL}/sequin/databases/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/sequin/databases/${id}`);
    },
    testConnection: async (data?: SequinDatabaseCreate): Promise<{ success: boolean }> => {
        const response = await axios.post(`${API_URL}/sequin/databases/test-connection`, data);
        return response.data;
    },
    refreshTables: async (id: string): Promise<{ success: boolean }> => {
        const response = await axios.post(`${API_URL}/sequin/databases/${id}/refresh-tables`);
        return response.data;
    }
};
