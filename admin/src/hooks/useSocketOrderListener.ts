import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAtom } from 'jotai';
import { pendingOrdersAtom } from '@/store/order-atoms';
import {
  serverOrderToAdminOrder,
  ServerOrder,
} from '@/data/order/server-order-mapper';

/**
 * Derive the socket.io base URL from NEXT_PUBLIC_REST_API_ENDPOINT.
 * The env var is e.g. "http://localhost:3001/api/v1" – we only want the origin.
 */
function getSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:3001/api/v1';
  try {
    const parsed = new URL(apiUrl);
    return parsed.origin; // e.g. "http://localhost:3001"
  } catch {
    return 'http://localhost:3001';
  }
}

/**
 * Hook that connects to the backend socket.io server and listens for
 * `new-order` events. When an event arrives it maps the payload to the
 * admin Order type and pushes it onto the pending-orders queue so the
 * NewOrderNotification component can show the modal directly.
 */
export function useSocketOrderListener() {
  const socketRef = useRef<Socket | null>(null);
  const [, setPendingOrders] = useAtom(pendingOrdersAtom);

  useEffect(() => {
    const url = getSocketUrl();
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to', url);
    });

    socket.on('new-order', (data: any) => {
      console.log('[Socket.IO] new-order received', data);

      // The backend emits the full server order object
      let order;
      try {
        order = serverOrderToAdminOrder(data as ServerOrder);
      } catch {
        // If mapping fails, build a minimal order from what we have
        order = {
          id: data?.id || data?.orderId || '',
          tracking_number: data?.order_number || data?.orderNumber || '',
          order_status: data?.status || 'pending',
          total: data?.money?.total_amount ?? 0,
          amount: data?.money?.subtotal ?? 0,
          created_at: data?.created_at || new Date().toISOString(),
          updated_at: data?.updated_at || new Date().toISOString(),
          money: data?.money,
          delivery: data?.delivery,
          items: data?.items || [],
          products: (data?.items || []).map((item: any) => ({
            id: item?.id || item?.menu_item_id,
            name: item?.name_snap || 'Item',
            pivot: {
              order_quantity: item?.quantity || 1,
              unit_price: item?.unit_price || 0,
              subtotal: item?.line_subtotal || 0,
            },
          })),
        } as any;
      }

      // Add to the pending orders queue
      setPendingOrders((prev) => [...prev, order]);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [setPendingOrders]);
}
