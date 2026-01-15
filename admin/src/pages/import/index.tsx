import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import { useImportSessionsQuery } from '@/data/import';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { Table } from '@/components/ui/table';
import Badge from '@/components/ui/badge/badge';
import { Routes } from '@/config/routes';
import LinkButton from '@/components/ui/link-button';
import { PlusIcon } from '@/components/icons/plus-icon';

export default function ImportListPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = router;
  const businessId = query.business_id as string;
  const { sessions, isLoading, error } = useImportSessionsQuery(businessId);

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as any)?.message} />;

  const columns = [
    {
      title: t('common:status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          draft: 'bg-gray-500',
          validated: 'bg-green-500',
          confirmed: 'bg-blue-500',
          discarded: 'bg-red-500',
        };
        return (
          <Badge
            text={status}
            color={colors[status] || 'bg-gray-500'}
          />
        );
      },
    },
    {
      title: t('common:items-count'),
      dataIndex: 'parsedData',
      key: 'items',
      width: 100,
      render: (data: any) => data?.items?.length || 0,
    },
    {
      title: t('common:errors'),
      dataIndex: 'validationErrors',
      key: 'errors',
      width: 100,
      render: (errors: any[]) => errors?.length || 0,
    },
    {
      title: t('common:warnings'),
      dataIndex: 'validationWarnings',
      key: 'warnings',
      width: 100,
      render: (warnings: any[]) => warnings?.length || 0,
    },
    {
      title: t('common:created-at'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t('common:actions'),
      dataIndex: 'id',
      key: 'actions',
      width: 150,
      render: (id: string, record: any) => (
        <div className="flex space-x-2">
          {record.status !== 'discarded' && (
            <Button
              size="small"
              onClick={() => router.push(Routes.import.review.replace(':id', id))}
            >
              {t('common:review')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading title={t('common:import-sessions')} />
          </div>
          <div className="flex items-center ms-auto">
            <LinkButton
              href={Routes.import.upload}
              className="h-12 md:ms-4 md:h-12"
              size="small"
            >
              <PlusIcon className="h-4 w-4 me-2" />
              <span>{t('common:new-import')}</span>
            </LinkButton>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={sessions}
          rowKey="id"
          scroll={{ x: 800 }}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <p className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('common:no-import-sessions')}
              </p>
              <p className="text-[13px]">{t('common:start-by-uploading-a-file')}</p>
            </div>
          )}
        />
      </Card>
    </>
  );
}

ImportListPage.authenticate = {
  permissions: adminOnly,
};

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
