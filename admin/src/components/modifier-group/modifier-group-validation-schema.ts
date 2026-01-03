import * as yup from 'yup';

export const modifierGroupValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  display_type: yup.string().oneOf(['RADIO', 'CHECKBOX']).required('form:error-display-type-required'),
  min_select: yup
    .number()
    .min(0, 'form:error-min-select-min')
    .required('form:error-min-select-required'),
  max_select: yup
    .number()
    .min(1, 'form:error-max-select-min')
    .test('max-greater-than-min', 'form:error-max-select-greater-than-min', function(value) {
      const { min_select } = this.parent;
      return value >= min_select;
    })
    .required('form:error-max-select-required'),
  applies_per_quantity: yup.boolean(),
  is_active: yup.boolean(),
  sort_order: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('form:error-sort-order-required'),
});

