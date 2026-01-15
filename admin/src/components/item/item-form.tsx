import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useForm, FormProvider, Controller, useFieldArray, useWatch } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import { itemValidationSchema } from './item-validation-schema';
import { Item, CreateItemInput, UpdateItemInput, ItemSize, ItemModifierAssignment, ItemModifierGroupAssignment } from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import Alert from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { getErrorMessage } from '@/utils/form-error';
import {
    useCreateItemMutation,
    useUpdateItemMutation,
} from '@/data/item';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { LongArrowPrev } from '@/components/icons/long-arrow-prev';
import { EditIcon } from '@/components/icons/edit';
import SelectInput from '@/components/ui/select-input';
import { useCategoriesQuery } from '@/data/category';
import SwitchInput from '@/components/ui/switch-input';
import { TrashIcon } from '@/components/icons/trash';
import { useModifierGroupsQuery } from '@/data/modifier-group';
import { useModifiersQuery } from '@/data/modifier';
import { getModifiersByGroupId } from '@/data/mock/modifiers';
import ItemSizesManager from './item-sizes-manager';
import { useItemSizesQuery } from '@/data/item-size';

// Default quantity levels for all modifiers
const DEFAULT_QUANTITY_LEVELS = [
    { quantity: 1, name: 'Light' },
    { quantity: 2, name: 'Normal' },
    { quantity: 3, name: 'Extra' },
];

type ItemFormProps = {
    initialValues?: Item | null;
};

type FormValues = {
    name: string;
    description?: string;
    base_price?: number; // Used ONLY if is_sizeable = false
    category: any;
    image?: any;
    sort_order?: number | null;
    max_per_order?: number | null;
    is_active?: boolean;
    is_available?: boolean;
    is_signature?: boolean;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    default_size_id?: string | null; // FK to ItemSize.id, required if is_sizeable = true
    sizes?: ItemSize[]; // Legacy - kept for backward compatibility
    modifier_groups?: ItemModifierGroupAssignment[]; // Updated to match backend
    modifier_assignment?: ItemModifierAssignment; // Legacy - kept for backward compatibility
    apply_sides?: boolean;
    sides?: {
        both?: boolean;
        left?: boolean;
        right?: boolean;
    };
};

const defaultValues: FormValues = {
    name: '',
    description: '',
    base_price: 0,
    category: null,
    image: '',
    sort_order: 0,
    max_per_order: 0,
    is_active: true,
    is_available: true,
    is_signature: false,
    is_sizeable: false,
    is_customizable: false,
    sizes: [],
    modifier_assignment: {
        modifier_groups: [],
        default_modifiers: [],
        assignment_scope: 'ITEM' as const,
    },
};

