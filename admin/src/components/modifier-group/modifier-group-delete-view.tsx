import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteModifierGroupMutation } from '@/data/modifier-group';

const ModifierGroupDeleteView = () => {
  const { mutate: deleteGroup, isPending: loading } =
    useDeleteModifierGroupMutation();

  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    deleteGroup({
      id: data,
    });
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

export default ModifierGroupDeleteView;

