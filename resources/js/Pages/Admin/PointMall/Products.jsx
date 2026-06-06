import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

export default function Products({ products, categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [stock, setStock] = useState(filters.stock ?? '');
    const [featured, setFeatured] = useState(filters.featured ?? '');
    const [mainVisible, setMainVisible] = useState(filters.main_visible ?? '');
    const hasFilters = Boolean(filters.search || filters.category_id || filters.status || filters.stock || filters.featured || filters.main_visible);

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route('admin.point-mall.products.index'), {
            search: search || undefined,
            category_id: categoryId || undefined,
            status: status || undefined,
            stock: stock || undefined,
            featured: featured || undefined,
            main_visible: mainVisible || undefined,
        }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setStatus('');
        setStock('');
        setFeatured('');
        setMainVisible('');
        router.get(route('admin.point-mall.products.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">포인트몰 상품관리</h2>}>
            <Head title="포인트몰 상품관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-5 rounded-lg border border-toss-blue/20 bg-toss-blueLight px-4 py-3 text-sm font-semibold text-toss-blue">
                            {flash.success}
                        </div>
                    )}

                    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">상품 목록</h3>
                                    <p className="mt-1 text-sm text-gray-500">등록된 상품을 검색하고 수정합니다.</p>
                                </div>
                                <Link href={route('admin.point-mall.products.create')} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700">
                                    <Plus className="size-4" />
                                    상품 등록
                                </Link>
                            </div>

                            <form onSubmit={applyFilters} className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
                                <div className="relative xl:col-span-2">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                    <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="상품명, 요약, 슬러그" className="h-10 w-full rounded-lg border-gray-300 pl-9 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                                </div>
                                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    <option value="">전체 카테고리</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    <option value="">전체 상태</option>
                                    <option value="active">판매중</option>
                                    <option value="inactive">숨김</option>
                                </select>
                                <select value={stock} onChange={(event) => setStock(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    <option value="">전체 재고</option>
                                    <option value="in_stock">재고 있음</option>
                                    <option value="low_stock">부족</option>
                                    <option value="out_of_stock">품절</option>
                                </select>
                                <select value={featured} onChange={(event) => setFeatured(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    <option value="">추천 전체</option>
                                    <option value="1">추천상품</option>
                                </select>
                                <select value={mainVisible} onChange={(event) => setMainVisible(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    <option value="">메인 전체</option>
                                    <option value="1">메인노출</option>
                                </select>
                                <div className="flex gap-2 xl:col-start-7">
                                    <button type="submit" className="h-10 flex-1 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white">검색</button>
                                    {hasFilters && (
                                        <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700" aria-label="필터 초기화">
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['썸네일', '상품', '카테고리', '포인트', '재고', '배송', '노출', '정렬순서', '수정일', '관리'].map((label) => (
                                            <th key={label} scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {products.map((product) => {
                                        const isLowStock = product.lowStockThreshold > 0 && product.stockQuantity <= product.lowStockThreshold;
                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-5 py-4">
                                                    {product.imagePath ? (
                                                        <img src={`/storage/${product.imagePath}`} alt="" className="h-12 w-12 rounded-md object-cover ring-1 ring-gray-200" />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-md bg-gray-100 ring-1 ring-gray-200" />
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Link href={route('admin.point-mall.products.show', product.id)} className="font-semibold text-gray-900 hover:text-toss-blue">{product.name}</Link>
                                                    <p className="mt-1 line-clamp-1 text-sm text-gray-500">{product.summary || '-'}</p>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{product.categoryName || '미분류'}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">{formatNumber(product.pointPrice)}P</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                    <span className={`rounded-lg px-2 py-1 font-semibold ${isLowStock ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {formatNumber(product.stockQuantity)}개
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                    {product.deliveryType === 'paid' ? `${formatNumber(product.deliveryFee)}원` : '무료배송'}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                    {[product.isActive ? '판매중' : '숨김', product.isFeatured ? '추천' : null, product.isMainVisible ? '메인' : null].filter(Boolean).join(' / ')}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{product.sortOrder}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{product.updatedAt}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <Link href={route('admin.point-mall.products.show', product.id)} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                                            <Pencil className="size-3.5" />
                                                            수정
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {products.length === 0 && (
                            <div className="px-5 py-12 text-center text-sm text-gray-500">조건에 맞는 상품이 없습니다.</div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
