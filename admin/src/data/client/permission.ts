import { Permission, QueryOptions } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const permissionClient = {
    // Get all permissions
    all: (params?: Partial<QueryOptions>) => {
        return HttpClient.get<Permission[]>(API_ENDPOINTS.PERMISSIONS, params);
    },

    // Get permissions grouped by module
    grouped: () => {
        return HttpClient.get<{ permissionsByModule: Record<string, Permission[]>; modules: string[] }>(
            `${API_ENDPOINTS.PERMISSIONS}/grouped`
        );
    },

    // Update permission (enable/disable) - Super Admin only
    update: (variables: { id: string; input: Partial<Permission> }) => {
        return HttpClient.patch<Permission>(
            `${API_ENDPOINTS.PERMISSIONS}/${variables.id}`,
            variables.input
        );
    },
};
