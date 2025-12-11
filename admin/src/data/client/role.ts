import {
  Role,
  RolePaginator,
  QueryOptionsType,
  CreateRoleInput,
  UpdateRoleInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const roleClient = {
  fetchRoles: ({ ...params }: Partial<QueryOptionsType>) => {
    return HttpClient.get<RolePaginator>(API_ENDPOINTS.ROLES, {
      ...params,
    });
  },
  fetchRole: ({ id }: { id: string }) => {
    return HttpClient.get<Role>(`${API_ENDPOINTS.ROLES}/${id}`);
  },
  create: (variables: CreateRoleInput) => {
    return HttpClient.post<Role>(API_ENDPOINTS.ROLES, variables);
  },
  update: ({ id, input }: { id: string; input: UpdateRoleInput }) => {
    return HttpClient.patch<Role>(`${API_ENDPOINTS.ROLES}/${id}`, input);
  },
  delete: ({ id }: { id: string }) => {
    return HttpClient.delete<boolean>(`${API_ENDPOINTS.ROLES}/${id}`);
  },
  fetchAllPermissions: async () => {
    const response = await HttpClient.get<{ data: { permissions: string[] } }>(
      API_ENDPOINTS.ALL_PERMISSIONS,
    );
    return response.data.permissions;
  },
  assignRoleToUser: ({
    userId,
    roleId,
  }: {
    userId: string;
    roleId: string;
  }) => {
    return HttpClient.patch<any>(
      `${API_ENDPOINTS.ROLES}/users/${userId}/assign`,
      { roleId },
    );
  },
  removeRoleFromUser: ({ userId }: { userId: string }) => {
    return HttpClient.patch<any>(
      `${API_ENDPOINTS.ROLES}/users/${userId}/remove`,
      {},
    );
  },
};
