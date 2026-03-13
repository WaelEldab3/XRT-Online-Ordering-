import { useTranslation } from 'next-i18next';
import { Order } from '@/types';
import ListItemPrice from '@/components/price/list-item-price';

interface OrderCardItemsProps {
  order: Order;
}

interface ModifierShape {
  id?: string | number;
  modifier_name_snap?: string;
  name_snapshot?: string;
  quantity_label_snapshot?: string;
  unit_price_delta?: number;
  selected_side?: string;
}

export const OrderCardItems = ({ order }: OrderCardItemsProps) => {
  const { t } = useTranslation();
  const products = order.products ?? [];

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white px-4 pb-4 pt-3 sm:p-5">
      <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3 shrink-0">
        <span>
          {products?.length}{' '}
          {products?.length === 1 ? t('text-item') : t('text-items')}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="order-card-items-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 space-y-3 max-h-[120px]">
        {products?.map((product: any, index: number) => {
          const qty = product?.pivot?.order_quantity ?? 0;
          const unitPrice = product?.pivot?.unit_price ?? 0;
          const modifiers: ModifierShape[] = product?.pivot?.modifiers ?? [];
          const sizeLabel = product?.pivot?.variation ?? null;

          return (
            <div
              key={index}
              className="flex justify-between items-start gap-2 text-sm border-b border-gray-50 last:border-0 last:pb-0 pb-3 last:mb-0"
            >
              <div className="flex gap-3 min-w-0 flex-1">
                <span
                  className="flex shrink-0 items-center justify-center w-6 h-6 rounded bg-gray-100 text-accent text-xs font-bold font-mono border border-gray-200"
                  title={t('text-quantity')}
                >
                  {qty}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-heading leading-snug truncate">
                    {product?.name}
                  </span>
                  {sizeLabel && (
                    <span className="text-[11px] text-gray-500 mt-0.5">
                      {t('text-sizes')}: {sizeLabel}
                    </span>
                  )}
                  {modifiers.length > 0 && (
                    <div className="flex flex-col mt-1 gap-0.5">
                      {modifiers.map((mod, i) => (
                        <span
                          key={mod.id ?? i}
                          className="text-[11px] text-gray-500 pl-2 border-l-2 border-gray-200"
                        >
                          + {mod.modifier_name_snap ?? mod.name_snapshot ?? ''}
                          {mod.quantity_label_snapshot && (
                            <span className="text-gray-400">
                              {' '}
                              × {mod.quantity_label_snapshot}
                            </span>
                          )}
                          {mod.selected_side && (
                            <span
                              className={`ml-1 text-[9px] font-bold uppercase px-1 py-0.5 rounded ${
                                mod.selected_side === 'LEFT'
                                  ? 'bg-orange-50 text-orange-600'
                                  : mod.selected_side === 'RIGHT'
                                    ? 'bg-purple-50 text-purple-600'
                                    : 'bg-green-50 text-green-600'
                              }`}
                            >
                              {mod.selected_side}
                            </span>
                          )}
                          {mod.unit_price_delta != null &&
                            mod.unit_price_delta !== 0 && (
                              <span className="ml-1">
                                <ListItemPrice value={mod.unit_price_delta} />
                              </span>
                            )}
                        </span>
                      ))}
                    </div>
                  )}
                  {product?.pivot?.variation_option_id && !sizeLabel && (
                    <span className="text-[11px] text-gray-500 mt-0.5">
                      {product?.pivot?.variation ?? ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="font-medium text-heading text-sm">
                  <ListItemPrice value={unitPrice} />
                </span>
                {qty > 1 && (
                  <span className="text-[11px] text-gray-400">
                    {qty} × <ListItemPrice value={unitPrice} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
