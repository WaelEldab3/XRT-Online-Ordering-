export type ModifierDisplayType = 'RADIO' | 'CHECKBOX';

export interface QuantityLevel {
  quantity: number;
  name?: string;
  price?: number;
  is_default?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface PricesBySize {
  sizeCode: 'S' | 'M' | 'L' | 'XL' | 'XXL'; // These codes should match ItemSize.code values for the item
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  business_id: string;
  name: string;
  display_type: ModifierDisplayType;
  min_select: number;
  max_select: number;
  applies_per_quantity: boolean;
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // For soft delete
}

export interface CreateModifierGroupDTO {
  business_id: string;
  name: string;
  display_type: ModifierDisplayType;
  min_select: number;
  max_select: number;
  applies_per_quantity?: boolean;
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateModifierGroupDTO {
  name?: string;
  display_type?: ModifierDisplayType;
  min_select?: number;
  max_select?: number;
  applies_per_quantity?: boolean;
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
  is_active?: boolean;
  sort_order?: number;
}

export interface ModifierGroupFilters {
  business_id?: string;
  name?: string;
  is_active?: boolean;
  display_type?: ModifierDisplayType;
  page?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: 'asc' | 'desc';
}
