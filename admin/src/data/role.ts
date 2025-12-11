import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { roleClient } from './client/role';
import { Role, RolePaginator, QueryOptionsType } from '@/types';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';

export const useRolesQuery = (params: Partial<QueryOptionsType>) => {
  const { data, isLoading, error } = useQuery<RolePaginator, Error>(
    [API_ENDPOINTS.ROLES, params],
    () => roleClient.fetchRoles(params),
    {
      keepPreviousData: true,
    },
  );

  return {
    roles: (data as any)?.data?.roles ?? [],
    paginatorInfo: {
      total: (data as any)?.data?.roles?.length ?? 0,
      currentPage: 1,
      lastPage: 1,
      hasMorePages: false,
      perPage: (data as any)?.data?.roles?.length ?? 10,
      count: (data as any)?.data?.roles?.length ?? 0,
      firstItem: 1,
      lastItem: (data as any)?.data?.roles?.length ?? 0,
    },
    loading: isLoading,
    error,
  };
};

export const useRoleQuery = ({ id }: { id: string }) => {
  return useQuery<Role, Error>(
    [API_ENDPOINTS.ROLES, id],
    () => roleClient.fetchRole({ id }),
    {
      enabled: Boolean(id) && id !== 'undefined',
    },
  );
};

export const useCreateRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(roleClient.create, {
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      router.push(Routes.role.list);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ROLES);
    },
  });
};

export const useUpdateRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(roleClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      router.push(Routes.role.list);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ROLES);
      queryClient.invalidateQueries(API_ENDPOINTS.USERS); // Permissions might change
    },
  });
};

export const useDeleteRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(roleClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ROLES);
    },
  });
};

export const usePermissionsQuery = (
  options?: UseQueryOptions<string[], Error>,
): UseQueryResult<string[], Error> => {
  return useQuery<string[], Error>(
    [API_ENDPOINTS.ALL_PERMISSIONS],
    () => roleClient.fetchAllPermissions(),
    options,
  );
};

export const useAssignRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(roleClient.assignRoleToUser, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      queryClient.invalidateQueries(API_ENDPOINTS.ROLES);
    },
  });
};

export const useRemoveRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(roleClient.removeRoleFromUser, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      queryClient.invalidateQueries(API_ENDPOINTS.ROLES);
    },
  });
};
