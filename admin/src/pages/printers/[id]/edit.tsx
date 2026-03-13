import Layout from '@/components/layouts/admin';
import PrinterForm from '@/components/printer/printer-form';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { usePrinterQuery } from '@/data/printer';

export default function EditPrinterPage() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data: printer, isLoading, error } = usePrinterQuery(id);

  if (isLoading) return <Loader text="Loading..." />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!printer) return <ErrorMessage message="Printer not found" />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Edit printer</h1>
      </div>
      <PrinterForm initialValues={printer} />
    </>
  );
}

EditPrinterPage.authenticate = {};
EditPrinterPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
