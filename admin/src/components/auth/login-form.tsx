import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import Link from '@/components/ui/link';
import Form from '@/components/ui/forms/form';
import { Routes } from '@/config/routes';
import { useLogin } from '@/data/user';
import type { LoginInput } from '@/types';
import { useState } from 'react';
import Alert from '@/components/ui/alert';
import Router from 'next/router';
import { toast } from 'react-toastify';
import {
  allowedRoles,
  hasAccess,
  setAuthCredentials,
} from '@/utils/auth-utils';

const loginFormSchema = yup.object().shape({
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
});

const defaultValues = {
  email: 'admin@demo.com',
  password: 'demodemo',
};

const LoginForm = () => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: login, isLoading, error } = useLogin();

  function onSubmit(values: LoginInput, e?: React.BaseSyntheticEvent) {
      // Prevent any default form submission behavior
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      login(
        {
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: (data) => {
            // Handle customize_server response format: { status: 'success', accessToken, refreshToken, data: { user } }
            if (data?.accessToken || data?.token) {
              const token = data?.accessToken || data?.token;
              const user = data?.data?.user || data;
              const permissions = (user as any)?.permissions || [];
              const role = (user as any)?.role || '';
              
              // Check if role is allowed (not permissions array)
              if (role === 'super_admin' || role === 'admin' || role === 'client') {
                setAuthCredentials(token || '', permissions, role);
                Router.push(Routes.dashboard);
                return;
              }
              const errorMsg = t('form:error-enough-permission');
              setErrorMessage(errorMsg);
              toast.error(errorMsg);
            } else {
              const errorMsg = t('form:error-credential-wrong');
              setErrorMessage(errorMsg);
              toast.error(errorMsg);
            }
          },
          onError: (error: any) => {
            let errorMsg = t('common:login-failed');
            
            // Handle different error types
            if (error?.response?.status === 401) {
              errorMsg = t('form:error-credential-wrong');
            } else if (error?.response?.status === 403) {
              errorMsg = t('form:error-enough-permission');
            } else if (error?.response?.status === 429) {
              errorMsg = t('form:error-too-many-attempts');
            } else if (error?.message) {
              errorMsg = error.message;
            }
            
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          },
        }
      );
    }

  return (
    <>
      <Form<LoginInput> validationSchema={loginFormSchema} onSubmit={onSubmit} useFormProps={{ defaultValues }}>
        {({ register, formState: { errors } }) => (
          <>
            <Input
              label={t('form:input-label-email')}
              {...register('email')}
              type="email"
              variant="outline"
              className="mb-4"
              error={t(errors?.email?.message!)}
            />
            <PasswordInput
              label={t('form:input-label-password')}
              forgotPassHelpText={t('form:input-forgot-password-label')}
              {...register('password')}
              error={t(errors?.password?.message!)}
              variant="outline"
              className="mb-4"
              forgotPageLink={Routes.forgotPassword}
            />
            <Button className="w-full" loading={isLoading} disabled={isLoading}>
              {t('form:button-label-login')}
            </Button>
          </>
        )}
      </Form>
      {errorMessage ? (
        <Alert
          message={t(errorMessage)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
    </>
  );
};

export default LoginForm;

{
  /* {errorMsg ? (
          <Alert
            message={t(errorMsg)}
            variant="error"
            closeable={true}
            className="mt-5"
            onClose={() => setErrorMsg('')}
          />
        ) : null} */
}
