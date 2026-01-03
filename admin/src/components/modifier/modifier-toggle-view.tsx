import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useUpdateModifierMutation } from '@/data/modifier';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { CloseFillIcon } from '@/components/icons/close-fill';
import { useTranslation } from 'next-i18next';

const ModifierToggleView = () => {
    const { mutate: updateModifier, isLoading: loading } = useUpdateModifierMutation();
    const { data } = useModalState();
    const { closeModal } = useModalAction();
    const { t } = useTranslation();

    function handleToggle() {
        updateModifier({
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
            title={isActivating ? t('form:modifier-enable-title') : t('form:modifier-disable-title')}
            description={isActivating ? t('form:modifier-enable-description') : t('form:modifier-disable-description')}
            deleteBtnClassName={isActivating ? 'bg-accent hover:bg-accent-hover' : 'bg-red-600 hover:bg-red-700'}
            icon={isActivating ? <CheckMarkCircle className="w-12 h-12 m-auto mt-4 text-accent" /> : <CloseFillIcon className="w-12 h-12 m-auto mt-4 text-red-500" />}
        />
    );
};

export default ModifierToggleView;

