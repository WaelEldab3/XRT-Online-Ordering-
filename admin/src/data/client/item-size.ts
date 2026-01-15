import { HttpClient } from './http-client';

export interface ItemSize {
  id: string;
  item_id: string;
  business_id: string;
  name: string;
  code: string;
  price: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateItemSizeInput {
  item_id: string;
  business_id: string;
  name: string;
  code: string;
  price: number;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateItemSizeInput {
  name?: string;
  code?: string;
  price?: number;
  display_order?: number;
  is_active?: boolean;
}

export const itemSizeClient = {
  getAll: async (itemId: string, businessId?: string) => {
    const response = await HttpClient.get<{ success: boolean; data: ItemSize[] }>(
      `items/${itemId}/sizes`,
      businessId ? { business_id: businessId } : {}
    );
    return response?.data || response || [];
  },

  get: async (itemId: string, id: string) => {
    const response = await HttpClient.get<{ success: boolean; data: ItemSize }>(
      `items/${itemId}/sizes/${id}`
    );
    return response;
  },

  create: async (itemId: string, input: CreateItemSizeInput) => {
    const response = await HttpClient.post<{ success: boolean; data: ItemSize }>(
      `items/${itemId}/sizes`,
      input
    );
    return response;
  },

  update: async (itemId: string, id: string, input: UpdateItemSizeInput) => {
    const response = await HttpClient.put<{ success: boolean; data: ItemSize }>(
      `items/${itemId}/sizes/${id}`,
      input
    );
    return response;
  },

  delete: async (itemId: string, id: string) => {
    const response = await HttpClient.delete<{ success: boolean }>(
      `items/${itemId}/sizes/${id}`
    );
    return response;
  },
};
