import Layout from '@/components/layouts/admin';
import ItemSizeForm from '@/components/item-size/item-size-form';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { adminOnly } from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useBusinessesQuery } from '@/data/business';
import Loader from '@/components/ui/loader/loader';

export default function CreateItemSizePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { businesses, loading } = useBusinessesQuery();

  // Use business_id from query, first available business, or default for single-tenant
  const businessId =
    (router.query.business_id as string) || businesses?.[0]?.id || 'default';

  if (loading) return <Loader text={t('common:text-loading')} />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-item-size')}
        </h1>
      </div>
      <ItemSizeForm businessId={businessId} />
    </>
  );
}

CreateItemSizePage.authenticate = {
  permissions: adminOnly,
};
CreateItemSizePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
