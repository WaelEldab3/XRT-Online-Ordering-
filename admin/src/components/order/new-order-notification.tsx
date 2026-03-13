import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { pendingOrdersAtom, newOrderModalStateAtom } from '@/store/order-atoms';
import { useUpdateOrderMutation } from '@/data/order';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { playNotificationSound } from '@/utils/notification-sound';

const AUTO_ACCEPT_TIMEOUT = 120_000; // 2 minutes
const SOUND_REPEAT_INTERVAL = 10_000; // 10 seconds

/**
 * Global component that watches the pending-orders queue.
 *
 * Behaviour:
 * 1. When a new order arrives (via socket.io → pendingOrdersAtom),
 *    immediately open the NewOrderModal with the first queued order.
 * 2. A notification sound plays immediately and repeats every 10 seconds
 *    until all pending orders are accepted.
 * 3. If the user doesn't accept within 2 minutes the order is
 *    automatically accepted and the modal moves to the next queued order.
 * 4. Orders are stacked: after one is accepted / auto-accepted the next
 *    one in the queue opens automatically.
 */
export default function NewOrderNotification() {
  const { t } = useTranslation();
  const [pendingOrders, setPendingOrders] = useAtom(pendingOrdersAtom);
  const [modalState, setModalState] = useAtom(newOrderModalStateAtom);
  const { mutate: updateOrder } = useUpdateOrderMutation();
  const autoAcceptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  // Whenever there are pending orders and the modal isn't open yet, show the first one
  useEffect(() => {
    if (pendingOrders.length > 0 && !modalState.isOpen) {
      const nextOrder = pendingOrders[0];
      setModalState({ isOpen: true, order: nextOrder });
    }
  }, [pendingOrders, modalState.isOpen, setModalState]);

  // Repeating notification sound: plays every 10s while there are pending orders
  useEffect(() => {
    // Clear any existing interval
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }

    if (pendingOrders.length === 0) return;

    // Play sound immediately when a new order arrives
    playNotificationSound();

    // Then repeat every 10 seconds
    soundIntervalRef.current = setInterval(() => {
      playNotificationSound();
    }, SOUND_REPEAT_INTERVAL);

    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
    };
  }, [pendingOrders.length]);

  // Auto-accept timer: 2 minutes for the currently shown order
  useEffect(() => {
    // Clear any existing timer
    if (autoAcceptTimerRef.current) {
      clearTimeout(autoAcceptTimerRef.current);
      autoAcceptTimerRef.current = null;
    }

    if (!modalState.isOpen || !modalState.order) return;

    const orderId = modalState.order.id;

    autoAcceptTimerRef.current = setTimeout(() => {
      // Auto-accept the order
      updateOrder(
        { id: orderId, status: 'accepted', silent: true },
        {
          onSuccess: () => {
            toast.success(
              `${t('text-order-auto-accepted') || 'Order auto-accepted'} #${orderId}`,
            );
          },
          onSettled: () => {
            queryClient.invalidateQueries({
              queryKey: [API_ENDPOINTS.ORDERS],
            });
          },
        },
      );

      // Remove from queue and close modal (next one will open via the effect above)
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setModalState({ isOpen: false, order: null });
    }, AUTO_ACCEPT_TIMEOUT);

    return () => {
      if (autoAcceptTimerRef.current) {
        clearTimeout(autoAcceptTimerRef.current);
        autoAcceptTimerRef.current = null;
      }
    };
  }, [
    modalState.isOpen,
    modalState.order,
    setPendingOrders,
    setModalState,
    t,
    updateOrder,
    queryClient,
  ]);

  return null; // UI handled by NewOrderModal
}
