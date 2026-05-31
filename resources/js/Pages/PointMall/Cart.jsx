import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

export default function Cart({ auth, cart }) {
    const { flash } = usePage().props;
    const form = useForm({
        recipient_name: auth?.user?.name ?? '',
        recipient_phone: auth?.user?.phone ?? '',
        postal_code: '',
        address_line1: '',
        address_line2: '',
        delivery_memo: '',
    });

    const checkout = (event) => {
        event.preventDefault();
        form.post(route('point-mall.cart.checkout'), {
            preserveScroll: true,
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="장바구니" />

            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between gap-4 border-b border-toss-grey200 pb-6">
                        <div>
                            <p className="text-sm font-semibold text-toss-blue">Point Mall</p>
                            <h1 className="mt-2 text-3xl font-bold text-toss-grey900">장바구니</h1>
                        </div>
                        <Link href="/point-mall" className="text-sm font-semibold text-toss-grey600 hover:text-toss-grey900">
                            쇼핑 계속하기
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="mt-6 rounded-lg border border-toss-blue/20 bg-toss-blueLight px-4 py-3 text-sm font-semibold text-toss-blue">
                            {flash.success}
                        </div>
                    )}

                    {cart.items.length === 0 ? (
                        <div className="mt-8 rounded-lg border border-toss-grey200 px-5 py-14 text-center text-sm text-toss-grey500">
                            장바구니가 비어 있습니다.
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                            <div className="space-y-3">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="rounded-lg border border-toss-grey200 bg-white p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-toss-blue">{item.product.categoryName}</p>
                                                <h2 className="mt-2 text-lg font-bold text-toss-grey900">{item.product.name}</h2>
                                                <p className="mt-2 text-sm text-toss-grey600">
                                                    수량 {formatNumber(item.quantity)}개 · {formatNumber(item.lineTotalPoints)}P
                                                </p>
                                                <p className="mt-1 text-sm text-toss-grey600">
                                                    배송비{' '}
                                                    {item.product.deliveryType === 'paid'
                                                        ? `${formatNumber(item.product.deliveryFee)}원`
                                                        : '무료배송'}
                                                </p>
                                            </div>
                                            <p className="text-lg font-bold tabular-nums text-toss-grey900">
                                                {formatNumber(item.product.pointPrice)}P
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={checkout} className="rounded-lg border border-toss-grey200 bg-toss-grey50 p-5">
                                <h2 className="text-base font-bold text-toss-grey900">결제 요약</h2>
                                <dl className="mt-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-toss-grey600">보유 포인트</dt>
                                        <dd className="font-bold tabular-nums text-toss-grey900">{formatNumber(cart.summary.pointBalance)}P</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-toss-grey600">상품 포인트</dt>
                                        <dd className="font-bold tabular-nums text-toss-grey900">{formatNumber(cart.summary.totalPoints)}P</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-toss-grey600">사용 포인트</dt>
                                        <dd className="font-bold tabular-nums text-toss-grey900">{formatNumber(cart.summary.usedPoints)}P</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-toss-grey600">부족 포인트 결제</dt>
                                        <dd className="font-bold tabular-nums text-toss-grey900">{formatNumber(cart.summary.pointShortfall)}원</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-toss-grey600">배송비</dt>
                                        <dd className="font-bold tabular-nums text-toss-grey900">{formatNumber(cart.summary.deliveryFee)}원</dd>
                                    </div>
                                    <div className="flex justify-between border-t border-toss-grey200 pt-3 text-base">
                                        <dt className="font-bold text-toss-grey900">추가 결제금액</dt>
                                        <dd className="font-bold tabular-nums text-toss-grey900">
                                            {formatNumber(cart.summary.cashPaymentAmount)}원
                                        </dd>
                                    </div>
                                </dl>

                                {form.errors.cart && <p className="mt-4 text-sm font-semibold text-red-600">{form.errors.cart}</p>}

                                <div className="mt-6 grid gap-3">
                                    {[
                                        ['recipient_name', '받는 분'],
                                        ['recipient_phone', '연락처'],
                                        ['postal_code', '우편번호'],
                                        ['address_line1', '주소'],
                                        ['address_line2', '상세주소'],
                                        ['delivery_memo', '배송메모'],
                                    ].map(([field, label]) => (
                                        <label key={field} className="grid gap-1 text-sm font-semibold text-toss-grey700">
                                            {label}
                                            <input
                                                type="text"
                                                value={form.data[field]}
                                                onChange={(event) => form.setData(field, event.target.value)}
                                                className="rounded-lg border-toss-grey300 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                            />
                                            {form.errors[field] && (
                                                <span className="text-xs font-semibold text-red-600">{form.errors[field]}</span>
                                            )}
                                        </label>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="mt-5 w-full rounded-lg bg-toss-grey900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-toss-grey700 disabled:opacity-60"
                                >
                                    포인트와 추가결제로 구매
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
