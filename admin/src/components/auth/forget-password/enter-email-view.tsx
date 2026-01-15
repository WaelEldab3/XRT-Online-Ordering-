import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'next-i18next';

interface Props {
  onSubmit: (values: { email: string }) => void;
  loading: boolean;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
});

const EnterEmailView = ({ onSubmit, loading }: Props) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<{ email: string }>({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label={t('form:input-label-email')}
        {...register('email')}
        type="email"
        variant="outline"
        placeholder="Enter your email address"
        error={t(errors.email?.message!)}
        className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
      />
      <Button
        className="mt-6 h-11 w-full text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md"
        loading={loading}
        disabled={loading}
      >
        {t('form:text-submit-email') || 'Send Reset Link'}
      </Button>
    </form>
  );
};

export default EnterEmailView;
