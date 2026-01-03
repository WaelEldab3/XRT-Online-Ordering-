import React, { useEffect, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { SortOrder } from '@/types';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import TitleWithSort from '@/components/ui/title-with-sort';
import { ModifierGroup, MappedPaginatorInfo } from '@/types';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';
import { getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import { Switch } from '@headlessui/react';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import Link from '@/components/ui/link';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useRouter } from 'next/router';

export type IProps = {
  groups: ModifierGroup[] | undefined;
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (key: number) => void;
  onSort: (current: any) => void;
  onOrder: (current: string) => void;
};

const ModifierGroupList = ({
  groups,
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
      render: (name: string, record: ModifierGroup) => (
        <Link
          href={`/modifiers/groups/${record.id}`}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
          }}
          className="font-medium text-heading hover:text-accent transition-colors cursor-pointer"
        >
          {name}
        </Link>
      ),
    },
    {
      title: t('form:input-label-display-type') || 'Display Type',
      dataIndex: 'display_type',
      key: 'display_type',
      align: alignLeft,
      width: 120,
      render: (type: string) => {
        const displayTypeLabel = type === 'RADIO' 
          ? t('common:text-radio') 
          : type === 'CHECKBOX' 
            ? t('common:text-checkbox') 
            : type;
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {displayTypeLabel}
          </span>
        );
      },
    },
    {
      title: t('form:input-label-min-select') || 'Min Select',
      dataIndex: 'min_select',
      key: 'min_select',
      align: 'center',
      width: 100,
      render: (min: number) => min,
    },
    {
      title: t('form:input-label-max-select') || 'Max Select',
      dataIndex: 'max_select',
      key: 'max_select',
      align: 'center',
      width: 100,
      render: (max: number) => max,
    },
    {
      title: t('form:input-label-applies-per-quantity') || 'Applies Per Quantity',
      dataIndex: 'applies_per_quantity',
      key: 'applies_per_quantity',
      align: 'center',
      width: 150,
      render: (applies: boolean) => (
        <span className={applies ? 'text-green-600' : 'text-gray-400'}>
          {applies ? t('common:text-yes') : t('common:text-no')}
        </span>
      ),
    },
    {
      title: t('form:input-label-modifiers-count') || 'Modifiers',
      dataIndex: 'modifiers',
      key: 'modifiers_count',
      align: 'center',
      width: 100,
      render: (modifiers: Modifier[]) => modifiers?.length || 0,
    },
    {
      title: t('table:table-item-actions'),
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (record: ModifierGroup) => {
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
                    openModal('TOGGLE_MODIFIER_GROUP_STATUS', record);
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
              <Link
                href={Routes.modifierGroup.edit(record.id, locale!)}
                className="text-base transition duration-200 hover:text-heading"
                title={t('common:text-edit')}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
              >
                <EditIcon width={16} />
              </Link>
            )}
            {canDelete && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setDeletingId(record.id);
                  openModal('DELETE_MODIFIER_GROUP', record.id);
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
          data={groups}
          rowKey="id"
          scroll={{ x: 1000 }}
          onRow={(record: ModifierGroup) => {
            const baseClassName = 'cursor-pointer hover:bg-gray-50 transition-colors';
            const statusClassName = 
              record.id === deletingId
                ? 'animate-pulse bg-red-100/30'
                : record.id === togglingId
                  ? 'animate-pulse bg-accent/10'
                  : '';
            
            return {
              onClick: (e: React.MouseEvent) => {
                const target = e.target as HTMLElement;
                const isActionElement = 
                  target.closest('button') ||
                  target.closest('a') ||
                  target.closest('[role="switch"]') ||
                  target.closest('[data-action]');
                
                if (isActionElement) {
                  e.stopPropagation();
                  return;
                }
                
                router.push(Routes.modifierGroup.details(record.id)).catch((err) => {
                  console.error('Navigation error:', err);
                  window.location.href = Routes.modifierGroup.details(record.id);
                });
              },
              className: `${baseClassName} ${statusClassName}`.trim(),
              style: { cursor: 'pointer' },
            };
          }}
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

export default ModifierGroupList;

