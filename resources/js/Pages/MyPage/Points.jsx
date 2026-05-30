import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

const typeLabels = {
    earned: '적립',
    spent: '사용',
    refunded: '환급',
    adjusted: '조정',
    expired: '만료',
};

export default function Points({ pointBalance, entries = [] }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">포인트 내역</h2>}
        >
            <Head title="포인트 내역" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <p className="text-sm font-semibold text-blue-600">보유 포인트</p>
                        <div className="mt-2 text-3xl font-bold text-gray-900">
                            {formatNumber(pointBalance)}P
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link
                                href="/dashboard"
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                마이페이지
                            </Link>
                            <Link
                                href="/point-mall"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                포인트몰 보기
                            </Link>
                        </div>
                    </div>

                    <section className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h3 className="text-base font-semibold text-gray-900">전체 포인트 내역</h3>
                            <p className="mt-1 text-sm text-gray-500">최근 50건까지 표시합니다.</p>
                        </div>

                        {entries.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {entries.map((entry) => {
                                    const isPositive = entry.points >= 0;

                                    return (
                                        <li
                                            key={entry.id}
                                            className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                                        >
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                                        {typeLabels[entry.type] ?? entry.type}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{entry.createdAt}</span>
                                                </div>
                                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                                    {entry.memo ?? '포인트 내역'}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    잔액 {formatNumber(entry.balanceAfter)}P
                                                </p>
                                            </div>
                                            <div
                                                className={`text-right text-lg font-bold tabular-nums ${
                                                    isPositive ? 'text-blue-600' : 'text-gray-900'
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
                            <div className="px-5 py-12 text-center text-sm text-gray-500">
                                아직 포인트 내역이 없습니다.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
