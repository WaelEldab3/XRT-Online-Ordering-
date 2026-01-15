import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useUpdateItemMutation } from '@/data/item';

const ItemToggleView = () => {
    const { data } = useModalState();
    const { closeModal } = useModalAction();
    const { mutate: updateItem, isPending: loading } = useUpdateItemMutation();

    function handleToggle() {
        updateItem(
            {
                id: data.id,
                is_active: !data.is_active,
            },
            {
                onSuccess: () => {
                    // Call onComplete callback if provided (to clear loading state in parent)
                    if (data?.onComplete) {
                        data.onComplete();
                    }
                    closeModal();
                },
                onError: () => {
                    // Call onComplete callback even on error to clear loading state
                    if (data?.onComplete) {
                        data.onComplete();
                    }
                    // Keep modal open on error so user can retry
                },
            }
        );
    }

    return (
        <ConfirmationCard
            onCancel={closeModal}
            onDelete={handleToggle}
            deleteBtnLoading={loading}
            title="text-confirm-toggle"
            description="text-confirm-toggle-description"
            deleteBtnText="text-confirm"
        />
    );
};

export default ItemToggleView;
