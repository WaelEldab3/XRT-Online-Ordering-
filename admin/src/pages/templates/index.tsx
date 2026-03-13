import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';
import Link from 'next/link';
import LinkButton from '@/components/ui/link-button';
import Search from '@/components/common/search';
import { useTemplatesQuery, useDeleteTemplateMutation } from '@/data/template';
import { useMemo, useState } from 'react';
import Badge from '@/components/ui/badge/badge';
import { toast } from 'react-toastify';
import TemplatePreviewModal from '@/components/template/template-preview-modal';
import { PrintTemplate } from '@/data/client/template';

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return '—';
  }
}

export default function TemplatesPage() {
  const { t } = useTranslation(['common', 'form']);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<PrintTemplate | null>(null);
  const { data: templates = [], isLoading: loading, error } = useTemplatesQuery({
    ...(typeFilter && { type: typeFilter as 'kitchen' | 'cashier' | 'generic' }),
    ...(activeFilter === 'true' && { active: true }),
    ...(activeFilter === 'false' && { active: false }),
  });
  const { mutate: deleteTemplate, isPending: deleting } = useDeleteTemplateMutation();

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    deleteTemplate(id, {
      onSuccess: () => toast.success('Template deleted'),
      onError: (e: any) => toast.error(e?.message ?? 'Failed to delete template'),
    });
  };

  const filteredTemplates = useMemo(() => {
    let list = templates;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((tpl) => tpl.name.toLowerCase().includes(q));
    }
    return list;
  }, [templates, searchTerm]);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="mb-6">
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-h-[4.75rem] flex-col justify-end md:w-1/4">
            <PageHeading title="Print templates" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="w-full sm:w-56">
              <Search
                onSearch={({ searchText }) => setSearchTerm(searchText)}
                placeholderText="Search templates..."
              />
            </div>
            <div className="flex flex-wrap items-end gap-3 sm:gap-4">
              <label className="flex min-w-[140px] flex-col gap-1.5">
                <span className="text-center text-xs font-medium text-body/70">Type</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select h-12 min-w-[140px] cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-9 text-sm text-heading shadow-sm transition hover:border-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="">All types</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="cashier">Cashier</option>
                  <option value="generic">Generic</option>
                </select>
              </label>
              <label className="flex min-w-[140px] flex-col gap-1.5">
                <span className="text-center text-xs font-medium text-body/70">Status</span>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="filter-select h-12 min-w-[140px] cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-9 text-sm text-heading shadow-sm transition hover:border-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>
            <LinkButton href={Routes.printTemplates.create} className="h-12 shrink-0">
              + Add template
            </LinkButton>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-heading">
              {searchTerm || typeFilter || activeFilter
                ? 'No templates match your filters'
                : 'No templates yet'}
            </h3>
            <p className="mb-6 max-w-sm text-sm text-body/70">
              {searchTerm || typeFilter || activeFilter
                ? 'Try changing search or filters, or create a new template.'
                : 'Create your first print template to define receipt and ticket layouts for your printers.'}
            </p>
            <LinkButton href={Routes.printTemplates.create}>
              + Add template
            </LinkButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-body/80">
                    Name
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-body/80">
                    Type
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-body/80">
                    Paper
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-body/80">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-body/80">
                    Updated
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-body/80">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTemplates.map((tpl, index) => (
                  <tr
                    key={tpl.id}
                    className={
                      index % 2 === 0
                        ? 'bg-white transition-colors hover:bg-gray-50/50'
                        : 'bg-gray-50/30 transition-colors hover:bg-gray-50/70'
                    }
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-heading">{tpl.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        text={tpl.type}
                        className={
                          tpl.type === 'kitchen'
                            ? 'bg-amber-100 text-amber-800'
                            : tpl.type === 'cashier'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-200 text-gray-700'
                        }
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-body">{tpl.paper_width}</td>
                    <td className="px-5 py-4">
                      <Badge
                        text={tpl.active ? 'Active' : 'Inactive'}
                        className={
                          tpl.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-body/70">
                      {formatRelativeDate(tpl.updated_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(tpl)}
                          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-heading transition hover:bg-gray-50 hover:border-gray-400"
                        >
                          View
                        </button>
                        <Link
                          href={Routes.printTemplates.edit(tpl.id)}
                          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-heading transition hover:bg-gray-50 hover:border-gray-400"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(tpl.id, tpl.name)}
                          disabled={deleting}
                          className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </>
  );
}

TemplatesPage.authenticate = {};
TemplatesPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
