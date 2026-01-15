import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import { useImportSessionQuery, useUpdateImportSessionMutation, useFinalSaveImportMutation, useDiscardImportSessionMutation, useDownloadImportErrorsMutation } from '@/data/import';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import ImportReviewModule from '@/components/import/import-review-module';
import { DownloadIcon } from '@/components/icons/download-icon';
import { TrashIcon } from '@/components/icons/trash';
import { SaveIcon } from '@/components/icons/save';
import Alert from '@/components/ui/alert';

export default function ImportReviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { session, isLoading, error } = useImportSessionQuery(id as string);
  const { mutate: updateSession, isPending: isUpdating } = useUpdateImportSessionMutation();
  const { mutate: finalSave, isPending: isSaving } = useFinalSaveImportMutation();
  const { mutate: discardSession, isPending: isDiscarding } = useDiscardImportSessionMutation();
  const { mutate: downloadErrors, isPending: isDownloading } = useDownloadImportErrorsMutation();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleSaveDraft = (updatedData: any) => {
    updateSession({
      id: id as string,
      parsedData: updatedData,
    });
  };

  const handleFinalSave = () => {
    if (session?.validationErrors && session.validationErrors.length > 0) {
      return; // Should be disabled, but double-check
    }
    finalSave(id as string);
  };

  const handleDiscard = () => {
    if (showDiscardConfirm) {
      discardSession(id as string);
    } else {
      setShowDiscardConfirm(true);
    }
  };

  const handleDownloadErrors = () => {
    downloadErrors(id as string);
  };

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as any)?.message} />;
  if (!session) return <ErrorMessage message={t('common:import-session-not-found')} />;

  const hasErrors = session.validationErrors && session.validationErrors.length > 0;
  const hasWarnings = session.validationWarnings && session.validationWarnings.length > 0;

  return (
    <>
      <Card className="mb-8">
        <div className="flex items-center justify-between">
          <PageHeading title={t('common:review-import')} />
          <div className="flex items-center space-x-2">
            {hasErrors && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                {session.validationErrors.length} {t('common:errors')}
              </span>
            )}
            {hasWarnings && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                {session.validationWarnings.length} {t('common:warnings')}
              </span>
            )}
            {!hasErrors && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                {t('common:validated')}
              </span>
            )}
          </div>
        </div>
      </Card>

      {hasErrors && (
        <Alert
          message={t('common:fix-errors-before-saving')}
          variant="error"
          className="mb-6"
        />
      )}

      {hasWarnings && (
        <Alert
          message={t('common:review-warnings')}
          variant="warning"
          className="mb-6"
        />
      )}

      <ImportReviewModule
        session={session}
        onSaveDraft={handleSaveDraft}
        isUpdating={isUpdating}
      />

      <Card className="mt-8">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div className="flex space-x-4">
            {hasErrors && (
              <Button
                variant="outline"
                onClick={handleDownloadErrors}
                disabled={isDownloading}
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>{t('common:download-errors')}</span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isUpdating}
              className="flex items-center space-x-2"
            >
              <SaveIcon className="h-4 w-4" />
              <span>{t('common:save-draft')}</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isDiscarding || showDiscardConfirm}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              <span>{showDiscardConfirm ? t('common:confirm-discard') : t('common:discard-import')}</span>
            </Button>
            {showDiscardConfirm && (
              <Button
                variant="outline"
                onClick={() => setShowDiscardConfirm(false)}
              >
                {t('common:text-cancel')}
              </Button>
            )}
          </div>
          <Button
            onClick={handleFinalSave}
            disabled={hasErrors || isSaving}
            loading={isSaving}
            className="flex items-center space-x-2"
          >
            <SaveIcon className="h-4 w-4" />
            <span>{t('common:save-to-database')}</span>
          </Button>
        </div>
      </Card>
    </>
  );
}

ImportReviewPage.authenticate = {
  permissions: adminOnly,
};

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
