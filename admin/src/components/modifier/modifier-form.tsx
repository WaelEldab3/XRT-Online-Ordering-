import Input from '@/components/ui/input';
import { useForm, useWatch } from 'react-hook-form';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modifier } from '@/types';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import SwitchInput from '@/components/ui/switch-input';
import {
  useCreateModifierMutation,
  useUpdateModifierMutation,
} from '@/data/modifier';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { EditIcon } from '@/components/icons/edit';
import Label from '@/components/ui/label';
import * as yup from 'yup';

type FormValues = {
  name: string;
  is_default?: boolean;
  max_quantity?: number | null;
  display_order: number;
  is_active?: boolean;
  sides_config?: {
    enabled?: boolean;
    allowed_sides?: string[];
  };
};

const modifierValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  is_default: yup.boolean().optional(),
  max_quantity: yup
    .number()
    .transform((value) => (isNaN(value) || value === null || value === '') ? undefined : value)
    .nullable()
    .optional()
    .min(1, 'form:error-max-quantity-min'),
  display_order: yup
    .number()
    .transform((value) => (isNaN(value) || value === null || value === '') ? 0 : value)
    .required('form:error-display-order-required')
    .min(0, 'form:error-display-order-min'),
  is_active: yup.boolean().optional(),
  sides_config: yup.object().shape({
    enabled: yup.boolean().optional(),
    allowed_sides: yup.array().of(yup.string().required()).optional(),
  }).optional(),
});

const defaultValues: FormValues = {
  name: '',
  is_default: false,
  max_quantity: undefined,
  display_order: 0,
  is_active: true,
  sides_config: {
    enabled: false,
    allowed_sides: [],
  },
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
  const { mutate: createModifier, isPending: creating } = useCreateModifierMutation();
  const { mutate: updateModifier, isPending: updating } = useUpdateModifierMutation();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(modifierValidationSchema),
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          is_default: initialValues.is_default,
          max_quantity: initialValues.max_quantity,
          display_order: initialValues.display_order,
          is_active: initialValues.is_active,
        }
      : defaultValues,
  });

  const allowedSides = useWatch({
    control,
    name: 'sides_config.allowed_sides',
    defaultValue: [],
  }) || [];

  const sidesEnabled = useWatch({
    control,
    name: 'sides_config.enabled',
    defaultValue: false,
  });

  const toggleSide = (side: string) => {
    const currentSides = allowedSides || [];
    const newSides = currentSides.includes(side)
      ? currentSides.filter(s => s !== side)
      : [...currentSides, side];
    setValue('sides_config.allowed_sides', newSides);
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    const input: any = {
      modifier_group_id: modifierGroupId,
      name: values.name,
      is_default: values.is_default || false,
      max_quantity: values.max_quantity || undefined,
      display_order: values.display_order || 0,
      is_active: values.is_active !== undefined ? values.is_active : true,
    };

    // Include sides_config only if enabled
    if (values.sides_config?.enabled) {
      input.sides_config = {
        enabled: true,
        allowed_sides: values.sides_config.allowed_sides || [],
      };
    } else {
      // If disabled, don't send sides_config or send it as disabled
      input.sides_config = {
        enabled: false,
        allowed_sides: [],
      };
    }

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
  };

  const isLoading = creating || updating;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information') || 'Modifier Information'}
          details={
            t('form:modifier-info-helper-text') || 
            'Configure basic modifier settings. Note: Pricing, quantity levels, and selection rules are managed at the Modifier Group level and will automatically apply to this modifier.'
          }
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{t('form:modifier-group-settings-note') || 'Note:'}</strong>{' '}
              {t('form:modifier-group-settings-note-text') || 
                'All pricing, quantity levels, and selection rules are configured at the Modifier Group level. These settings automatically apply to all modifiers in the group.'}
            </p>
          </div>

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
            <p className="text-xs text-gray-500 mt-1">
              {t('form:default-modifier-helper') || 'Mark this modifier as the default selection for the group'}
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
            <p className="text-xs text-gray-500 mt-1">
              {t('form:max-quantity-help-text') || 'Set maximum quantity allowed for this specific modifier (optional)'}
            </p>
          </div>

          <div className="mb-5">
            <Input
              label={t('form:input-label-display-order') || 'Display Order'}
              {...register('display_order', {
                valueAsNumber: true,
              })}
              type="number"
              min="0"
              error={t(errors.display_order?.message!)}
              variant="outline"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('form:display-order-helper') || 'Order in which this modifier appears in the list'}
            </p>
          </div>

          <div className="mb-5">
            <SwitchInput
              name="is_active"
              control={control}
              label={t('form:input-label-active') || 'Active'}
            />
          </div>

          <div className="mb-5 p-4 border border-border-200 rounded-lg bg-gray-50">
            <div className="mb-3">
              <SwitchInput
                name="sides_config.enabled"
                control={control}
                label={t('form:input-label-enable-sides') || 'Enable Sides Configuration'}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('form:sides-config-helper') || 'Allow customers to select sides (LEFT, RIGHT, WHOLE) for this modifier'}
              </p>
            </div>
            {sidesEnabled && (
              <div className="mt-4 space-y-3">
                <Label className="mb-3 block text-sm font-medium">
                  {t('form:input-label-allowed-sides') || 'Allowed Sides'}
                </Label>
                {['LEFT', 'RIGHT', 'WHOLE'].map((side) => (
                  <div key={side} className="flex items-center justify-between">
                    <Label className="text-sm text-body">
                      {t(`form:input-label-side-${side.toLowerCase()}`) || side}
                    </Label>
                    <input
                      type="checkbox"
                      checked={allowedSides.includes(side)}
                      onChange={() => toggleSide(side)}
                      className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

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
