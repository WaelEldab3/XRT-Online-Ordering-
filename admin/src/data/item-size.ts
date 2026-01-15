import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { itemSizeClient, ItemSize, CreateItemSizeInput, UpdateItemSizeInput } from './client/item-size';

export const useItemSizesQuery = (itemId: string, businessId?: string, options?: { enabled?: boolean }) => {
  const { data, error, isPending: isLoading } = useQuery<ItemSize[]>({
    queryKey: ['item-sizes', itemId, businessId],
    queryFn: () => itemSizeClient.getAll(itemId, businessId),
    enabled: options?.enabled !== false && !!itemId,
  });
  const sizes = (data as any)?.data || data || [];
  return {
    sizes: Array.isArray(sizes) ? sizes : [],
    error,
    isLoading,
  };
};

export const useItemSizeQuery = (itemId: string, id: string) => {
  const { data, error, isPending: isLoading } = useQuery<ItemSize>({
    queryKey: ['item-size', itemId, id],
    queryFn: async () => {
      const response = await itemSizeClient.get(itemId, id);
      return (response as any)?.data || response;
    },
    enabled: !!itemId && !!id,
  });
  const size = data;
  return {
    size,
    error,
    isLoading,
  };
};

export const useCreateItemSizeMutation = (itemId: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (input: CreateItemSizeInput) => itemSizeClient.create(itemId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-sizes', itemId] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useUpdateItemSizeMutation = (itemId: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateItemSizeInput) =>
      itemSizeClient.update(itemId, id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-sizes', itemId] });
      queryClient.invalidateQueries({ queryKey: ['item-size', itemId, variables.id] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
  });
};

export const useDeleteItemSizeMutation = (itemId: string) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => itemSizeClient.delete(itemId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-sizes', itemId] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:delete-failed'));
    },
  });
};
