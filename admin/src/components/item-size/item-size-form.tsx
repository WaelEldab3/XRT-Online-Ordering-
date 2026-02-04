import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  useCreateItemSizeMutation,
  useUpdateItemSizeMutation,
} from '@/data/item-size';
import { Routes } from '@/config/routes';
import SwitchInput from '@/components/ui/switch-input';
import { ItemSize } from '@/data/client/item-size';
import { toast } from 'react-toastify';

interface FormValues {
  name: string;
  code: string;
  display_order: number;
  is_active: boolean;
}

const itemSizeValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  code: yup.string().required('form:error-code-required'),
  display_order: yup.number().min(0).default(0),
  is_active: yup.boolean().default(true),
});

type Props = {
  initialValues?: ItemSize;
  businessId?: string | null;
};

export default function ItemSizeForm({ initialValues, businessId }: Props) {
  const router = useRouter();
  const { t } = useTranslation();

  const { mutate: createItemSize, isPending: creating } =
    useCreateItemSizeMutation();
  const { mutate: updateItemSize, isPending: updating } =
    useUpdateItemSizeMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    // @ts-ignore
    resolver: yupResolver(itemSizeValidationSchema),
    defaultValues: {
      name: initialValues?.name || '',
      code: initialValues?.code || '',
      display_order: initialValues?.display_order || 0,
      is_active: initialValues?.is_active ?? true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (initialValues?.id) {
      // Update
      updateItemSize(
        {
          id: initialValues.id,
          ...values,
        },
        {
          onSuccess: () => {
            router.push(Routes.itemSize.list);
          },
        },
      );
    } else {
      // Create - use business_id from URL, first business, or default
      createItemSize(
        {
          ...values,
          business_id: businessId || 'default',
        },
        {
          onSuccess: () => {
            router.push(Routes.itemSize.list);
          },
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={t('form:item-size-form-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <Input
              label={t('form:input-label-code')}
              {...register('code')}
              error={t(errors.code?.message!)}
              variant="outline"
              disabled={!!initialValues?.id}
            />
            {initialValues?.id && (
              <p className="mt-2 text-xs text-red-500">
                {t('form:code-cannot-be-changed')}
              </p>
            )}
          </div>

          <Input
            label={t('form:input-label-display-order')}
            type="number"
            {...register('display_order')}
            error={t(errors.display_order?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <SwitchInput
              name="is_active"
              control={control}
              label={t('form:input-label-is-active')}
            />
          </div>
        </Card>
      </div>

      <div className="mb-4 text-end">
        <Button
          variant="outline"
          onClick={router.back}
          className="me-4"
          type="button"
        >
          {t('form:button-label-back')}
        </Button>
        <Button loading={creating || updating} disabled={creating || updating}>
          {initialValues?.id
            ? t('form:button-label-update')
            : t('form:button-label-add')}
        </Button>
      </div>
    </form>
  );
}
