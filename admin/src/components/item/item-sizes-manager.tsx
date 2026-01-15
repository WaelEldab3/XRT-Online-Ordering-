import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Table } from '@/components/ui/table';
import Card from '@/components/common/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Label from '@/components/ui/label';
import { TrashIcon } from '@/components/icons/trash';
import { PlusIcon } from '@/components/icons/plus-icon';
import { EditIcon } from '@/components/icons/edit';
import { CheckMark } from '@/components/icons/checkmark';
import { CloseIcon } from '@/components/icons/close-icon';
import { useItemSizesQuery, useCreateItemSizeMutation, useUpdateItemSizeMutation, useDeleteItemSizeMutation } from '@/data/item-size';
import { ItemSizeEntity } from '@/types';
import Alert from '@/components/ui/alert';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import SwitchInput from '@/components/ui/switch-input';
import { Controller, useForm } from 'react-hook-form';
import Description from '@/components/ui/description';
import cn from 'classnames';

interface ItemSizesManagerProps {
  itemId: string;
  businessId: string;
  defaultSizeId?: string | null;
  onDefaultSizeChange?: (sizeId: string | null) => void;
  disabled?: boolean;
}

interface SizeFormData {
  name: string;
  code: string;
  price: number;
  display_order: number;
  is_active: boolean;
}

