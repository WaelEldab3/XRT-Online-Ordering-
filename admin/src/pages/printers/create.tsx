import Layout from '@/components/layouts/admin';
import PrinterForm from '@/components/printer/printer-form';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function CreatePrinterPage() {
  const { t } = useTranslation(['form', 'common']);
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Add printer</h1>
      </div>
      <PrinterForm />
    </>
  );
}

CreatePrinterPage.authenticate = {};
CreatePrinterPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
