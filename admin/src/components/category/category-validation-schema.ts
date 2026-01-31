import * as yup from 'yup';

export const categoryValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  kitchen_section_id: yup
    .object()
    .nullable()
    .required('form:error-kitchen-section-required'),
  sort_order: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('form:error-sort-order-required'),
  icon: yup.mixed(),
  details: yup.string(),
  image: yup.mixed(),
  is_active: yup.boolean(),
  modifier_groups: yup.array().nullable(),
});
