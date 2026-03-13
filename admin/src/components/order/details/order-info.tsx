import { useTranslation } from 'next-i18next';
import { formatString } from '@/utils/format-string';
import dayjs from 'dayjs';

interface OrderInfoProps {
  order: any;
}

export default function OrderInfo({ order }: OrderInfoProps) {
  const { t } = useTranslation('common');

  return (
    <div className="rounded-lg border border-border-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-heading">
        {t('text-order-info')}
      </h3>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-semibold text-heading">
            {t('text-payment-method')}
          </span>
          <span className="text-sm text-body capitalize font-medium text-heading">
            {order?.money?.card_type || order?.card_type 
              ? `${order?.money?.card_type || order?.card_type} ${order?.money?.last_4 || order?.last_4 ? `**** ${order?.money?.last_4 || order?.last_4}` : ''}`
              : (order?.payment_gateway || order?.money?.payment || 'N/A')}
          </span>
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-sm font-semibold text-heading">
            {t('text-delivery-time')}
          </span>
          <span className="text-sm text-body">{order?.delivery_time}</span>
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-sm font-semibold text-heading">
            {t('text-total-items')}
          </span>
          <span className="text-sm text-body">Items</span>
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-sm font-semibold text-heading">
            {t('text-order-date')}
          </span>
          <span className="text-sm text-body">
            {dayjs(order?.created_at).format('MMMM D, YYYY')}
          </span>
        </div>
      </div>

      {order?.note && (
        <div className="mt-8">
          <h4 className="mb-2 text-sm font-semibold text-heading">
            {t('text-purchase-note')}
          </h4>
          <div className="rounded bg-gray-50 p-4 text-sm text-body border border-gray-200">
            {order?.note}
          </div>
        </div>
      )}
    </div>
  );
}
