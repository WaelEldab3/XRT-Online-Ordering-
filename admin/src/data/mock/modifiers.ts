import { ModifierGroup, Modifier } from '@/types';

// Mock data for modifier groups
export const mockModifierGroups: ModifierGroup[] = [
  {
    id: 'mg_001',
    business_id: 'biz_001',
    name: 'Extra Toppings',
    display_type: 'CHECKBOX',
    min_select: 0,
    max_select: 5,
    applies_per_quantity: false,
    is_active: true,
    sort_order: 1,
    modifiers: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mg_002',
    business_id: 'biz_001',
    name: 'Sauce Selection',
    display_type: 'RADIO',
    min_select: 1,
    max_select: 1,
    applies_per_quantity: true,
    is_active: true,
    sort_order: 2,
    modifiers: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mg_003',
    business_id: 'biz_001',
    name: 'Side Dishes',
    display_type: 'CHECKBOX',
    min_select: 0,
    max_select: 3,
    applies_per_quantity: false,
    is_active: true,
    sort_order: 3,
    modifiers: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock data for modifiers
export const mockModifiers: Modifier[] = [
  // Modifiers for Extra Toppings (mg_001)
  {
    id: 'm_001',
    modifier_group_id: 'mg_001',
    name: 'Extra Cheese',
    is_default: false,
    max_quantity: 3,
    quantity_levels: [
      { quantity: 1, price: 2.0 },
      { quantity: 2, price: 3.5 },
      { quantity: 3, price: 5.0 },
    ],
    prices_by_size: {
      S: 1.5,
      M: 2.0,
      L: 2.5,
    },
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_002',
    modifier_group_id: 'mg_001',
    name: 'Mushrooms',
    is_default: false,
    max_quantity: 5,
    quantity_levels: [
      { quantity: 1, price: 1.5 },
      { quantity: 2, price: 2.5 },
      { quantity: 3, price: 3.5 },
    ],
    prices_by_size: undefined,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_003',
    modifier_group_id: 'mg_001',
    name: 'Olives',
    is_default: true,
    max_quantity: 4,
    quantity_levels: undefined,
    prices_by_size: {
      S: 1.0,
      M: 1.5,
      L: 2.0,
    },
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Modifiers for Sauce Selection (mg_002)
  {
    id: 'm_004',
    modifier_group_id: 'mg_002',
    name: 'Marinara',
    is_default: true,
    max_quantity: undefined,
    quantity_levels: undefined,
    prices_by_size: undefined,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_005',
    modifier_group_id: 'mg_002',
    name: 'Alfredo',
    is_default: false,
    max_quantity: undefined,
    quantity_levels: undefined,
    prices_by_size: {
      S: 1.0,
      M: 1.5,
      L: 2.0,
    },
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_006',
    modifier_group_id: 'mg_002',
    name: 'Pesto',
    is_default: false,
    max_quantity: undefined,
    quantity_levels: undefined,
    prices_by_size: {
      S: 1.5,
      M: 2.0,
      L: 2.5,
    },
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Modifiers for Side Dishes (mg_003)
  {
    id: 'm_007',
    modifier_group_id: 'mg_003',
    name: 'French Fries',
    is_default: false,
    max_quantity: undefined,
    quantity_levels: undefined,
    prices_by_size: {
      S: 3.0,
      M: 4.0,
      L: 5.0,
    },
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm_008',
    modifier_group_id: 'mg_003',
    name: 'Garlic Bread',
    is_default: false,
    max_quantity: undefined,
    quantity_levels: undefined,
    prices_by_size: undefined,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper function to get modifiers by group ID
export const getModifiersByGroupId = (groupId: string): Modifier[] => {
  return mockModifiers.filter((m) => m.modifier_group_id === groupId);
};

// Helper function to get modifier group with modifiers
export const getModifierGroupWithModifiers = (groupId: string): ModifierGroup | undefined => {
  const group = mockModifierGroups.find((g) => g.id === groupId);
  if (group) {
    return {
      ...group,
      modifiers: getModifiersByGroupId(groupId),
    };
  }
  return undefined;
};

