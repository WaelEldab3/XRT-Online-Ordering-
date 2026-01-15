import {
  ModifierGroup,
  ModifierGroupPaginator,
  ModifierGroupQueryOptions,
  CreateModifierGroupInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const modifierGroupClient = {
  ...crudFactory<ModifierGroup, QueryOptions, CreateModifierGroupInput>(
    API_ENDPOINTS.MODIFIER_GROUPS
  ),
  paginated: async ({ business_id, ...params }: Partial<ModifierGroupQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.MODIFIER_GROUPS, {
      ...params,
      business_id,
    });
    const groups = response?.data || response || [];
    return {
      data: Array.isArray(groups) ? groups : [],
      current_page: 1,
      first_page_url: '',
      from: 1,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: 10,
      prev_page_url: null,
      to: Array.isArray(groups) ? groups.length : 0,
      total: Array.isArray(groups) ? groups.length : 0,
    };
  },
  get: async ({ id, language }: any) => {
    const response = await HttpClient.get<any>(
      `${API_ENDPOINTS.MODIFIER_GROUPS}/${id}`
    );
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },
  create: async (input: CreateModifierGroupInput) => {
    const response = await HttpClient.post<any>(API_ENDPOINTS.MODIFIER_GROUPS, input);
    return response?.data || response;
  },
  update: async ({ id, ...input }: any) => {
    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.MODIFIER_GROUPS}/${id}`,
      input
    );
    return response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(`${API_ENDPOINTS.MODIFIER_GROUPS}/${id}`);
    return response?.data || response;
  },
};