export default function CreateOrUpdateItemForm({
    initialValues,
}: ItemFormProps) {
    const router = useRouter();
    const { query, locale } = router;
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { t } = useTranslation();

    const { data: shopData } = useShopQuery(
        { slug: router.query.shop as string },
        {
            enabled: !!router.query.shop,
        },
    );
    const shopId = (shopData as any)?.id!;

    const methods = useForm<FormValues>({
        resolver: yupResolver(itemValidationSchema),
        shouldUnregister: true,
        defaultValues: initialValues
            ? {
                ...initialValues,
                category: initialValues.category,
                sizes: initialValues.sizes || [],
                // If item has sizes, automatically set is_sizeable to true
                is_sizeable: initialValues.is_sizeable || (initialValues.sizes && initialValues.sizes.length > 0) || false,
                is_customizable: initialValues.is_customizable || false,
                modifier_assignment: initialValues.modifier_assignment || {
                    modifier_groups: [],
                    default_modifiers: [],
                    assignment_scope: 'ITEM' as const,
                },
                apply_sides: initialValues.apply_sides || false,
                sides: initialValues.sides || {
                    both: false,
                    left: false,
                    right: false,
                },
            }
            : defaultValues,
    });

    // Reset form when initialValues change (e.g., after update)
    useEffect(() => {
        if (initialValues) {
            const formValues: FormValues = {
                ...initialValues,
                category: initialValues.category,
                sizes: initialValues.sizes || [], // Legacy - kept for backward compatibility
                // If item has sizes or default_size_id, automatically set is_sizeable to true
                is_sizeable: initialValues.is_sizeable || !!initialValues.default_size_id || false,
                default_size_id: initialValues.default_size_id || null,
                is_customizable: initialValues.is_customizable || false,
                modifier_groups: initialValues.modifier_groups || [],
                modifier_assignment: initialValues.modifier_assignment || {
                    modifier_groups: [],
                    default_modifiers: [],
                    assignment_scope: 'ITEM' as const,
                },
            };
            // Reset the form with new values
            methods.reset(formValues, { 
                keepDefaultValues: false,
                keepValues: false,
                keepDirty: false,
                keepIsSubmitted: false,
                keepTouched: false,
                keepIsValid: false,
                keepSubmitCount: false,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.id, initialValues?.default_size_id, initialValues?.is_sizeable, initialValues?.is_customizable, initialValues?.updated_at]);

    const {
        register,
        handleSubmit,
        control,
        setError,
        watch,
        setValue,
        formState: { errors },
    } = methods;

    const isSizeable = useWatch({
        control,
        name: 'is_sizeable',
        defaultValue: false,
    });

    const defaultSizeId = useWatch({
        control,
        name: 'default_size_id',
        defaultValue: null,
    });

    // Fetch item sizes if editing and item is sizeable
    const { sizes: itemSizes } = useItemSizesQuery(
        initialValues?.id || '',
        shopId,
        { enabled: !!initialValues?.id && isSizeable }
    );

    // Auto-set is_sizeable to true if item has default_size_id when editing
    useEffect(() => {
        if (initialValues && initialValues.default_size_id && !isSizeable) {
            setValue('is_sizeable', true, { shouldValidate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.id, initialValues?.default_size_id, isSizeable]);

    const { mutate: createItem, isPending: creating } = useCreateItemMutation();
    const { mutate: updateItem, isPending: updating } = useUpdateItemMutation();

    const { categories, loading: loadingCategories } = useCategoriesQuery({
        limit: 1000,
        language: locale,
        type: 'all', // Adjust type if needed
    });

    // Fetch modifier groups for selection
    const { groups: modifierGroups, loading: loadingModifierGroups } = useModifierGroupsQuery({
        limit: 1000,
        language: locale,
        is_active: true,
    });

    const onSubmit = async (values: any) => {
        let basePrice: number | undefined = undefined;
        
        // Pricing logic:
        // - If is_sizeable = false: base_price is required and used
        // - If is_sizeable = true: base_price is ignored, default_size_id is required
        if (!values.is_sizeable) {
            basePrice = values.base_price ?? 0;
            if (!basePrice || basePrice <= 0) {
                setError('base_price', {
                    type: 'manual',
                    message: t('form:error-base-price-required') || 'Base price is required for non-sizeable items',
                });
                return;
            }
        } else {
            // For sizeable items, base_price is ignored
            basePrice = 0; // Backend expects 0 when is_sizeable = true
            if (!values.default_size_id) {
                setError('default_size_id', {
                    type: 'manual',
                    message: t('form:error-default-size-required') || 'Default size is required for sizeable items',
                });
                return;
            }
        }

        // Transform modifier assignment data
        let modifierAssignment = undefined;
        if (values.modifier_assignment) {
            const selectedGroups = values.modifier_assignment.modifier_groups || [];
            const selectedDefaultModifiers = values.modifier_assignment.default_modifiers || [];
            const modifierPricesBySize = values.modifier_assignment.modifier_prices_by_size || {};
            const modifierPricesBySizeAndQuantity = values.modifier_assignment.modifier_prices_by_size_and_quantity || {};
            
            if (selectedGroups.length > 0 || selectedDefaultModifiers.length > 0 || Object.keys(modifierPricesBySize).length > 0 || Object.keys(modifierPricesBySizeAndQuantity).length > 0) {
                // Transform groups from objects to ItemModifierGroupAssignment format
                const modifierGroups = Array.isArray(selectedGroups) 
                    ? selectedGroups.map((group: any, index: number) => ({
                        modifier_group_id: typeof group === 'string' ? group : group.id,
                        display_order: index + 1,
                    }))
                    : [];
                
                // Transform default modifiers to IDs (strings)
                const defaultModifiers = Array.isArray(selectedDefaultModifiers)
                    ? selectedDefaultModifiers.map((modifier: any) => 
                        typeof modifier === 'string' ? modifier : modifier.id
                    )
                    : [];
                
                // Transform modifier prices by size and quantity levels
                // Format: { modifierId: { sizeName: { quantity: price } } } or { modifierId: { sizeName: price } }
                const pricesBySize: any = {};
                const pricesBySizeAndQuantity: any = {};
                
                if (values.is_sizeable && itemSizes && itemSizes.length > 0) {
                    // Handle modifiers with quantity levels: modifier_prices_by_size_and_quantity[modifierId][sizeName][quantity]
                    Object.keys(modifierPricesBySizeAndQuantity).forEach((modifierId) => {
                        const modifierPriceData = modifierPricesBySizeAndQuantity[modifierId];
                        if (modifierPriceData && typeof modifierPriceData === 'object') {
                            const sizePrices: any = {};
                            Object.keys(modifierPriceData).forEach((sizeName) => {
                                const quantityPrices = modifierPriceData[sizeName];
                                if (quantityPrices && typeof quantityPrices === 'object') {
                                    // Has quantity levels
                                    const qtyPriceMap: any = {};
                                    Object.keys(quantityPrices).forEach((quantity) => {
                                        const price = quantityPrices[quantity];
                                        if (price !== undefined && price !== null && price !== '') {
                                            const numPrice = Number(price);
                                            if (!isNaN(numPrice)) {
                                                qtyPriceMap[quantity] = numPrice;
                                            }
                                        }
                                    });
                                    if (Object.keys(qtyPriceMap).length > 0) {
                                        sizePrices[sizeName] = qtyPriceMap;
                                    }
                                }
                            });
                            if (Object.keys(sizePrices).length > 0) {
                                pricesBySizeAndQuantity[modifierId] = sizePrices;
                            }
                        }
                    });

                    // Handle modifiers without quantity levels: modifier_prices_by_size[modifierId][sizeName]
                    Object.keys(modifierPricesBySize).forEach((modifierId) => {
                        // Only process if not already in pricesBySizeAndQuantity
                        if (!pricesBySizeAndQuantity[modifierId]) {
                            const modifierPriceData = modifierPricesBySize[modifierId];
                            if (modifierPriceData && typeof modifierPriceData === 'object') {
                                const sizePrices: any = {};
                                Object.keys(modifierPriceData).forEach((sizeName) => {
                                    const price = modifierPriceData[sizeName];
                                    if (price !== undefined && price !== null && price !== '') {
                                        const numPrice = Number(price);
                                        if (!isNaN(numPrice)) {
                                            sizePrices[sizeName] = numPrice;
                                        }
                                    }
                                });
                                if (Object.keys(sizePrices).length > 0) {
                                    pricesBySize[modifierId] = sizePrices;
                                }
                            }
                        }
                    });
                }
                
                modifierAssignment = {
                    modifier_groups: modifierGroups,
                    default_modifiers: defaultModifiers,
                    assignment_scope: values.modifier_assignment.assignment_scope || 'ITEM',
                    modifier_prices_by_size: Object.keys(pricesBySize).length > 0 ? pricesBySize : undefined,
                    modifier_prices_by_size_and_quantity: Object.keys(pricesBySizeAndQuantity).length > 0 ? pricesBySizeAndQuantity : undefined,
                };
            }
        }

        const inputValues: CreateItemInput = {
            name: values.name,
            description: values.description,
            base_price: basePrice,
            category_id: values.category?.id,
            sort_order: values.sort_order ?? undefined,
            max_per_order: values.max_per_order ?? undefined,
            is_active: values.is_active,
            is_available: values.is_available,
            is_signature: values.is_signature,
            is_sizeable: values.is_sizeable ?? false,
            is_customizable: values.is_customizable ?? false,
            default_size_id: values.is_sizeable ? values.default_size_id : null,
            // Legacy sizes array - kept for backward compatibility but not used if using ItemSize API
            sizes: undefined,
            // Updated modifier_groups structure
            modifier_groups: values.modifier_groups || modifierAssignment?.modifier_groups?.map((mg: any) => ({
                modifier_group_id: typeof mg === 'string' ? mg : mg.modifier_group_id || mg.id,
                display_order: mg.display_order || 1,
                modifier_overrides: mg.modifier_overrides,
            })),
            // Legacy modifier_assignment - kept for backward compatibility
            modifier_assignment: modifierAssignment,
            image: values.image,
            business_id: shopId,
        };

        try {
            if (!initialValues) {
                createItem(inputValues);
            } else {
                updateItem({
                    ...inputValues,
                    id: initialValues.id,
                });
            }
        } catch (error) {
            const serverErrors = getErrorMessage(error);
            Object.keys(serverErrors?.validation).forEach((field: any) => {
                setError(field.split('.')[1], {
                    type: 'manual',
                    message: serverErrors?.validation[field][0],
                });
            });
        }
    };

    return (
        <>
            {errorMessage ? (
                <Alert
                    message={t(`common:${errorMessage}`)}
                    variant="error"
                    closeable={true}
                    className="mt-5"
                    onClose={() => setErrorMessage(null)}
                />
            ) : null}
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                        <Description
                            title={t('form:item-description')}
                            details={`${initialValues
                                ? t('form:item-description-edit')
                                : t('form:item-description-add')
                                }`}
                            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                        />

                        <Card className="w-full sm:w-8/12 md:w-2/3">
                            <Input
                                label={`${t('form:input-label-name')}*`}
                                {...register('name')}
                                error={t(errors.name?.message!)}
                                variant="outline"
                                placeholder={t('form:input-placeholder-item-name') || 'Enter item name'}
                                className="mb-5"
                            />

                            <TextArea
                                label={t('form:input-label-description')}
                                {...register('description')}
                                error={t(errors.description?.message!)}
                                variant="outline"
                                className="mb-5"
                            />

                            <div className="mb-5">
                                <SwitchInput 
                                    name="is_sizeable" 
                                    control={control} 
                                    label={t('form:input-label-sizeable')} 
                                />
                            </div>

                            {!isSizeable && (
                                <Input
                                    label={`${t('form:input-label-base-price')}*`}
                                    {...register('base_price')}
                                    type="number"
                                    error={t(errors.base_price?.message!)}
                                    variant="outline"
                                    className="mb-5"
                                />
                            )}

                            {isSizeable && (
                                <div className="mb-5">
                                    <Description
                                        title={t('form:input-label-sizes')}
                                        details={t('form:item-sizes-help-text') || 'Manage item sizes. At least one size is required, and you must select a default size.'}
                                        className="mb-4"
                                    />
                                    {initialValues?.id ? (
                                        <ItemSizesManager
                                            itemId={initialValues.id}
                                            businessId={shopId}
                                            defaultSizeId={defaultSizeId || undefined}
                                            onDefaultSizeChange={(sizeId) => {
                                                setValue('default_size_id', sizeId, { shouldValidate: true });
                                            }}
                                        />
                                    ) : (
                                        <Alert
                                            message={t('form:save-item-first-to-manage-sizes') || 'Please save the item first to manage sizes.'}
                                            variant="info"
                                        />
                                    )}
                                    {errors.default_size_id && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {t(errors.default_size_id.message!)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mb-5">
                                <Label>{t('form:input-label-category')}*</Label>
                                <SelectInput
                                    name="category"
                                    control={control}
                                    getOptionLabel={(option: any) => option.name}
                                    getOptionValue={(option: any) => option.id}
                                    options={categories}
                                    isLoading={loadingCategories}
                                />
                                {errors.category?.message && (
                                    <p className="my-2 text-xs text-red-500">
                                        {t(errors.category.message)}
                                    </p>
                                )}
                            </div>

                            <Input
                                label={t('form:input-label-sort-order')}
                                {...register('sort_order')}
                                type="number"
                                error={t(errors.sort_order?.message!)}
                                variant="outline"
                                className="mb-5"
                            />

                            <Input
                                label={t('form:input-label-max-per-order')}
                                {...register('max_per_order')}
                                type="number"
                                error={t(errors.max_per_order?.message!)}
                                variant="outline"
                                className="mb-5"
                            />
                        </Card>
                    </div>

                    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                        <Description
                            title={t('form:featured-image-title')}
                            details={t('form:featured-image-help-text')}
                            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                        />

                        <Card className="w-full sm:w-8/12 md:w-2/3">
                            <FileInput
                                name="image"
                                control={control}
                                multiple={false}
                            />
                        </Card>
                    </div>

                    {/* Modifiers Section */}
                    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                        <Description
                            title={t('form:input-label-modifiers') || 'Item Modifiers'}
                            details={t('form:item-modifiers-help-text') || 'Assign modifier groups and configure default modifiers for this item.'}
                            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                        />
                        <Card className="w-full sm:w-8/12 md:w-2/3">
                            <div className="mb-5">
                                <Label>{t('form:input-label-modifier-groups') || 'Modifier Groups'}</Label>
                                <SelectInput
                                    name="modifier_assignment.modifier_groups"
                                    control={control}
                                    getOptionLabel={(option: any) => option.name}
                                    getOptionValue={(option: any) => option.id}
                                    options={modifierGroups || []}
                                    isMulti
                                    isClearable
                                    isLoading={loadingModifierGroups}
                                    placeholder={t('form:input-placeholder-select-modifier-groups') || 'Select modifier groups...'}
                                />
                            </div>

                            <Controller
                                name="modifier_assignment.default_modifiers"
                                control={control}
                                render={({ field }) => {
                                    const selectedGroups = watch('modifier_assignment.modifier_groups') || [];
                                    const allModifiers: any[] = [];
                                    
                                    selectedGroups.forEach((group: any) => {
                                        const modifiers = getModifiersByGroupId(group.id);
                                        allModifiers.push(...modifiers);
                                    });

                                    return (
                                        <div className="mb-5">
                                            <Label>{t('form:input-label-default-modifiers') || 'Default Modifiers'}</Label>
                                            <SelectInput
                                                name="modifier_assignment.default_modifiers"
                                                control={control}
                                                getOptionLabel={(option: any) => option.name}
                                                getOptionValue={(option: any) => option.id}
                                                options={allModifiers}
                                                isMulti
                                                isClearable
                                                placeholder={t('form:input-placeholder-select-default-modifiers') || 'Select default modifiers...'}
                                                isDisabled={selectedGroups.length === 0}
                                            />
                                            {selectedGroups.length === 0 && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    {t('form:select-modifier-groups-first') || 'Please select modifier groups first'}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }}
                            />

                            {/* Modifier Prices by Size and Quantity Levels - Only show if item is sizeable */}
                            {isSizeable && itemSizes && itemSizes.length > 0 && (
                                <div className="mb-5">
                                    <Label className="mb-3 block">
                                        {t('form:input-label-modifier-prices-by-size-quantity') || 'Modifier Prices by Size & Quantity Level'}
                                    </Label>
                                    <div className="space-y-6">
                                        {(() => {
                                            const selectedGroups = watch('modifier_assignment.modifier_groups') || [];
                                            const allModifiers: any[] = [];
                                            
                                            selectedGroups.forEach((group: any) => {
                                                const groupId = typeof group === 'object' ? group.id : group;
                                                const modifiers = getModifiersByGroupId(groupId);
                                                allModifiers.push(...modifiers);
                                            });

                                            if (allModifiers.length === 0) {
                                                return (
                                                    <div className="p-4 text-center text-sm text-gray-500 border border-gray-200 rounded-lg">
                                                        {t('form:select-modifier-groups-first') || 'Please select modifier groups first to set prices'}
                                                    </div>
                                                );
                                            }

                                            return allModifiers.map((modifier: any, modifierIndex: number) => {
                                                // Always use default quantity levels (Light, Normal, Extra) for all modifiers
                                                const quantityLevelsToShow = DEFAULT_QUANTITY_LEVELS;

                                                return (
                                                    <div key={modifier.id || modifierIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                            <h4 className="text-sm font-semibold text-heading">
                                                                {modifier.name}
                                                            </h4>
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold text-heading border-b border-gray-200">
                                                                            {t('form:input-label-quantity-level') || 'Quantity Level'}
                                                                        </th>
                                                                        {itemSizes.map((size: any, sizeIndex: number) => (
                                                                            <th
                                                                                key={sizeIndex}
                                                                                className="px-4 py-2 text-center text-xs font-semibold text-heading border-b border-gray-200"
                                                                            >
                                                                                {size.name || size.code || `Size ${sizeIndex + 1}`}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {/* Always show default quantity levels (Light, Normal, Extra) */}
                                                                    {quantityLevelsToShow.map((qtyLevel: any, qtyIndex: number) => (
                                                                        <tr key={qtyIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                                                            <td className="px-4 py-3 text-sm text-heading font-medium">
                                                                                {qtyLevel.name} ({t('form:input-label-quantity') || 'Qty'}: {qtyLevel.quantity})
                                                                            </td>
                                                                            {itemSizes.map((size: any, sizeIndex: number) => (
                                                                                <td key={sizeIndex} className="px-4 py-3">
                                                                                    <Input
                                                                                        {...register(`modifier_assignment.modifier_prices_by_size_and_quantity.${modifier.id}.${size.code || size.name}.${qtyLevel.quantity}` as any, {
                                                                                            valueAsNumber: true,
                                                                                        })}
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        min="0"
                                                                                        placeholder="0.00"
                                                                                        className="w-full text-center"
                                                                                        variant="outline"
                                                                                    />
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {t('form:modifier-prices-by-size-quantity-help') || 'Set custom prices for each modifier by size and quantity level. Leave empty to use default modifier price.'}
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
                        <Description
                            title={t('form:form-settings-title')}
                            details={t('form:item-description-help-text')}
                            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
                        />
                        <Card className="w-full sm:w-8/12 md:w-2/3">
                            <div className="mb-5">
                                <SwitchInput name="is_active" control={control} label={t('form:input-label-active')} />
                            </div>
                            <div className="mb-5">
                                <SwitchInput name="is_available" control={control} label={t('form:input-label-available')} />
                            </div>
                            <div className="mb-5">
                                <SwitchInput name="is_signature" control={control} label={t('form:input-label-signature-dish')} />
                            </div>
                            <div className="mb-5">
                                <SwitchInput name="is_customizable" control={control} label={t('form:input-label-customizable')} />
                            </div>
                        </Card>
                    </div>

                    <StickyFooterPanel className="z-0">
                        <div className="flex items-center justify-end">
                            <Button
                                variant="custom"
                                onClick={() => router.back()}
                                className="!px-0 text-sm !text-body me-4 hover:!text-accent focus:ring-0 md:text-base"
                                type="button"
                                size="medium"
                            >
                                <LongArrowPrev className="w-4 h-5 me-2" />
                                {t('form:button-label-back')}
                            </Button>
                            <Button
                                loading={updating || creating}
                                disabled={updating || creating}
                                size="medium"
                                className="text-sm md:text-base"
                            >
                                {initialValues ? (
                                    <>
                                        <EditIcon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:pl-2" />
                                        <span className="sm:hidden">
                                            {t('form:button-label-update')}
                                        </span>
                                        <span className="hidden sm:block">
                                            {t('form:button-label-update-item')}
                                        </span>
                                    </>
                                ) : (
                                    t('form:button-label-add-item')
                                )}
                            </Button>
                        </div>
                    </StickyFooterPanel>
                </form>
            </FormProvider>
        </>
    );
}
