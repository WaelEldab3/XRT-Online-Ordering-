import * as yup from 'yup';

export const customerValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  phoneNumber: yup.string().required('form:error-phone-required'),
  business_id: yup.string().required('form:error-business-required'),
  location_id: yup.string().required('form:error-location-required'),
  rewards: yup.number().optional(),
  notes: yup.string().optional(),
});

export const customerUpdateValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  phoneNumber: yup.string().required('form:error-phone-required'),
  business_id: yup.string().required('form:error-business-required'),
  location_id: yup.string().required('form:error-location-required'),
  rewards: yup.number().optional(),
  notes: yup.string().optional(),
});
