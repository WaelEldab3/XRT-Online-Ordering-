import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import { useRegisterMutation, useUpdateUserMutation } from '@/data/user';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  customerValidationSchema,
  customerUpdateValidationSchema,
} from './user-validation-schema';
import { User } from '@/types';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { toast } from 'react-toastify';

type FormValues = {
  name: string;
  email: string;
  password?: string;
  // permission: Permission;
};

const defaultValues = {
  email: '',
  password: '',
  name: '',
};

type UserFormProps = {
  initialValues?: User | null;
};

const UserForm = ({ initialValues }: UserFormProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: registerUser, isLoading: creating } = useRegisterMutation();
  const { mutate: updateUser, isLoading: updating } = useUpdateUserMutation();

  const isNew = !initialValues;
  const isLoading = creating || updating;

  const {
    register,
    handleSubmit,
    setError,

    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          email: initialValues.email,
          password: '',
        }
      : defaultValues,
    resolver: yupResolver(
      isNew ? customerValidationSchema : customerUpdateValidationSchema,
    ),
  });

  async function onSubmit({ name, email, password }: FormValues) {
    if (isNew) {
      registerUser(
        {
          name,
          email,
          password: password!,
          // permission: Permission.StoreOwner,
        },
        {
          onError: (error: any) => {
            Object.keys(error?.response?.data).forEach((field: any) => {
              setError(field, {
                type: 'manual',
                message: error?.response?.data[field][0],
              });
            });
          },
          onSuccess: (data) => {
            if (data) {
              router.push(Routes.user.list);
            }
          },
        },
      );
    } else {
      updateUser(
        {
          variables: {
            id: initialValues?.id as string,
            input: {
              name,
              // email, // Email might not be editable depending on backend, but let's include it if allowed
              // password, // Only send if provided
              // Profile update logic might be separate or included here.
              // Start with name, and basic info.
              ...(password && { password }),
            },
          },
        },
        {
          onError: (error: any) => {
            // Handle Errors
          },
          onSuccess: (data) => {
            router.push(Routes.user.list);
          },
        },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:customer-form-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            type="text"
            variant="outline"
            className="mb-4"
            error={t(errors.name?.message!)}
            required
          />
          <Input
            label={t('form:input-label-email')}
            {...register('email')}
            type="email"
            variant="outline"
            className="mb-4"
            error={t(errors.email?.message!)}
            required
          />
          <PasswordInput
            label={t('form:input-label-password')}
            {...register('password')}
            error={t(errors.password?.message!)}
            variant="outline"
            className="mb-4"
            required={isNew}
          />
        </Card>
      </div>
      <StickyFooterPanel className="z-0">
        <div className="mb-4 text-end">
          <Button loading={isLoading} disabled={isLoading}>
            {initialValues
              ? t('form:button-label-update-user')
              : t('form:button-label-create-customer')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
};

export default UserForm;
