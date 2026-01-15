import ForgotPasswordForm from '@/components/auth/forget-password/forget-password';
import AuthPageLayout from '@/components/layouts/auth-layout';
import { SUPER_ADMIN } from '@/utils/constants';
import { parseContextCookie } from '@/utils/parse-cookie';
import { Routes } from '@/config/routes';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideProps: GetServerSideProps = async ({
  context,
  locale,
}: any) => {
  const cookies = parseContextCookie(context?.req?.headers?.cookie);
  if (cookies?.auth_token) {
    if (cookies?.auth_permissions?.includes(SUPER_ADMIN)) {
      return {
        redirect: { destination: Routes.dashboard, permanent: false },
      };
    }
  }
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'form'])),
    },
  };
};

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <AuthPageLayout>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('form:form-title-forgot-password') || 'Reset Password'}
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          XRT Restaurant System - Password Recovery
        </p>
      </div>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </AuthPageLayout>
  );
}
