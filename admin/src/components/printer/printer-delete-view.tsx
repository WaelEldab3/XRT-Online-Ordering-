import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeletePrinterMutation } from '@/data/printer';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

const PrinterDeleteView = () => {
  const { t } = useTranslation('common');
  const { data: id } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: deletePrinter, isPending: loading } =
    useDeletePrinterMutation();

  function handleDelete() {
    deletePrinter(id, {
      onSuccess: () => {
        toast.success(t('common:delete-success'));
        closeModal();
      },
      onError: (error: any) => {
        toast.error(error?.message || t('common:error-something-wrong'));
      },
    });
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default PrinterDeleteView;
