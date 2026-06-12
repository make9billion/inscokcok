import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

const entryTypeLabel = {
    earned: '적립',
    spent: '사용',
    refunded: '환급',
    adjusted: '조정',
    expired: '만료',
};

const consultationStatusLabel = {
    received: '접수',
    assigned: '배정',
    in_progress: '진행 중',
    completed: '완료',
    cancelled: '취소',
};

const orderStatusLabel = {
    pending: '결제 대기',
    paid: '결제 완료',
    preparing: '상품 준비',
    shipped: '배송 중',
    delivered: '배송 완료',
    cancelled: '취소',
    refunded: '환불',
};

const questionStatusLabel = {
    open: '답변 대기',
    answered: '답변 완료',
    closed: '종료',
};

function EmptyState({ children }) {
    return <div className="px-5 py-8 text-sm leading-6 text-gray-600">{children}</div>;
}

export default function Dashboard({
    summary,
    recentPointEntries = [],
    recentConsultations = [],
    recentOrders = [],
    recentQuestions = [],
}) {
    const cards = [
        {
            label: '보유 포인트',
            value: `${formatNumber(summary?.pointBalance)}P`,
            href: '/mypage/points',
            action: '포인트 내역 보기',
        },
        {
            label: '상담 신청',
            value: `${formatNumber(summary?.consultationCount)}건`,
            href: '/insurance-checkup',
            action: '보험점검 신청',
        },
        {
            label: '보험지식인',
            value: `${formatNumber(summary?.questionCount)}건`,
            href: '/knowledge',
            action: '보험지식인 보기',
        },
        {
            label: '주문 내역',
            value: `${formatNumber(summary?.orderCount)}건`,
            href: '/mypage/point-mall/orders',
            action: '주문 확인',
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">마이페이지</h2>}
        >
            <Head title="마이페이지" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="space-y-6 px-4 sm:px-0">
                        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sm font-medium text-blue-600">회원 마이페이지</p>
                                <h1 className="mt-2 text-2xl font-bold leading-8 text-gray-900">마이페이지</h1>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    상담, 포인트, 주문, 보험지식인 현황을 한 화면에서 확인하세요.
                                </p>
                            </div>

                            <Link
                                href="/profile"
                                className="inline-flex w-full items-center justify-center rounded px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 sm:w-auto"
                            >
                                프로필 관리
                            </Link>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {cards.map((card) => (
                                <Link
                                    key={card.label}
                                    href={card.href}
                                    className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="text-sm font-medium text-gray-600">{card.label}</div>
                                    <div className="mt-3 text-2xl font-bold tracking-normal text-gray-900">
                                        {card.value}
                                    </div>
                                    <div className="mt-4 text-sm font-semibold text-blue-600">{card.action}</div>
                                </Link>
                            ))}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="space-y-6">
                                <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                                    <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                                        <h3 className="text-base font-semibold text-gray-900">최근 상담 신청</h3>
                                        <Link href="/insurance-checkup" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                            상담 신청
                                        </Link>
                                    </div>
                                    {recentConsultations.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {recentConsultations.map((consultation) => (
                                                <li key={consultation.id} className="flex items-center justify-between gap-4 px-5 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {consultation.interestedProduct ?? '보험 상담'}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {consultation.createdAt}
                                                            {consultation.preferredContactTime ? ` · ${consultation.preferredContactTime}` : ''}
                                                        </p>
                                                    </div>
                                                    <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                                        {consultationStatusLabel[consultation.status] ?? consultation.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <EmptyState>아직 상담 신청 내역이 없습니다.</EmptyState>
                                    )}
                                </section>

                                <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                                    <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                                        <h3 className="text-base font-semibold text-gray-900">최근 포인트 내역</h3>
                                        <Link href="/mypage/points" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                            전체보기
                                        </Link>
                                    </div>
                                    {recentPointEntries.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {recentPointEntries.map((entry, index) => {
                                                const isPositive = entry.points >= 0;

                                                return (
                                                    <li key={`${entry.createdAt}-${entry.memo}-${index}`} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                                                    {entryTypeLabel[entry.type] ?? entry.type}
                                                                </span>
                                                                <span className="text-sm text-gray-500">{entry.createdAt}</span>
                                                            </div>
                                                            <p className="mt-2 text-sm font-medium text-gray-800">
                                                                {entry.memo ?? '포인트 내역'}
                                                            </p>
                                                        </div>
                                                        <div className={`text-base font-bold tabular-nums ${isPositive ? 'text-blue-600' : 'text-gray-900'}`}>
                                                            {isPositive ? '+' : ''}
                                                            {formatNumber(entry.points)}P
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <EmptyState>아직 포인트 내역이 없습니다.</EmptyState>
                                    )}
                                </section>

                                <section className="grid gap-6 lg:grid-cols-2">
                                    <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                                            <h3 className="text-base font-semibold text-gray-900">최근 주문</h3>
                                            <Link href="/mypage/point-mall/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                                전체보기
                                            </Link>
                                        </div>
                                        {recentOrders.length > 0 ? (
                                            <ul className="divide-y divide-gray-100">
                                                {recentOrders.map((order) => (
                                                    <li key={order.id} className="px-5 py-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                                                {orderStatusLabel[order.status] ?? order.status}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm tabular-nums text-gray-600">
                                                            {formatNumber(order.totalPoints)}P
                                                            {order.cashPaymentAmount > 0 ? ` + ${formatNumber(order.cashPaymentAmount)}원` : ''}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <EmptyState>아직 주문 내역이 없습니다.</EmptyState>
                                        )}
                                    </div>

                                    <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                                            <h3 className="text-base font-semibold text-gray-900">최근 보험지식인</h3>
                                            <Link href="/knowledge" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                                전체보기
                                            </Link>
                                        </div>
                                        {recentQuestions.length > 0 ? (
                                            <ul className="divide-y divide-gray-100">
                                                {recentQuestions.map((question) => (
                                                    <li key={question.id} className="px-5 py-4">
                                                        <Link href={route('knowledge.questions.show', question.id)} className="group block">
                                                            <p className="line-clamp-2 text-sm font-semibold text-gray-900 transition group-hover:text-blue-600">
                                                                {question.title}
                                                            </p>
                                                            <p className="mt-1 text-xs font-semibold text-blue-600">답변 확인하기</p>
                                                        </Link>
                                                        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                                                            <span>{question.createdAt}</span>
                                                            <span>{questionStatusLabel[question.status] ?? question.status}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <EmptyState>아직 보험지식인 내역이 없습니다.</EmptyState>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">바로가기</h3>
                                <div className="mt-4 grid gap-2">
                                    {[
                                        ['보험점검 신청', '/insurance-checkup'],
                                        ['보험지식인', '/knowledge'],
                                        ['포인트몰', '/point-mall'],
                                        ['포인트몰 주문내역', '/mypage/point-mall/orders'],
                                        ['프로필 수정', '/profile'],
                                    ].map(([label, href]) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            className="rounded border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
