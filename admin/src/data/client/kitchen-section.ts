import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from '@/data/client/http-client';
import { KitchenSection } from '@/types';

export const kitchenSectionClient = {
  fetchKitchenSections: async () => {
    return await HttpClient.get<KitchenSection[]>(
      API_ENDPOINTS.KITCHEN_SECTIONS,
    );
  },
};
