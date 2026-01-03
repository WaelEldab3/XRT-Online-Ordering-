import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  ModifierGroup,
  ModifierGroupPaginator,
  ModifierGroupQueryOptions,
  GetParams,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { modifierGroupClient } from './client/modifier-group';
import { Config } from '@/config';
import { 
  mockModifierGroups, 
  getModifierGroupWithModifiers,
  mockModifiers,
  getModifiersByGroupId 
} from './mock/modifiers';

export const useCreateModifierGroupMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(async (input: any) => {
    // Mock: Just return the input with generated ID
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...input,
      id: `mg_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, {
    onSuccess: () => {
      Router.push(Routes.modifierGroup.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      console.error('❌ Create Modifier Group Error:', error);
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIER_GROUPS);
    },
  });
};

export const useDeleteModifierGroupMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(async ({ id }: { id: string }) => {
    // Mock: Just simulate deletion
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id };
  }, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIER_GROUPS);
    },
  });
};

export const useUpdateModifierGroupMutation = () => {
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
      const updatedGroup = (data as any)?.data || data;
      queryClient.setQueryData(
        [API_ENDPOINTS.MODIFIER_GROUPS, { id: variables.id, language: router.locale }],
        (old: any) => {
          return { data: updatedGroup };
        }
      );
      toast.success(t('common:successfully-updated'));
      router.push(Routes.modifierGroup.list, undefined, {
        locale: Config.defaultLanguage,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.MODIFIER_GROUPS);
    },
  });
};

export const useModifierGroupQuery = ({ slug, id, language }: GetParams & { id?: string }) => {
  // Use mock data instead of API call
  const { data, error, isLoading } = useQuery<ModifierGroup, Error>(
    [API_ENDPOINTS.MODIFIER_GROUPS, { slug, id, language }],
    async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const groupId = id || slug;
      const group = getModifierGroupWithModifiers(groupId || '');
      
      if (!group) {
        throw new Error('Modifier group not found');
      }
      
      return group;
    },
    {
      enabled: Boolean(id || slug),
    }
  );

  const group = (data as any)?.data || data;

  return {
    group,
    error,
    isLoading,
  };
};

export const useModifierGroupsQuery = (options: Partial<ModifierGroupQueryOptions>) => {
  // Use mock data instead of API call
  const { data, error, isLoading } = useQuery<ModifierGroupPaginator, Error>(
    [API_ENDPOINTS.MODIFIER_GROUPS, options],
    async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredGroups = [...mockModifierGroups];
      
      // Apply filters
      if (options.name) {
        filteredGroups = filteredGroups.filter(g => 
          g.name.toLowerCase().includes(options.name!.toLowerCase())
        );
      }
      
      if (options.is_active !== undefined) {
        filteredGroups = filteredGroups.filter(g => g.is_active === options.is_active);
      }
      
      // Add modifiers to each group
      filteredGroups = filteredGroups.map(group => ({
        ...group,
        modifiers: getModifiersByGroupId(group.id),
      }));
      
      // Pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedGroups = filteredGroups.slice(startIndex, endIndex);
      
      return {
        data: paginatedGroups,
        current_page: page,
        per_page: limit,
        total: filteredGroups.length,
        last_page: Math.ceil(filteredGroups.length / limit),
        from: startIndex + 1,
        to: Math.min(endIndex, filteredGroups.length),
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

  const groups = (data as any)?.data ?? [];
  const paginatorInfo = (data as any)?.paginatorInfo ?? mapPaginatorData(data);

  return {
    groups: Array.isArray(groups) ? groups : [],
    paginatorInfo,
    error,
    loading: isLoading,
  };
};

