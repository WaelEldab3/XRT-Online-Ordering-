import { useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { get } from './client';

export const useBusinessesQuery = ({
  limit = 20,
  page = 1,
  search = '',
}: {
  limit?: number;
  page?: number;
  search?: string;
}) => {
  const url = `${API_ENDPOINTS.BUSINESSES}?limit=${limit}&page=${page}&search=${search}`;

  return useQuery(
    [API_ENDPOINTS.BUSINESSES, { limit, page, search }],
    () => get(url),
    {
      staleTime: 60 * 1000, // 1 minute
      select: (data: any) => {
        // Backend returns { status, data: [...] } - the array is directly in data.data
        return data.data || [];
      },
    },
  );
};

export const useBusinessQuery = (id: string) => {
  return useQuery(
    [API_ENDPOINTS.BUSINESSES, id],
    () => get(`${API_ENDPOINTS.BUSINESSES}/${id}`),
    {
      enabled: !!id,
      select: (data: any) => data.data?.business,
    },
  );
};
