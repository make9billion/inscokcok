import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function DeliveryForm({ product }) {
    const form = useForm({
        delivery_type: product.deliveryType,
        delivery_fee: product.deliveryFee,
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.point-mall.products.delivery.update', product.id), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[130px_120px_auto] sm:items-end">
            <label className="grid gap-1 text-xs font-semibold text-gray-600">
                배송유형
                <select
                    value={form.data.delivery_type}
                    onChange={(event) => form.setData('delivery_type', event.target.value)}
                    className="rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
            </label>
            <button
                type="submit"
                disabled={form.processing}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
                저장
            </button>
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
                            <h3 className="text-base font-semibold text-gray-900">상품 배송 설정</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                포인트몰 상품별 무료배송/유료배송과 배송비를 설정합니다.
                            </p>
                            {flash?.success && (
                                <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                                    {flash.success}
                                </div>
                            )}
                        </div>

                        <div className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-blue-600">
                                                {product.categoryName}
                                            </span>
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                                                {product.isActive ? '판매중' : '비활성'}
                                            </span>
                                        </div>
                                        <h4 className="mt-2 text-base font-bold text-gray-900">{product.name}</h4>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {formatNumber(product.pointPrice)}P · 재고 {formatNumber(product.stockQuantity)}개
                                        </p>
                                    </div>
                                    <DeliveryForm product={product} />
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
