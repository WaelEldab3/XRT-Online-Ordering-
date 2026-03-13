import Layout from '@/components/layouts/admin';
import TemplateBuilderForm from '@/components/template/template-builder-form';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function CreateTemplatePage() {
  const { t } = useTranslation(['form', 'common']);
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Add print template</h1>
      </div>
      <TemplateBuilderForm />
    </>
  );
}

CreateTemplatePage.authenticate = {};
CreateTemplatePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
