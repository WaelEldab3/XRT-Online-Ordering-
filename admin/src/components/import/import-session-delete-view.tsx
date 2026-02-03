import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteImportSessionMutation } from '@/data/import';

const ImportSessionDeleteView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: deleteImportSession, isPending: loading } =
    useDeleteImportSessionMutation();

  function handleDelete() {
    deleteImportSession(data);
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default ImportSessionDeleteView;
