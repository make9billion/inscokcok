import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

const statusStyles = {
    received: 'bg-blue-50 text-blue-700',
    no_answer: 'bg-rose-50 text-rose-700',
    recall: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-gray-100 text-gray-600',
    assigned: 'bg-indigo-50 text-indigo-700',
    completed: 'bg-emerald-50 text-emerald-700',
    consultation_cancelled: 'bg-slate-100 text-slate-700',
};

export default function Index({ consultations, filters, statusOptions }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(route('admin.consultations.index'), {
            search: search || undefined,
            status: status || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        router.get(route('admin.consultations.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">상담관리</h2>}>
            <Head title="상담관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">상담 접수 목록</h3>
                                    <p className="mt-1 text-sm text-gray-500">최근 상담 접수 50건을 확인하고 상태별로 조회합니다.</p>
                                </div>

                                <form onSubmit={applyFilters} className="flex flex-col gap-2 sm:flex-row">
                                    <label className="sr-only" htmlFor="consultation-search">이름, 연락처, 상품 검색</label>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            id="consultation-search"
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="이름, 연락처, 상품"
                                            className="h-10 w-full rounded-lg border-gray-300 pl-9 text-sm focus:border-toss-blue focus:ring-toss-blue sm:w-56"
                                        />
                                    </div>

                                    <label className="sr-only" htmlFor="consultation-status">상태</label>
                                    <select
                                        id="consultation-status"
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value)}
                                        className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                    >
                                        <option value="">전체 상태</option>
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>

                                    <button type="submit" className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700">
                                        검색
                                    </button>
                                    {(filters.search || filters.status) && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                            aria-label="필터 초기화"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['접수일', '이름', '연락처', '상품', '상태', '담당'].map((label) => (
                                            <th key={label} scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {consultations.map((consultation) => (
                                        <tr key={consultation.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{consultation.createdAt}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                                                <Link href={route('admin.consultations.show', consultation.id)} className="hover:text-toss-blue">
                                                    {consultation.applicantName}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{consultation.phone}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{consultation.interestedProduct ?? '보험점검'}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                <span className={`rounded-lg px-2 py-1 font-semibold ${statusStyles[consultation.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {consultation.statusLabel}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{consultation.assignedPlannerName ?? '미배정'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {consultations.length === 0 && (
                            <div className="px-5 py-12 text-center text-sm text-gray-500">조건에 맞는 상담 접수가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
