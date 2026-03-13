import Layout from '@/components/layouts/admin';
import KitchenSectionForm from '@/components/kitchen-section/kitchen-section-form';
import { useCreateKitchenSectionMutation } from '@/data/kitchen-section';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PageHeading from '@/components/common/page-heading';

export default function CreateKitchenSectionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: createSection, isPending: creating } =
    useCreateKitchenSectionMutation();

  const onSubmit = (values: { name: string; is_active: boolean }) => {
    createSection(values, {
      onSuccess: () => {
        toast.success(t('common:successfully-created'));
        router.push(Routes.kitchenSections.list);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || 'Failed to create section',
        );
      },
    });
  };

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <PageHeading title="Add Kitchen Section" />
      </div>
      <KitchenSectionForm onSubmit={onSubmit} isLoading={creating} />
    </>
  );
}

CreateKitchenSectionPage.authenticate = {};
CreateKitchenSectionPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});
