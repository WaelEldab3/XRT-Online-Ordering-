import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Attribute, AttributeQueryOptions, GetParams } from '@/types';
import { attributeClient } from '@/data/client/attribute';
import { Config } from '@/config';
import { STORE_OWNER, SUPER_ADMIN } from '@/utils/constants';
import { getAuthCredentials } from '@/utils/auth-utils';

export const useCreateAttributeMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: attributeClient.create,
    onSuccess: () => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.attribute.list}`
        : Routes.attribute.list;
      Router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ATTRIBUTES] });
    },
  });
};

export const useUpdateAttributeMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attributeClient.update,
    onSuccess: (data, variables) => {
      toast.success(t('common:successfully-updated'));
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.attribute.list}`
        : Routes.attribute.list;
      Router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ATTRIBUTES] });
    },
  });
};

export const useDeleteAttributeMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: attributeClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ATTRIBUTES] });
    },
  });
};

export const useAttributeQuery = ({ slug, language }: GetParams) => {
  return useQuery<Attribute, Error>({
    queryKey: [API_ENDPOINTS.ATTRIBUTES, { slug, language }],
    queryFn: () => attributeClient.get({ slug, language }),
  });
};

export const useAttributesQuery = (
  params: Partial<AttributeQueryOptions>,
  options: any = {}
) => {
  const { data, error, isPending: isLoading } = useQuery<Attribute[], Error>({
    queryKey: [API_ENDPOINTS.ATTRIBUTES, params],
    queryFn: ({ queryKey }) =>
      attributeClient.all(Object.assign({}, queryKey[1])),
    placeholderData: (previousData) => previousData,
    ...options,
  });

  return {
    attributes: data ?? [],
    error,
    loading: isLoading,
  };
};
