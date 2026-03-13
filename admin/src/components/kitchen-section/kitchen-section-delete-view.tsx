import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteKitchenSectionMutation } from '@/data/kitchen-section';
import { getErrorMessage } from '@/utils/form-error';

const KitchenSectionDeleteView = () => {
  const { mutate: deleteKitchenSectionById, isPending: loading } =
    useDeleteKitchenSectionMutation();

  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    try {
      deleteKitchenSectionById(data);
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default KitchenSectionDeleteView;
