import Button from '@/components/ui/button';
import PasswordInput from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'next-i18next';

interface Props {
  onSubmit: (values: { password: string }) => void;
  loading: boolean;
}

const schema = yup.object().shape({
  password: yup.string().required('form:error-password-required'),
});

const EnterNewPasswordView = ({ onSubmit, loading }: Props) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ password: string }>({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
        <p className="font-medium">Token verified</p>
        <p className="mt-1 text-green-700">
          Please enter your new password below.
        </p>
      </div>
      <PasswordInput
        label={t('form:input-label-password') || 'New Password'}
        {...register('password')}
        error={t(errors.password?.message!)}
        variant="outline"
        placeholder="Enter your new password"
        className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
      />
      <Button
        className="mt-6 h-11 w-full text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md"
        loading={loading}
        disabled={loading}
      >
        {t('form:text-reset-password') || 'Reset Password'}
      </Button>
    </form>
  );
};

export default EnterNewPasswordView;
