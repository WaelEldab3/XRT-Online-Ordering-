import { Order, OrderItem } from '../../domain/entities/Order';

export const KITCHEN_SECTION_UNASSIGNED = 'Unassigned';

/**
 * Group order items by kitchen section for print routing.
 * Each section may have multiple printers assigned later.
 * Uses kitchen_section_snapshot on each order item (set at order creation).
 *
 * @param order - Order with items that have kitchen_section_snapshot
 * @returns Array of { sectionName, items } in stable order (sections ordered by first occurrence)
 */
export function groupOrderItemsByKitchenSection(
  order: Order
): { sectionName: string; items: OrderItem[] }[] {
  const sectionMap = new Map<string, OrderItem[]>();
  const sectionOrder: string[] = [];

  for (const item of order.items) {
    const sectionName = item.kitchen_section_snapshot?.trim() || KITCHEN_SECTION_UNASSIGNED;
    if (!sectionMap.has(sectionName)) {
      sectionOrder.push(sectionName);
      sectionMap.set(sectionName, []);
    }
    sectionMap.get(sectionName)!.push(item);
  }

  return sectionOrder.map((sectionName) => ({
    sectionName,
    items: sectionMap.get(sectionName)!,
  }));
}
