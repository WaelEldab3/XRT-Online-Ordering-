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
import { Item, CreateItemInput, UpdateItemInput, ItemSize, ItemModifierAssignment } from '@/types';
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

type ItemFormProps = {
    initialValues?: Item | null;
};

type FormValues = {
    name: string;
    description?: string;
    base_price?: number;
    category: any;
    image?: any;
    sort_order?: number | null;
    max_per_order?: number | null;
    is_active?: boolean;
    is_available?: boolean;
    is_signature?: boolean;
    is_sizeable?: boolean;
    is_customizable?: boolean;
    sizes?: ItemSize[];
    modifier_assignment?: ItemModifierAssignment;
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
    apply_sides: false,
    sides: {
        both: false,
        left: false,
        right: false,
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
    const shopId = shopData?.id!;

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
    }, [initialValues?.id, initialValues?.sizes?.length, initialValues?.is_sizeable, initialValues?.is_customizable, initialValues?.apply_sides, initialValues?.updated_at]);

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

    const applySides = useWatch({
        control,
        name: 'apply_sides',
        defaultValue: false,
    });

    const sizes = useWatch({
        control,
        name: 'sizes',
        defaultValue: [],
    });

    const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
        control,
        name: 'sizes',
    });

    // Update base_price when default size changes or when a default size's price changes
    useEffect(() => {
        if (isSizeable && sizes && sizes.length > 0) {
            const defaultSize = sizes.find((size: any) => size?.is_default === true);
            if (defaultSize && defaultSize.price !== undefined) {
                setValue('base_price', defaultSize.price, { shouldValidate: false });
            }
        }
    }, [isSizeable, sizes, setValue]);

    // Auto-set is_sizeable to true if item has sizes when editing
    // Also ensure sizes are preserved in the form
    useEffect(() => {
        if (initialValues) {
            // If item has sizes, ensure is_sizeable is true
            if (initialValues.sizes && initialValues.sizes.length > 0 && !isSizeable) {
                setValue('is_sizeable', true, { shouldValidate: false });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues?.id, initialValues?.sizes?.length, isSizeable]);

    // Handler to set default size (only one can be default)
    const handleDefaultSizeChange = (index: number) => {
        const currentSizes = watch('sizes') || [];
        
        // Update all sizes - only the selected index is default
        currentSizes.forEach((size: any, idx: number) => {
            setValue(`sizes.${idx}.is_default`, idx === index, { shouldValidate: false });
        });

        // Update base_price from the new default size
        const defaultSizePrice = currentSizes[index]?.price;
        if (defaultSizePrice !== undefined) {
            setValue('base_price', defaultSizePrice, { shouldValidate: false });
        }
    };

    const { mutate: createItem, isLoading: creating } = useCreateItemMutation();
    const { mutate: updateItem, isLoading: updating } = useUpdateItemMutation();

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
        let basePrice = values.base_price ?? undefined;
        
        // If sizeable, ensure base_price is set from default size
        if (values.is_sizeable && values.sizes && values.sizes.length > 0) {
            const defaultSize = values.sizes.find((size: any) => size?.is_default === true);
            if (defaultSize && defaultSize.price) {
                basePrice = defaultSize.price;
            } else {
                // Validation should catch this, but set error if no default size
                setError('sizes', {
                    type: 'manual',
                    message: 'form:error-default-size-required',
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
                
                if (values.is_sizeable && sizes && sizes.length > 0) {
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
            // Always send sizes array when item is sizeable (validation ensures at least one size)
            sizes: values.is_sizeable && values.sizes ? values.sizes : undefined,
            image: values.image,
            business_id: shopId,
            modifier_assignment: modifierAssignment,
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
                                    <Label className="mb-3 block">
                                        {t('form:input-label-sizes')}*
                                    </Label>
                                    <div className="space-y-4">
                                        {sizeFields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="p-4 border border-border-200 rounded-lg"
                                            >
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                                                    <div className="sm:col-span-4">
                                                        <Input
                                                            label={t('form:input-label-size-name')}
                                                            {...register(`sizes.${index}.name` as const)}
                                                            error={t(errors.sizes?.[index]?.name?.message!)}
                                                            variant="outline"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-4">
                                                        <Input
                                                            label={t('form:input-label-size-price')}
                                                            {...register(`sizes.${index}.price` as const, {
                                                                valueAsNumber: true,
                                                            })}
                                                            type="number"
                                                            step="0.01"
                                                            error={t(errors.sizes?.[index]?.price?.message!)}
                                                            variant="outline"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3 flex items-end">
                                                        <div className="mb-5">
                                                            <label className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="default-size"
                                                                    checked={sizes?.[index]?.is_default === true}
                                                                    onChange={() => handleDefaultSizeChange(index)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-sm text-body">
                                                                    {t('form:input-label-default')}
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="hidden"
                                                                {...register(`sizes.${index}.is_default` as const)}
                                                                value={sizes?.[index]?.is_default ? 'true' : 'false'}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="sm:col-span-1 flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSize(index)}
                                                            className="text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                const isFirstSize = sizeFields.length === 0;
                                                appendSize({ 
                                                    name: '', 
                                                    price: 0, 
                                                    is_default: isFirstSize // First size is default by default
                                                });
                                                if (isFirstSize) {
                                                    // Set base_price to 0 initially for first size
                                                    setValue('base_price', 0, { shouldValidate: false });
                                                }
                                            }}
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                        >
                                            {t('form:button-label-add-size')}
                                        </Button>
                                    </div>
                                    {errors.sizes && typeof errors.sizes.message === 'string' && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {t(errors.sizes.message)}
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
                            {isSizeable && sizes && sizes.length > 0 && (
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
                                                const quantityLevels = modifier.quantity_levels || [];
                                                const hasQuantityLevels = quantityLevels.length > 0;

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
                                                                            {hasQuantityLevels 
                                                                                ? (t('form:input-label-quantity-level') || 'Quantity Level')
                                                                                : (t('form:input-label-price') || 'Price')
                                                                            }
                                                                        </th>
                                                                        {sizes.map((size: any, sizeIndex: number) => (
                                                                            <th
                                                                                key={sizeIndex}
                                                                                className="px-4 py-2 text-center text-xs font-semibold text-heading border-b border-gray-200"
                                                                            >
                                                                                {size.name || `Size ${sizeIndex + 1}`}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {hasQuantityLevels ? (
                                                                        // Show quantity levels as rows
                                                                        quantityLevels.map((qtyLevel: any, qtyIndex: number) => (
                                                                            <tr key={qtyIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                                                                <td className="px-4 py-3 text-sm text-heading font-medium">
                                                                                    Qty: {qtyLevel.quantity}
                                                                                </td>
                                                                                {sizes.map((size: any, sizeIndex: number) => (
                                                                                    <td key={sizeIndex} className="px-4 py-3">
                                                                                        <Input
                                                                                            {...register(`modifier_assignment.modifier_prices_by_size_and_quantity.${modifier.id}.${size.name}.${qtyLevel.quantity}` as any, {
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
                                                                        ))
                                                                    ) : (
                                                                        // Show single row for modifiers without quantity levels
                                                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                                {t('form:single-price') || 'Price'}
                                                                            </td>
                                                                            {sizes.map((size: any, sizeIndex: number) => (
                                                                                <td key={sizeIndex} className="px-4 py-3">
                                                                                    <Input
                                                                                        {...register(`modifier_assignment.modifier_prices_by_size.${modifier.id}.${size.name}` as any, {
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
                                                                    )}
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
                            <div className="mb-5">
                                <SwitchInput name="apply_sides" control={control} label={t('form:input-label-apply-sides')} />
                            </div>
                            {applySides && (
                                <div className="mb-5 p-4 border border-border-200 rounded-lg bg-gray-50">
                                    <Label className="mb-3 block text-sm font-medium">
                                        {t('form:input-label-sides-configuration')}
                                    </Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-body">
                                                {t('form:input-label-side-both')}
                                            </Label>
                                            <SwitchInput 
                                                name="sides.both" 
                                                control={control} 
                                                label="" 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-body">
                                                {t('form:input-label-side-left')}
                                            </Label>
                                            <SwitchInput 
                                                name="sides.left" 
                                                control={control} 
                                                label="" 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-body">
                                                {t('form:input-label-side-right')}
                                            </Label>
                                            <SwitchInput 
                                                name="sides.right" 
                                                control={control} 
                                                label="" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
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
