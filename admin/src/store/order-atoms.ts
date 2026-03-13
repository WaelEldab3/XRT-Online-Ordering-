import { atom } from 'jotai';
import { Order } from '@/types';

/** New order that triggered a notification (e.g. from polling or real-time). */
export const newOrderAtom = atom<Order | null>(null);

/** Queue of pending orders that arrived via socket.io (shown as stacked modals). */
export const pendingOrdersAtom = atom<Order[]>([]);

/** Modal state for the new order accept flow. */
export const newOrderModalStateAtom = atom<{
  isOpen: boolean;
  order: Order | null;
}>({
  isOpen: false,
  order: null,
});
