export interface Modifier {
  id: string;
  modifier_group_id: string;
  name: string;
  is_default: boolean;
  max_quantity?: number;
  display_order: number;
  is_active: boolean;
  sides_config?: {
    enabled: boolean;
    allowed_sides?: string[]; // Array of 'LEFT', 'RIGHT', 'WHOLE'
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // For soft delete
}

export interface CreateModifierDTO {
  modifier_group_id: string;
  name: string;
  is_default?: boolean;
  max_quantity?: number;
  display_order?: number;
  is_active?: boolean;
  sides_config?: {
    enabled?: boolean;
    allowed_sides?: string[];
  };
}

export interface UpdateModifierDTO {
  name?: string;
  is_default?: boolean;
  max_quantity?: number;
  display_order?: number;
  is_active?: boolean;
  sides_config?: {
    enabled?: boolean;
    allowed_sides?: string[];
  };
}

export interface ModifierFilters {
  modifier_group_id?: string;
  name?: string;
  is_active?: boolean;
  is_default?: boolean;
}
