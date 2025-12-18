import { useQuery, useMutation } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { get, post } from './client';
import { CustomerPaginator, Customer, MappedPaginatorInfo } from '@/types';

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
  const url = `${API_ENDPOINTS.CUSTOMERS}?limit=${limit}&page=${page}&search=${search}&orderBy=${orderBy}&sortedBy=${sortedBy}`;

  return useQuery<CustomerPaginator, Error>(
    [API_ENDPOINTS.CUSTOMERS, { limit, page, search, orderBy, sortedBy }],
    () => get(url),
    {
      keepPreviousData: true,
      staleTime: 60 * 1000, // 1 minute
      select: (data: any) => {
        // Transform API response to match expected format
        return {
          data: data.data?.customers || [],
          total: data.total || 0,
          page: data.page || page,
          pages: data.pages || 1,
          limit: data.limit || limit,
          current_page: data.page || page,
          first_page_url: '',
          from: 0,
          last_page: data.pages || 1,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          per_page: data.limit || limit,
          prev_page_url: null,
          to: 0,
          hasMorePages: false,
        };
      },
    },
  );
};

export const useCustomerQuery = (id: string) => {
  return useQuery<Customer, Error>(
    [API_ENDPOINTS.CUSTOMERS, id],
    () => get(`${API_ENDPOINTS.CUSTOMERS}/${id}`),
    {
      enabled: !!id,
      select: (data: any) => data.data?.customer,
    },
  );
};

export const useCreateCustomerMutation = () => {
  return useMutation<any, Error, any>((variables) => {
    return post(API_ENDPOINTS.CUSTOMERS, variables);
  });
};

export const useUpdateCustomerMutation = () => {
  return useMutation<any, Error, { id: string; variables: any }>(
    ({ id, variables }) => post(`${API_ENDPOINTS.CUSTOMERS}/${id}`, variables),
  );
};

export const useDeleteCustomerMutation = () => {
  return useMutation<any, Error, string>((id) => {
    // Assuming DELETE method - adjust based on your API
    return post(`${API_ENDPOINTS.CUSTOMERS}/${id}`, { id });
  });
};

export const useImportCustomersMutation = () => {
  return useMutation<
    any,
    Error,
    { customers: any[]; business_id: string; location_id: string }
  >((variables) => {
    return post(`${API_ENDPOINTS.CUSTOMERS}/import`, variables);
  });
};

export const useExportCustomersMutation = () => {
  return useMutation<
    any,
    Error,
    { business_id?: string; location_id?: string; format?: string }
  >((variables) => {
    return post(`${API_ENDPOINTS.CUSTOMERS}/export`, variables, {
      responseType: 'blob', // Important for file download
    });
  });
};
