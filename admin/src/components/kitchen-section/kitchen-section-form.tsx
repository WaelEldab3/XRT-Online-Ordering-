import Input from '@/components/ui/input';
import { useTranslation } from 'next-i18next';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import Button from '@/components/ui/button';
import { useRouter } from 'next/router';
import { KitchenSection } from '@/types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SwitchInput from '@/components/ui/switch-input';

type FormValues = {
  name: string;
  is_active: boolean;
};

const kitchenSectionValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  is_active: yup.boolean().required(),
});

type IProps = {
  initialValues?: KitchenSection;
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
};

export default function KitchenSectionForm({
  initialValues,
  onSubmit,
  isLoading,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    resolver: yupResolver(kitchenSectionValidationSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      is_active: initialValues?.is_active ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:item-description')}
          details={`${initialValues ? 'Update' : 'Add'} kitchen section details here.`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label="Name"
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
            placeholder="e.g. Grill, Bar, Main Kitchen"
          />

          <SwitchInput
            name="is_active"
            label="Active Status"
            control={control}
            error={t(errors.is_active?.message!)}
          />
        </Card>
      </div>
      <div className="mb-4 text-end">
        {initialValues && (
          <Button
            variant="outline"
            onClick={router.back}
            className="me-4"
            type="button"
          >
            {t('form:button-label-back')}
          </Button>
        )}

        <Button loading={isLoading} disabled={isLoading}>
          {initialValues ? 'Update Kitchen Section' : 'Add Kitchen Section'}
        </Button>
      </div>
    </form>
  );
}
