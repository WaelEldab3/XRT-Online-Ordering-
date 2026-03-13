import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Checkbox from '@/components/ui/checkbox/checkbox';
import {
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  usePrintableFieldsQuery,
} from '@/data/template';
import { PrintTemplate, TemplateLayout } from '@/data/client/template';
import { Routes } from '@/config/routes';
import { getTemplateDataFromLayout } from '@/components/template/invoice-receipt';
import InvoiceReceipt from '@/components/template/invoice-receipt';

/** Fixed order: fields shown at top of receipt */
const HEADER_FIELD_KEYS = [
  'logo',
  'orderNumber',
  'orderType',
  'orderStatus',
  'createdAt',
  'name',
  'phone',
  'email',
  'address',
  'serviceTimeType',
  'scheduleTime',
  'businessAddress',
];

/** Fixed order: fields shown at bottom of receipt */
const FOOTER_FIELD_KEYS = [
  'notes',
  'subtotal',
  'discount',
  'deliveryFee',
  'taxTotal',
  'tips',
  'totalAmount',
  'paymentMethod',
  'currency',
  'readyTime',
  'actualReadyTime',
  'updatedAt',
];

const FIELD_LABELS: Record<string, string> = {
  logo: 'Store Logo',
  orderNumber: 'Order number',
  orderType: 'Order type',
  orderStatus: 'Order status',
  createdAt: 'Date & time',
  name: 'Customer name',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  serviceTimeType: 'Service type',
  scheduleTime: 'Scheduled time',
  businessAddress: 'Business address',
  notes: 'Notes',
  subtotal: 'Subtotal',
  discount: 'Discount',
  deliveryFee: 'Delivery fee',
  taxTotal: 'Tax',
  tips: 'Tips',
  totalAmount: 'Total',
  paymentMethod: 'Payment method',
  currency: 'Currency',
  readyTime: 'Ready time',
  actualReadyTime: 'Ready (actual)',
  updatedAt: 'Updated at',
};

type FormValues = {
  name: string;
  type: 'kitchen' | 'cashier' | 'generic';
  paper_width: '58mm' | '80mm';
  active: boolean;
};

type Props = {
  initialValues?: PrintTemplate | null;
};

function buildLayoutFromSelection(
  header: string[],
  itemColumns: string[],
  footer: string[],
): TemplateLayout {
  return {
    header: header.map((value) => {
      if (value === 'logo') return { type: 'logo' as const };
      return { type: 'field' as const, value };
    }),
    body:
      itemColumns.length > 0
        ? [{ type: 'itemsTable' as const, columns: itemColumns }]
        : [],
    footer: footer.map((value) => ({ type: 'field' as const, value })),
  };
}

