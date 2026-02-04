import { useTranslation } from 'next-i18next';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useState } from 'react';
import { ClipboardIcon } from '@/components/icons/clipboard';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { EditIcon } from '@/components/icons/edit';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';

type ViewDetailsModalProps = {
  entityType?: 'category' | 'item' | 'modifier-group' | 'modifier';
};

// Kitchen section id -> display name (for category view)
const KITCHEN_SECTION_NAMES: Record<string, string> = {
  KS_001: 'Appetizers',
  KS_002: 'Main Course',
  KS_003: 'Desserts',
  KS_004: 'Beverages',
};

const getKitchenSectionName = (id: string): string =>
  KITCHEN_SECTION_NAMES[id] ?? id;

/** Generate a short display id from the real id (deterministic, does not expose real id) */
const generateShortId = (realId: string, length = 8): string => {
  if (typeof realId !== 'string' || realId.length === 0) return String(realId);
  const base36 = '0123456789abcdefghijklmnopqrstuvwxyz';
  let hash = 0;
  for (let i = 0; i < realId.length; i++) {
    const c = realId.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  const abs = Math.abs(hash);
  let short = '';
  let n = abs;
  for (let i = 0; i < length; i++) {
    short = base36[n % 36] + short;
    n = Math.floor(n / 36);
  }
  return short;
};

const isCategoryData = (data: any): boolean =>
  Boolean(data && 'kitchen_section_id' in data && !('category_id' in data));

const formatKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`group flex items-center gap-1.5 text-xs font-medium transition-colors focus:outline-none ${
        copied ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
      }`}
      title="Copy ID"
    >
      {label && <span>{label}</span>}
      {copied ? (
        <CheckMarkCircle className="w-3.5 h-3.5" />
      ) : (
        <ClipboardIcon className="w-3.5 h-3.5" />
      )}
    </button>
  );
};

// Fields to exclude from display
const excludedFields = ['__v', 'password', 'token', 'snapshot'];

// Extra exclusions for category view modal
const categoryExcludedFields = [
  'business_id',
  'translated_languages',
  'icon_public_id',
  'image_public_id',
  'kitchen_section_id',
];

const itemExcludedFields = ['category_id', 'image_public_id'];

