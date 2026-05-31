import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function CancelButton({ order }) {
    const form = useForm({});

    if (!order.canCancel) {
        return null;
    }

    const submit = () => {
        if (!window.confirm('주문을 취소하고 사용 포인트를 환불할까요?')) {
            return;
        }

        form.post(route('mypage.point-mall.orders.cancel', order.id), {
            preserveScroll: true,
        });
    };

    return (
        <button
            type="button"
            onClick={submit}
            disabled={form.processing}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
            주문취소
        </button>
    );
}

export default function PointMallOrders({ orders }) {
    const { flash, errors } = usePage().props;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">포인트몰 주문내역</h2>}
        >
            <Head title="포인트몰 주문내역" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-blue-600">Point Mall</p>
                                <h1 className="mt-2 text-2xl font-bold text-gray-900">주문내역</h1>
                            </div>
                            <Link href="/point-mall" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                                포인트몰 보기
                            </Link>
                        </div>
                        {flash?.success && (
                            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                                {flash.success}
                            </div>
                        )}
                        {(errors?.order || errors?.status) && (
                            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                {errors.order || errors.status}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 space-y-4">
                        {orders.map((order) => (
                            <article key={order.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-600">{order.orderNumber}</p>
                                        <h2 className="mt-1 text-lg font-bold text-gray-900">{order.orderedAt}</h2>
                                        <p className="mt-1 text-sm text-gray-500">상태 {order.statusLabel}</p>
                                        {order.cancelledAt && (
                                            <p className="mt-1 text-sm text-gray-500">취소일 {order.cancelledAt}</p>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-700 sm:text-right">
                                        <p>상품 포인트 {formatNumber(order.totalPoints)}P</p>
                                        <p>사용 포인트 {formatNumber(order.usedPoints)}P</p>
                                        <p>배송비 {formatNumber(order.deliveryFee)}원</p>
                                        <p className="font-bold text-gray-900">
                                            추가 결제 {formatNumber(order.cashPaymentAmount)}원
                                        </p>
                                        <div className="mt-3 flex justify-start sm:justify-end">
                                            <CancelButton order={order} />
                                        </div>
                                    </div>
                                </div>
                                {order.cashRefundNotice && (
                                    <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                                        추가 결제 금액과 배송비는 실제 결제 연동 후 환불 처리 대상입니다.
                                    </div>
                                )}
                                <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                                    {order.items.map((item) => (
                                        <li key={`${order.id}-${item.name}`} className="flex justify-between gap-4 py-3 text-sm">
                                            <span className="font-semibold text-gray-900">{item.name}</span>
                                            <span className="text-gray-600">
                                                {formatNumber(item.quantity)}개 · {formatNumber(item.lineTotalPoints)}P
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>

                    {orders.length === 0 && (
                        <div className="mt-6 rounded-lg bg-white px-5 py-12 text-center text-sm text-gray-500 shadow-sm ring-1 ring-gray-200">
                            아직 주문내역이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
