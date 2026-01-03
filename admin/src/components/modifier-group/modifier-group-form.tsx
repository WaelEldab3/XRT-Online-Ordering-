import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { ModifierGroup } from '@/types';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { useTranslation } from 'next-i18next';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { modifierGroupValidationSchema } from './modifier-group-validation-schema';
import {
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
} from '@/data/modifier-group';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';

type FormValues = {
  name: string;
  display_type: 'RADIO' | 'CHECKBOX';
  min_select: number;
  max_select: number;
  applies_per_quantity?: boolean;
  is_active?: boolean;
  sort_order: number;
};

const defaultValues = {
  name: '',
  display_type: 'RADIO' as const,
  min_select: 0,
  max_select: 1,
  applies_per_quantity: false,
  is_active: true,
  sort_order: 0,
};

type IProps = {
  initialValues?: ModifierGroup | undefined;
};

export default function CreateOrUpdateModifierGroupForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'form']);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          display_type: initialValues.display_type,
          min_select: initialValues.min_select,
          max_select: initialValues.max_select,
          applies_per_quantity: initialValues.applies_per_quantity,
          is_active: initialValues.is_active,
          sort_order: initialValues.sort_order,
        }
      : defaultValues,
    resolver: yupResolver(modifierGroupValidationSchema),
  });

  const displayTypeOptions = [
    { value: 'RADIO', label: `${t('common:text-radio')} (Single Selection)` },
    { value: 'CHECKBOX', label: `${t('common:text-checkbox')} (Multiple Selection)` },
  ];

  const { mutate: createGroup, isLoading: creating } =
    useCreateModifierGroupMutation();
  const { mutate: updateGroup, isLoading: updating } =
    useUpdateModifierGroupMutation();

  const minSelect = watch('min_select');
  const maxSelect = watch('max_select');
  const isRequired = minSelect > 0;

  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name,
      display_type: values.display_type,
      min_select: Number(values.min_select),
      max_select: Number(values.max_select),
      applies_per_quantity: values.applies_per_quantity || false,
      is_active: values.is_active !== false,
      sort_order: Number(values.sort_order),
      business_id: 'biz_001', // Mock - should come from shop context
    };

    if (!initialValues) {
      createGroup(input);
    } else {
      updateGroup({
        ...input,
        id: initialValues.id!,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-modifier-group-details') || 'Modifier Group Details'}
          details={t('form:modifier-group-details-helper-text') || 'Configure how customers can select modifiers from this group.'}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
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
            <Label>{t('form:input-label-display-type') || 'Display Type'}</Label>
            <SelectInput
              name="display_type"
              control={control as any}
              options={displayTypeOptions}
              getOptionLabel={(option: any) => option.label}
              getOptionValue={(option: any) => option.value}
            />
            <ValidationError message={t(errors.display_type?.message!)} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <Input
                label={t('form:input-label-min-select') || 'Min Select'}
                {...register('min_select', { valueAsNumber: true })}
                type="number"
                min={0}
                variant="outline"
                error={t(errors.min_select?.message!)}
              />
              {isRequired && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('form:modifier-group-required-note') || 'Group is required (min_select > 0)'}
                </p>
              )}
            </div>
            <div>
              <Input
                label={t('form:input-label-max-select') || 'Max Select'}
                {...register('max_select', { valueAsNumber: true })}
                type="number"
                min={1}
                variant="outline"
                error={t(errors.max_select?.message!)}
              />
            </div>
          </div>

          <div className="mb-5">
            <SwitchInput
              name="applies_per_quantity"
              control={control as any}
              label={t('form:input-label-applies-per-quantity') || 'Applies Per Quantity'}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('form:applies-per-quantity-helper') || 'If enabled, modifier pricing applies per item quantity'}
            </p>
          </div>

          <div className="mb-5">
            <Input
              label={t('form:input-label-sort-order') || 'Sort Order'}
              {...register('sort_order', { valueAsNumber: true })}
              type="number"
              variant="outline"
              error={t(errors.sort_order?.message!)}
            />
          </div>

          <div className="mb-5">
            <SwitchInput name="is_active" control={control as any} label={t('form:input-label-is-active') || 'Is Active?'} />
          </div>
        </Card>
      </div>
      <StickyFooterPanel className="z-0">
        <div className="text-end">
          <Button
            variant="outline"
            onClick={() => router.push(Routes.modifierGroup.list)}
            className="text-sm me-4 md:text-base"
            type="button"
          >
            {t('form:button-label-back')}
          </Button>

          <Button
            loading={creating || updating}
            disabled={creating || updating}
            className="text-sm md:text-base"
          >
            {initialValues
              ? t('form:button-label-update') || 'Update Modifier Group'
              : t('form:button-label-add') || 'Add Modifier Group'}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}

