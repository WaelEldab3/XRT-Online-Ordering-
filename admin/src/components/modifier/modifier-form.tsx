import Input from '@/components/ui/input';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modifier, QuantityLevel } from '@/types';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import SwitchInput from '@/components/ui/switch-input';
import {
  useCreateModifierMutation,
  useUpdateModifierMutation,
} from '@/data/modifier';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { LongArrowPrev } from '@/components/icons/long-arrow-prev';
import { EditIcon } from '@/components/icons/edit';
import { TrashIcon } from '@/components/icons/trash';
import { useState, useEffect } from 'react';
import * as yup from 'yup';

type FormValues = {
  name: string;
  is_default?: boolean;
  price?: number;
  max_quantity?: number;
  quantity_levels?: QuantityLevel[];
  is_active?: boolean;
  sort_order: number;
};

const modifierValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  is_default: yup.boolean(),
  price: yup
    .number()
    .transform((value) => (isNaN(value) || value === null || value === '') ? undefined : value)
    .nullable()
    .min(0, 'form:error-price-must-positive'),
  max_quantity: yup
    .number()
    .transform((value) => (isNaN(value) || value === null || value === '') ? undefined : value)
    .nullable()
    .min(1, 'form:error-max-quantity-min'),
  quantity_levels: yup.array().of(
    yup.object().shape({
      quantity: yup.number().required().min(1, 'form:error-quantity-min'),
      name: yup.string().nullable(),
      price: yup.number().required().min(0, 'form:error-price-must-positive'),
    })
  ),
  is_active: yup.boolean(),
  sort_order: yup.number().nullable(),
});

const defaultValues: FormValues = {
  name: '',
  is_default: false,
  price: undefined,
  max_quantity: undefined,
  quantity_levels: [],
  is_active: true,
  sort_order: 0,
};

type IProps = {
  initialValues?: Modifier | undefined;
  modifierGroupId: string;
  onSuccess?: () => void;
};

