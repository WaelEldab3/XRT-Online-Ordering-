/**
 * Structured printable fields for the Template Builder.
 * Used by GET /printable-fields and for layout validation.
 */

export interface PrintableFieldDef {
  key: string;
  label: string;
  category: 'order' | 'items' | 'itemColumns' | 'customer' | 'delivery' | 'system';
  description?: string;
}

/** All valid field keys for type: 'field' blocks (order, customer, delivery, system). */
export const PRINTABLE_FIELD_KEYS = [
  'orderNumber',
  'orderType',
  'orderStatus',
  'serviceTimeType',
  'scheduleTime',
  'readyTime',
  'actualReadyTime',
  'createdAt',
  'updatedAt',
  'notes',
  'paymentMethod',
  'currency',
  'subtotal',
  'discount',
  'deliveryFee',
  'taxTotal',
  'tips',
  'totalAmount',
  'name',
  'phone',
  'email',
  'address',
  'branchName',
  'businessAddress',
  'cashierName',
] as const;

/** Valid column keys for type: 'itemsTable' blocks. */
export const PRINTABLE_ITEM_COLUMNS = [
  'name',
  'quantity',
  'size',
  'unitPrice',
  'modifierTotals',
  'lineSubtotal',
  'specialNotes',
  'kitchenSection',
] as const;

export type PrintableFieldKey = (typeof PRINTABLE_FIELD_KEYS)[number];
export type PrintableItemColumnKey = (typeof PRINTABLE_ITEM_COLUMNS)[number];

const ORDER_FIELDS: PrintableFieldDef[] = [
  { key: 'orderNumber', label: 'Order number', category: 'order', description: 'e.g. ORD-XXXXXX' },
  { key: 'orderType', label: 'Order type', category: 'order' },
  { key: 'orderStatus', label: 'Order status', category: 'order' },
  { key: 'serviceTimeType', label: 'Service time type', category: 'order' },
  { key: 'scheduleTime', label: 'Schedule time', category: 'order' },
  { key: 'readyTime', label: 'Ready time', category: 'order' },
  { key: 'actualReadyTime', label: 'Actual ready time', category: 'order' },
  { key: 'createdAt', label: 'Created at', category: 'order' },
  { key: 'updatedAt', label: 'Updated at', category: 'order' },
  { key: 'notes', label: 'Notes', category: 'order' },
  { key: 'paymentMethod', label: 'Payment method', category: 'order' },
  { key: 'currency', label: 'Currency', category: 'order' },
  { key: 'subtotal', label: 'Subtotal', category: 'order' },
  { key: 'discount', label: 'Discount', category: 'order' },
  { key: 'deliveryFee', label: 'Delivery fee', category: 'order' },
  { key: 'taxTotal', label: 'Tax total', category: 'order' },
  { key: 'tips', label: 'Tips', category: 'order' },
  { key: 'totalAmount', label: 'Total amount', category: 'order' },
];

const CUSTOMER_DELIVERY_FIELDS: PrintableFieldDef[] = [
  { key: 'name', label: 'Name', category: 'customer' },
  { key: 'phone', label: 'Phone', category: 'customer' },
  { key: 'email', label: 'Email', category: 'customer' },
  { key: 'address', label: 'Address', category: 'delivery' },
];

const SYSTEM_FIELDS: PrintableFieldDef[] = [
  { key: 'branchName', label: 'Branch name', category: 'system' },
  { key: 'businessAddress', label: 'Business address', category: 'system' },
  { key: 'cashierName', label: 'Cashier name', category: 'system' },
];

const ITEM_COLUMN_DEFS: PrintableFieldDef[] = PRINTABLE_ITEM_COLUMNS.map((key) => ({
  key,
  label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
  category: 'itemColumns' as const,
}));

/**
 * Returns the full structured list of printable fields for the Template Builder.
 */
export function getPrintableFieldsStructured(): {
  order: PrintableFieldDef[];
  customer: PrintableFieldDef[];
  delivery: PrintableFieldDef[];
  system: PrintableFieldDef[];
  itemColumns: PrintableFieldDef[];
} {
  return {
    order: ORDER_FIELDS,
    customer: CUSTOMER_DELIVERY_FIELDS.filter((f) => f.category === 'customer'),
    delivery: CUSTOMER_DELIVERY_FIELDS.filter((f) => f.category === 'delivery'),
    system: SYSTEM_FIELDS,
    itemColumns: ITEM_COLUMN_DEFS,
  };
}
