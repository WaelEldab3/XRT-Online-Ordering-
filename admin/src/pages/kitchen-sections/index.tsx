import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';
import LinkButton from '@/components/ui/link-button';
import { useKitchenSectionsQuery } from '@/data/kitchen-section';
import Badge from '@/components/ui/badge/badge';
import ActionButtons from '@/components/common/action-buttons';
import { Table } from '@/components/ui/table';
import { KitchenSection } from '@/types';

export default function KitchenSectionsPage() {
  const { t } = useTranslation();
  const { data: sections = [], isLoading, error } = useKitchenSectionsQuery();

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'left' as const,
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center' as const,
      render: (is_active: boolean) => (
        <Badge
          text={is_active ? 'Active' : 'Inactive'}
          color={
            is_active
              ? 'bg-accent bg-opacity-10 text-accent'
              : 'bg-red-500 bg-opacity-10 text-red-500'
          }
        />
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'actions',
      align: 'right' as const,
      render: (id: string) => (
        <ActionButtons
          id={id}
          editUrl={Routes.kitchenSections.edit(id)}
          deleteModalView="DELETE_KITCHEN_SECTION"
        />
      ),
    },
  ];

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title="Kitchen Sections" />
        </div>
        <div className="ms-auto flex w-full items-center justify-end md:w-3/4">
          <LinkButton
            href={Routes.kitchenSections.create}
            className="h-12 w-full md:w-auto"
          >
            + Add section
          </LinkButton>
        </div>
      </Card>

      <div className="mb-8 overflow-hidden rounded shadow">
        <Table
          columns={columns}
          emptyText="No kitchen sections. Add one to get started."
          data={sections}
          rowKey="id"
          scroll={{ x: 380 }}
        />
      </div>
    </>
  );
}

KitchenSectionsPage.authenticate = {};
KitchenSectionsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
