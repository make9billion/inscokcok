import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const statusStyles = {
    received: 'bg-blue-50 text-blue-700',
    no_answer: 'bg-rose-50 text-rose-700',
    recall: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-gray-100 text-gray-600',
    assigned: 'bg-indigo-50 text-indigo-700',
    completed: 'bg-emerald-50 text-emerald-700',
    consultation_cancelled: 'bg-slate-100 text-slate-700',
};

const sourceStyles = {
    main: 'bg-orange-50 text-orange-700',
    product: 'bg-blue-50 text-blue-700',
};

export default function Index({ consultations, filters, statusOptions, planners = [], productOptions = [] }) {
    const user = usePage().props.auth.user;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [assignedPlannerId, setAssignedPlannerId] = useState(filters.assigned_planner_id ?? '');
    const [product, setProduct] = useState(filters.product ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [bulkPlannerId, setBulkPlannerId] = useState('');
    const [bulkMemo, setBulkMemo] = useState('');

    const hasFilters = Boolean(filters.search || filters.status || filters.assigned_planner_id || filters.product || filters.date_from || filters.date_to);
    const selectedCount = selectedIds.length;
    const isAdmin = user?.role === 'admin';

    const exportHref = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries({
            search,
            status,
            assigned_planner_id: assignedPlannerId,
            product,
            date_from: dateFrom,
            date_to: dateTo,
        }).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });

        const query = params.toString();

        return `${route('admin.consultations.export')}${query ? `?${query}` : ''}`;
    }, [assignedPlannerId, dateFrom, dateTo, product, search, status]);

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(route('admin.consultations.index'), {
            search: search || undefined,
            status: status || undefined,
            assigned_planner_id: assignedPlannerId || undefined,
            product: product || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setAssignedPlannerId('');
        setProduct('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.consultations.index'), {}, { preserveState: true, replace: true });
    };

    const toggleAll = (checked) => {
        setSelectedIds(checked ? consultations.map((consultation) => consultation.id) : []);
    };

    const toggleOne = (id, checked) => {
        setSelectedIds((current) => checked ? [...current, id] : current.filter((value) => value !== id));
    };

    const submitBulkUpdate = (event) => {
        event.preventDefault();

        router.patch(route('admin.consultations.bulk'), {
            consultation_ids: selectedIds,
            status: bulkStatus,
            assigned_planner_id: isAdmin ? (bulkPlannerId || null) : undefined,
            memo: bulkMemo || undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setBulkStatus('');
                setBulkPlannerId('');
                setBulkMemo('');
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">상담관리</h2>}>
            <Head title="상담관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">상담 접수 목록</h3>
                                        <p className="mt-1 text-sm text-gray-500">검색, 담당자, 상품, 접수일 기준으로 조회하고 선택 상담을 일괄 처리합니다.</p>
                                    </div>
                                    <a href={exportHref} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                        <Download className="size-4" />
                                        CSV 다운로드
                                    </a>
                                </div>

                                <form onSubmit={applyFilters} className="grid gap-2 md:grid-cols-2 xl:grid-cols-12">
                                    <label className="sr-only" htmlFor="consultation-search">이름, 연락처, 상품 검색</label>
                                    <div className="relative xl:col-span-3">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            id="consultation-search"
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="이름, 연락처, 상품"
                                            className="h-10 w-full rounded-lg border-gray-300 pl-9 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                        />
                                    </div>

                                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue xl:col-span-2">
                                        <option value="">전체 상태</option>
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>

                                    {isAdmin && (
                                        <select value={assignedPlannerId} onChange={(event) => setAssignedPlannerId(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue xl:col-span-2">
                                            <option value="">전체 담당자</option>
                                            <option value="unassigned">미배정</option>
                                            {planners.map((planner) => (
                                                <option key={planner.id} value={planner.id}>{planner.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    <select value={product} onChange={(event) => setProduct(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue xl:col-span-2">
                                        <option value="">전체 상품</option>
                                        {productOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>

                                    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 xl:col-span-3">
                                        <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                                        <span className="text-sm font-semibold text-gray-400">~</span>
                                        <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="h-10 rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                                    </div>

                                    <div className="flex gap-2 xl:col-span-2 xl:col-start-11">
                                        <button type="submit" className="h-10 flex-1 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700">
                                            검색
                                        </button>
                                        {hasFilters && (
                                            <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50" aria-label="필터 초기화">
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        <form onSubmit={submitBulkUpdate} className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                                <div className="flex h-10 items-center text-sm font-semibold text-gray-700">
                                    선택 {selectedCount}건
                                </div>
                                <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} required={selectedCount > 0} disabled={selectedCount === 0} className="h-10 rounded-lg border-gray-300 text-sm disabled:bg-gray-100">
                                    <option value="">변경할 상태</option>
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {isAdmin && (
                                    <select value={bulkPlannerId} onChange={(event) => setBulkPlannerId(event.target.value)} disabled={selectedCount === 0} className="h-10 rounded-lg border-gray-300 text-sm disabled:bg-gray-100">
                                        <option value="">담당자 유지/해제</option>
                                        {planners.map((planner) => (
                                            <option key={planner.id} value={planner.id}>{planner.name}</option>
                                        ))}
                                    </select>
                                )}
                                <input value={bulkMemo} onChange={(event) => setBulkMemo(event.target.value)} disabled={selectedCount === 0} placeholder="일괄 처리 메모" className="h-10 rounded-lg border-gray-300 text-sm disabled:bg-gray-100 xl:col-span-1" />
                                <button type="submit" disabled={selectedCount === 0 || !bulkStatus} className="h-10 rounded-lg bg-toss-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300">
                                    일괄 변경
                                </button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="w-12 px-5 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={consultations.length > 0 && selectedIds.length === consultations.length}
                                                onChange={(event) => toggleAll(event.target.checked)}
                                                className="rounded border-gray-300 text-toss-blue focus:ring-toss-blue"
                                                aria-label="전체 선택"
                                            />
                                        </th>
                                        {['접수일', '구분', '이름', '연락처', '상품', '상태', '담당'].map((label) => (
                                            <th key={label} scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {consultations.map((consultation) => (
                                        <tr key={consultation.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(consultation.id)}
                                                    onChange={(event) => toggleOne(consultation.id, event.target.checked)}
                                                    className="rounded border-gray-300 text-toss-blue focus:ring-toss-blue"
                                                    aria-label={`${consultation.applicantName} 선택`}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{consultation.createdAt}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                <span className={`rounded-lg px-2 py-1 font-semibold ${sourceStyles[consultation.source] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {consultation.sourceLabel}
                                                </span>
                                            </td>
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
