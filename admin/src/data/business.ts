import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { businessClient, Business, CreateBusinessInput, UpdateBusinessInput } from './client/business';
import { API_ENDPOINTS } from './client/api-endpoints';

export const useBusinessesQuery = () => {
  const { data, error, isPending: isLoading } = useQuery<Business[], Error>({
    queryKey: [API_ENDPOINTS.BUSINESSES],
    queryFn: () => businessClient.getAll(),
  });

  return {
    businesses: Array.isArray(data) ? data : [],
    loading: isLoading,
    error,
  };
};

export const useBusinessQuery = ({ id }: { id: string }) => {
  const { data, error, isPending: isLoading } = useQuery<Business, Error>({
    queryKey: [API_ENDPOINTS.BUSINESSES, id],
    queryFn: () => businessClient.get({ id }),
    enabled: Boolean(id),
  });

  return {
    business: data,
    loading: isLoading,
    error,
  };
};

export const useCreateBusinessMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: businessClient.create,
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.BUSINESSES] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useUpdateBusinessMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateBusinessInput & { id: string }) =>
      businessClient.update({ id, ...input }),
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.BUSINESSES] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
  });
};

export const useDeleteBusinessMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: businessClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.BUSINESSES] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:delete-failed'));
    },
  });
};

