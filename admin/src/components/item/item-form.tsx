import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Radio from '@/components/ui/radio/radio';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import { itemValidationSchema } from './item-validation-schema';
import { Item, CreateItemInput, UpdateItemInput } from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import Alert from '@/components/ui/alert';
import { useState } from 'react';
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

type ItemFormProps = {
    initialValues?: Item | null;
};

type FormValues = {
    name: string;
    description?: string;
    base_price: number;
    category: any;
    image?: any;
    sort_order?: number | null;
    max_per_order?: number | null;
    is_active?: boolean;
    is_available?: boolean;
    is_signature?: boolean;
};

const defaultValues = {
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
            }
            : defaultValues,
    });

    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors },
    } = methods;

    const { mutate: createItem, isLoading: creating } = useCreateItemMutation();
    const { mutate: updateItem, isLoading: updating } = useUpdateItemMutation();

    const { categories, loading: loadingCategories } = useCategoriesQuery({
        limit: 1000,
        language: locale,
        type: 'all', // Adjust type if needed
    });

    const onSubmit = async (values: any) => {

        const inputValues: CreateItemInput = {
            name: values.name,
            description: values.description,
            base_price: values.base_price,
            category_id: values.category?.id,
            sort_order: values.sort_order ?? undefined,
            max_per_order: values.max_per_order ?? undefined,
            is_active: values.is_active,
            is_available: values.is_available,
            is_signature: values.is_signature,
            image: values.image, // Assuming image is handled by FileInput correctly or needs transformation
            business_id: shopId, // For now assuming shop context, or backend handles it from user
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

                            <Input
                                label={`${t('form:input-label-base-price')}*`}
                                {...register('base_price')}
                                type="number"
                                error={t(errors.base_price?.message!)}
                                variant="outline"
                                className="mb-5"
                            />

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
