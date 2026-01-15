import {
    Item,
    CreateItemInput,
    ItemPaginator,
    ItemQueryOptions,
    GetParams,
    UpdateItemInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const itemClient = {
    ...crudFactory<Item, ItemQueryOptions, CreateItemInput>(API_ENDPOINTS.ITEMS),
    get: async ({ slug, id, language }: { slug?: string; id?: string; language: string }) => {
        const itemId = id || slug || '';
        const response = await HttpClient.get<any>(`${API_ENDPOINTS.ITEMS}/${itemId}`, {
            language,
        });
        return response?.data?.item || response?.data || response;
    },
    paginated: async ({
        name,
        category_id,
        is_active,
        is_available,
        ...params
    }: Partial<ItemQueryOptions>) => {
        const response = await HttpClient.get<any>(API_ENDPOINTS.ITEMS, {
            ...params,
            name,
            category_id,
            is_active: is_active !== undefined ? String(is_active) : undefined,
            is_available: is_available !== undefined ? String(is_available) : undefined,
        });
        return response?.data || response;
    },
    updateItem: async (data: UpdateItemInput) => {
        const response = await HttpClient.put<any>(`${API_ENDPOINTS.ITEMS}/${data.id}`, data);
        // Handle backend response format: { success: true, data: { item: {...} } }
        return response?.data?.item || response?.data || response;
    },
    create: async (variables: CreateItemInput) => {
        const response = await HttpClient.post<any>(API_ENDPOINTS.ITEMS, variables);
        // Handle backend response format: { success: true, data: { item: {...} } }
        return response?.data?.item || response?.data || response;
    },
    delete: async ({ id }: { id: string }) => {
        const response = await HttpClient.delete<any>(`${API_ENDPOINTS.ITEMS}/${id}`);
        return response?.data || response;
    },
};
