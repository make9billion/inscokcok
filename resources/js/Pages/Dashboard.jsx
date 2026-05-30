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

export default function Dashboard({ summary, recentPointEntries = [] }) {
    const cards = [
        {
            label: '보유 포인트',
            value: `${formatNumber(summary?.pointBalance)}P`,
            href: '/point-mall',
            action: '포인트몰 보기',
        },
        {
            label: '상담 신청',
            value: `${formatNumber(summary?.consultationCount)}건`,
            href: '/insurance-checkup',
            action: '보험 점검 신청',
        },
        {
            label: 'Q&A',
            value: `${formatNumber(summary?.questionCount)}건`,
            href: '/knowledge',
            action: '지식센터 보기',
        },
        {
            label: '주문 내역',
            value: `${formatNumber(summary?.orderCount)}건`,
            href: '/point-mall',
            action: '주문 확인',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    내정보
                </h2>
            }
        >
            <Head title="내정보" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="space-y-6 px-4 sm:px-0">
                        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sm font-medium text-blue-600">
                                    회원 대시보드
                                </p>
                                <h1 className="mt-2 text-2xl font-bold leading-8 text-gray-900">
                                    내정보
                                </h1>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    상담, 포인트, 주문 현황을 한곳에서 확인하세요.
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
                                    <div className="text-sm font-medium text-gray-600">
                                        {card.label}
                                    </div>
                                    <div className="mt-3 text-2xl font-bold tracking-normal text-gray-900">
                                        {card.value}
                                    </div>
                                    <div className="mt-4 text-sm font-semibold text-blue-600">
                                        {card.action}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                                <div className="border-b border-gray-100 px-5 py-4">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        최근 포인트 내역
                                    </h3>
                                </div>

                                {recentPointEntries.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {recentPointEntries.map((entry, index) => {
                                            const isPositive = entry.points >= 0;

                                            return (
                                                <li
                                                    key={`${entry.createdAt}-${entry.memo}-${index}`}
                                                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                                                {entryTypeLabel[entry.type] ?? entry.type}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {entry.createdAt}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm font-medium text-gray-800">
                                                            {entry.memo ?? '포인트 내역'}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`text-base font-bold tabular-nums ${
                                                            isPositive
                                                                ? 'text-blue-600'
                                                                : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {isPositive ? '+' : ''}
                                                        {formatNumber(entry.points)}P
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="px-5 py-10 text-sm leading-6 text-gray-600">
                                        아직 포인트 내역이 없습니다. 상담 신청과 이벤트 참여로 포인트를 모아보세요.
                                    </div>
                                )}
                            </section>

                            <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">
                                    바로가기
                                </h3>
                                <div className="mt-4 grid gap-2">
                                    <Link
                                        href="/insurance-checkup"
                                        className="rounded border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        보험 점검 신청
                                    </Link>
                                    <Link
                                        href="/knowledge"
                                        className="rounded border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        지식 Q&A
                                    </Link>
                                    <Link
                                        href="/point-mall"
                                        className="rounded border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        포인트몰
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="rounded border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        프로필 수정
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
