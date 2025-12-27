import Card from '@/components/common/card';
import Search from '@/components/common/search';
import { ArrowDown } from '@/components/icons/arrow-down';
import { ArrowUp } from '@/components/icons/arrow-up';
import Layout from '@/components/layouts/admin';
import CategoryTypeFilter from '@/components/filters/category-type-filter';
import ItemList from '../../components/item/item-list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useItemsQuery } from '@/data/item';
import { Category, SortOrder } from '@/types';
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

export default function ItemsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const { t } = useTranslation();
    const { locale, query: { shop } } = useRouter();
    const [orderBy, setOrder] = useState('created_at');
    const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
    const [visible, setVisible] = useState(true);
    const [status, setStatus] = useState<any>(null);
    const [availability, setAvailability] = useState<any>(null);

    const toggleVisible = () => {
        setVisible((v) => !v);
    };

    const { items, loading, paginatorInfo, error } = useItemsQuery({
        language: locale,
        limit: 20,
        page,
        category_id: category,
        name: searchTerm,
        orderBy,
        sortedBy,
        is_active: status?.value,
        is_available: availability?.value,
    });

    if (loading) return <Loader text={t('common:text-loading')} />;
    if (error) return <ErrorMessage message={error.message} />;

    function handleSearch({ searchText }: { searchText: string }) {
        setSearchTerm(searchText);
        setPage(1);
    }

    function handlePagination(current: any) {
        setPage(current);
    }

    return (
        <>
            <Card className="mb-8 flex flex-col">
                <div className="flex w-full flex-col items-center md:flex-row">
                    <div className="mb-4 md:mb-0 md:w-1/4">
                        <PageHeading title="Items" />
                    </div>

                    <div className="flex w-full flex-col items-center ms-auto md:w-2/4">
                        <Search
                            onSearch={handleSearch}
                            placeholderText={t('form:input-placeholder-search-name')}
                        />
                    </div>

                    <div className="flex items-center ms-auto md:ms-6">
                        <LinkButton
                            href={shop ? `/${shop}${Routes.item.create}` : Routes.item.create}
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
                        'invisible h-0': !visible,
                    })}
                >
                    <div className="mt-5 flex w-full flex-col border-t border-gray-200 pt-5 md:mt-8 md:flex-row md:items-center md:pt-8">
                        <CategoryTypeFilter
                            className="w-full"
                            onCategoryFilter={(category: Category) => {
                                setCategory(category?.id!);
                                setPage(1);
                            }}
                            enableCategory
                        />
                        <div className="w-full">
                            <Select
                                options={[
                                    { value: true, label: 'Active' },
                                    { value: false, label: 'Inactive' },
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
                            <Select
                                options={[
                                    { value: true, label: 'Available' },
                                    { value: false, label: 'Unavailable' },
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
ItemsPage.authenticate = {
    permissions: adminOnly,
};
ItemsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
    props: {
        ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
    },
});
