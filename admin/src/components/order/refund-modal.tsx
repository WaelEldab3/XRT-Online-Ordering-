import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useModalState, useModalAction } from '@/components/ui/modal/modal.context';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useRefundOrderMutation } from '@/data/order';

const RefundModal = () => {
  const { t } = useTranslation('common');
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: refundOrder, isPending } = useRefundOrderMutation();

  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState<string>('');

  const handleRefund = () => {
    const payload = {
      id: data.orderId,
      amount: refundType === 'partial' ? parseFloat(amount) : undefined,
    };
    
    refundOrder(payload, {
      onSuccess: () => {
        closeModal();
      },
    });
  };

  return (
    <div className="flex flex-col bg-light h-full w-full rounded p-6 sm:w-[500px]">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-semibold text-heading">
          {t('text-refund-order')} #{data?.orderId}
        </h3>
        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-gray-600 transition duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded text-sm leading-relaxed">
        <p className="font-bold mb-1">Important Notice (Authorize.net):</p>
        <p>
          You cannot issue a <strong>Refund</strong> for a transaction that has not yet been settled (settlement usually occurs overnight).
        </p>
        <p className="mt-2">
          If you attempt a <strong>Full Refund</strong> on an unsettled order, the system will automatically try to <strong>Void</strong> the original charge instead. However, <strong>Partial Refunds</strong> can <em>only</em> be processed after the transaction is fully settled.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="refundType"
            value="full"
            checked={refundType === 'full'}
            onChange={() => setRefundType('full')}
            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
          />
          <span className="text-gray-700">Full Refund</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="refundType"
            value="partial"
            checked={refundType === 'partial'}
            onChange={() => setRefundType('partial')}
            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
          />
          <span className="text-gray-700">Partial Refund</span>
        </label>
      </div>

      {refundType === 'partial' && (
        <div className="mb-6">
          <Input
            label="Refund Amount (USD)"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to refund"
            variant="outline"
            className="mb-4"
          />
          <p className="text-xs text-gray-500">
             Original Total: <span className="font-bold">${data?.totalAmount}</span>
          </p>
        </div>
      )}

      <div className="flex gap-4 mt-auto">
        <Button
          variant="outline"
          onClick={closeModal}
          className="w-1/2"
        >
          Cancel
        </Button>
        <Button
          onClick={handleRefund}
          loading={isPending}
          disabled={isPending || (refundType === 'partial' && (!amount || isNaN(Number(amount)) || Number(amount) <= 0))}
          className="w-1/2 bg-red-600 hover:bg-red-700"
        >
          {refundType === 'full' ? 'Process Full Refund' : 'Process Partial Refund'}
        </Button>
      </div>
    </div>
  );
};

export default RefundModal;
