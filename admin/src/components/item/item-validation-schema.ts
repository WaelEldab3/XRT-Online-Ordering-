import * as yup from 'yup';

export const itemValidationSchema = yup.object().shape({
    name: yup.string().required('form:error-name-required'),
    base_price: yup
        .number()
        .typeError('form:error-price-must-number')
        .positive('form:error-price-must-positive')
        .required('form:error-price-required'),
    category: yup.object().nullable().required('form:error-category-required'),
    sort_order: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable(),
    max_per_order: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .nullable(),
    is_active: yup.boolean(),
    is_available: yup.boolean(),
    is_signature: yup.boolean(),
    image: yup.mixed().nullable(),
});
