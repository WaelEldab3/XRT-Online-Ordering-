import Card from '@/components/common/card';
import Search from '@/components/common/search';
import { ArrowDown } from '@/components/icons/arrow-down';
import { ArrowUp } from '@/components/icons/arrow-up';
import Layout from '@/components/layouts/admin';
import ItemList from '@/components/item/item-list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useItemsQuery } from '@/data/item';
import { useCategoryQuery } from '@/data/category';
import { SortOrder } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import PageHeading from '@/components/common/page-heading';
import LinkButton from '@/components/ui/link-button';
import { Routes } from '@/config/routes';
import Select from '@/components/ui/select/select';
import Label from '@/components/ui/label';
import Button from '@/components/ui/button';
import Link from '@/components/ui/link';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';

export default function CategoryItemsPage() {
    const router = useRouter();
    const { categorySlug } = router.query;
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const { t } = useTranslation();
    const { locale, query: { shop } } = useRouter();
    const [orderBy, setOrder] = useState('created_at');
    const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
    const [visible, setVisible] = useState(true);
    const [status, setStatus] = useState<any>(null);
    const [availability, setAvailability] = useState<any>(null);

    // Fetch category details
    const { category, isLoading: categoryLoading, error: categoryError } = useCategoryQuery({
        id: categorySlug as string,
        slug: categorySlug as string,
        language: locale!,
    });

    const toggleVisible = () => {
        setVisible((v) => !v);
    };

    // Fetch items filtered by category
    const { items, loading, paginatorInfo, error } = useItemsQuery({
        language: locale!,
        limit: 20,
        page,
        category_id: categorySlug as string,
        name: searchTerm,
        orderBy,
        sortedBy,
        is_active: status?.value,
        is_available: availability?.value,
    });

    if (categoryLoading || loading) return <Loader text={t('common:text-loading')} />;
    if (categoryError || error) return <ErrorMessage message={categoryError?.message || error?.message} />;

    function handleSearch({ searchText }: { searchText: string }) {
        setSearchTerm(searchText);
        setPage(1);
    }

    function handlePagination(current: any) {
        setPage(current);
    }

    function handleClearFilters() {
        setSearchTerm('');
        setStatus(null);
        setAvailability(null);
        setPage(1);
    }

    const hasActiveFilters = searchTerm || status || availability;

    return (
        <>
            {/* Breadcrumb Navigation */}
            <Card className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <Link
                        href={Routes.category.list}
                        className="text-body hover:text-accent transition-colors"
                    >
                        {t('form:input-label-categories')}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-heading font-medium">
                        {category?.name || t('common:text-loading')}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-heading font-medium">
                        {t('common:sidebar-nav-item-items')}
                    </span>
                </div>
            </Card>

            <Card className="mb-8 flex flex-col">
                <div className="flex w-full flex-col items-center md:flex-row">
                    <div className="mb-4 md:mb-0 md:w-1/4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={Routes.category.list}
                                className="text-body hover:text-accent transition-colors"
                                title={t('common:text-back')}
                            >
                                <IosArrowLeft width={20} />
                            </Link>
                            <PageHeading 
                                title={category?.name ? `${category.name} - ${t('common:sidebar-nav-item-items')}` : t('common:sidebar-nav-item-items')} 
                            />
                        </div>
                    </div>

                    <div className="flex w-full flex-col items-center ms-auto md:w-2/4">
                        <Search
                            onSearch={handleSearch}
                            placeholderText={t('form:input-placeholder-search-name')}
                        />
                    </div>

                    <div className="flex items-center ms-auto md:ms-6">
                        <LinkButton
                            href={
                                category?.business_id
                                    ? `${Routes.item.create}?business_id=${category.business_id}`
                                    : shop
                                    ? `/${shop}${Routes.item.create}`
                                    : Routes.item.create
                            }
                            className="h-12 md:ms-4 md:h-12 me-4"
                            size="small"
                        >
                            <span>+ {t('form:button-label-add-item')}</span>
                        </LinkButton>

                        <button
                            className="flex items-center whitespace-nowrap text-base font-semibold text-accent"
                            onClick={toggleVisible}
                        >
                            {t('common:text-filter')}{' '}
                            {visible ? (
                                <ArrowUp className="ms-2" />
                            ) : (
                                <ArrowDown className="ms-2" />
                            )}
                        </button>
                    </div>
                </div>

                <div
                    className={cn('flex w-full transition', {
                        'visible h-auto': visible,
                        'invisible h-0 overflow-hidden': !visible,
                    })}
                >
                    <div className="mt-5 w-full border-t border-gray-200 pt-5 md:mt-8 md:pt-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-heading">
                                {t('common:text-filter')}
                            </h3>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={handleClearFilters}
                                    className="text-xs"
                                >
                                    {t('common:text-clear')}
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Category filter is hidden since we're already in a category */}
                            <div className="w-full">
                                <Label>{t('form:input-label-status')}</Label>
                                <Select
                                    options={[
                                        { value: true, label: t('common:text-active') },
                                        { value: false, label: t('common:text-inactive') },
                                    ]}
                                    value={status}
                                    name="is_active"
                                    placeholder={t('form:input-placeholder-status')}
                                    onChange={(value: any) => {
                                        setStatus(value);
                                        setPage(1);
                                    }}
                                    isClearable
                                />
                            </div>
                            <div className="w-full">
                                <Label>{t('form:input-label-availability')}</Label>
                                <Select
                                    options={[
                                        { value: true, label: t('common:text-available') },
                                        { value: false, label: t('common:text-unavailable') },
                                    ]}
                                    value={availability}
                                    name="is_available"
                                    placeholder={t('form:input-placeholder-availability')}
                                    onChange={(value: any) => {
                                        setAvailability(value);
                                        setPage(1);
                                    }}
                                    isClearable
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <ItemList
                items={items}
                paginatorInfo={paginatorInfo}
                onPagination={handlePagination}
                onOrder={setOrder}
                onSort={setColumn}
            />
        </>
    );
}

CategoryItemsPage.authenticate = {
    permissions: adminOnly,
};
CategoryItemsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
    },
});

