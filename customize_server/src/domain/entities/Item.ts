export interface ItemModifierPriceOverride {
    sizeCode: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    priceDelta: number;
}

export interface ItemModifierQuantityLevelOverride {
    quantity: number;
    name?: string;
    price?: number;
    is_default?: boolean;
    display_order?: number;
    is_active?: boolean;
}

export interface ItemModifierOverride {
    modifier_id: string;
    max_quantity?: number;
    is_default?: boolean;
    prices_by_size?: ItemModifierPriceOverride[];
    quantity_levels?: ItemModifierQuantityLevelOverride[];
}

export interface ItemModifierGroupAssignment {
    modifier_group_id: string;
    display_order: number;
    modifier_overrides?: ItemModifierOverride[]; // Item-level overrides for individual modifiers
}

export interface Item {
    id: string;
    business_id: string;
    name: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    base_price: number;
    category_id: string;
    category?: {
        id: string;
        name: string;
    };
    image?: string;
    image_public_id?: string;
    is_available: boolean;
    is_signature: boolean;
    max_per_order?: number;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    default_size_id?: string; // FK to ItemSize.id, nullable - only used when is_sizeable = true
    modifier_groups?: ItemModifierGroupAssignment[];
    created_at: Date;
    updated_at: Date;
}

export interface CreateItemDTO {
    business_id: string;
    name: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    base_price: number;
    category_id: string;
    image?: string;
    image_public_id?: string;
    is_available?: boolean;
    is_signature?: boolean;
    max_per_order?: number;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    default_size_id?: string; // FK to ItemSize.id, nullable - only used when is_sizeable = true
    modifier_groups?: ItemModifierGroupAssignment[];
}

export interface UpdateItemDTO {
    name?: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
    base_price?: number;
    category_id?: string;
    image?: string;
    image_public_id?: string;
    is_available?: boolean;
    is_signature?: boolean;
    max_per_order?: number;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    default_size_id?: string; // FK to ItemSize.id, nullable - only used when is_sizeable = true
    modifier_groups?: ItemModifierGroupAssignment[];
}

export interface ItemFilters {
    business_id?: string;
    category_id?: string;
    is_active?: boolean;
    is_available?: boolean;
    is_signature?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    sortedBy?: 'asc' | 'desc';
    name?: string;
}
