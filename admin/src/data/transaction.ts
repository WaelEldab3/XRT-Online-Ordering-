import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { transactionClient, TransactionsListParams, TransactionsListResult } from './client/transaction';
import { MappedPaginatorInfo } from '@/types';

export const useTransactionsQuery = (
  params: TransactionsListParams,
  options: any = {}
) => {
  const { data, error, isPending: isLoading } = useQuery<TransactionsListResult, Error>({
    queryKey: [API_ENDPOINTS.TRANSACTIONS, params],
    queryFn: () => transactionClient.getList(params),
    ...options,
  });

  const payload = (data as any)?.data ?? data;
  const list = Array.isArray(payload?.data) ? payload.data : [];
  const total = payload?.total ?? 0;
  
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const lastPage = Math.max(1, Math.ceil(total / limit));

  const paginatorInfo: MappedPaginatorInfo = {
    currentPage: page,
    lastPage,
    total,
    perPage: limit,
    hasMorePages: page < lastPage,
  };

  return {
    transactions: list,
    paginatorInfo,
    error,
    loading: isLoading,
  };
};

export const useTransactionQuery = (id: string, options: any = {}) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.TRANSACTIONS, id],
    queryFn: () => transactionClient.get(id),
    enabled: !!id,
    ...options,
  });
};
