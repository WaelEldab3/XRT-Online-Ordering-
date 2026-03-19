import Pagination from '@/components/ui/pagination';
import dayjs from 'dayjs';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import ListItemPrice from '@/components/price/list-item-price';
import { formatAddress } from '@/utils/format-address';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { SortOrder, UserAddress } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Order, MappedPaginatorInfo } from '@/types';
import { useRouter } from 'next/router';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import Button from '@/components/ui/button';
import { Routes } from '@/config/routes';
import { ChatIcon } from '@/components/icons/chat';
import { useCreateConversations } from '@/data/conversations';
import { SUPER_ADMIN } from '@/utils/constants';
import { getAuthCredentials } from '@/utils/auth-utils';
import { NoDataFound } from '@/components/icons/no-data-found';
import TransactionDetailsModal from './transaction-details-modal';
import { useModalAction } from '@/components/ui/modal/modal.context';

type IProps = {
  transactions: any[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
};

const OrderTransactionList = ({
  transactions,
  paginatorInfo,
  onPagination,
}: IProps) => {
  // const { data, paginatorInfo } = orders! ?? {};
  const router = useRouter();
  const { t } = useTranslation();
  const rowExpandable = (record: any) => record?.children?.length;
  const { alignLeft, alignRight } = useIsRTL();
  const { permissions } = getAuthCredentials();
  const { mutate: createConversations, isPending: creating } =
    useCreateConversations();
  const [loading, setLoading] = useState<boolean | string | undefined>(false);
  const { openModal } = useModalAction();

  const columns = [
    {
      title: t('table:table-item-order-number'),
      dataIndex: 'order_id',
      key: 'order_number',
      align: 'center',
      render: (order: any) => order?.order_number || 'N/A',
    },
    {
      title: t('table:table-item-placed-at'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date: string) => dayjs(date).format('MM/DD/YYYY HH:mm'),
    },
    {
      title: t('table:table-item-customer-name'),
      dataIndex: 'customer_id',
      key: 'customer_name',
      align: alignLeft,
      render: (customer: any) => customer?.name || 'Guest',
    },
    {
      title: t('table:table-item-total-items-value'),
      dataIndex: 'order_id',
      key: 'subtotal',
      align: 'center',
      render: (order: any) => <ListItemPrice value={order?.money?.subtotal} />,
    },
    {
      title: t('table:table-item-tax'),
      dataIndex: 'order_id',
      key: 'tax',
      align: 'center',
      render: (order: any) => <ListItemPrice value={order?.money?.tax_total} />,
    },
    {
      title: t('table:table-item-tip'),
      dataIndex: 'order_id',
      key: 'tip',
      align: 'center',
      render: (order: any) => <ListItemPrice value={order?.money?.tips} />,
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (amount: number) => <ListItemPrice value={amount} />,
    },
    {
      title: t('table:table-item-order-type'),
      dataIndex: 'order_id',
      key: 'order_type',
      align: 'center',
      render: (order: any) => (
        <span className="capitalize">{order?.order_type || 'N/A'}</span>
      ),
    },
    {
      title: t('table:table-item-payment-method'),
      dataIndex: 'payment_method',
      key: 'payment_method',
      align: 'center',
      render: (method: string, record: any) => (
        <span className="capitalize">
          {record.card_type} {record.last_4 ? `**** ${record.last_4}` : method}
        </span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      render: (id: string, record: any) => {
        const canRefund = record?.payment_status === 'paid' || typeof record?.money?.payment_status === 'string' && record?.money?.payment_status === 'paid' || record?.payment_status === 'partially_refunded' || record?.money?.payment_status === 'partially_refunded';
        
        // determine total amount
        const totalAmount = record?.amount ?? record?.money?.total_amount ?? record?.total ?? 0;

        return (
          <div className="flex items-center justify-end gap-2">
            {canRefund && (
              <Button
                size="small"
                variant="outline"
                onClick={() => openModal('REFUND_ORDER', { orderId: record?.id, totalAmount })}
                className="!text-red-500 hover:!bg-red-50 !border-red-500 hover:!border-red-500"
              >
                Refund
              </Button>
            )}
            <Button
              size="small"
              onClick={() => setSelectedTransaction(record)}
              className="!bg-accent !text-light"
            >
              {t('common:text-show-more')}
            </Button>
          </div>
        );
      },
    },
  ];

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={transactions}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </div>

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default OrderTransactionList;
