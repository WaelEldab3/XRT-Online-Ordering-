import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  kitchenSectionClient,
  CreateKitchenSectionInput,
  UpdateKitchenSectionInput,
} from './client/kitchen-section';
import { API_ENDPOINTS } from './client/api-endpoints';
import { KitchenSection } from '@/types';

export const useKitchenSectionsQuery = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.KITCHEN_SECTIONS],
    queryFn: () => kitchenSectionClient.fetchKitchenSections(),
  });
};

export const useKitchenSectionQuery = (id: string | null) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.KITCHEN_SECTIONS, id],
    queryFn: () => kitchenSectionClient.fetchKitchenSection(id!),
    enabled: !!id,
  });
};

export const useCreateKitchenSectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kitchenSectionClient.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.KITCHEN_SECTIONS],
      });
    },
  });
};

export const useUpdateKitchenSectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kitchenSectionClient.update,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.KITCHEN_SECTIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.KITCHEN_SECTIONS, id],
      });
    },
  });
};

export const useDeleteKitchenSectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kitchenSectionClient.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.KITCHEN_SECTIONS],
      });
    },
  });
};