export default function ItemSizesManager({
  itemId,
  businessId,
  defaultSizeId,
  onDefaultSizeChange,
  disabled = false,
}: ItemSizesManagerProps) {
  const { t } = useTranslation();
  const { sizes, isLoading, error } = useItemSizesQuery(itemId, businessId);
  const { mutate: createSize, isPending: creating } = useCreateItemSizeMutation(itemId);
  const { mutate: updateSize, isPending: updating } = useUpdateItemSizeMutation(itemId);
  const { mutate: deleteSize, isPending: deleting } = useDeleteItemSizeMutation(itemId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SizeFormData>({
    defaultValues: {
      name: '',
      code: '',
      price: 0,
      display_order: 0,
      is_active: true,
    },
  });

  const { control: editControl, handleSubmit: handleEditSubmit, reset: resetEdit } = useForm<SizeFormData>();

  useEffect(() => {
    if (!showAddForm) {
      reset();
    }
  }, [showAddForm, reset]);

  const handleCreate = (data: SizeFormData) => {
    createSize({
      item_id: itemId,
      business_id: businessId,
      ...data,
    }, {
      onSuccess: (newSize: any) => {
        setShowAddForm(false);
        reset();
        // If this is the first size, set it as default
        if (sizes.length === 0 && newSize?.id) {
          onDefaultSizeChange?.(newSize.id);
        }
      },
    });
  };

  const handleUpdate = (id: string) => (data: SizeFormData) => {
    updateSize({
      id,
      ...data,
    }, {
      onSuccess: () => {
        setEditingId(null);
        resetEdit();
      },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('form:confirm-delete-size', { defaultValue: 'Are you sure you want to delete this size? This action cannot be undone.' }))) {
      deleteSize(id, {
        onSuccess: () => {
          if (defaultSizeId === id) {
            onDefaultSizeChange?.(null);
          }
        },
      });
    }
  };

  const handleEdit = (size: ItemSizeEntity) => {
    setEditingId(size.id);
    resetEdit({
      name: size.name,
      code: size.code,
      price: size.price,
      display_order: size.display_order,
      is_active: size.is_active,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  if (isLoading) return <Loader text={t('form:loading-sizes', { defaultValue: 'Loading sizes...' })} />;
  if (error) return <ErrorMessage message={(error as any)?.message || t('form:error-loading-sizes', { defaultValue: 'Failed to load sizes. Please try again.' })} />;

  const columns = [
    {
      title: t('common:name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name: string, record: any, index: number) => {
        if (editingId === record.id) {
          return (
            <Controller
              name="name"
              control={editControl}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  className="!h-9 !text-sm"
                  error={errors.name?.message}
                />
              )}
            />
          );
        }
        return (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-body">{name}</span>
            {defaultSizeId === record.id && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                {t('form:default-size-badge', { defaultValue: 'Default' })}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: t('common:code'),
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string, record: any, index: number) => {
        if (editingId === record.id) {
          return (
            <Controller
              name="code"
              control={editControl}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  className="!h-9 !text-sm"
                  error={errors.code?.message}
                />
              )}
            />
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 font-mono">
            {code}
          </span>
        );
      },
    },
    {
      title: t('common:price'),
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number, record: any, index: number) => {
        if (editingId === record.id) {
          return (
            <Controller
              name="price"
              control={editControl}
              rules={{ required: true, min: 0 }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  className="!h-9 !text-sm"
                  error={errors.price?.message}
                />
              )}
            />
          );
        }
        return (
          <span className="text-sm font-semibold text-body">
            ${price.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: t('common:is-default'),
      dataIndex: 'id',
      key: 'is_default',
      width: 100,
      render: (id: string, record: any, index: number) => (
        <div className="flex items-center justify-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="default-size"
              checked={defaultSizeId === id}
              onChange={() => onDefaultSizeChange?.(id)}
              disabled={disabled || editingId !== null}
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {defaultSizeId === id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <CheckMark className="h-3 w-3 text-accent" />
              </span>
            )}
          </label>
        </div>
      ),
    },
    {
      title: t('common:is-active'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active: boolean, record: any, index: number) => {
        if (editingId === record.id) {
          return (
            <Controller
              name="is_active"
              control={editControl}
              render={({ field }) => (
                <SwitchInput
                  name="is_active"
                  control={editControl}
                  label=""
                />
              )}
            />
          );
        }
        return (
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
            is_active 
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
          )}>
            {is_active ? t('common:text-active') : t('common:text-inactive')}
          </span>
        );
      },
    },
    {
      title: t('common:actions'),
      dataIndex: 'id',
      key: 'actions',
      width: 150,
      render: (id: string, record: any, index: number) => {
        if (editingId === record.id) {
          return (
            <div className="flex space-x-2">
              <Button
                size="small"
                onClick={handleEditSubmit(handleUpdate(id))}
                loading={updating}
                disabled={updating}
              >
                {t('common:save')}
              </Button>
              <Button
                size="small"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updating}
              >
                {t('common:text-cancel')}
              </Button>
            </div>
          );
        }
        return (
          <div className="flex space-x-2">
            <Button
              size="small"
              variant="outline"
              onClick={() => handleEdit(record)}
              disabled={disabled || deleting}
              className="hover:bg-accent/10 hover:border-accent"
            >
              <EditIcon className="h-4 w-4 me-1" />
              {t('common:edit')}
            </Button>
            <Button
              size="small"
              variant="outline"
              onClick={() => handleDelete(id)}
              disabled={disabled || deleting || defaultSizeId === id}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="mb-6 flex items-center justify-between border-b border-border-200 pb-4">
        <div>
          <Label className="text-lg font-semibold text-heading">
            {t('form:input-label-sizes', { defaultValue: 'Sizes' })}
            {sizes.length > 0 && (
              <span className="ml-2 text-sm font-normal text-body">
                ({sizes.length} {t('form:size-count', { defaultValue: 'sizes', count: sizes.length })})
              </span>
            )}
          </Label>
          <Description className="mt-1 text-sm text-body">
            {t('form:sizes-help-text', { defaultValue: 'Manage item sizes and pricing. Select a default size for this item.' })}
          </Description>
        </div>
        {!showAddForm && (
          <Button
            size="small"
            onClick={() => setShowAddForm(true)}
            disabled={disabled}
            className="shrink-0"
          >
            <PlusIcon className="h-4 w-4 me-2" />
            {t('form:button-label-add-size', { defaultValue: 'Add Size' })}
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="mb-6 border-2 border-dashed border-accent/30 bg-accent/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-heading">
              {t('form:add-new-size', { defaultValue: 'Add New Size' })}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => {
                setShowAddForm(false);
                reset();
              }}
              className="!h-8 !w-8 !p-0"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit(handleCreate)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label className="mb-2">
                  {t('form:input-label-size-name', { defaultValue: 'Size Name' })}*
                </Label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: t('form:error-size-name-required', { defaultValue: 'Size name is required' }) }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      error={errors.name?.message}
                      className="!h-10"
                      placeholder={t('form:placeholder-size-name', { defaultValue: 'e.g., Small, Medium, Large' })}
                    />
                  )}
                />
              </div>
              <div>
                <Label className="mb-2">
                  {t('form:input-label-size-code', { defaultValue: 'Size Code' })}*
                </Label>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: t('form:error-size-code-required', { defaultValue: 'Size code is required' }) }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      error={errors.code?.message}
                      className="!h-10 font-mono"
                      placeholder={t('form:input-placeholder-size-code', { defaultValue: 'e.g., S, M, L, XL' })}
                    />
                  )}
                />
              </div>
              <div>
                <Label className="mb-2">
                  {t('form:input-label-size-price', { defaultValue: 'Size Price' })}*
                </Label>
                <Controller
                  name="price"
                  control={control}
                  rules={{ 
                    required: t('form:error-size-price-required', { defaultValue: 'Size price is required' }),
                    min: { value: 0, message: t('form:error-price-must-positive', { defaultValue: 'Price must be positive' }) }
                  }}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        error={errors.price?.message}
                        className="!h-10 !pl-8"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                />
              </div>
              <div>
                <Label className="mb-2">
                  {t('form:input-label-display-order', { defaultValue: 'Display Order' })}
                </Label>
                <Controller
                  name="display_order"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      className="!h-10"
                      placeholder="0"
                    />
                  )}
                />
              </div>
              <div className="flex items-end">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="w-full">
                      <Label className="mb-2 block">
                        {t('form:input-label-active', { defaultValue: 'Active' })}
                      </Label>
                      <SwitchInput
                        name="is_active"
                        control={control}
                        label=""
                      />
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3 border-t border-border-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  reset();
                }}
                disabled={creating}
                className="min-w-[100px]"
              >
                {t('common:text-cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                type="submit"
                loading={creating}
                disabled={creating}
                className="min-w-[100px]"
              >
                <PlusIcon className="h-4 w-4 me-2" />
                {t('form:button-label-add-size', { defaultValue: 'Add Size' })}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {sizes.length === 0 && !showAddForm && (
        <div className="py-12 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <PlusIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-heading mb-2">
            {t('form:no-sizes-added-title', { defaultValue: 'No sizes added yet' })}
          </h3>
          <p className="text-sm text-body mb-4">
            {t('form:no-sizes-added-description', { defaultValue: 'Add sizes to allow customers to choose different options for this item.' })}
          </p>
          <Button
            size="small"
            onClick={() => setShowAddForm(true)}
            disabled={disabled}
          >
            <PlusIcon className="h-4 w-4 me-2" />
            {t('form:button-label-add-first-size', { defaultValue: 'Add Your First Size' })}
          </Button>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="overflow-hidden">
          <Table
            columns={columns}
            data={sizes}
            rowKey="id"
            scroll={{ x: 800 }}
            className="sizes-table"
          />
        </div>
      )}

      {!defaultSizeId && sizes.length > 0 && (
        <Alert
          message={t('form:select-default-size-warning', { defaultValue: 'Please select a default size for this item. The default size will be pre-selected when customers view this item.' })}
          variant="warning"
          className="mt-6"
        />
      )}
    </Card>
  );
}
