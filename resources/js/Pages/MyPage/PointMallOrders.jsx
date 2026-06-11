import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

const statusTone = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    paid: 'bg-blue-50 text-blue-700 ring-blue-200',
    preparing: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    shipped: 'bg-violet-50 text-violet-700 ring-violet-200',
    delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    cancelled: 'bg-gray-100 text-gray-600 ring-gray-200',
    refunded: 'bg-rose-50 text-rose-700 ring-rose-200',
    exchange_requested: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    return_requested: 'bg-orange-50 text-orange-700 ring-orange-200',
};

function CancelButton({ order }) {
    const form = useForm({});

    if (!order.canCancel) {
        return null;
    }

    const submit = () => {
        if (!window.confirm('주문을 취소할까요? 결제금액과 사용 포인트를 함께 취소/환불 처리합니다.')) {
            return;
        }

        form.post(route('mypage.point-mall.orders.cancel', order.id), { preserveScroll: true });
    };

    return (
        <button type="button" onClick={submit} disabled={form.processing} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60">
            주문취소
        </button>
    );
}

function PaymentButton({ order }) {
    if (order.cashPaymentAmount <= 0 || order.status !== 'pending') {
        return null;
    }

    return (
        <Link href={route('point-mall.orders.payment', order.id)} className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-black text-white transition hover:bg-gray-700">
            추가 결제
        </Link>
    );
}

export default function PointMallOrders({ orders }) {
    const { flash, errors } = usePage().props;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">포인트몰 주문내역</h2>}>
            <Head title="포인트몰 주문내역" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-black text-[#f47b20]">Point Mall</p>
                                <h1 className="mt-2 text-2xl font-black text-gray-900">주문내역</h1>
                                <p className="mt-2 text-sm font-semibold text-gray-500">배송지, 결제정보, 주문 상품을 한눈에 확인할 수 있어요.</p>
                            </div>
                            <Link href="/point-mall" className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-black text-white transition hover:bg-gray-700">
                                포인트몰 보기
                            </Link>
                        </div>
                        {flash?.success && (
                            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">{flash.success}</div>
                        )}
                        {(errors?.order || errors?.status || errors?.payment) && (
                            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                {errors.order || errors.status || errors.payment}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 space-y-5">
                        {orders.map((order) => (
                            <article key={order.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-black text-blue-600">{order.orderNumber}</p>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${statusTone[order.status] ?? statusTone.cancelled}`}>
                                                {order.statusLabel}
                                            </span>
                                        </div>
                                        <h2 className="mt-2 text-lg font-black text-gray-900">{order.orderedAt ?? '결제대기'}</h2>
                                        {order.cancelledAt && <p className="mt-1 text-sm font-semibold text-gray-500">취소일 {order.cancelledAt}</p>}
                                    </div>

                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        <PaymentButton order={order} />
                                        <CancelButton order={order} />
                                    </div>
                                </div>

                                {order.cashRefundNotice && (
                                    <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                                        추가 결제 금액과 배송비는 토스페이먼츠 결제 취소 후 환불 처리합니다.
                                    </div>
                                )}

                                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                                    <InfoPanel title="배송 정보">
                                        <InfoRow label="수령인" value={order.recipientName} />
                                        <InfoRow label="연락처" value={order.recipientPhone} />
                                        <InfoRow label="주소" value={order.address} />
                                        <InfoRow label="송장번호" value={order.trackingNumber || '-'} />
                                        <InfoRow label="배송메모" value={order.deliveryMemo || '-'} />
                                    </InfoPanel>

                                    <InfoPanel title="결제 정보">
                                        <InfoRow label="상품 포인트" value={`${formatNumber(order.totalPoints)}P`} />
                                        <InfoRow label="사용 포인트" value={`${formatNumber(order.usedPoints)}P`} />
                                        <InfoRow label="배송비" value={`${formatNumber(order.deliveryFee)}원`} />
                                        <InfoRow label="추가 결제" value={`${formatNumber(order.cashPaymentAmount)}원`} strong />
                                        <InfoRow label="결제수단" value={order.paymentMethod || '-'} />
                                        <InfoRow label="결제승인" value={order.paymentApprovedAt || '-'} />
                                    </InfoPanel>

                                    <InfoPanel title="주문 상품">
                                        <ul className="divide-y divide-gray-100">
                                            {order.items.map((item, index) => (
                                                <li key={`${order.id}-${item.name}-${index}`} className="py-2 text-sm">
                                                    <p className="font-black text-gray-900">{item.name}</p>
                                                    <p className="mt-1 font-semibold text-gray-500">
                                                        {formatNumber(item.quantity)}개 · {formatNumber(item.lineTotalPoints)}P
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </InfoPanel>
                                </div>
                            </article>
                        ))}
                    </div>

                    {orders.length === 0 && (
                        <div className="mt-6 rounded-2xl bg-white px-5 py-12 text-center text-sm font-semibold text-gray-500 shadow-sm ring-1 ring-gray-200">
                            아직 주문내역이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function InfoPanel({ title, children }) {
    return (
        <section className="rounded-2xl bg-gray-50 p-4">
            <h3 className="text-sm font-black text-gray-900">{title}</h3>
            <dl className="mt-3 space-y-2">{children}</dl>
        </section>
    );
}

function InfoRow({ label, value, strong = false }) {
    return (
        <div className="grid gap-1 text-sm">
            <dt className="font-semibold text-gray-500">{label}</dt>
            <dd className={strong ? 'font-black text-gray-950' : 'font-bold text-gray-800'}>{value || '-'}</dd>
        </div>
    );
}
