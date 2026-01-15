import Input from '@/components/ui/input';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { ModifierGroup, QuantityLevel, PricesBySize } from '@/types';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { modifierGroupValidationSchema } from './modifier-group-validation-schema';
import {
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
} from '@/data/modifier-group';
import SwitchInput from '@/components/ui/switch-input';
import { TrashIcon } from '@/components/icons/trash';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import cn from 'classnames';

type FormValues = {
  name: string;
  display_type: 'RADIO' | 'CHECKBOX';
  min_select: number;
  max_select: number;
  applies_per_quantity?: boolean;
  quantity_levels?: QuantityLevel[];
  prices_by_size?: PricesBySize[];
  is_active?: boolean;
  sort_order: number;
};

const defaultValues: FormValues = {
  name: '',
  display_type: 'RADIO' as const,
  min_select: 0,
  max_select: 1,
  applies_per_quantity: false,
  quantity_levels: [],
  prices_by_size: [],
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
        quantity_levels: initialValues.quantity_levels?.map(ql => ({
          ...ql,
          name: ql.name ?? undefined,
          display_order: ql.display_order ?? 0,
          price: (ql as any).pivot?.price ?? (ql as any).price ?? 0,
        })) || [],
        prices_by_size: initialValues.prices_by_size || [],
        is_active: initialValues.is_active,
        sort_order: initialValues.sort_order,
      }
      : defaultValues,
    resolver: yupResolver(modifierGroupValidationSchema),
  });

  const {
    fields: quantityLevelFields,
    append: appendQuantityLevel,
    remove: removeQuantityLevel,
  } = useFieldArray({
    control,
    name: 'quantity_levels',
  });

  const {
    fields: priceBySizeFields,
    append: appendPriceBySize,
    remove: removePriceBySize,
  } = useFieldArray({
    control,
    name: 'prices_by_size',
  });

  const displayTypeOptions = [
    { value: 'RADIO', label: `${t('common:text-radio')} (Single Selection)` },
    { value: 'CHECKBOX', label: `${t('common:text-checkbox')} (Multiple Selection)` },
  ];

  const sizeCodeOptions = [
    { value: 'S', label: 'S (Small)' },
    { value: 'M', label: 'M (Medium)' },
    { value: 'L', label: 'L (Large)' },
    { value: 'XL', label: 'XL (Extra Large)' },
    { value: 'XXL', label: 'XXL (Double Extra Large)' },
  ];

  const { mutate: createGroup, isPending: creating } =
    useCreateModifierGroupMutation();
  const { mutate: updateGroup, isPending: updating } =
    useUpdateModifierGroupMutation();

  const minSelect = watch('min_select');
  const isRequired = minSelect > 0;
  const isPending = creating || updating;

  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name,
      display_type: values.display_type,
      min_select: Number(values.min_select),
      max_select: Number(values.max_select),
      applies_per_quantity: values.applies_per_quantity || false,
      quantity_levels: values.quantity_levels || [],
      prices_by_size: values.prices_by_size || [],
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      {/* Sticky Action Header */}
      <div
        className={cn(
          'sticky top-0 z-20 bg-white/95 backdrop-blur-sm',
          'border-b border-border-200 shadow-sm',
          '-mx-5 md:-mx-8 px-5 md:px-8 py-4 mb-6',
          'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'
        )}
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-heading">
            {initialValues
              ? t('form:form-title-edit-modifier-group') || 'Edit Modifier Group'
              : t('form:form-title-create-modifier-group') || 'Create Modifier Group'}
          </h2>
          <p className="text-sm text-body mt-1">
            {t('form:modifier-group-form-subtitle') || 'Configure the modifier group settings'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(Routes.modifierGroup.list)}
            className="flex-1 sm:flex-initial"
            disabled={isPending}
          >
            {t('form:button-label-cancel')}
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={isPending}
            className="flex-1 sm:flex-initial"
          >
            {initialValues
              ? t('form:button-label-update')
              : t('form:button-label-save')}
          </Button>
        </div>
      </div>

      {/* Tabbed Form Content */}
      <Tabs defaultTab="general" className="animate-fade-in">
        {/* Mobile dropdown for tabs */}
        <div className="sm:hidden mb-4">
          <select
            onChange={(e) => {
              const tabButtons = document.querySelectorAll('[role="tab"]');
              tabButtons.forEach((btn) => {
                if (btn.getAttribute('aria-controls') === `tabpanel-${e.target.value}`) {
                  (btn as HTMLButtonElement).click();
                }
              });
            }}
            className="block w-full rounded-md border-border-base py-2.5 pl-3 pr-10 text-base focus:border-accent focus:outline-none focus:ring-accent"
            defaultValue="general"
          >
            <option value="general">{t('form:tab-general') || 'General'}</option>
            <option value="selection">{t('form:tab-selection-rules') || 'Selection Rules'}</option>
            <option value="quantity-levels">
              {t('form:tab-quantity-levels') || 'Quantity Levels'} ({quantityLevelFields.length})
            </option>
            <option value="pricing">
              {t('form:tab-pricing') || 'Pricing by Size'} ({priceBySizeFields.length})
            </option>
          </select>
        </div>

        {/* Desktop tab list */}
        <TabList className="hidden sm:flex">
          <Tab id="general" icon={<GeneralIcon />}>
            {t('form:tab-general') || 'General'}
          </Tab>
          <Tab id="selection" icon={<SelectionIcon />}>
            {t('form:tab-selection-rules') || 'Selection Rules'}
          </Tab>
          <Tab id="quantity-levels" badge={quantityLevelFields.length} icon={<QuantityIcon />}>
            {t('form:tab-quantity-levels') || 'Quantity Levels'}
          </Tab>
          <Tab id="pricing" badge={priceBySizeFields.length} icon={<PricingIcon />}>
            {t('form:tab-pricing') || 'Pricing by Size'}
          </Tab>
        </TabList>

        {/* General Tab */}
        <TabPanel id="general">
          <Card className="animate-slide-up">
            <div className="space-y-5">
              <Input
                label={t('form:input-label-name')}
                {...register('name')}
                error={t(errors.name?.message!)}
                variant="outline"
                placeholder={t('form:input-placeholder-modifier-group-name') || 'e.g., Toppings, Sizes, Extras'}
              />

              <Input
                label={t('form:input-label-sort-order') || 'Sort Order'}
                {...register('sort_order', { valueAsNumber: true })}
                type="number"
                variant="outline"
                error={t(errors.sort_order?.message!)}
                note={t('form:sort-order-note') || 'Lower numbers appear first'}
              />

              <div className="flex items-center gap-6">
                <SwitchInput
                  name="is_active"
                  control={control as any}
                  label={t('form:input-label-is-active') || 'Active'}
                />
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* Selection Rules Tab */}
        <TabPanel id="selection">
          <Card className="animate-slide-up">
            <div className="space-y-5">
              <div>
                <Label>{t('form:input-label-display-type') || 'Display Type'}</Label>
                <p className="text-xs text-gray-500 mb-2">
                  {t('form:display-type-helper') || 'How customers select modifiers from this group'}
                </p>
                <SelectInput
                  name="display_type"
                  control={control as any}
                  options={displayTypeOptions}
                  getOptionLabel={(option: any) => option.label}
                  getOptionValue={(option: any) => option.value}
                />
                <ValidationError message={t(errors.display_type?.message!)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={t('form:input-label-min-select') || 'Minimum Selections'}
                    {...register('min_select', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    variant="outline"
                    error={t(errors.min_select?.message!)}
                  />
                  {isRequired && (
                    <p className="text-xs text-accent mt-1 flex items-center gap-1">
                      <CheckIcon />
                      {t('form:modifier-group-required-note') || 'Group is required'}
                    </p>
                  )}
                  {!isRequired && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('form:modifier-group-optional-note') || 'Set to 0 for optional'}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    label={t('form:input-label-max-select') || 'Maximum Selections'}
                    {...register('max_select', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    variant="outline"
                    error={t(errors.max_select?.message!)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('form:max-select-note') || 'Max items customer can select'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border-100">
                <div className="flex items-start gap-4">
                  <SwitchInput
                    name="applies_per_quantity"
                    control={control as any}
                    label={t('form:input-label-applies-per-quantity') || 'Applies Per Quantity'}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-11">
                  {t('form:applies-per-quantity-helper') || 'If enabled, modifier pricing applies per item quantity (e.g., $0.50 extra cheese × 2 pizzas = $1.00)'}
                </p>
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* Quantity Levels Tab */}
        <TabPanel id="quantity-levels">
          <Card className="animate-slide-up">
            <div className="mb-6">
              <h3 className="text-base font-medium text-heading mb-2">
                {t('form:input-label-quantity-levels') || 'Quantity Levels'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('form:quantity-levels-group-helper-text') || 'Define default quantity levels for ALL modifiers in this group. These levels (e.g., Light, Normal, Extra) will be available for all modifiers.'}
              </p>
            </div>

            {quantityLevelFields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border-200 rounded-lg">
                <QuantityIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-4">
                  {t('form:no-quantity-levels') || 'No quantity levels defined yet'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendQuantityLevel({
                    quantity: 1,
                    name: '',
                    display_order: 0,
                    is_default: false,
                    is_active: true,
                  })}
                >
                  {t('form:button-label-add-quantity-level') || 'Add Quantity Level'}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {quantityLevelFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border border-border-200 rounded-lg bg-gray-50 hover:border-border-base transition-colors"
                    >
                      {/* Mobile layout */}
                      <div className="sm:hidden space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-heading">
                            Level {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuantityLevel(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <Input
                          label={t('form:input-label-name') || 'Name'}
                          {...register(`quantity_levels.${index}.name` as const)}
                          variant="outline"
                          placeholder="e.g., Light, Normal, Extra"
                          error={t(errors.quantity_levels?.[index]?.name?.message!)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label={t('form:input-label-quantity') || 'Qty'}
                            {...register(`quantity_levels.${index}.quantity` as const, { valueAsNumber: true })}
                            type="number"
                            min="1"
                            variant="outline"
                            error={t(errors.quantity_levels?.[index]?.quantity?.message!)}
                          />
                          <Input
                            label={t('form:input-label-display-order') || 'Order'}
                            {...register(`quantity_levels.${index}.display_order` as const, { valueAsNumber: true })}
                            type="number"
                            min="0"
                            variant="outline"
                            error={t(errors.quantity_levels?.[index]?.display_order?.message!)}
                          />
                        </div>
                        <div className="flex items-center gap-6">
                          <SwitchInput
                            name={`quantity_levels.${index}.is_default`}
                            control={control}
                            label={t('form:input-label-default') || 'Default'}
                          />
                          <SwitchInput
                            name={`quantity_levels.${index}.is_active`}
                            control={control}
                            label={t('form:input-label-active') || 'Active'}
                          />
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden sm:grid sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-2">
                          <Input
                            label={t('form:input-label-quantity') || 'Quantity'}
                            {...register(`quantity_levels.${index}.quantity` as const, { valueAsNumber: true })}
                            type="number"
                            min="1"
                            error={t(errors.quantity_levels?.[index]?.quantity?.message!)}
                            variant="outline"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <Input
                            label={t('form:input-label-name') || 'Name'}
                            {...register(`quantity_levels.${index}.name` as const)}
                            type="text"
                            error={t(errors.quantity_levels?.[index]?.name?.message!)}
                            variant="outline"
                            placeholder="e.g., Light, Normal, Extra"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            label={t('form:input-label-display-order') || 'Order'}
                            {...register(`quantity_levels.${index}.display_order` as const, { valueAsNumber: true })}
                            type="number"
                            min="0"
                            error={t(errors.quantity_levels?.[index]?.display_order?.message!)}
                            variant="outline"
                          />
                        </div>
                        <div className="sm:col-span-3 flex items-center gap-4 pt-7">
                          <SwitchInput
                            name={`quantity_levels.${index}.is_default`}
                            control={control}
                            label={t('form:input-label-default') || 'Default'}
                          />
                          <SwitchInput
                            name={`quantity_levels.${index}.is_active`}
                            control={control}
                            label={t('form:input-label-active') || 'Active'}
                          />
                        </div>
                        <div className="sm:col-span-1 flex items-center pt-7">
                          <button
                            type="button"
                            onClick={() => removeQuantityLevel(index)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 -m-2"
                            title={t('common:text-delete')}
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
                  onClick={() => appendQuantityLevel({
                    quantity: quantityLevelFields.length + 1,
                    name: '',
                    display_order: quantityLevelFields.length,
                    is_default: false,
                    is_active: true,
                  })}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {t('form:button-label-add-quantity-level') || 'Add Quantity Level'}
                </Button>
              </>
            )}
          </Card>
        </TabPanel>

        {/* Pricing by Size Tab */}
        <TabPanel id="pricing">
          <Card className="animate-slide-up">
            <div className="mb-6">
              <h3 className="text-base font-medium text-heading mb-2">
                {t('form:input-label-pricing-by-size') || 'Pricing by Size'}
              </h3>
              <p className="text-sm text-gray-600">
                {t('form:pricing-by-size-group-helper-text') || 'Define default price deltas by size for ALL modifiers in this group. These prices will be applied to all modifiers.'}
              </p>
            </div>

            {priceBySizeFields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border-200 rounded-lg">
                <PricingIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-4">
                  {t('form:no-pricing-by-size') || 'No size-based pricing defined yet'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendPriceBySize({
                    sizeCode: 'M',
                    priceDelta: 0,
                  })}
                >
                  {t('form:button-label-add-price-by-size') || 'Add Price by Size'}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {priceBySizeFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border border-border-200 rounded-lg bg-gray-50 hover:border-border-base transition-colors"
                    >
                      {/* Mobile layout */}
                      <div className="sm:hidden space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-heading">
                            Size Pricing {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePriceBySize(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <div>
                          <Label>{t('form:input-label-size-code') || 'Size Code'}</Label>
                          <SelectInput
                            name={`prices_by_size.${index}.sizeCode`}
                            control={control}
                            options={sizeCodeOptions}
                            getOptionLabel={(option: any) => option.label}
                            getOptionValue={(option: any) => option.value}
                          />
                          <ValidationError message={t(errors.prices_by_size?.[index]?.sizeCode?.message!)} />
                        </div>
                        <Input
                          label={t('form:input-label-price-delta') || 'Price Delta'}
                          {...register(`prices_by_size.${index}.priceDelta` as const, { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          variant="outline"
                          placeholder="0.00"
                          error={t(errors.prices_by_size?.[index]?.priceDelta?.message!)}
                          note={t('form:price-delta-helper') || 'Price difference from base (can be negative)'}
                        />
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden sm:grid sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-4">
                          <Label>{t('form:input-label-size-code') || 'Size Code'}</Label>
                          <SelectInput
                            name={`prices_by_size.${index}.sizeCode`}
                            control={control}
                            options={sizeCodeOptions}
                            getOptionLabel={(option: any) => option.label}
                            getOptionValue={(option: any) => option.value}
                          />
                          <ValidationError message={t(errors.prices_by_size?.[index]?.sizeCode?.message!)} />
                        </div>
                        <div className="sm:col-span-7">
                          <Input
                            label={t('form:input-label-price-delta') || 'Price Delta'}
                            {...register(`prices_by_size.${index}.priceDelta` as const, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            error={t(errors.prices_by_size?.[index]?.priceDelta?.message!)}
                            variant="outline"
                            placeholder="0.00"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {t('form:price-delta-helper') || 'Price difference from base price (can be negative)'}
                          </p>
                        </div>
                        <div className="sm:col-span-1 flex items-center pt-7">
                          <button
                            type="button"
                            onClick={() => removePriceBySize(index)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 -m-2"
                            title={t('common:text-delete')}
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
                  onClick={() => appendPriceBySize({
                    sizeCode: 'M',
                    priceDelta: 0,
                  })}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {t('form:button-label-add-price-by-size') || 'Add Price by Size'}
                </Button>
              </>
            )}
          </Card>
        </TabPanel>
      </Tabs>
    </form>
  );
}

// Simple inline icons for tabs
function GeneralIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SelectionIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function QuantityIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function PricingIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