const ViewDetailsModal = ({ entityType }: ViewDetailsModalProps) => {
  const { t } = useTranslation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const router = useRouter();
  const { locale } = router;

  if (!data) {
    return null;
  }

  const isCategory = isCategoryData(data);
  // Simple check for item: has base_price/price and category/category_id
  const isItem = Boolean(
    data && ('base_price' in data || 'price' in data) && 'category_id' in data,
  );

  const excluded = [
    ...excludedFields,
    ...(isCategory ? categoryExcludedFields : []),
    ...(isItem ? itemExcludedFields : []),
  ];

  const entries = Object.entries(data).filter(
    ([key]) =>
      !excluded.includes(key) &&
      !key.startsWith('_') &&
      key !== 'id' &&
      key !== 'name' &&
      key !== 'title' &&
      key !== 'description' &&
      key !== 'image' &&
      key !== 'thumbnail' &&
      key !== 'icon' &&
      key !== 'price' &&
      key !== 'base_price' &&
      key !== 'is_active' &&
      key !== 'is_available' &&
      !key.includes('public_id'),
  );

  // Sorting
  const priorityFields = ['status'];
  const sortedEntries = entries.sort(([a], [b]) => {
    const aIndex = priorityFields.indexOf(a);
    const bIndex = priorityFields.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  // Hero Data
  const displayName = data.name ?? data.title;
  const displayDescription = data.description;
  const displayPrice = isItem
    ? (data.base_price ?? data.price)
    : (data.price ?? null);

  const mainImage = data.image?.thumbnail ?? data.image ?? data.thumbnail;
  const mainImageSrc =
    typeof mainImage === 'string' ? mainImage : mainImage?.thumbnail;

  const isActive = data.is_active;
  const isAvailable = data.is_available; // Might only exist on items

  const editUrl = isCategory
    ? Routes.category.edit(data.id, locale!)
    : isItem
      ? Routes.item.edit(data.id ?? data.slug, locale!) // Corrected route for items
      : null; // Fallback

  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined)
      return <span className="text-gray-300 italic">N/A</span>;

    if (typeof value === 'boolean') {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
            value
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (key === 'kitchen_section_id' && typeof value === 'string') {
      return (
        <span className="font-semibold text-heading">
          {getKitchenSectionName(value)}
        </span>
      );
    }

    if (key === 'modifier_group_id' && data?.modifier_group?.name) {
      return (
        <span className="font-semibold text-heading">
          {data.modifier_group.name}
        </span>
      );
    }

    // Handle modifier_group object directly if passed
    if (key === 'modifier_group' && typeof value === 'object' && value?.name) {
      return <span className="font-semibold text-heading">{value.name}</span>;
    }

    if (
      key.includes('_at') ||
      key.includes('date') ||
      key.includes('created') ||
      key.includes('updated')
    ) {
      const date = dayjs(value);
      if (date.isValid())
        return (
          <span className="font-medium text-heading">
            {date.format('MMM D, YYYY')}
          </span>
        );
    }

    if (Array.isArray(value)) {
      if (value.length === 0)
        return <span className="text-gray-400 italic">Empty</span>;

      // Helper to extract display name from array item
      const getDisplayName = (item: any): string => {
        if (typeof item === 'string') return item;
        if (typeof item !== 'object' || item === null) return String(item);

        // For modifier_groups array items - look for nested modifier_group.name
        // This matches the ItemRepository population logic
        if (item.modifier_group?.name) return item.modifier_group.name;

        if (item.name) return item.name;
        if (item.title) return item.title;
        if (item.category?.name) return item.category.name;
        // Fallback
        return JSON.stringify(item).slice(0, 15) + '...';
      };

      return (
        <div className="flex flex-wrap gap-1.5">
          {value.slice(0, 8).map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200"
            >
              {getDisplayName(item)}
            </span>
          ))}
          {value.length > 8 && (
            <span className="px-2 py-1 rounded bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
              +{value.length - 8}
            </span>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      if (value.name)
        return <span className="font-semibold text-heading">{value.name}</span>;
      return (
        <code className="text-xs bg-gray-50 p-1 rounded">
          {JSON.stringify(value).slice(0, 50)}
        </code>
      );
    }

    return <span className="font-semibold text-heading">{String(value)}</span>;
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[90vh]">
      {/* 2-Column Grid */}
      <div className="flex flex-col md:grid md:grid-cols-2 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Media */}
        <div className="relative w-full h-64 md:h-full bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex items-center justify-center p-8">
          {mainImageSrc ? (
            <div className="relative w-full h-full max-h-[400px] aspect-square rounded-2xl overflow-hidden shadow-lg border border-white bg-white">
              <Image
                src={mainImageSrc}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full max-h-[400px] aspect-square rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16 mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}

          {/* Price Overlay (Mobile Only mainly) */}
          {displayPrice !== null && (
            <div className="absolute top-6 right-6 md:left-6 md:right-auto md:top-6 bg-white/90 backdrop-blur shadow-sm border border-gray-200/50 px-4 py-2 rounded-xl">
              <span className="text-2xl font-bold text-accent">
                ${Number(displayPrice).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col h-full bg-white overflow-y-auto">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {isCategory ? 'Category' : isItem ? 'Product' : 'Entity'}
                  </span>
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                    <span className="text-xs font-mono text-gray-400">
                      ID: {generateShortId(data.id)}
                    </span>
                    <CopyButton text={data.id} />
                  </div>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-heading mt-2 tracking-tight leading-tight">
                {displayName}
              </h3>

              {displayDescription && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {displayDescription}
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-3 mt-6">
              {typeof isActive !== 'undefined' && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </div>
              )}
              {typeof isAvailable !== 'undefined' && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isAvailable ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}
                >
                  {isAvailable ? 'Available' : 'Unavailable'}
                </div>
              )}
            </div>
          </div>

          {/* Data Grid */}
          <div className="p-8 space-y-6">
            {sortedEntries.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {formatKey(key)}
                </span>
                <div className="text-sm">{renderValue(key, value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
        <button
          onClick={closeModal}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          Close
        </button>

        {editUrl && (
          <Link
            href={editUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            onClick={closeModal} // Close modal when navigating
          >
            <EditIcon className="w-4 h-4" />
            <span>Edit {isCategory ? 'Category' : 'Item'}</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ViewDetailsModal;
