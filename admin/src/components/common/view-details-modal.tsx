import { useTranslation } from 'next-i18next';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import Image from 'next/image';
import dayjs from 'dayjs';

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

const formatValue = (
  key: string,
  value: any,
  data?: any,
  isCategory?: boolean,
): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">N/A</span>;
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${value ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60'}`}
      >
        {value ? 'Yes' : 'No'}
      </span>
    );
  }

  // Category view: show generated short id instead of full db id
  if (key === 'id' && isCategory && typeof value === 'string') {
    return (
      <span className="inline-flex font-mono text-sm px-2 py-1 rounded bg-slate-100 text-slate-700">
        {generateShortId(value)}
      </span>
    );
  }

  // Kitchen section: show name instead of id (category view)
  if (key === 'kitchen_section_id' && typeof value === 'string') {
    return (
      <span className="font-medium">{getKitchenSectionName(value)}</span>
    );
  }

  // Handle modifier_group_id by looking up the modifier_group object
  if (key === 'modifier_group_id' && data?.modifier_group?.name) {
    return <span className="font-medium">{data.modifier_group.name}</span>;
  }

  // Handle category_id by looking up the category object
  if (key === 'category_id' && data?.category?.name) {
    return <span className="font-medium">{data.category.name}</span>;
  }

  // Handle modifier_group object directly
  if (key === 'modifier_group' && typeof value === 'object' && value?.name) {
    return <span className="font-medium">{value.name}</span>;
  }

  // Handle category object directly
  if (key === 'category' && typeof value === 'object' && value?.name) {
    return <span className="font-medium">{value.name}</span>;
  }

  // Date fields
  if (
    key.includes('_at') ||
    key.includes('date') ||
    key.includes('Date') ||
    key.includes('created') ||
    key.includes('updated')
  ) {
    const date = dayjs(value);
    if (date.isValid() && typeof value === 'string') {
      return date.format('MMM D, YYYY h:mm A');
    }
  }

  // Image fields
  if (key === 'image' || key === 'thumbnail' || key === 'icon') {
    const src =
      typeof value === 'object' && value?.thumbnail
        ? value.thumbnail
        : typeof value === 'string' &&
            (value.startsWith('http') || value.startsWith('/'))
          ? value
          : null;
    if (src) {
      return (
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200/80 bg-gray-50 shadow-sm ring-1 ring-black/5">
          <Image src={src} alt="" fill className="object-cover" />
        </div>
      );
    }
  }

  // Arrays - special handling for modifier_groups
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">Empty</span>;
    }

    // Helper to extract display name from array item
    const getDisplayName = (item: any): string => {
      if (typeof item === 'string') return item;
      if (typeof item !== 'object' || item === null) return String(item);

      // For modifier_groups array items - look for nested modifier_group.name
      if (item.modifier_group?.name) return item.modifier_group.name;
      // For items with direct name property
      if (item.name) return item.name;
      if (item.title) return item.title;
      // For category items
      if (item.category?.name) return item.category.name;
      // Fallback to ID if no name found
      if (item.id) return `ID: ${String(item.id).slice(0, 8)}...`;
      // Last resort
      return JSON.stringify(item).slice(0, 20);
    };

    return (
      <div className="flex flex-wrap gap-2">
        {value.slice(0, 5).map((item, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
          >
            {getDisplayName(item)}
          </span>
        ))}
        {value.length > 5 && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-600 text-xs font-medium">
            +{value.length - 5} more
          </span>
        )}
      </div>
    );
  }

  // Objects (nested) - show name if available
  if (typeof value === 'object') {
    if (value.name) {
      return <span className="font-medium">{value.name}</span>;
    }
    if (value.title) {
      return <span className="font-medium">{value.title}</span>;
    }
    // For complex objects, show a compact representation
    const str = JSON.stringify(value);
    if (str.length > 60) {
      return (
        <span className="text-sm text-gray-600">{str.slice(0, 60)}...</span>
      );
    }
    return <span className="text-sm text-gray-600">{str}</span>;
  }

  // Price fields
  if (key.includes('price') || key.includes('Price') || key === 'cost') {
    const num = Number(value);
    if (!isNaN(num)) {
      return (
        <span className="font-semibold text-emerald-600">${num.toFixed(2)}</span>
      );
    }
  }

  // Default text
  return String(value);
};

const formatKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Fields to exclude from display
const excludedFields = ['__v', 'password', 'token', 'snapshot'];

// Extra exclusions for category view modal
const categoryExcludedFields = ['business_id', 'translated_languages'];

const ViewDetailsModal = ({ entityType }: ViewDetailsModalProps) => {
  const { t } = useTranslation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  if (!data) {
    return null;
  }

  const isCategory = isCategoryData(data);
  const excluded = [
    ...excludedFields,
    ...(isCategory ? categoryExcludedFields : []),
  ];

  const entries = Object.entries(data).filter(
    ([key]) => !excluded.includes(key) && !key.startsWith('_'),
  );

  // Prioritize important fields first
  const priorityFields = [
    'id',
    'name',
    'title',
    'description',
    'image',
    'price',
    'is_active',
    'is_available',
    'status',
  ];
  const sortedEntries = entries.sort(([a], [b]) => {
    const aIndex = priorityFields.indexOf(a);
    const bIndex = priorityFields.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  // Hero: name/title + image + icon when present
  const displayName = data.name ?? data.title;
  const mainImage =
    data.image?.thumbnail ?? data.image ?? data.thumbnail;
  const mainImageSrc =
    typeof mainImage === 'string' ? mainImage : mainImage?.thumbnail;
  const iconSrc =
    typeof data.icon === 'string'
      ? data.icon
      : data.icon?.thumbnail ?? data.icon?.original;
  const hasMedia = mainImageSrc || iconSrc;

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
        <h2 className="text-lg font-semibold text-heading tracking-tight">
          {t('common:text-view-details')}
        </h2>
        <button
          onClick={closeModal}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Hero: name + image + icon (categories show both) */}
      {(displayName || hasMedia) && (
        <div
          className={`px-6 py-5 flex items-center gap-4 border-b border-gray-100 ${isCategory ? 'bg-gradient-to-br from-accent/5 via-gray-50/50 to-transparent' : 'bg-gray-50/50'}`}
        >
          {(mainImageSrc || iconSrc) && (
            <div className="relative w-16 h-16 flex-shrink-0">
              {/* Main image (or icon if no image) */}
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/5">
                <Image
                  src={mainImageSrc || iconSrc}
                  alt={String(displayName ?? '')}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Icon badge overlay for categories when both image and icon exist */}
              {isCategory && mainImageSrc && iconSrc && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg border-2 border-white bg-white shadow-md overflow-hidden">
                  <Image
                    src={iconSrc}
                    alt=""
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
              )}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {isCategory && (
              <span className="inline-block px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider mb-1.5">
                Category
              </span>
            )}
            {displayName && (
              <h3 className="text-xl font-semibold text-heading truncate">
                {String(displayName)}
              </h3>
            )}
          </div>
        </div>
      )}

      {/* Fields list */}
      <div className="max-h-[50vh] overflow-y-auto">
        <div className="px-6 py-4 space-y-0">
          {sortedEntries
            .filter(([key]) => key !== 'name' && key !== 'title' && key !== 'image' && key !== 'thumbnail' && key !== 'icon')
            .map(([key, value], index) => (
              <div
                key={key}
                className={`grid grid-cols-[minmax(0,140px)_1fr] gap-4 py-3.5 px-3 -mx-3 rounded-lg ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50'}`}
              >
                <div className="min-w-0 pt-0.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {formatKey(key)}
                  </span>
                </div>
                <div className="min-w-0 text-sm text-heading break-words">
                  {formatValue(key, value, data, isCategory)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
        <button
          onClick={closeModal}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          {t('common:text-close')}
        </button>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
