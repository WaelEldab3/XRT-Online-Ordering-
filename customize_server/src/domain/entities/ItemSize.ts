export interface ItemSize {
  id: string;
  item_id: string;
  restaurant_id: string; // business_id
  name: string;
  code: string; // Unique per item (e.g., 'S', 'M', 'L', 'XL', 'XXL' or custom codes)
  price: number;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateItemSizeDTO {
  item_id: string;
  restaurant_id: string;
  name: string;
  code: string;
  price: number;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateItemSizeDTO {
  name?: string;
  code?: string;
  price?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface ItemSizeFilters {
  item_id?: string;
  restaurant_id?: string;
  is_active?: boolean;
}
