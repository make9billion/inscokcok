import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

export default function Payment({ auth, clientKey, order }) {
    const { errors, flash } = usePage().props;
    const [processing, setProcessing] = useState(false);

    const requestPayment = async () => {
        if (!clientKey) {
            alert('토스페이먼츠 테스트 클라이언트 키를 먼저 설정해 주세요.');
            return;
        }

        if (!window.TossPayments) {
            alert('토스페이먼츠 SDK를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');
            return;
        }

        setProcessing(true);

        try {
            const tossPayments = window.TossPayments(clientKey);
            const payment = tossPayments.payment({
                customerKey: `USER-${auth.user.id}`,
            });

            await payment.requestPayment({
                method: 'CARD',
                amount: {
                    currency: 'KRW',
                    value: order.cashPaymentAmount,
                },
                orderId: order.paymentOrderId,
                orderName: order.orderName,
                successUrl: route('point-mall.payment.success'),
                failUrl: route('point-mall.payment.fail'),
                customerEmail: order.customerEmail,
                customerName: order.customerName,
                customerMobilePhone: order.customerMobilePhone,
            });
        } catch (error) {
            setProcessing(false);
            alert(error?.message ?? '결제창을 여는 중 오류가 발생했습니다.');
        }
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="포인트몰 결제" />

            <section className="bg-[#f7f8fb]">
                <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                    <Link href="/mypage/point-mall/orders" className="inline-flex items-center gap-2 text-sm font-black text-gray-600 transition hover:text-gray-950">
                        <ArrowLeft className="size-4" strokeWidth={2.2} />
                        주문내역으로 돌아가기
                    </Link>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
                        <div className="rounded-[28px] bg-white p-6 ring-1 ring-gray-100">
                            <p className="text-sm font-black text-[#f47b20]">Toss Payments</p>
                            <h1 className="mt-2 text-3xl font-black tracking-normal text-gray-950">추가 결제 진행</h1>
                            <p className="mt-3 text-sm font-semibold leading-6 text-gray-500">
                                포인트 부족분과 배송비를 테스트 결제로 진행합니다. 결제 완료 후 주문이 접수 상태로 변경됩니다.
                            </p>

                            {flash?.success && (
                                <div className="mt-5 rounded-2xl bg-[#edf8f2] px-4 py-3 text-sm font-black text-[#168044]">
                                    {flash.success}
                                </div>
                            )}

                            {(errors?.payment || errors?.amount || errors?.orderId || errors?.paymentKey) && (
                                <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">
                                    {errors.payment || errors.amount || errors.orderId || errors.paymentKey}
                                </div>
                            )}

                            {!clientKey && (
                                <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
                                    `.env`에 `TOSS_PAYMENTS_CLIENT_KEY`와 `TOSS_PAYMENTS_SECRET_KEY`를 설정한 뒤 서버를 재시작해 주세요.
                                </div>
                            )}

                            <div className="mt-6 rounded-2xl bg-[#f7f8fb] p-5">
                                <div className="flex items-center gap-3">
                                    <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#12284a]">
                                        <ShieldCheck className="size-5" strokeWidth={2.2} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-black text-gray-950">테스트 결제 안내</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-500">
                                            테스트 키에서는 실제 금액이 청구되지 않습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={requestPayment}
                                disabled={processing || !clientKey}
                                className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#12284a] to-[#f47b20] px-5 text-base font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                            >
                                <CreditCard className="size-5" strokeWidth={2.2} />
                                {processing ? '결제창 여는 중' : '테스트 카드 결제하기'}
                            </button>
                        </div>

                        <aside className="self-start rounded-[28px] bg-white p-5 ring-1 ring-gray-100">
                            <h2 className="text-lg font-black text-gray-950">결제 요약</h2>
                            <dl className="mt-5 space-y-3 text-sm">
                                <SummaryRow label="주문번호" value={order.orderNumber} />
                                <SummaryRow label="상품 포인트" value={`${formatNumber(order.totalPoints)}P`} />
                                <SummaryRow label="사용 포인트" value={`${formatNumber(order.usedPoints)}P`} />
                                <SummaryRow label="배송비" value={`${formatNumber(order.deliveryFee)}원`} />
                                <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
                                    <dt className="font-black text-gray-950">결제금액</dt>
                                    <dd className="font-black tabular-nums text-[#f47b20]">{formatNumber(order.cashPaymentAmount)}원</dd>
                                </div>
                            </dl>

                            <ul className="mt-5 divide-y divide-gray-100 border-t border-gray-100">
                                {order.items.map((item) => (
                                    <li key={`${order.id}-${item.name}`} className="py-3 text-sm">
                                        <p className="font-black text-gray-950">{item.name}</p>
                                        <p className="mt-1 font-semibold text-gray-500">
                                            {formatNumber(item.quantity)}개 · {formatNumber(item.lineTotalPoints)}P
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="font-semibold text-gray-500">{label}</dt>
            <dd className="text-right font-black tabular-nums text-gray-950">{value}</dd>
        </div>
    );
}
