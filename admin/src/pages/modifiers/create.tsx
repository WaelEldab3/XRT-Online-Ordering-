import Layout from '@/components/layouts/admin';
import CreateOrUpdateModifierForm from '@/components/modifier/modifier-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly, getAuthCredentials, hasPermission } from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useModifierGroupsQuery } from '@/data/modifier-group';
import Card from '@/components/common/card';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import SelectInput from '@/components/ui/select-input';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Label from '@/components/ui/label';

export default function CreateModifierPage() {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation(['common', 'form']);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { groups: modifierGroups, loading: loadingGroups, error: groupsError } = useModifierGroupsQuery({
    limit: 1000,
    language: locale,
    is_active: true,
  });

  const { control, watch } = useForm({
    defaultValues: {
      modifier_group: null,
    },
  });

  const selectedGroup = watch('modifier_group');

  // Update selectedGroupId when group selection changes
  useEffect(() => {
    if (selectedGroup) {
      const groupId = typeof selectedGroup === 'object' ? selectedGroup.id : selectedGroup;
      setSelectedGroupId(groupId);
    } else {
      setSelectedGroupId(null);
    }
  }, [selectedGroup]);

  if (loadingGroups) return <Loader text={t('common:text-loading')} />;
  if (groupsError) return <ErrorMessage message={groupsError.message} />;

  // If no group is selected, show group selection
  if (!selectedGroupId) {
    return (
      <>
        {/* Breadcrumb Navigation */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={Routes.modifier.list}
              className="text-body hover:text-accent transition-colors"
            >
              {t('form:input-label-modifiers')}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-heading font-medium">
              {t('form:form-title-create-modifier') || 'Create Modifier'}
            </span>
          </div>
        </Card>

        <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7 mb-5">
          <h1 className="text-lg font-semibold text-heading">
            {t('form:form-title-create-modifier') || 'Create Modifier'}
          </h1>
        </div>

        <Card className="mb-8">
          <div className="mb-5">
            <SelectInput
              name="modifier_group"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.id}
              options={modifierGroups || []}
              isClearable
              isLoading={loadingGroups}
              placeholder={t('form:input-placeholder-select-modifier-group') || 'Select a modifier group...'}
            />
            <p className="mt-2 text-xs text-gray-500">
              {t('form:select-modifier-group-first') || 'Please select a modifier group to continue'}
            </p>
          </div>
        </Card>
      </>
    );
  }

  // Show modifier form when group is selected
  return (
    <>
      {/* Breadcrumb Navigation */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={Routes.modifier.list}
            className="text-body hover:text-accent transition-colors"
          >
            {t('form:input-label-modifiers')}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-heading font-medium">
            {t('form:form-title-create-modifier') || 'Create Modifier'}
          </span>
        </div>
      </Card>

      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7 mb-5">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-modifier') || 'Create Modifier'}
        </h1>
      </div>

      {selectedGroupId && (
        <CreateOrUpdateModifierForm
          modifierGroupId={selectedGroupId}
          onSuccess={() => {
            router.push(Routes.modifier.list);
          }}
        />
      )}
    </>
  );
}

CreateModifierPage.authenticate = {
  permissions: adminOnly,
  allowedPermissions: ['categories:create'],
};
CreateModifierPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});

