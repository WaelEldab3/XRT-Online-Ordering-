import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import Select from '@/components/ui/select/select';
import { useRolesQuery } from '@/data/role';
import { useCreateUserMutation } from '@/data/user';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Role } from '@/types';

const createAdminSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  email: yup
    .string()
    .email('form:error-email-format')
    .required('form:error-email-required'),
  password: yup.string().required('form:error-password-required'),
  role: yup.object().required('form:error-role-required'),
});

const CreateAdminView = () => {
  const { t } = useTranslation();
  const { closeModal } = useModalAction();
  const { mutate: createUser, isLoading } = useCreateUserMutation();
  const { roles, loading: loadingRoles } = useRolesQuery({ limit: 100 });

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: null as any,
    },
    resolver: yupResolver(createAdminSchema),
  });

  const roleOptions = roles?.map((role: Role) => ({
    label: role.displayName,
    value: role.name,
  }));

  function onSubmit(values: any) {
    const { name, email, password, role } = values;

    console.log('Form values:', values);
    console.log('Selected role:', role);
    console.log('Available roles:', roles);

    const selectedRole = roles?.find((r: Role) => r.name === role.value);
    const permissions = selectedRole?.permissions || [];

    console.log('Selected role object:', selectedRole);
    console.log('Permissions:', permissions);

    const userData = {
      name,
      email,
      password,
      role: role.value,
      permissions,
    };

    console.log('User data to send:', userData);

    createUser(userData, {
      onSuccess: () => {
        closeModal();
      },
    });
  }

  return (
    <div className="p-5 bg-light sm:p-8 min-w-[350px] sm:min-w-[450px]">
      <h1 className="mb-4 text-center font-semibold text-heading sm:mb-6">
        Create Admin
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label={t('form:input-label-name')}
          {...registerField('name')}
          error={t(errors.name?.message!)}
          variant="outline"
          className="mb-5"
        />
        <Input
          label={t('form:input-label-email')}
          type="email"
          {...registerField('email')}
          error={t(errors.email?.message!)}
          variant="outline"
          className="mb-5"
        />
        <PasswordInput
          label={t('form:input-label-password')}
          {...registerField('password')}
          error={t(errors.password?.message!)}
          className="mb-5"
        />
        <div className="mb-5">
          <Label>Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={roleOptions}
                isLoading={loadingRoles}
                placeholder={t('form:input-placeholder-role')}
              />
            )}
          />
          {errors.role && (
            <p className="my-2 text-xs text-red-500 text-end">
              {t(errors.role?.message!)}
            </p>
          )}
        </div>

        <Button className="w-full" loading={isLoading} disabled={isLoading}>
          Create Admin
        </Button>
      </form>
    </div>
  );
};

export default CreateAdminView;
