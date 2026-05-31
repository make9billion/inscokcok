import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function StatusForm({ order, statusOptions }) {
    const form = useForm({
        status: order.status,
    });

    if (!order.canUpdateStatus) {
        return <span className="text-sm font-semibold text-gray-500">{order.statusLabel}</span>;
    }

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.point-mall.orders.status.update', order.id), {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
            <select
                value={form.data.status}
                onChange={(event) => form.setData('status', event.target.value)}
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
                {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                disabled={form.processing}
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
                변경
            </button>
        </form>
    );
}

function CancelButton({ order }) {
    const form = useForm({});

    if (!order.canCancel) {
        return null;
    }

    const submit = () => {
        if (!window.confirm('주문을 취소하고 사용 포인트를 환불할까요?')) {
            return;
        }

        form.post(route('admin.point-mall.orders.cancel', order.id), {
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
            취소/환불
        </button>
    );
}

export default function Orders({ orders, statusOptions }) {
    const { flash, errors } = usePage().props;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">포인트몰 주문 관리</h2>}
        >
            <Head title="포인트몰 주문 관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">주문 관리</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            포인트몰 주문 상태를 변경하고, 배송 전 주문은 취소/포인트 환불 처리할 수 있습니다.
                        </p>
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
                                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-600">{order.orderNumber}</p>
                                        <h2 className="mt-1 text-lg font-bold text-gray-900">{order.memberName}</h2>
                                        <p className="mt-1 text-sm text-gray-500">{order.memberEmail}</p>
                                        <p className="mt-2 text-sm text-gray-700">
                                            {order.recipientName} · {order.recipientPhone}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">{order.address}</p>
                                        {order.deliveryMemo && (
                                            <p className="mt-1 text-sm text-gray-500">배송메모 {order.deliveryMemo}</p>
                                        )}
                                    </div>

                                    <div className="text-sm text-gray-700">
                                        <p>주문일 {order.orderedAt}</p>
                                        <p>상태 {order.statusLabel}</p>
                                        {order.cancelledAt && <p>취소일 {order.cancelledAt}</p>}
                                        <div className="mt-3 grid gap-1">
                                            <p>상품 포인트 {formatNumber(order.totalPoints)}P</p>
                                            <p>사용 포인트 {formatNumber(order.usedPoints)}P</p>
                                            <p>배송비 {formatNumber(order.deliveryFee)}원</p>
                                            <p className="font-bold text-gray-900">
                                                추가 결제 {formatNumber(order.cashPaymentAmount)}원
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 xl:items-end">
                                        <StatusForm order={order} statusOptions={statusOptions} />
                                        <CancelButton order={order} />
                                    </div>
                                </div>

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
