import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useState } from 'react';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Checkbox from '@/components/ui/checkbox/checkbox';
import SelectInput from '@/components/ui/select-input';
import {
  useCreatePrinterMutation,
  useUpdatePrinterMutation,
  useScanWiFiMutation,
  useScanLANMutation,
  useScanBluetoothMutation,
} from '@/data/printer';
import { useTemplatesQuery } from '@/data/template';
import { useKitchenSectionsQuery } from '@/data/kitchen-section';
import { Printer } from '@/data/client/printer';
import { Routes } from '@/config/routes';

type FormValues = {
  name: string;
  connection_type: 'lan' | 'wifi' | 'bluetooth';
  interface: string;
  assigned_templates: any[];
  kitchen_sections_list: any[];
  active: boolean;
};

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  connection_type: yup.string().oneOf(['lan', 'wifi', 'bluetooth']).required(),
  interface: yup.string().required('Interface is required'),
  assigned_templates: yup.array().nullable(),
  kitchen_sections_list: yup.array().nullable(),
  active: yup.boolean(),
});

type Props = {
  initialValues?: Printer | null;
};

export default function PrinterForm({ initialValues }: Props) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'form']);
  const { data: templates = [] } = useTemplatesQuery();
  const { data: kitchenSections = [] } = useKitchenSectionsQuery();

  const { mutate: createPrinter, isPending: creating } =
    useCreatePrinterMutation();
  const { mutate: updatePrinter, isPending: updating } =
    useUpdatePrinterMutation();

  const { mutate: scanWiFi, isPending: scanningWiFi } = useScanWiFiMutation();
  const { mutate: scanLAN, isPending: scanningLAN } = useScanLANMutation();
  const { mutate: scanBluetooth, isPending: scanningBluetooth } =
    useScanBluetoothMutation();

  const scanning = scanningWiFi || scanningLAN || scanningBluetooth;
  const [scannedPrinters, setScannedPrinters] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialValues?.name ?? '',
      connection_type: initialValues?.connection_type ?? 'lan',
      interface: initialValues?.interface ?? '',
      assigned_templates: initialValues?.assigned_template_ids
        ? initialValues.assigned_template_ids.map(
            (id) => templates.find((t) => t.id === id) || { id, name: id },
          )
        : [],
      kitchen_sections_list: initialValues?.kitchen_sections
        ? initialValues.kitchen_sections.map(
            (name) =>
              kitchenSections.find((s) => s.name === name) || {
                id: name,
                name,
              },
          )
        : [],
      active: initialValues?.active ?? true,
    },
    resolver: yupResolver(schema) as any,
  });

  const connectionType = useWatch({ control, name: 'connection_type' });

  const onScan = () => {
    setScannedPrinters([]);
    const isBluetooth = connectionType === 'bluetooth';

    const mutation =
      connectionType === 'bluetooth'
        ? scanBluetooth
        : connectionType === 'lan'
          ? scanLAN
          : scanWiFi;

    mutation(undefined, {
      onSuccess: (data: string[]) => {
        setScannedPrinters(data || []);
        if (data?.length === 0) {
          toast.info(
            isBluetooth
              ? 'No Bluetooth printers found'
              : 'No printers found on local network',
          );
        } else {
          toast.success(`Found ${data.length} printers`);
        }
      },
      onError: () =>
        toast.error(
          isBluetooth ? 'Failed to scan Bluetooth' : 'Failed to scan network',
        ),
    });
  };

  const onSubmit = (values: FormValues) => {
    const kitchen_sections = values.kitchen_sections_list
      ? values.kitchen_sections_list.map((s: any) => s.name || s.id)
      : [];
    const assigned_template_ids = values.assigned_templates
      ? values.assigned_templates.map((t: any) => t.id)
      : [];

    const payload = {
      name: values.name,
      connection_type: values.connection_type,
      interface: values.interface,
      assigned_template_ids,
      kitchen_sections,
      active: values.active,
    };

    if (initialValues?.id) {
      updatePrinter(
        { id: initialValues.id, input: payload as any },
        {
          onSuccess: () => {
            toast.success(t('common:update-success'));
            router.push(Routes.printers.list);
          },
          onError: (e: any) =>
            toast.error(e?.message ?? t('common:error-something-wrong')),
        },
      );
    } else {
      createPrinter(payload as any, {
        onSuccess: () => {
          toast.success(t('common:create-success'));
          router.push(Routes.printers.list);
        },
        onError: (e: any) =>
          toast.error(e?.message ?? t('common:error-something-wrong')),
      });
    }
  };

  const isLoading = creating || updating;

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <Card className="mb-8">
        <div className="space-y-5">
          <Input
            label="Name"
            {...register('name')}
            error={errors.name?.message}
            variant="outline"
            disabled={isLoading}
          />
          <div>
            <Label>Connection type</Label>
            <select
              {...register('connection_type')}
              className="mt-1 block w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm focus:border-accent focus:ring-accent/20"
              disabled={isLoading}
            >
              <option value="lan">LAN</option>
              <option value="wifi">WiFi</option>
              <option value="bluetooth">Bluetooth</option>
            </select>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Interface (e.g. 192.168.1.100:9100 or COM3)"
                {...register('interface')}
                error={errors.interface?.message}
                variant="outline"
                disabled={isLoading}
              />
            </div>
            {(connectionType === 'wifi' ||
              connectionType === 'lan' ||
              connectionType === 'bluetooth') && (
              <Button
                type="button"
                onClick={onScan}
                loading={scanning}
                disabled={scanning || isLoading}
                variant="outline"
                className="mb-[2px]"
              >
                Scan
              </Button>
            )}
          </div>
          {scannedPrinters.length > 0 &&
            (connectionType === 'wifi' ||
              connectionType === 'lan' ||
              connectionType === 'bluetooth') && (
              <div>
                <Label>Scanned Printers</Label>
                <select
                  className="mt-1 block w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm focus:border-accent focus:ring-accent/20"
                  onChange={(e) => {
                    if (e.target.value) {
                      setValue('interface', e.target.value);
                    }
                  }}
                >
                  <option value="">
                    Select a printer ID to auto-fill interface
                  </option>
                  {scannedPrinters.map((ip) => (
                    <option key={ip} value={ip}>
                      {ip}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <SelectInput
            name="assigned_templates"
            label="Assigned Templates"
            control={control}
            options={templates}
            isMulti
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id}
            disabled={isLoading}
          />

          <SelectInput
            name="kitchen_sections_list"
            label="Kitchen Sections"
            control={control}
            options={kitchenSections}
            isMulti
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id || option.name}
            disabled={isLoading}
          />

          <Checkbox
            label="Active"
            {...register('active')}
            disabled={isLoading}
            className="mt-5"
          />
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
    </form>
  );
}
