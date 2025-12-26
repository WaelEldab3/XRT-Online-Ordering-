import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { HttpClient } from './client/http-client';
import { CustomerPaginator, Customer, MappedPaginatorInfo, SortOrder } from '@/types';
import { userClient } from './client/user';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

export const useCustomersQuery = ({
  limit = 20,
  page = 1,
  search = '',
  orderBy = 'created_at',
  sortedBy = 'DESC' as const,
}: {
  limit?: number;
  page?: number;
  search?: string;
  orderBy?: string;
  sortedBy?: 'DESC' | 'ASC';
}) => {
  // Use users endpoint with role filter for clients
  const { data, error, isLoading } = useQuery<any, Error>(
    [API_ENDPOINTS.USERS, { limit, page, search, orderBy, sortedBy, role: 'client' }],
    () => userClient.fetchCustomers({
      limit,
      page,
      search,
      orderBy,
      sortedBy: sortedBy.toLowerCase() as SortOrder,
    }),
    {
      keepPreviousData: true,
      staleTime: 60 * 1000, // 1 minute
    },
  );

  // Handle backend response format: { success: true, data: { users: [...], paginatorInfo: {...} } }
  const responseData = data?.data || data;
  const customers = responseData?.users ?? [];
  const paginatorInfo = responseData?.paginatorInfo ?? {
    total: customers.length,
    currentPage: page,
    lastPage: 1,
    perPage: limit,
    count: customers.length,
  };

  // Transform to match expected format
  const transformedData: CustomerPaginator = {
    data: customers,
    total: paginatorInfo.total,
    // page: paginatorInfo.currentPage,
    // pages: paginatorInfo.lastPage,
    // limit: paginatorInfo.perPage,
    current_page: paginatorInfo.currentPage,
    first_page_url: '',
    from: 0,
    last_page: paginatorInfo.lastPage,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: paginatorInfo.perPage,
    prev_page_url: null,
    to: 0,
    // hasMorePages: paginatorInfo.currentPage < paginatorInfo.lastPage,
  };

  return {
    data: transformedData,
    error,
    isLoading,
    refetch: () => { },
  };
};

export const useCustomerQuery = (id: string) => {
  return useQuery<Customer, Error>(
    [API_ENDPOINTS.USERS, id],
    () => userClient.fetchUser({ id }),
    {
      enabled: !!id,
      select: (data: any) => {
        // Handle backend response format
        return data?.data?.user || data?.data || data;
      },
    },
  );
};

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<any, Error, any>(
    (variables) => {
      // Create user with client role
      return userClient.createUser({
        ...variables,
        role: 'client',
      });
    },
    {
      onSuccess: () => {
        toast.success(t('common:successfully-created'));
        queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:create-failed'));
      },
    }
  );
};

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<any, Error, { id: string; variables: any }>(
    ({ id, variables }) => userClient.update({ id, input: variables }),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:update-failed'));
      },
    }
  );
};

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<any, Error, string>(
    (id) => {
      // Use user delete endpoint
      return HttpClient.delete<any>(`${API_ENDPOINTS.USERS}/${id}`);
    },
    {
      onSuccess: () => {
        toast.success(t('common:successfully-deleted'));
        queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:delete-failed'));
      },
    }
  );
};

export const useImportCustomersMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<
    any,
    Error,
    { customers: any[]; business_id?: string; location_id?: string }
  >(
    async (variables) => {
      // Import customers by creating users with client role
      // For now, create them one by one (can be optimized later)
      const results = [];
      for (const customer of variables.customers) {
        try {
          const result = await userClient.createUser({
            name: customer.name,
            email: customer.email,
            password: 'TempPassword123!', // Generate or require password
            role: 'client',
            // Add other customer-specific fields
          });
          results.push(result);
        } catch (error) {
          console.error('Failed to import customer:', customer, error);
        }
      }
      return { imported: results.length, data: results };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:import-failed'));
      },
    }
  );
};

export const useExportCustomersMutation = () => {
  const { t } = useTranslation();

  return useMutation<
    any,
    Error,
    { business_id?: string; location_id?: string; format?: string }
  >(
    async (variables) => {
      // Fetch all customers (users with client role)
      const response = await userClient.fetchCustomers({
        limit: 10000, // Get all
        role: 'client',
      });

      const customers = response?.users || [];

      // Convert to CSV
      const headers = ['Name', 'Email', 'Phone', 'Role', 'Created At'];
      const rows = customers.map((customer: any) => [
        customer.name || '',
        customer.email || '',
        customer.phone || '',
        customer.role || 'client',
        customer.created_at || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
      ].join('\n');

      // Return as blob-like object
      return new Blob([csvContent], { type: 'text/csv' });
    },
    {
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:export-failed'));
      },
    }
  );
};
