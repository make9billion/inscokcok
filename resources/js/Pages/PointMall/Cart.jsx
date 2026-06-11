import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Minus, Plus, Search, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

export default function Cart({ auth, cart }) {
    const { flash, errors } = usePage().props;
    const [quantities, setQuantities] = useState(() =>
        Object.fromEntries(cart.items.map((item) => [item.id, item.quantity])),
    );
    const form = useForm({
        recipient_name: auth?.user?.name ?? '',
        recipient_phone: auth?.user?.phone ?? '',
        postal_code: auth?.user?.postal_code ?? '',
        address_line1: auth?.user?.address_line1 ?? '',
        address_line2: auth?.user?.address_line2 ?? '',
        delivery_memo: '',
    });

    const setQuantity = (itemId, quantity) => {
        setQuantities((current) => ({
            ...current,
            [itemId]: Math.max(1, Math.min(99, Number(quantity) || 1)),
        }));
    };

    const updateQuantity = (item) => {
        router.patch(
            route('point-mall.cart.items.update', item.id),
            { quantity: quantities[item.id] ?? item.quantity },
            { preserveScroll: true },
        );
    };

    const removeItem = (item) => {
        if (!confirm('장바구니에서 이 상품을 삭제할까요?')) {
            return;
        }

        router.delete(route('point-mall.cart.items.destroy', item.id), { preserveScroll: true });
    };

    const openAddressSearch = () => {
        if (!window.daum?.Postcode) {
            alert('주소검색을 사용하려면 카카오/다음 우편번호 스크립트가 필요합니다.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: (address) => {
                form.setData((current) => ({
                    ...current,
                    postal_code: address.zonecode,
                    address_line1: address.roadAddress || address.jibunAddress,
                }));
                window.setTimeout(() => document.getElementById('point_mall_address_line2')?.focus(), 0);
            },
        }).open();
    };

    const checkout = (event) => {
        event.preventDefault();
        form.post(route('point-mall.cart.checkout'), { preserveScroll: true });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="장바구니" />

            <section className="bg-[#f7f8fb]">
                <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-black text-[#f47b20]">Point Mall</p>
                            <h1 className="mt-2 text-3xl font-black tracking-normal text-gray-950">장바구니</h1>
                            <p className="mt-2 text-sm font-semibold text-gray-500">상품 수량과 배송지를 확인한 뒤 주문을 완료해 주세요.</p>
                        </div>
                        <Link href="/point-mall" className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50">
                            쇼핑 계속하기
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="mt-6 rounded-2xl bg-[#edf8f2] px-4 py-3 text-sm font-black text-[#168044]">
                            {flash.success}
                        </div>
                    )}

                    {cart.items.length === 0 ? (
                        <div className="mt-8 rounded-[28px] bg-white px-5 py-16 text-center ring-1 ring-gray-100">
                            <ShoppingBag className="mx-auto size-12 text-gray-300" strokeWidth={1.5} />
                            <p className="mt-4 text-sm font-bold text-gray-500">장바구니가 비어 있습니다.</p>
                            <Link href="/point-mall" className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#12284a] px-5 text-sm font-black text-white">
                                상품 보러가기
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <article key={item.id} className="overflow-hidden rounded-[24px] bg-white ring-1 ring-gray-100">
                                        <div className="grid gap-4 p-4 sm:grid-cols-[132px_1fr]">
                                            <Link
                                                href={route('point-mall.products.show', item.product.slug)}
                                                className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#f3f5f8] text-gray-400"
                                            >
                                                {item.product.imagePath ? (
                                                    <img src={`/storage/${item.product.imagePath}`} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <ShoppingBag className="size-10" strokeWidth={1.5} />
                                                )}
                                            </Link>

                                            <div className="min-w-0">
                                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                    <div>
                                                        <p className="text-xs font-black text-[#f47b20]">{item.product.categoryName ?? '포인트 상품'}</p>
                                                        <Link href={route('point-mall.products.show', item.product.slug)} className="mt-1 block text-lg font-black leading-6 text-gray-950 hover:text-[#f47b20]">
                                                            {item.product.name}
                                                        </Link>
                                                        <p className="mt-2 text-sm font-semibold text-gray-500">
                                                            {item.product.deliveryType === 'paid'
                                                                ? `배송비 ${formatNumber(item.product.deliveryFee)}원`
                                                                : '무료배송'}
                                                        </p>
                                                    </div>
                                                    <p className="text-xl font-black tabular-nums text-[#12284a]">{formatNumber(item.product.pointPrice)}P</p>
                                                </div>

                                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="inline-flex h-11 w-fit items-center overflow-hidden rounded-2xl bg-[#f7f8fb] ring-1 ring-gray-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuantity(item.id, (quantities[item.id] ?? item.quantity) - 1)}
                                                            className="grid size-11 place-items-center text-gray-600 transition hover:bg-white"
                                                            aria-label="수량 감소"
                                                        >
                                                            <Minus className="size-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="99"
                                                            value={quantities[item.id] ?? item.quantity}
                                                            onChange={(event) => setQuantity(item.id, event.target.value)}
                                                            className="h-11 w-14 border-0 bg-transparent p-0 text-center text-sm font-black tabular-nums text-gray-950 focus:ring-0"
                                                            aria-label="수량"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuantity(item.id, (quantities[item.id] ?? item.quantity) + 1)}
                                                            className="grid size-11 place-items-center text-gray-600 transition hover:bg-white"
                                                            aria-label="수량 증가"
                                                        >
                                                            <Plus className="size-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item)}
                                                            className="h-10 rounded-xl bg-[#12284a] px-4 text-sm font-black text-white transition hover:bg-[#0b1a33]"
                                                        >
                                                            수량 적용
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item)}
                                                            className="grid size-10 place-items-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                                            aria-label="삭제"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-2xl bg-[#fff7ed] px-4 py-3 text-right text-sm font-black text-[#9a4a12]">
                                                    상품 합계 {formatNumber((quantities[item.id] ?? item.quantity) * item.product.pointPrice)}P
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}

                                {(errors?.cart || errors?.quantity) && (
                                    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">
                                        {errors.cart || errors.quantity}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={checkout} className="self-start rounded-[28px] bg-white p-5 ring-1 ring-gray-100">
                                <h2 className="text-lg font-black text-gray-950">주문/배송 정보</h2>

                                <div className="mt-5 rounded-2xl bg-[#f7f8fb] p-4">
                                    <dl className="space-y-3 text-sm">
                                        <SummaryRow label="보유 포인트" value={`${formatNumber(cart.summary.pointBalance)}P`} />
                                        <SummaryRow label="상품 포인트" value={`${formatNumber(cart.summary.totalPoints)}P`} />
                                        <SummaryRow label="사용 예정 포인트" value={`${formatNumber(cart.summary.usedPoints)}P`} />
                                        <SummaryRow label="부족 포인트 결제" value={`${formatNumber(cart.summary.pointShortfall)}원`} />
                                        <SummaryRow label="배송비" value={`${formatNumber(cart.summary.deliveryFee)}원`} />
                                        <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
                                            <dt className="font-black text-gray-950">추가 결제금액</dt>
                                            <dd className="font-black tabular-nums text-[#f47b20]">{formatNumber(cart.summary.cashPaymentAmount)}원</dd>
                                        </div>
                                    </dl>
                                </div>

                                {form.errors.cart && <p className="mt-4 text-sm font-black text-red-600">{form.errors.cart}</p>}

                                <div className="mt-5 grid gap-3">
                                    <Field label="받는 분" error={form.errors.recipient_name}>
                                        <input
                                            type="text"
                                            value={form.data.recipient_name}
                                            onChange={(event) => form.setData('recipient_name', event.target.value)}
                                            className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm font-semibold focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        />
                                    </Field>

                                    <Field label="연락처" error={form.errors.recipient_phone}>
                                        <input
                                            type="text"
                                            value={form.data.recipient_phone}
                                            onChange={(event) => form.setData('recipient_phone', event.target.value)}
                                            className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm font-semibold focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        />
                                    </Field>

                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="inline-flex items-center gap-2 text-sm font-black text-gray-950">
                                                <Truck className="size-4" strokeWidth={2.2} />
                                                배송지
                                            </p>
                                            <button
                                                type="button"
                                                onClick={openAddressSearch}
                                                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-[#12284a] ring-1 ring-gray-200 transition hover:bg-gray-100"
                                            >
                                                <Search className="size-4" />
                                                주소검색
                                            </button>
                                        </div>

                                        <div className="mt-3 grid gap-2">
                                            <div className="grid gap-2 sm:grid-cols-[108px_1fr]">
                                                <input
                                                    type="text"
                                                    value={form.data.postal_code}
                                                    className="h-10 rounded-xl border-gray-200 bg-white text-sm font-semibold focus:border-[#f47b20] focus:ring-[#f47b20]"
                                                    placeholder="우편번호"
                                                    readOnly
                                                />
                                                <input
                                                    type="text"
                                                    value={form.data.address_line1}
                                                    className="h-10 rounded-xl border-gray-200 bg-white text-sm font-semibold focus:border-[#f47b20] focus:ring-[#f47b20]"
                                                    placeholder="주소검색으로 주소를 입력하세요"
                                                    readOnly
                                                />
                                            </div>
                                            <input
                                                id="point_mall_address_line2"
                                                type="text"
                                                value={form.data.address_line2}
                                                onChange={(event) => form.setData('address_line2', event.target.value)}
                                                className="h-10 rounded-xl border-gray-200 bg-white text-sm font-semibold focus:border-[#f47b20] focus:ring-[#f47b20]"
                                                placeholder="상세주소"
                                            />
                                            {(form.errors.postal_code || form.errors.address_line1 || form.errors.address_line2) && (
                                                <p className="text-xs font-black text-red-600">
                                                    {form.errors.postal_code || form.errors.address_line1 || form.errors.address_line2}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Field label="배송 메모" error={form.errors.delivery_memo}>
                                        <input
                                            type="text"
                                            value={form.data.delivery_memo}
                                            onChange={(event) => form.setData('delivery_memo', event.target.value)}
                                            className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm font-semibold focus:border-[#f47b20] focus:ring-[#f47b20]"
                                            placeholder="예: 부재 시 문 앞에 놓아주세요"
                                        />
                                    </Field>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="mt-6 flex min-h-[64px] w-full items-center justify-center rounded-3xl bg-gradient-to-r from-[#f47b20] to-[#ff9f43] px-6 text-lg font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                                >
                                    주문하기
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex justify-between">
            <dt className="font-semibold text-gray-500">{label}</dt>
            <dd className="font-black tabular-nums text-gray-950">{value}</dd>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="grid gap-1 text-sm font-black text-gray-700">
            {label}
            {children}
            {error && <span className="text-xs font-black text-red-600">{error}</span>}
        </label>
    );
}
