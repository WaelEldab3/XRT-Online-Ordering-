import {
  Modifier,
  ModifierPaginator,
  ModifierQueryOptions,
  CreateModifierInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const modifierClient = {
  ...crudFactory<Modifier, QueryOptions, CreateModifierInput>(
    API_ENDPOINTS.MODIFIERS
  ),
  paginated: async ({ modifier_group_id, ...params }: Partial<ModifierQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.MODIFIERS, {
      ...params,
      modifier_group_id,
    });
    // Handle backend response format: { success: true, data: [...] }
    const modifiers = response?.data || response || [];
    return {
      data: Array.isArray(modifiers) ? modifiers : [],
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
      to: Array.isArray(modifiers) ? modifiers.length : 0,
      total: Array.isArray(modifiers) ? modifiers.length : 0,
    };
  },
  get: async ({ id, language }: any) => {
    const response = await HttpClient.get<any>(
      `${API_ENDPOINTS.MODIFIERS}/${id}`
    );
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },
  create: async (input: CreateModifierInput) => {
    const response = await HttpClient.post<any>(API_ENDPOINTS.MODIFIERS, input);
    return response?.data || response;
  },
  update: async ({ id, ...input }: any) => {
    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.MODIFIERS}/${id}`,
      input
    );
    return response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(`${API_ENDPOINTS.MODIFIERS}/${id}`);
    return response?.data || response;
  },
};

