'use client';
import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { useSettingsQuery } from '@/data/settings';

import { PrintTemplate, TemplateLayout } from '@/data/client/template';

/** Sample data for preview - same for all paper sizes */
export const SAMPLE_FIELDS: Record<string, string> = {
  orderNumber: 'ORD-123456',
  orderType: 'Dine-in',
  orderStatus: 'Pending',
  serviceTimeType: 'ASAP',
  scheduleTime: '—',
  readyTime: '—',
  actualReadyTime: '—',
  createdAt: 'Feb 24, 2025 2:30 PM',
  updatedAt: 'Feb 24, 2025 2:35 PM',
  notes: 'No onions, please.',
  paymentMethod: 'Card',
  currency: 'USD',
  subtotal: '$24.00',
  discount: '$0.00',
  deliveryFee: '$2.50',
  taxTotal: '$2.50',
  tips: '$3.00',
  totalAmount: '$32.00',
  name: 'John Doe',
  phone: '+1 555-0123',
  email: 'john@example.com',
  address: '123 Main St, City',
  branchName: 'Downtown Branch',
  businessAddress: '456 Business Ave',
  cashierName: 'Jane',
};

export const SAMPLE_ITEMS = [
  {
    name: 'Burger',
    quantity: 2,
    size: 'L',
    unitPrice: '$8.00',
    modifierTotals: '+$1.50',
    lineSubtotal: '$17.50',
    specialNotes: 'No pickle',
    kitchenSection: 'Grill',
    modifiers: [
      { name: 'Extra Cheese', qty: '1' },
      { name: 'Bacon', qty: '' },
    ],
  },
  {
    name: 'Fries',
    quantity: 1,
    size: 'M',
    unitPrice: '$3.50',
    modifierTotals: '—',
    lineSubtotal: '$3.50',
    specialNotes: '—',
    kitchenSection: 'Fryer',
  },
];

/** Extract header field keys, item columns, and footer field keys from template layout */
export function getTemplateDataFromLayout(
  layout: TemplateLayout | null | undefined,
) {
  const header: string[] = [];
  const footer: string[] = [];
  let itemColumns: string[] = [];
  (layout?.header ?? []).forEach((b) => {
    if (b.type === 'field' && (b as { value?: string }).value)
      header.push((b as { value: string }).value);
    if (b.type === 'logo') header.push('logo');
  });
  (layout?.body ?? []).forEach((b) => {
    if (b.type === 'itemsTable' && (b as { columns?: string[] }).columns)
      itemColumns = (b as { columns: string[] }).columns;
  });
  (layout?.footer ?? []).forEach((b) => {
    if (b.type === 'field' && (b as { value?: string }).value)
      footer.push((b as { value: string }).value);
  });
  return { header, itemColumns, footer };
}

const FIELD_LABELS: Record<string, string> = {
  logo: 'Store Logo',
  orderNumber: 'Order #',
  orderType: 'Type',
  orderStatus: 'Status',
  serviceTimeType: 'Service',
  scheduleTime: 'Scheduled',
  readyTime: 'Ready',
  actualReadyTime: 'Ready (actual)',
  createdAt: 'Date',
  updatedAt: 'Updated',
  notes: 'Notes',
  paymentMethod: 'Payment',
  currency: 'Currency',
  subtotal: 'Subtotal',
  discount: 'Discount',
  deliveryFee: 'Delivery',
  taxTotal: 'Tax',
  tips: 'Tips',
  totalAmount: 'Total',
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  businessAddress: 'Address',
};

const COLUMN_LABELS: Record<string, string> = {
  name: 'Item',
  quantity: 'Qty',
  size: 'Size',
  unitPrice: 'Price',
  modifierTotals: 'Modifiers',
  lineSubtotal: 'Subtotal',
  specialNotes: 'Notes',
  kitchenSection: 'Section',
};

