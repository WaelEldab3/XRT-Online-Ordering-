import Layout from '@/components/layouts/admin';
import TemplateBuilderForm from '@/components/template/template-builder-form';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTemplateQuery } from '@/data/template';

export default function EditTemplatePage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data: template, isPending: loading, error } = useTemplateQuery(id);

  if (loading || !id) return <Loader text="Loading..." />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!template) return <ErrorMessage message="Template not found" />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Edit print template</h1>
      </div>
      <TemplateBuilderForm initialValues={template} />
    </>
  );
}

EditTemplatePage.authenticate = {};
EditTemplatePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
