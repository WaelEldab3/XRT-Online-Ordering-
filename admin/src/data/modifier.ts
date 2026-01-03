import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  Modifier,
  ModifierPaginator,
  ModifierQueryOptions,
  GetParams,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { modifierClient } from './client/modifier';
import { Config } from '@/config';
import { mockModifiers } from './mock/modifiers';

export const useCreateModifierMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(async (input: any) => {
    // Mock: Just return the input with generated ID
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...input,
      id: `m_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, {
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIERS);
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIER_GROUPS);
    },
    onError: (error: any) => {
      console.error('❌ Create Modifier Error:', error);
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useDeleteModifierMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(async ({ id }: { id: string }) => {
    // Mock: Just simulate deletion
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id };
  }, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIERS);
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIER_GROUPS);
    },
  });
};

export const useUpdateModifierMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(async ({ id, ...input }: any) => {
    // Mock: Just return the updated data
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...input,
      id,
      updated_at: new Date().toISOString(),
    };
  }, {
    onSuccess: async (data, variables) => {
      const updatedModifier = (data as any)?.data || data;
      queryClient.setQueryData(
        [API_ENDPOINTS.MODIFIERS, { id: variables.id, language: router.locale }],
        (old: any) => {
          return { data: updatedModifier };
        }
      );
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIERS);
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIER_GROUPS);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
  });
};

export const useModifierQuery = ({ slug, id, language }: GetParams & { id?: string }) => {
  // Use mock data instead of API call
  const { data, error, isLoading } = useQuery<Modifier, Error>(
    [API_ENDPOINTS.MODIFIERS, { slug, id, language }],
    async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const modifierId = id || slug;
      const modifier = mockModifiers.find(m => m.id === modifierId);
      
      if (!modifier) {
        throw new Error('Modifier not found');
      }
      
      return modifier;
    },
    {
      enabled: Boolean(id || slug),
    }
  );

  const modifier = (data as any)?.data || data;

  return {
    modifier,
    error,
    isLoading,
  };
};

export const useModifiersQuery = (options: Partial<ModifierQueryOptions>) => {
  // Use mock data instead of API call
  const { data, error, isLoading } = useQuery<ModifierPaginator, Error>(
    [API_ENDPOINTS.MODIFIERS, options],
    async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredModifiers = [...mockModifiers];
      
      // Apply filters
      if (options.modifier_group_id) {
        filteredModifiers = filteredModifiers.filter(m => 
          m.modifier_group_id === options.modifier_group_id
        );
      }
      
      if (options.name) {
        filteredModifiers = filteredModifiers.filter(m => 
          m.name.toLowerCase().includes(options.name!.toLowerCase())
        );
      }
      
      if (options.is_active !== undefined) {
        filteredModifiers = filteredModifiers.filter(m => m.is_active === options.is_active);
      }
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedModifiers = filteredModifiers.slice(startIndex, endIndex);
      
      return {
        data: paginatedModifiers,
        current_page: page,
        per_page: limit,
        total: filteredModifiers.length,
        last_page: Math.ceil(filteredModifiers.length / limit),
        from: startIndex + 1,
        to: Math.min(endIndex, filteredModifiers.length),
        first_page_url: '',
        last_page_url: '',
        next_page_url: null,
        prev_page_url: null,
        path: '',
        links: [],
      };
    },
    {
      keepPreviousData: true,
    }
  );

  const modifiers = (data as any)?.data ?? [];
  const paginatorInfo = (data as any)?.paginatorInfo ?? mapPaginatorData(data);

  return {
    modifiers: Array.isArray(modifiers) ? modifiers : [],
    paginatorInfo,
    error,
    loading: isLoading,
  };
};

