export interface KitchenSection {
  id: string;
  name: string;
  business_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKitchenSectionDTO {
  name: string;
  business_id: string;
  is_active?: boolean;
}

export interface KitchenSectionFilters {
  business_id?: string;
  name?: string;
}
