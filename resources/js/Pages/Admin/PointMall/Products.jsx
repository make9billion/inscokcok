import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function ProductForm({ product }) {
    const form = useForm({
        name: product.name ?? '',
        summary: product.summary ?? '',
        point_price: product.pointPrice ?? 0,
        stock_quantity: product.stockQuantity ?? 0,
        delivery_type: product.deliveryType ?? 'free',
        delivery_fee: product.deliveryFee ?? 0,
        is_featured: Boolean(product.isFeatured),
        is_active: Boolean(product.isActive),
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.point-mall.products.update', product.id), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    상품명
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    요약
                    <input
                        type="text"
                        value={form.data.summary}
                        onChange={(event) => form.setData('summary', event.target.value)}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    포인트 가격
                    <input
                        type="number"
                        min="0"
                        value={form.data.point_price}
                        onChange={(event) => form.setData('point_price', Number(event.target.value))}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    재고
                    <input
                        type="number"
                        min="0"
                        value={form.data.stock_quantity}
                        onChange={(event) => form.setData('stock_quantity', Number(event.target.value))}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    배송유형
                    <select
                        value={form.data.delivery_type}
                        onChange={(event) => form.setData('delivery_type', event.target.value)}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="free">무료배송</option>
                        <option value="paid">유료배송</option>
                    </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    배송비
                    <input
                        type="number"
                        min="0"
                        value={form.data.delivery_fee}
                        disabled={form.data.delivery_type === 'free'}
                        onChange={(event) => form.setData('delivery_fee', Number(event.target.value))}
                        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.data.is_featured}
                            onChange={(event) => form.setData('is_featured', event.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        추천상품
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(event) => form.setData('is_active', event.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        판매중
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                >
                    저장
                </button>
            </div>
        </form>
    );
}

export default function Products({ products }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">포인트몰 상품 관리</h2>}
        >
            <Head title="포인트몰 상품 관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h3 className="text-base font-semibold text-gray-900">상품 설정</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                포인트 가격, 재고, 노출 상태, 추천 여부, 배송비를 관리합니다.
                            </p>
                            {flash?.success && (
                                <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                                    {flash.success}
                                </div>
                            )}
                        </div>

                        <div className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <div key={product.id} className="grid gap-4 px-5 py-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-blue-600">
                                            {product.categoryName ?? '미분류'}
                                        </span>
                                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                                            {formatNumber(product.pointPrice)}P · 재고 {formatNumber(product.stockQuantity)}개
                                        </span>
                                    </div>
                                    <ProductForm product={product} />
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="px-5 py-12 text-center text-sm text-gray-500">
                                등록된 포인트몰 상품이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
