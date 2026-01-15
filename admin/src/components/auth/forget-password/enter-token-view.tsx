import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'next-i18next';

interface Props {
  onSubmit: (values: { token: string }) => void;
  loading: boolean;
}

const schema = yup.object().shape({
  token: yup.string().required('form:error-token-required'),
});

const EnterTokenView = ({ onSubmit, loading }: Props) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ token: string }>({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-blue-700">
          We&apos;ve sent a verification token to your email address. Please enter it below.
        </p>
      </div>
      <Input
        label={t('form:token-label') || 'Verification Token'}
        {...register('token')}
        variant="outline"
        placeholder="Enter the token from your email"
        error={t(errors.token?.message!)}
        className="transition-all duration-200 focus:ring-2 focus:ring-accent/20"
      />
      <Button
        className="mt-6 h-11 w-full text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md"
        loading={loading}
        disabled={loading}
      >
        {t('form:text-submit-token') || 'Verify Token'}
      </Button>
    </form>
  );
};

export default EnterTokenView;
