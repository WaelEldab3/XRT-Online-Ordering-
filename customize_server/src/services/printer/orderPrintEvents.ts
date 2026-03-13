import { EventEmitter } from 'events';
import { routeOrderToPrinters } from './printRoutingService';
import { logger } from '../../shared/utils/logger';

const orderPrintEmitter = new EventEmitter();
orderPrintEmitter.setMaxListeners(20);

export const ORDER_PRINT_EVENTS = {
  NEW_ORDER: 'new-order',
} as const;

export interface NewOrderPayload {
  orderId: string;
  orderNumber?: string;
}

/**
 * Emit when an order is created. The local print handler listens and runs routing.
 * Idempotency: routeOrderToPrinters uses order.print_status to avoid double prints.
 */
export function emitNewOrder(payload: NewOrderPayload): void {
  orderPrintEmitter.emit(ORDER_PRINT_EVENTS.NEW_ORDER, payload);
}

/**
 * Register the local print handler. Call once at server startup (e.g. from server.ts).
 * Listens for 'new-order' and triggers routeOrderToPrinters (safe retry; no double prints).
 */
export function registerOrderPrintHandler(): void {
  orderPrintEmitter.on(ORDER_PRINT_EVENTS.NEW_ORDER, (payload: NewOrderPayload) => {
    const { orderId } = payload;
    setImmediate(() => {
      routeOrderToPrinters(orderId).catch((err) => {
        logger.error('[OrderPrintEvents] routeOrderToPrinters error:', err);
      });
    });
  });
  logger.info('[OrderPrintEvents] Order print handler registered');
}