export default function CreateOrUpdateModifierForm({
  initialValues,
  modifierGroupId,
  onSuccess,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: createModifier, isLoading: creating } = useCreateModifierMutation();
  const { mutate: updateModifier, isLoading: updating } = useUpdateModifierMutation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(modifierValidationSchema),
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          is_default: initialValues.is_default,
          max_quantity: initialValues.max_quantity,
          price: initialValues.price,
          quantity_levels: initialValues.quantity_levels || [],
          is_active: initialValues.is_active,
          sort_order: initialValues.sort_order,
        }
      : defaultValues,
  });

  const [hasQuantityLevels, setHasQuantityLevels] = useState(
    initialValues?.quantity_levels && initialValues.quantity_levels.length > 0
  );

  const maxQuantity = useWatch({
    control,
    name: 'max_quantity',
    defaultValue: undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'quantity_levels',
  });

  // Clear quantity levels when toggle is turned off
  useEffect(() => {
    if (!hasQuantityLevels && fields.length > 0) {
      const indices = fields.map((_, idx) => idx).reverse();
      indices.forEach(idx => remove(idx));
    }
  }, [hasQuantityLevels, fields.length, remove]);

  const onSubmit = async (values: FormValues) => {
    const input = {
      modifier_group_id: modifierGroupId,
      name: values.name,
      is_default: values.is_default || false,
      price: values.price || undefined,
      max_quantity: values.max_quantity || undefined,
      quantity_levels: hasQuantityLevels && values.quantity_levels && values.quantity_levels.length > 0
        ? values.quantity_levels
        : undefined,
      is_active: values.is_active !== undefined ? values.is_active : true,
      sort_order: values.sort_order || 0,
    };

    try {
      if (!initialValues) {
        createModifier(input, {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            } else {
              router.push(Routes.modifierGroup.details(modifierGroupId));
            }
          },
        });
      } else {
        updateModifier(
          {
            id: initialValues.id,
            ...input,
          },
          {
            onSuccess: () => {
              if (onSuccess) {
                onSuccess();
              } else {
                router.push(Routes.modifierGroup.details(modifierGroupId));
              }
            },
          }
        );
      }
    } catch (error) {
      console.error('Error submitting modifier:', error);
    }
  };

  const isLoading = creating || updating;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information') || 'Information'}
          details={
            initialValues
              ? t('form:item-description-update') || 'Update modifier information'
              : t('form:item-description-add') || 'Add new modifier information'
          }
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name') || 'Name'}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
            required
          />

          <div className="mb-5">
            <SwitchInput
              name="is_default"
              control={control}
              label={t('form:input-label-default') || 'Default'}
            />
          </div>

          <div className="mb-5">
            <Input
              label={t('form:input-label-price') || 'Price'}
              {...register('price', {
                valueAsNumber: true,
              })}
              type="number"
              step="0.01"
              min="0"
              error={t(errors.price?.message!)}
              variant="outline"
              placeholder={t('form:input-placeholder-price') || '0.00'}
            />
            <p className="mt-2 text-xs text-gray-500">
              {t('form:price-help-text') || 'Set the base price for this modifier'}
            </p>
          </div>

          <div className="mb-5">
            <Input
              label={t('form:input-label-max-quantity') || 'Max Quantity'}
              {...register('max_quantity', {
                valueAsNumber: true,
              })}
              type="number"
              min="1"
              error={t(errors.max_quantity?.message!)}
              variant="outline"
              placeholder={t('form:input-placeholder-max-quantity') || 'Leave empty if no quantity limit'}
            />
            <p className="mt-2 text-xs text-gray-500">
              {t('form:max-quantity-help-text') || 'Set maximum quantity allowed for this modifier'}
            </p>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between">
              <Label className="mb-0">
                {t('form:input-label-has-quantity-levels') || 'Enable Quantity Levels'}
              </Label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasQuantityLevels}
                  onChange={(e) => {
                    setHasQuantityLevels(e.target.checked);
                    if (!e.target.checked && fields.length > 0) {
                      // Clear all quantity levels when toggle is turned off
                      const indices = fields.map((_, idx) => idx).reverse();
                      indices.forEach(idx => remove(idx));
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {t('form:has-quantity-levels-help-text') || 'Enable to set different prices for different quantity levels'}
            </p>
          </div>

          <div className="mb-5">
            <SwitchInput
              name="is_active"
              control={control}
              label={t('form:input-label-active') || 'Active'}
            />
          </div>

          <Input
            label={t('form:input-label-sort-order') || 'Sort Order'}
            {...register('sort_order', {
              valueAsNumber: true,
            })}
            type="number"
            error={t(errors.sort_order?.message!)}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

      {/* Quantity Levels Section - Only show if toggle is enabled */}
      {hasQuantityLevels && (
        <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
          <Description
            title={t('form:input-label-quantity-levels') || 'Quantity Levels'}
            details={t('form:quantity-levels-help-text') || 'Set prices for different quantity levels'}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />
          <Card className="w-full sm:w-8/12 md:w-2/3">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-border-200 rounded-lg"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <Input
                        label={t('form:input-label-quantity') || 'Quantity'}
                        {...register(`quantity_levels.${index}.quantity` as const, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="1"
                        error={t(errors.quantity_levels?.[index]?.quantity?.message!)}
                        variant="outline"
                        placeholder="1"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        label={t('form:input-label-name') || 'Name'}
                        {...register(`quantity_levels.${index}.name` as const)}
                        type="text"
                        error={t(errors.quantity_levels?.[index]?.name?.message!)}
                        variant="outline"
                        placeholder={t('form:input-placeholder-quantity-level-name') || 'e.g., Small, Medium, Large'}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        label={t('form:input-label-price') || 'Price'}
                        {...register(`quantity_levels.${index}.price` as const, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        error={t(errors.quantity_levels?.[index]?.price?.message!)}
                        variant="outline"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={() => append({ quantity: fields.length + 1, name: '', price: 0 })}
              variant="outline"
              className="w-full sm:w-auto mt-4"
            >
              {t('form:button-label-add-quantity-level') || 'Add Quantity Level'}
            </Button>
            {fields.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">
                {t('form:no-quantity-levels') || 'Click "Add Quantity Level" to add quantity levels with custom prices.'}
              </p>
            )}
          </Card>
        </div>
      )}

      <StickyFooterPanel className="z-0">
        <div className="text-end">
          <Button
            variant="outline"
            onClick={() => {
              if (onSuccess) {
                onSuccess();
              } else {
                router.push(Routes.modifierGroup.details(modifierGroupId));
              }
            }}
            className="text-sm me-4 md:ms-0"
          >
            {t('form:button-label-cancel') || 'Cancel'}
          </Button>
          <Button
            loading={isLoading}
            disabled={isLoading}
            className="text-sm"
          >
            {initialValues ? (
              <>
                <EditIcon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:pl-2" />
                <span className="sm:hidden">
                  {t('form:button-label-update')}
                </span>
                <span className="hidden sm:block">
                  {t('form:button-label-update-modifier') || 'Update Modifier'}
                </span>
              </>
            ) : (
              t('form:button-label-add-modifier') || 'Add Modifier'
            )}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}

