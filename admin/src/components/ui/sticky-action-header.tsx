import cn from 'classnames';
import { ReactNode } from 'react';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';

interface StickyActionHeaderProps {
    title?: string;
    children?: ReactNode;
    onSave?: () => void;
    onCancel?: () => void;
    saveLabel?: string;
    cancelLabel?: string;
    isSaving?: boolean;
    isDisabled?: boolean;
    showCancel?: boolean;
    className?: string;
    saveButtonType?: 'button' | 'submit';
}

export default function StickyActionHeader({
    title,
    children,
    onSave,
    onCancel,
    saveLabel,
    cancelLabel,
    isSaving = false,
    isDisabled = false,
    showCancel = true,
    className,
    saveButtonType = 'submit',
}: StickyActionHeaderProps) {
    const { t } = useTranslation('form');

    return (
        <div
            className={cn(
                'sticky top-0 z-20 bg-white/95 backdrop-blur-sm',
                'border-b border-border-200 shadow-sm',
                '-mx-5 md:-mx-8 px-5 md:px-8 py-4',
                'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
                className
            )}
        >
            {/* Left side - Title or custom content */}
            <div className="flex-1 min-w-0">
                {title && (
                    <h2 className="text-lg font-semibold text-heading truncate">
                        {title}
                    </h2>
                )}
                {children}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
                {showCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 sm:flex-initial"
                        disabled={isSaving}
                    >
                        {cancelLabel || t('button-label-back')}
                    </Button>
                )}
                <Button
                    type={saveButtonType}
                    onClick={saveButtonType === 'button' ? onSave : undefined}
                    loading={isSaving}
                    disabled={isDisabled || isSaving}
                    className="flex-1 sm:flex-initial"
                >
                    {saveLabel || t('button-label-save')}
                </Button>
            </div>
        </div>
    );
}
