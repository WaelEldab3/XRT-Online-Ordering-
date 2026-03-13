import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from '@/data/client/http-client';
import { KitchenSection } from '@/types';

export interface CreateKitchenSectionInput {
  name: string;
  is_active?: boolean;
}

export interface UpdateKitchenSectionInput {
  name?: string;
  is_active?: boolean;
}

export const kitchenSectionClient = {
  fetchKitchenSections: async () => {
    const response = await HttpClient.get<{
      success: boolean;
      data: KitchenSection[];
    }>(API_ENDPOINTS.KITCHEN_SECTIONS);
    return response.data;
  },

  fetchKitchenSection: async (id: string) => {
    const response = await HttpClient.get<{
      success: boolean;
      data: KitchenSection;
    }>(`${API_ENDPOINTS.KITCHEN_SECTIONS}/${id}`);
    return response.data;
  },

  create: async (input: CreateKitchenSectionInput) => {
    const response = await HttpClient.post<{
      success: boolean;
      data: KitchenSection;
    }>(API_ENDPOINTS.KITCHEN_SECTIONS, input);
    return response.data;
  },

  update: async ({
    id,
    input,
  }: {
    id: string;
    input: UpdateKitchenSectionInput;
  }) => {
    const response = await HttpClient.put<{
      success: boolean;
      data: KitchenSection;
    }>(`${API_ENDPOINTS.KITCHEN_SECTIONS}/${id}`, input);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await HttpClient.delete<{
      success: boolean;
      data: null;
    }>(`${API_ENDPOINTS.KITCHEN_SECTIONS}/${id}`);
    return response;
  },
};