export default function TemplateBuilderForm({ initialValues }: Props) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'form']);
  const { data: fieldsData, isLoading: loadingFields } =
    usePrintableFieldsQuery();

  const initialData = useMemo(() => {
    if (initialValues?.layout)
      return getTemplateDataFromLayout(initialValues.layout);
    return {
      header: [
        'logo',
        'orderNumber',
        'orderType',
        'createdAt',
        'name',
        'phone',
      ],
      itemColumns: ['name', 'quantity', 'specialNotes', 'kitchenSection'],
      footer: ['notes', 'totalAmount', 'paymentMethod'],
    };
  }, [initialValues?.layout]);

  const [headerSelected, setHeaderSelected] = useState<Set<string>>(
    () => new Set(initialData.header),
  );
  const [itemColumnsSelected, setItemColumnsSelected] = useState<Set<string>>(
    () => new Set(initialData.itemColumns),
  );
  const [footerSelected, setFooterSelected] = useState<Set<string>>(
    () => new Set(initialData.footer),
  );

  const { mutate: createTemplate, isPending: creating } =
    useCreateTemplateMutation();
  const { mutate: updateTemplate, isPending: updating } =
    useUpdateTemplateMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialValues?.name ?? '',
      type: initialValues?.type ?? 'kitchen',
      paper_width: initialValues?.paper_width ?? '80mm',
      active: initialValues?.active ?? true,
    },
  });

  const paperWidth = watch('paper_width');
  const itemColumnsOrdered = useMemo(
    () =>
      fieldsData?.itemColumns
        ?.map((c) => c.key)
        .filter((k) => itemColumnsSelected.has(k)) ?? [],
    [fieldsData?.itemColumns, itemColumnsSelected],
  );
  const layoutForPreview = useMemo(
    () =>
      buildLayoutFromSelection(
        HEADER_FIELD_KEYS.filter((k) => headerSelected.has(k)),
        itemColumnsOrdered,
        FOOTER_FIELD_KEYS.filter((k) => footerSelected.has(k)),
      ),
    [headerSelected, itemColumnsOrdered, footerSelected],
  );
  const previewTemplate: PrintTemplate | null = initialValues
    ? { ...initialValues, layout: layoutForPreview, paper_width: paperWidth }
    : {
        id: '',
        name: watch('name') || 'Preview',
        type: watch('type'),
        layout: layoutForPreview,
        paper_width: paperWidth,
        active: true,
        created_by: null,
        created_at: '',
        updated_at: '',
      };

  const toggleHeader = (key: string) => {
    setHeaderSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleItemColumn = (key: string) => {
    setItemColumnsSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleFooter = (key: string) => {
    setFooterSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onSubmit = (values: FormValues) => {
    const header = HEADER_FIELD_KEYS.filter((k) => headerSelected.has(k));
    const itemColumns = itemColumnsOrdered;
    const footer = FOOTER_FIELD_KEYS.filter((k) => footerSelected.has(k));
    const layout = buildLayoutFromSelection(header, itemColumns, footer);

    const payload = {
      name: values.name,
      type: values.type,
      paper_width: values.paper_width,
      active: values.active,
      layout,
    };

    if (initialValues?.id) {
      updateTemplate(
        { id: initialValues.id, input: payload },
        {
          onSuccess: () => {
            toast.success(t('common:update-success'));
            router.push(Routes.printTemplates.list);
          },
          onError: (e: any) =>
            toast.error(e?.message ?? t('common:error-something-wrong')),
        },
      );
    } else {
      createTemplate(payload as any, {
        onSuccess: () => {
          toast.success(t('common:create-success'));
          router.push(Routes.printTemplates.list);
        },
        onError: (e: any) =>
          toast.error(e?.message ?? t('common:error-something-wrong')),
      });
    }
  };

  const isLoading = creating || updating;
  const itemColumnsList = fieldsData?.itemColumns ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mb-6">
        <h3 className="mb-4 text-base font-semibold text-heading">
          Template info
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="Template name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            variant="outline"
            disabled={isLoading}
          />
          <div>
            <Label>Type</Label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="kitchen">Kitchen</option>
              <option value="cashier">Cashier</option>
              <option value="generic">Generic</option>
            </select>
          </div>
          <div>
            <Label>Paper width</Label>
            <select
              {...register('paper_width')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <Checkbox
              label="Active"
              {...register('active')}
              disabled={isLoading}
            />
          </div>
        </div>
      </Card>

      {loadingFields ? (
        <p className="text-body/60">Loading options...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <h3 className="mb-3 text-base font-semibold text-heading">
                Data on receipt
              </h3>
              <p className="mb-4 text-sm text-body/70">
                Choose which data appears on the invoice. The layout is the same
                for all templates.
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-xs font-semibold uppercase text-body/70">
                    Top of receipt
                  </Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {HEADER_FIELD_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={headerSelected.has(key)}
                          onChange={() => toggleHeader(key)}
                          className="rounded border-gray-300"
                        />
                        {FIELD_LABELS[key] ?? key}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-xs font-semibold uppercase text-body/70">
                    Items table columns
                  </Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {itemColumnsList.map((col) => (
                      <label
                        key={col.key}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={itemColumnsSelected.has(col.key)}
                          onChange={() => toggleItemColumn(col.key)}
                          className="rounded border-gray-300"
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-xs font-semibold uppercase text-body/70">
                    Bottom of receipt
                  </Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {FOOTER_FIELD_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={footerSelected.has(key)}
                          onChange={() => toggleFooter(key)}
                          className="rounded border-gray-300"
                        />
                        {FIELD_LABELS[key] ?? key}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                {t('form:button-label-back')}
              </Button>
              <Button type="submit" loading={isLoading} disabled={isLoading}>
                {initialValues
                  ? (t('form:button-label-update') ?? 'Update')
                  : (t('form:button-label-add') ?? 'Create')}
              </Button>
            </div>
          </div>

          <Card>
            <h3 className="mb-3 text-base font-semibold text-heading">
              Preview
            </h3>
            <p className="mb-4 text-sm text-body/70">
              How the receipt will look ({paperWidth}). Same design for all
              paper sizes.
            </p>
            <InvoiceReceipt
              template={previewTemplate}
              paperWidth={paperWidth}
            />
          </Card>
        </div>
      )}
    </form>
  );
}
