import ProductDescriptionEditor from '@/Components/Admin/ProductDescriptionEditor';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

const normalizeProductPayload = (data) => ({
    ...data,
    is_featured: data.is_featured ? 1 : 0,
    is_main_visible: data.is_main_visible ? 1 : 0,
    is_active: data.is_active ? 1 : 0,
});

function NumberField({ label, value, onChange, disabled = false }) {
    return (
        <label className="grid gap-1 text-xs font-semibold text-gray-600">
            {label}
            <input type="number" min="0" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="rounded-md border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue disabled:bg-gray-100" />
        </label>
    );
}

function ChangeSummary({ log }) {
    const before = log.before ?? {};
    const after = log.after ?? {};
    const changedKeys = Object.keys(after).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));

    if (changedKeys.length === 0) {
        return <p className="mt-1 text-sm text-gray-500">{log.memo || '변경 상세 없음'}</p>;
    }

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {changedKeys.slice(0, 8).map((key) => (
                <span key={key} className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{key}</span>
            ))}
            {changedKeys.length > 8 && <span className="text-xs font-semibold text-gray-500">+{changedKeys.length - 8}</span>}
        </div>
    );
}

export default function ProductShow({ product, categories, logs }) {
    const { flash } = usePage().props;
    const form = useForm({
        point_mall_category_id: product.categoryId ?? '',
        name: product.name ?? '',
        summary: product.summary ?? '',
        description: product.description ?? '',
        point_price: product.pointPrice ?? 0,
        stock_quantity: product.stockQuantity ?? 0,
        low_stock_threshold: product.lowStockThreshold ?? 0,
        delivery_type: product.deliveryType ?? 'free',
        delivery_fee: product.deliveryFee ?? 0,
        sort_order: product.sortOrder ?? 0,
        is_featured: Boolean(product.isFeatured),
        is_main_visible: Boolean(product.isMainVisible),
        is_active: Boolean(product.isActive),
        image: null,
    });

    const submit = (event) => {
        event.preventDefault();
        form.transform((data) => ({ ...normalizeProductPayload(data), _method: 'patch' }));
        form.post(route('admin.point-mall.products.update', product.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };
    const deleteProduct = () => {
        if (window.confirm(`${product.name} 상품을 삭제할까요?`)) {
            router.delete(route('admin.point-mall.products.destroy', product.id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">상품 상세</h2>}>
            <Head title="상품 상세" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <Link href={route('admin.point-mall.products.index')} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                        상품 목록으로
                    </Link>

                    {flash?.success && (
                        <div className="mt-5 rounded-lg border border-toss-blue/20 bg-toss-blueLight px-4 py-3 text-sm font-semibold text-toss-blue">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-5 rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-toss-blue">{product.categoryName || '미분류'}</p>
                                <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
                                <p className="mt-2 text-sm text-gray-500">{formatNumber(product.pointPrice)}P · 재고 {formatNumber(product.stockQuantity)}개</p>
                            </div>
                            <div className="flex items-start gap-3">
                                {product.imagePath && (
                                    <img src={`/storage/${product.imagePath}`} alt="" className="h-28 w-28 rounded-lg object-cover ring-1 ring-gray-200" />
                                )}
                                <button type="button" onClick={deleteProduct} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                                    <Trash2 className="size-4" />
                                    삭제
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 lg:grid-cols-3">
                            <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                카테고리
                                <select value={form.data.point_mall_category_id} onChange={(event) => form.setData('point_mall_category_id', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="grid gap-1 text-xs font-semibold text-gray-600 lg:col-span-2">
                                상품명
                                <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            </label>
                            <label className="grid gap-1 text-xs font-semibold text-gray-600 lg:col-span-3">
                                요약
                                <input value={form.data.summary} onChange={(event) => form.setData('summary', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            </label>
                            <div className="lg:col-span-3">
                                <ProductDescriptionEditor value={form.data.description} onChange={(value) => form.setData('description', value)} />
                            </div>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <NumberField label="포인트 가격" value={form.data.point_price} onChange={(value) => form.setData('point_price', value)} />
                            <NumberField label="재고" value={form.data.stock_quantity} onChange={(value) => form.setData('stock_quantity', value)} />
                            <NumberField label="부족 알림 기준" value={form.data.low_stock_threshold} onChange={(value) => form.setData('low_stock_threshold', value)} />
                            <NumberField label="정렬순서" value={form.data.sort_order} onChange={(value) => form.setData('sort_order', value)} />
                            <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                배송 유형
                                <select value={form.data.delivery_type} onChange={(event) => form.setData('delivery_type', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    <option value="free">무료배송</option>
                                    <option value="paid">유료배송</option>
                                </select>
                            </label>
                            <NumberField label="배송비" value={form.data.delivery_fee} disabled={form.data.delivery_type === 'free'} onChange={(value) => form.setData('delivery_fee', value)} />
                            <label className="grid gap-1 text-xs font-semibold text-gray-600 sm:col-span-2">
                                썸네일 이미지 교체
                                <input type="file" accept="image/*" onChange={(event) => form.setData('image', event.target.files?.[0] ?? null)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
                            </label>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={form.data.is_featured} onChange={(event) => form.setData('is_featured', event.target.checked)} className="rounded border-gray-300 text-toss-blue focus:ring-toss-blue" />
                                    추천상품
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={form.data.is_main_visible} onChange={(event) => form.setData('is_main_visible', event.target.checked)} className="rounded border-gray-300 text-toss-blue focus:ring-toss-blue" />
                                    메인노출
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} className="rounded border-gray-300 text-toss-blue focus:ring-toss-blue" />
                                    판매중
                                </label>
                            </div>
                            <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                                저장
                            </button>
                        </div>
                    </form>

                    <section className="mt-5 rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <h2 className="text-base font-semibold text-gray-900">운영 로그</h2>
                        <div className="mt-4 divide-y divide-gray-100">
                            {logs.map((log) => (
                                <div key={log.id} className="py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-gray-900">{log.actionLabel}</span>
                                        <span className="text-sm text-gray-500">{log.createdAt}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">처리자 {log.actorName || '-'}</p>
                                    <ChangeSummary log={log} />
                                </div>
                            ))}
                        </div>
                        {logs.length === 0 && (
                            <p className="mt-4 text-sm text-gray-500">아직 운영 로그가 없습니다.</p>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
