import Layout from '@/components/layouts/admin';
import KitchenSectionForm from '@/components/kitchen-section/kitchen-section-form';
import {
  useUpdateKitchenSectionMutation,
  useKitchenSectionQuery,
} from '@/data/kitchen-section';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageHeading from '@/components/common/page-heading';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';

export default function EditKitchenSectionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const {
    data: section,
    isLoading,
    error,
  } = useKitchenSectionQuery(id as string);

  const { mutate: updateSection, isPending: updating } =
    useUpdateKitchenSectionMutation();

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const onSubmit = (values: { name: string; is_active: boolean }) => {
    updateSection(
      { id: id as string, input: values },
      {
        onSuccess: () => {
          toast.success(t('common:successfully-updated'));
          router.push(Routes.kitchenSections.list);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to update section',
          );
        },
      },
    );
  };

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <PageHeading title="Edit Kitchen Section" />
      </div>
      <KitchenSectionForm
        initialValues={section}
        onSubmit={onSubmit}
        isLoading={updating}
      />
    </>
  );
}

EditKitchenSectionPage.authenticate = {};
EditKitchenSectionPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});
