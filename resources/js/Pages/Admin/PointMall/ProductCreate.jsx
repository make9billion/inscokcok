import ProductDescriptionEditor from '@/Components/Admin/ProductDescriptionEditor';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const emptyProduct = {
    point_mall_category_id: '',
    name: '',
    summary: '',
    description: '',
    point_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 0,
    delivery_type: 'free',
    delivery_fee: 0,
    sort_order: 0,
    is_featured: false,
    is_main_visible: false,
    is_active: true,
    image: null,
};

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

function CheckGroup({ form }) {
    return (
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
    );
}

export default function ProductCreate({ categories }) {
    const form = useForm(emptyProduct);

    const submit = (event) => {
        event.preventDefault();
        form.transform(normalizeProductPayload);
        form.post(route('admin.point-mall.products.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">상품 등록</h2>}>
            <Head title="상품 등록" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <Link href={route('admin.point-mall.products.index')} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                        상품 목록으로
                    </Link>

                    <form onSubmit={submit} className="mt-5 rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-semibold text-gray-900">상품 기본정보</h3>
                            <p className="text-sm text-gray-500">썸네일, 포인트, 재고, 배송비, 노출 상태를 함께 등록합니다.</p>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-3">
                            <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                카테고리
                                <select value={form.data.point_mall_category_id} onChange={(event) => form.setData('point_mall_category_id', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                    <option value="">선택</option>
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
                            <label className="grid gap-1 text-xs font-semibold text-gray-600 lg:col-span-3">
                                썸네일 이미지
                                <input type="file" accept="image/*" onChange={(event) => form.setData('image', event.target.files?.[0] ?? null)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
                            </label>
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
                        </div>

                        <div className="mt-5">
                            <ProductDescriptionEditor value={form.data.description} onChange={(value) => form.setData('description', value)} />
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <CheckGroup form={form} />
                            <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                                상품 등록
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
