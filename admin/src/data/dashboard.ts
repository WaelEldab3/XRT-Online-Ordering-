import { Product, ProductQueryOptions, CategoryProductCount } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { dashboardClient } from '@/data/client/dashboard';
import { productClient } from '@/data/client/product';
import { 
  mockTopRatedProducts, 
  mockProductCountByCategory, 
  mockDashboardStats 
} from './mock-data';

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: [API_ENDPOINTS.ANALYTICS], 
    queryFn: () => Promise.resolve(mockDashboardStats),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function usePopularProductsQuery(options: Partial<ProductQueryOptions>) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.POPULAR_PRODUCTS, options],
    queryFn: () => Promise.resolve(mockTopRatedProducts),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: Infinity,
    });
}

export function useLowProductStockQuery(options: Partial<ProductQueryOptions>) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.LOW_STOCK_PRODUCTS_ANALYTICS, options],
    queryFn: () => Promise.resolve([]),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: Infinity,
    });
}

export function useProductByCategoryQuery({
  limit,
  language,
}: {
  limit?: number;
  language?: string;
}) {
  return useQuery<CategoryProductCount[], Error>({
    queryKey: [API_ENDPOINTS.CATEGORY_WISE_PRODUCTS, { limit, language }],
    queryFn: () => Promise.resolve(mockProductCountByCategory),
      placeholderData: undefined,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
  );
}

export function useMostSoldProductByCategoryQuery(
  options: Partial<ProductQueryOptions>,
) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.CATEGORY_WISE_PRODUCTS_SALE, options],
    queryFn: () => Promise.resolve([]),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: Infinity,
    });
}

export function useTopRatedProductsQuery(
  options: Partial<ProductQueryOptions>,
) {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.TOP_RATED_PRODUCTS, options],
    queryFn: () => Promise.resolve(mockTopRatedProducts),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: Infinity,
    });
}
