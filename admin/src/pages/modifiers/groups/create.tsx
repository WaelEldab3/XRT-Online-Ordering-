import Layout from '@/components/layouts/admin';
import CreateOrUpdateModifierGroupForm from '@/components/modifier-group/modifier-group-form';
import { adminOnly, getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import { SUPER_ADMIN } from '@/utils/constants';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function CreateModifierGroupPage() {
  const router = useRouter();
  const { permissions, role } = getAuthCredentials();

  // Allow super admin or users with categories:create permission
  if (role !== SUPER_ADMIN && !hasPermission(['modifier_groups:create'], permissions)) {
    router.replace('/');
  }

  return (
    <>
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          Create Modifier Group
        </h1>
      </div>
      <CreateOrUpdateModifierGroupForm />
    </>
  );
}

CreateModifierGroupPage.authenticate = {
  permissions: adminOnly,
  allowedPermissions: ['modifier_groups:create'],
};
CreateModifierGroupPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

