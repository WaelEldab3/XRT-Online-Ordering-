import Layout from '@/components/layouts/admin';
import CreateOrUpdateModifierGroupForm from '@/components/modifier-group/modifier-group-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useModifierGroupQuery } from '@/data/modifier-group';
import { adminOnly, getAuthCredentials, hasPermission, hasAccess } from '@/utils/auth-utils';
import { SUPER_ADMIN } from '@/utils/constants';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function UpdateModifierGroupPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { group, error, isLoading } = useModifierGroupQuery({
    id: query.groupId as string,
    slug: query.groupId as string,
    language: locale!,
  });

  const { permissions, role } = getAuthCredentials();
  // Allow super admin or users with categories:update permission
  if (role !== SUPER_ADMIN && !hasPermission(['modifier_groups:update'], permissions)) {
    return <ErrorMessage message={t('common:text-permission-denied')} />;
  }

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (query.action === 'edit') {
    return (
      <>
        <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
          <h1 className="text-lg font-semibold text-heading">
            {t('form:form-title-edit-modifier-group')}
          </h1>
        </div>
        <CreateOrUpdateModifierGroupForm initialValues={group} />
      </>
    );
  }

  return null;
}

UpdateModifierGroupPage.authenticate = {
  permissions: adminOnly,
  allowedPermissions: ['modifier_groups:update'],
};
UpdateModifierGroupPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

