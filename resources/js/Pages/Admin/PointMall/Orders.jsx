import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

const paymentStatusLabel = {
    pending: '결제대기',
    ready: '결제대기',
    requested: '결제요청',
    paid: '결제완료',
    not_required: '결제불필요',
    cancelled: '결제취소',
    refunded: '환불완료',
};

function StatusBadge({ order }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusTone[order.status] ?? statusTone.cancelled}`}>
            {order.statusLabel}
        </span>
    );
}

function StatusForm({ order, statusOptions }) {
    const form = useForm({ status: order.status });

    if (!order.canUpdateStatus) {
        return <StatusBadge order={order} />;
    }

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.point-mall.orders.status.update', order.id), {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
            <select
                value={form.data.status}
                onChange={(event) => form.setData('status', event.target.value)}
                className="min-w-36 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
                {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
            <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                변경
            </button>
        </form>
    );
}

function TrackingForm({ order }) {
    const form = useForm({ tracking_number: order.trackingNumber ?? '' });

    if (!order.canUpdateStatus) {
        return null;
    }

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.point-mall.orders.tracking.update', order.id), {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
                type="text"
                value={form.data.tracking_number}
                onChange={(event) => form.setData('tracking_number', event.target.value)}
                placeholder="송장번호 입력"
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button type="submit" disabled={form.processing} className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60">
                송장저장
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
        if (!window.confirm('이 주문을 취소하고 결제/포인트 환불을 진행할까요?')) {
            return;
        }

        form.post(route('admin.point-mall.orders.cancel', order.id), {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <button type="button" onClick={submit} disabled={form.processing} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60">
            주문취소/환불
        </button>
    );
}

function FilterBar({ filters, statusOptions }) {
    const form = useForm({
        search: filters.search ?? '',
        status: filters.status ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        router.get(route('admin.point-mall.orders.index'), compactFilters(form.data), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const reset = () => {
        router.get(route('admin.point-mall.orders.index'), {}, { preserveScroll: true, replace: true });
    };

    const exportUrl = route('admin.point-mall.orders.export', compactFilters(form.data));

    return (
        <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto_auto_auto]">
            <input
                type="search"
                value={form.data.search}
                onChange={(event) => form.setData('search', event.target.value)}
                placeholder="주문번호, 회원명, 이메일, 수령인, 연락처, 송장번호 검색"
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <select
                value={form.data.status}
                onChange={(event) => form.setData('status', event.target.value)}
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
                <option value="">전체상태</option>
                {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
            <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
                검색
            </button>
            <button type="button" onClick={reset} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                초기화
            </button>
            <a href={exportUrl} className="rounded-md border border-blue-200 px-4 py-2 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                CSV 다운로드
            </a>
        </form>
    );
}

function compactFilters(data) {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== '' && value !== null && value !== undefined));
}

export default function Orders({ orders, statusOptions, filters }) {
    const { flash, errors } = usePage().props;
    const [openOrderId, setOpenOrderId] = useState(null);

    const toggleOrder = (orderId) => {
        setOpenOrderId((current) => (current === orderId ? null : orderId));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">포인트몰 주문관리</h2>}>
            <Head title="포인트몰 주문관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">주문관리</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    목록은 약식으로 확인하고, 주문을 클릭하면 수령지와 결제 상세를 관리할 수 있습니다.
                                </p>
                            </div>
                            <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">총 {formatNumber(orders.length)}건</div>
                        </div>
                        <FilterBar filters={filters} statusOptions={statusOptions} />
                        {flash?.success && (
                            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>
                        )}
                        {(errors?.order || errors?.status || errors?.tracking_number) && (
                            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                {errors.order || errors.status || errors.tracking_number}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="hidden grid-cols-[180px_minmax(0,1.4fr)_120px_130px_140px_80px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold text-gray-500 lg:grid">
                            <span>주문번호</span>
                            <span>회원/수령인</span>
                            <span>상태</span>
                            <span>추가결제</span>
                            <span>주문일</span>
                            <span className="text-right">상세</span>
                        </div>

                        {orders.map((order) => (
                            <article key={order.id} className="border-b border-gray-100 last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => toggleOrder(order.id)}
                                    className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-gray-50 lg:grid-cols-[180px_minmax(0,1.4fr)_120px_130px_140px_80px] lg:items-center lg:gap-4"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-blue-700" title={order.orderNumber}>{order.orderNumber}</p>
                                        <p className="mt-1 text-xs text-gray-500 lg:hidden">{order.orderedAt || '-'}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-gray-900">{order.memberName || '-'}</p>
                                        <p className="mt-1 truncate text-xs text-gray-500">
                                            수령인 {order.recipientName || '-'} · {order.memberEmail || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <StatusBadge order={order} />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">{formatNumber(order.cashPaymentAmount)}원</div>
                                    <div className="hidden text-sm font-semibold text-gray-600 lg:block">{order.orderedAt || '-'}</div>
                                    <div className="text-right text-sm font-bold text-gray-500">{openOrderId === order.id ? '접기' : '보기'}</div>
                                </button>

                                {openOrderId === order.id && <OrderDetail order={order} statusOptions={statusOptions} />}
                            </article>
                        ))}

                        {orders.length === 0 && (
                            <div className="px-5 py-12 text-center text-sm text-gray-500">조건에 맞는 주문이 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function OrderDetail({ order, statusOptions }) {
    return (
        <div className="bg-gray-50 px-5 py-5">
            <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
                <InfoPanel title="수령 정보">
                    <InfoRow label="수령인" value={order.recipientName} />
                    <InfoRow label="연락처" value={order.recipientPhone} />
                    <InfoRow label="주소" value={order.address} />
                    <InfoRow label="송장번호" value={order.trackingNumber || '-'} />
                    <InfoRow label="배송메모" value={order.deliveryMemo || '-'} />
                    <InfoRow label="취소일" value={order.cancelledAt || '-'} />
                </InfoPanel>

                <InfoPanel title="결제 정보">
                    <InfoRow label="결제상태" value={paymentStatusLabel[order.paymentStatus] || order.paymentStatus || '-'} />
                    <InfoRow label="결제수단" value={order.paymentMethod || '-'} />
                    <InfoRow label="결제 주문번호" value={order.paymentOrderId || '-'} />
                    <InfoRow label="결제 승인일" value={order.paymentApprovedAt || '-'} />
                    <InfoRow label="상품 포인트" value={`${formatNumber(order.totalPoints)}P`} />
                    <InfoRow label="사용 포인트" value={`${formatNumber(order.usedPoints)}P`} />
                    <InfoRow label="배송비" value={`${formatNumber(order.deliveryFee)}원`} />
                    <InfoRow label="추가 결제" value={`${formatNumber(order.cashPaymentAmount)}원`} strong />
                </InfoPanel>

                <InfoPanel title="주문 상품">
                    <ul className="divide-y divide-gray-100">
                        {order.items.map((item, index) => (
                            <li key={`${order.id}-${item.name}-${index}`} className="py-2 text-sm">
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="mt-1 text-gray-600">{formatNumber(item.quantity)}개 · {formatNumber(item.lineTotalPoints)}P</p>
                            </li>
                        ))}
                    </ul>
                </InfoPanel>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg bg-white p-4 ring-1 ring-gray-200 md:flex-row md:items-center">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">주문 처리</h3>
                    <p className="mt-1 text-xs text-gray-500">송장번호를 저장하면 주문 상태가 배송중으로 변경됩니다.</p>
                </div>
                <div className="grid gap-2 md:min-w-[520px]">
                    <TrackingForm order={order} />
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <StatusForm order={order} statusOptions={statusOptions} />
                        <CancelButton order={order} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoPanel({ title, children }) {
    return (
        <section className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <dl className="mt-3 space-y-2">{children}</dl>
        </section>
    );
}

function InfoRow({ label, value, strong = false }) {
    return (
        <div className="grid gap-1 text-sm">
            <dt className="font-semibold text-gray-500">{label}</dt>
            <dd className={strong ? 'break-words font-bold text-gray-950' : 'break-words font-semibold text-gray-800'}>{value || '-'}</dd>
        </div>
    );
}
