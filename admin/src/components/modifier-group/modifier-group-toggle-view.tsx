import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useUpdateModifierGroupMutation } from '@/data/modifier-group';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { CloseFillIcon } from '@/components/icons/close-fill';
import { useTranslation } from 'next-i18next';

const ModifierGroupToggleView = () => {
    const { mutate: updateGroup, isLoading: loading } = useUpdateModifierGroupMutation();
    const { data } = useModalState();
    const { closeModal } = useModalAction();
    const { t } = useTranslation();

    function handleToggle() {
        updateGroup({
            id: data.id,
            ...data,
            is_active: !data.is_active,
        }, {
            onSuccess: () => {
                closeModal();
            },
            onError: () => {
                closeModal();
            }
        });
    }

    const isActivating = !data.is_active;

    return (
        <ConfirmationCard
            onCancel={closeModal}
            onDelete={handleToggle}
            deleteBtnLoading={loading}
            deleteBtnText={isActivating ? t('common:text-enable') : t('common:text-disable')}
            title={isActivating ? t('form:modifier-group-enable-title') : t('form:modifier-group-disable-title')}
            description={isActivating ? t('form:modifier-group-enable-description') : t('form:modifier-group-disable-description')}
            deleteBtnClassName={isActivating ? 'bg-accent hover:bg-accent-hover' : 'bg-red-600 hover:bg-red-700'}
            icon={isActivating ? <CheckMarkCircle className="w-12 h-12 m-auto mt-4 text-accent" /> : <CloseFillIcon className="w-12 h-12 m-auto mt-4 text-red-500" />}
        />
    );
};

export default ModifierGroupToggleView;

