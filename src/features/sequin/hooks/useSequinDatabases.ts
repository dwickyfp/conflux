import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databasesApi, SequinDatabaseCreate, SequinDatabaseUpdate } from '../api/databases';

export const useSequinDatabases = () => {
    return useQuery({
        queryKey: ['sequin-databases'],
        queryFn: databasesApi.list,
    });
};

export const useSequinDatabase = (id: string) => {
    return useQuery({
        queryKey: ['sequin-databases', id],
        queryFn: () => databasesApi.get(id),
        enabled: !!id,
    });
};

export const useCreateSequinDatabase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: SequinDatabaseCreate) => databasesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequin-databases'] });
        },
    });
};

export const useUpdateSequinDatabase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: SequinDatabaseUpdate }) => databasesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequin-databases'] });
        },
    });
};

export const useDeleteSequinDatabase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => databasesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sequin-databases'] });
        },
    });
};

export const useTestConnection = () => {
    return useMutation({
        mutationFn: (data?: SequinDatabaseCreate) => databasesApi.testConnection(data),
    });
};

export const useRefreshTables = () => {
    return useMutation({
        mutationFn: (id: string) => databasesApi.refreshTables(id),
    });
};
