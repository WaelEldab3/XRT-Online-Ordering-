export const KITCHEN_SECTIONS = [
  { label: 'Appetizers', value: 'KS_001' },
  { label: 'Main Course', value: 'KS_002' },
  { label: 'Desserts', value: 'KS_003' },
  { label: 'Beverages', value: 'KS_004' },
];

export const getKitchenSectionIdByName = (name: string): string | undefined => {
  const section = KITCHEN_SECTIONS.find((s) => s.label.toLowerCase() === name.toLowerCase());
  return section?.value;
};

export const getKitchenSectionNameById = (id: string): string | undefined => {
  const section = KITCHEN_SECTIONS.find((s) => s.value === id);
  return section?.label;
};
