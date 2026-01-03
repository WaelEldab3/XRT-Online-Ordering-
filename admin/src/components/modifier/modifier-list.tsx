import React, { useEffect, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Modifier, MappedPaginatorInfo } from '@/types';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';
import { getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import { Switch } from '@headlessui/react';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import Link from '@/components/ui/link';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useRouter } from 'next/router';
import usePrice from '@/utils/use-price';
import { mockModifierGroups } from '@/data/mock/modifiers';

export type IProps = {
  modifiers: Modifier[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const PriceDisplay = ({ amount }: { amount: number }) => {
  const { price } = usePrice({ amount });
  return <span className="whitespace-nowrap">{price}</span>;
};

const ModifierList = ({
  modifiers,
  paginatorInfo,
  onPagination,
  onSort,
  onOrder,
}: IProps) => {
  const { t } = useTranslation(['common', 'form', 'table']);
  const { openModal } = useModalAction();
  const { isOpen } = useModalState();
  const router = useRouter();
  const { locale } = router;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setDeletingId(null);
      setTogglingId(null);
    }
  }, [isOpen]);

  const { alignLeft, alignRight } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      onSort((currentSortDirection: SortOrder) =>
        currentSortDirection === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc
      );
      onOrder(column!);

      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  // Helper to get group name
  const getGroupName = (groupId: string) => {
    const group = mockModifierGroups.find(g => g.id === groupId);
    return group?.name || groupId;
  };

  const columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'name'
          }
          isActive={sortingObj.column === 'name'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 200,
      onHeaderCell: () => onHeaderClick('name'),
      render: (name: string, record: Modifier) => (
        <div className="font-medium text-heading">
          {name}
          {record.is_default && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {t('form:input-label-default') || 'Default'}
            </span>
          )}
        </div>
      ),
    },
    {
      title: t('form:input-label-modifier-group') || 'Group',
      dataIndex: 'modifier_group_id',
      key: 'modifier_group_id',
      align: alignLeft,
      width: 150,
      render: (groupId: string) => (
        <Link
          href={`/modifiers/groups/${groupId}`}
          className="text-body hover:text-accent transition-colors"
        >
          {getGroupName(groupId)}
        </Link>
      ),
    },
    {
      title: t('form:input-label-price') || 'Price',
      dataIndex: 'prices_by_size',
      key: 'price',
      align: alignRight,
      width: 120,
      render: (pricesBySize: any, record: Modifier) => {
        if (pricesBySize) {
          const prices = Object.values(pricesBySize).filter((p: any) => p !== undefined);
          if (prices.length > 0) {
            return <PriceDisplay amount={prices[0] as number} />;
          }
        }
        if (record.quantity_levels && record.quantity_levels.length > 0) {
          return <PriceDisplay amount={record.quantity_levels[0].price} />;
        }
        return <span className="text-gray-400">—</span>;
      },
    },
    {
      title: t('form:input-label-max-quantity') || 'Max Qty',
      dataIndex: 'max_quantity',
      key: 'max_quantity',
      align: 'center',
      width: 100,
      render: (maxQty: number | undefined) => maxQty || '—',
    },
    {
      title: t('table:table-item-actions'),
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (record: Modifier) => {
        const { permissions, role } = getAuthCredentials();
        const canUpdate = role === 'super_admin' || hasPermission(['categories:update'], permissions);
        const canDelete = role === 'super_admin' || hasPermission(['categories:delete'], permissions);

        if (!canUpdate && !canDelete) return null;

        return (
          <div className="inline-flex items-center gap-3">
            {canUpdate && (
              <div 
                title={t('common:text-status')}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
              >
                <Switch
                  checked={record?.is_active}
                  onChange={(checked: boolean) => {
                    setTogglingId(record.id);
                    openModal('TOGGLE_MODIFIER_STATUS', record);
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                  }}
                  className={`${record?.is_active ? 'bg-accent' : 'bg-gray-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
                >
                  <span className="sr-only">Toggle Status</span>
                  <span
                    className={`${record?.is_active ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-light transition-transform`}
                  />
                </Switch>
              </div>
            )}

            {canUpdate && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  router.push(`/modifiers/groups/${record.modifier_group_id}?editModifier=${record.id}`);
                }}
                className="text-base transition duration-200 hover:text-heading"
                title={t('common:text-edit')}
              >
                <EditIcon width={16} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setDeletingId(record.id);
                  openModal('DELETE_MODIFIER', record.id);
                }}
                className="text-red-500 transition duration-200 hover:text-red-600 focus:outline-none"
                title={t('common:text-delete')}
              >
                <TrashIcon width={16} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

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
          data={modifiers}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default ModifierList;

