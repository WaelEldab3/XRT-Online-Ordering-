import Modal from '@/components/ui/modal/modal';
import { PrintTemplate } from '@/data/client/template';
import { CloseIcon } from '@/components/icons/close-icon';
import InvoiceReceipt from '@/components/template/invoice-receipt';

type Props = {
  template: PrintTemplate | null;
  onClose: () => void;
};

export default function TemplatePreviewModal({ template, onClose }: Props) {
  return (
    <Modal open={!!template} onClose={onClose}>
      <div className="max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {template ? (
          <>
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold text-heading">Template preview</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-body/70">
              <span className="font-medium text-heading">{template.name}</span>
              <span className="text-body/70"> · {template.type} · {template.paper_width}</span>
            </p>
            <InvoiceReceipt template={template} className="shadow-inner" />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-heading transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
