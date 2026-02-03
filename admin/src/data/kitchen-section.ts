import { useQuery } from '@tanstack/react-query';
import { kitchenSectionClient } from './client/kitchen-section';
import { KitchenSection } from '@/types';
import { API_ENDPOINTS } from './client/api-endpoints';

export const useKitchenSectionsQuery = (options?: any) => {
  return useQuery<KitchenSection[], Error>({
    queryKey: [API_ENDPOINTS.KITCHEN_SECTIONS, options],
    queryFn: kitchenSectionClient.fetchKitchenSections,
    ...options,
  });
};