type Props = {
  template: PrintTemplate | null;
  /** Optional: override paper width for display */
  paperWidth?: '58mm' | '80mm';
  className?: string;
};

/**
 * Single modern invoice/receipt UI. Same layout for all templates; responsive to paper size.
 */
export default function InvoiceReceipt({
  template,
  paperWidth,
  className = '',
}: Props) {
  const router = useRouter();
  const { locale } = router ?? { locale: 'en' };
  const { settings } = useSettingsQuery({
    language: locale as string,
  });

  if (!template) return null;
  const layout = template.layout ?? { header: [], body: [], footer: [] };
  const {
    header: headerKeys,
    itemColumns,
    footer: footerKeys,
  } = getTemplateDataFromLayout(layout);
  const width = paperWidth ?? template.paper_width ?? '80mm';
  const isNarrow = width === '58mm';

  return (
    <div
      className={`mx-auto max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
      style={{
        maxWidth: isNarrow ? '220px' : '300px',
        width: '100%',
      }}
    >
      <div className={`p-4 ${isNarrow ? 'p-3 text-xs' : 'text-sm'}`}>
        {/* Header section */}
        {headerKeys.length > 0 && (
          <div className="space-y-1.5 border-b border-gray-200 pb-3">
            {headerKeys.includes('logo') && (
              <div className="flex justify-center mb-4">
                {settings?.options?.logo?.original ? (
                  <img
                    src={settings.options.logo.original}
                    alt="Store Logo"
                    className="object-contain"
                    style={{
                      maxHeight: isNarrow ? '40px' : '60px',
                      maxWidth: isNarrow ? '120px' : '180px',
                    }}
                  />
                ) : (
                  <div className="flex h-12 w-24 items-center justify-center rounded border border-gray-300 bg-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-500">
                      Store Logo
                    </span>
                  </div>
                )}
              </div>
            )}
            {headerKeys
              .filter((k) => k !== 'logo')
              .map((key) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">
                    {FIELD_LABELS[key] ?? key}:
                  </span>
                  <span className="text-right font-medium text-gray-900 break-words">
                    {SAMPLE_FIELDS[key] ?? '—'}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Items table */}
        {itemColumns.length > 0 && (
          <div className="my-3 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {itemColumns.map((col) => (
                    <th
                      key={col}
                      className={`py-1.5 text-left font-semibold text-gray-700 break-words ${isNarrow ? 'px-1 text-[10px]' : 'px-2 text-xs'}`}
                    >
                      {COLUMN_LABELS[col] ?? col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ITEMS.map((row, i) => (
                  <Fragment key={i}>
                    <tr className="border-b border-gray-100">
                      {itemColumns.map((col) => (
                        <td
                          key={col}
                          className={`py-1.5 text-gray-800 break-words align-top ${isNarrow ? 'px-1 text-[10px]' : 'px-2 text-xs'}`}
                        >
                          {String((row as Record<string, unknown>)[col] ?? '—')}
                        </td>
                      ))}
                    </tr>
                    {row.modifiers && (
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <td
                          colSpan={itemColumns.length}
                          className={`py-1 text-gray-500 italic break-words ${isNarrow ? 'px-1 text-[9px]' : 'px-2 text-[11px]'}`}
                        >
                          {row.modifiers
                            .map(
                              (m: any) =>
                                `+ ${m.name} ${m.qty ? `(${m.qty})` : ''}`,
                            )
                            .join(', ')}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer section */}
        {footerKeys.length > 0 && (
          <div className="space-y-1.5 border-t border-gray-200 pt-3">
            {footerKeys.map((key) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="text-gray-500 shrink-0">
                  {FIELD_LABELS[key] ?? key}:
                </span>
                <span className="text-right font-medium text-gray-900 break-words">
                  {SAMPLE_FIELDS[key] ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {headerKeys.length === 0 &&
          itemColumns.length === 0 &&
          footerKeys.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No data selected for this template.
            </p>
          )}
      </div>
    </div>
  );
}
