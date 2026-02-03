import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import { useParseImportMutation } from '@/data/import';
import { adminOnly } from '@/utils/auth-utils';
import PageHeading from '@/components/common/page-heading';
import { useRouter } from 'next/router';
import ErrorMessage from '@/components/ui/error-message';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import {
  FolderIcon,
  CubeIcon,
  AdjustmentsIcon,
  StackIcon,
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from '@/components/icons/import-export-icons';
import { ChevronRight } from '@/components/icons/chevron-right';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';
import cn from 'classnames';

const ENTITY_TYPES = [
  {
    id: 'categories',
    name: 'Categories',
    description: 'Menu categories and kitchen sections',
    icon: FolderIcon,
  },
  {
    id: 'items',
    name: 'Items',
    description: 'Menu items and products',
    icon: CubeIcon,
  },
  {
    id: 'modifiers',
    name: 'Modifier Groups',
    description: 'Modifier groups configuration',
    icon: AdjustmentsIcon,
  },
  {
    id: 'modifier_items',
    name: 'Modifier Items',
    description: 'Individual modifier options',
    icon: AdjustmentsIcon,
  },
  {
    id: 'sizes',
    name: 'Sizes',
    description: 'Item size variations and pricing',
    icon: StackIcon,
  },
];

const ImportUploadPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = router;
  const initialType = (query.type as string) || 'categories';

  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    mutate: parseImport,
    isPending: isLoading,
    error,
  } = useParseImportMutation();

  useEffect(() => {
    if (query.type && typeof query.type === 'string') {
      setSelectedType(query.type);
    }
  }, [query.type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    parseImport({ file });
  };

  const selectedEntity =
    ENTITY_TYPES.find((e) => e.id === selectedType) || ENTITY_TYPES[0];
  const IconComponent = selectedEntity.icon;

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-body">
        <Link
          href={Routes.import.list}
          className="hover:text-accent transition-colors"
        >
          {t('common:text-import-export')}
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-heading font-medium">
          {t('common:text-import')}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-heading font-medium">{selectedEntity.name}</span>
      </div>

      {/* Header */}
      <Card className="mb-6 border border-border-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(Routes.import.list)}
            className="text-body hover:text-accent transition-colors hidden sm:block"
            title={t('common:text-back')}
          >
            <IosArrowLeft width={18} />
          </button>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <IconComponent className="h-6 w-6 text-accent" />
          </div>
          <div>
            <PageHeading
              title={`${t('common:text-import')} ${selectedEntity.name}`}
            />
            <p className="mt-1 text-sm text-body">
              {t('common:import-description')}
            </p>
          </div>
        </div>
      </Card>

      {/* Entity Type Selection */}
      <Card className="mb-6 border border-border-200 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-heading">
          {t('common:select-data-type')}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ENTITY_TYPES.map((entity) => {
            const Icon = entity.icon;
            const isSelected = selectedType === entity.id;
            return (
              <button
                key={entity.id}
                type="button"
                onClick={() => setSelectedType(entity.id)}
                className={cn(
                  'flex flex-col items-center rounded-xl border-2 p-4 transition-all text-left',
                  isSelected
                    ? 'border-accent bg-accent/5 shadow-sm'
                    : 'border-border-200 hover:border-accent/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
                )}
              >
                <Icon
                  className={cn(
                    'mb-2 h-6 w-6',
                    isSelected ? 'text-accent' : 'text-body',
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-heading' : 'text-body',
                  )}
                >
                  {entity.name}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Upload Form */}
      <Card className="border border-border-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-heading">
              {t('common:csv-or-zip-file')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'relative rounded-xl border-2 border-dashed p-8 transition-all',
                dragActive
                  ? 'border-accent bg-accent/5'
                  : file
                    ? 'border-accent/50 bg-accent/5'
                    : 'border-border-200 bg-gray-50/50 hover:border-accent/40 dark:bg-gray-800/30 dark:border-gray-600',
              )}
            >
              <input
                type="file"
                accept=".csv,.zip"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                required={!file}
              />
              <div className="flex flex-col items-center text-center">
                {file ? (
                  <>
                    <DocumentArrowUpIcon className="mb-3 h-12 w-12 text-accent" />
                    <p className="text-sm font-medium text-heading">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-body">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      {t('common:remove-file')}
                    </button>
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="mb-3 h-12 w-12 text-body" />
                    <p className="text-sm text-body">
                      <span className="font-semibold text-accent">
                        {t('common:click-to-upload')}
                      </span>{' '}
                      {t('common:or-drag-and-drop')}
                    </p>
                    <p className="mt-1 text-xs text-body">
                      {t('common:csv-zip-files-only')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <ErrorMessage
              message={
                (error as any)?.response?.data?.message ||
                (error as any)?.message ||
                t('common:upload-failed')
              }
            />
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border-200 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(Routes.import.list)}
              disabled={isLoading}
              className="border-border-200 text-heading hover:border-accent hover:text-accent"
            >
              {t('common:text-cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!file || isLoading}
              loading={isLoading}
              className="bg-accent hover:bg-accent-hover text-white border-0"
            >
              {isLoading
                ? t('common:text-loading')
                : t('common:parse-and-validate')}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};

ImportUploadPage.authenticate = {
  permissions: adminOnly,
};
ImportUploadPage.Layout = Layout;

export default ImportUploadPage;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
