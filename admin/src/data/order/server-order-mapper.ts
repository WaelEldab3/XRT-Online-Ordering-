import { Order } from '@/types';

/** Shape returned by the custom server GET /orders */
export interface ServerOrderResponse {
  data: ServerOrder[];
  total: number;
}

export interface ServerOrderItemModifier {
  id?: string;
  modifier_id: string;
  name_snapshot: string;
  modifier_quantity_id?: string;
  quantity_label_snapshot?: string;
  unit_price_delta: number;
  selected_side?: string;
}

export interface ServerOrderItem {
  id?: string;
  menu_item_id: string;
  size_id?: string;
  name_snap: string;
  size_snap?: string;
  unit_price: number;
  quantity: number;
  modifier_totals: number;
  line_subtotal: number;
  special_notes?: string;
  modifiers: ServerOrderItemModifier[];
}

export interface ServerOrder {
  id: string;
  customer_id: string;
  order_number: string;
  order_type: string;
  service_time_type: string;
  schedule_time?: string | null;
  ready_time?: string;
  actual_ready_time?: string;
  status: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  completed_at?: string;
  cancelled_reason?: string;
  cancelled_by?: string;
  money: {
    subtotal: number;
    discount: number;
    delivery_fee: number;
    tax_total: number;
    tips: number;
    total_amount: number;
    currency: string;
    payment: string;
  };
  delivery?: {
    name?: string;
    phone?: string;
    address?: Record<string, unknown>;
  };
  notes?: string;
  items: ServerOrderItem[];
}

/** Map server order to admin Order type for list/cards/details */
export function serverOrderToAdminOrder(server: ServerOrder): Order {
  const delivery = server.delivery;
  const address = delivery?.address as
    | {
        line1?: string;
        city?: string;
        state?: string;
        formatted_address?: string;
      }
    | undefined;
  const formattedAddress =
    address?.formatted_address ||
    [address?.line1, address?.city, address?.state].filter(Boolean).join(', ');

  return {
    id: server.id,
    parent_id: '',
    tracking_number: server.order_number,
    customer_contact: delivery?.phone ?? '',
    customer_name: delivery?.name ?? '',
    customer_id: Number(server.customer_id) || 0,
    customer: delivery?.name ? ({ name: delivery.name } as any) : undefined,
    amount: server.money?.subtotal ?? 0,
    sales_tax: server.money?.tax_total ?? 0,
    total: server.money?.total_amount ?? 0,
    paid_total: server.money?.total_amount ?? 0,
    delivery_fee: server.money?.delivery_fee ?? 0,
    discount: server.money?.discount ?? 0,
    delivery_time: server.ready_time ?? server.created_at ?? '',
    order_status: server.status,
    order_type: server.order_type,
    schedule_time: server.schedule_time ?? null,
    payment_status: server.money?.payment ?? 'pending',
    created_at:
      typeof server.created_at === 'string'
        ? server.created_at
        : ((server as any).created_at?.toString?.() ?? ''),
    updated_at:
      typeof server.updated_at === 'string'
        ? server.updated_at
        : ((server as any).updated_at?.toString?.() ?? ''),
    translated_languages: [],
    language: '',
    products: (server.items ?? []).map(
      (item) =>
        ({
          id: item.id ?? item.menu_item_id,
          name: item.name_snap,
          pivot: {
            order_quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.line_subtotal,
            variation: item.size_snap,
            modifiers: (item.modifiers ?? []).map((m) => ({
              id: m.id,
              modifier_name_snap: m.name_snapshot,
              quantity_label_snapshot: m.quantity_label_snapshot,
              unit_price_delta: m.unit_price_delta,
              selected_side: m.selected_side,
            })),
          },
        }) as any,
    ),
    shipping_address: formattedAddress
      ? ({ formatted_address: formattedAddress } as any)
      : undefined,
    billing_address: formattedAddress
      ? ({ formatted_address: formattedAddress } as any)
      : undefined,
    note: server.notes,
    cancelled_reason: server.cancelled_reason,
    cancelled_by: server.cancelled_by,
    // Preserve raw server data for the new order modal
    ...({ money: server.money, delivery: server.delivery } as any),
  } as Order;
}
