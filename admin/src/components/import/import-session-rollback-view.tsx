import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useRollbackImportSessionMutation } from '@/data/import';

const RollbackImportSessionView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: rollbackSession, isPending: loading } =
    useRollbackImportSessionMutation();

  function handleRollback() {
    rollbackSession(data, {
      onSuccess: () => {
        closeModal();
      },
      // Error handling is likely in the hook, but we can add more here if needed
    });
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleRollback}
      deleteBtnLoading={loading}
      deleteBtnText="text-rollback" // Assuming translation key exists or will fallback
      title="text-rollback-import-session" // Translation key
      description="text-rollback-import-session-description" // Translation key
      deleteBtnClassName="bg-red-500 hover:bg-red-600 focus:bg-red-600"
      cancelBtnClassName="bg-gray-200 hover:bg-gray-300 focus:bg-gray-300"
    />
  );
};

export default RollbackImportSessionView;
