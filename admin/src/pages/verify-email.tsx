import Button from '@/components/ui/button';
import {
  useResendVerificationEmail,
  useLogoutMutation,
  useMeQuery,
} from '@/data/user';

import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';
import AuthPageLayout from '@/components/layouts/auth-layout';

import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getEmailVerified } from '@/utils/auth-utils';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common', 'form'])),
  },
});

export default function VerifyEmailActions() {
  const { t } = useTranslation('common');
  useMeQuery();

  const { mutate: logout, isPending: isLoading } = useLogoutMutation();
  const { mutate: verifyEmail, isPending: isVerifying } =
    useResendVerificationEmail();
  const router = useRouter();
  const { emailVerified } = getEmailVerified();
  if (emailVerified) {
    router.push(Routes.dashboard);
  }

  return (
    <AuthPageLayout>
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <svg
            className="h-8 w-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('common:email-not-verified') || 'Email Not Verified'}
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Please verify your email address to continue using XRT Restaurant System
        </p>
      </div>
      <div className="mt-6 space-y-3">
        <Button
          onClick={() => verifyEmail()}
          disabled={isVerifying}
          loading={isVerifying}
          className="w-full"
        >
          {t('common:text-resend-verification-email') || 'Resend Verification Email'}
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          variant="outline"
          className="w-full"
          onClick={() => logout()}
        >
          {t('common:authorized-nav-item-logout') || 'Logout'}
        </Button>
      </div>
    </AuthPageLayout>
  );
}
