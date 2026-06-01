import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function PointAdjustForm({ member, canAdjustPoints, search }) {
    const form = useForm({
        points: '',
        memo: '',
        search,
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(route('admin.members.points.adjust', member.id), {
            preserveScroll: true,
            onSuccess: () => form.reset('points', 'memo'),
        });
    };

    if (!canAdjustPoints) {
        return <p className="text-xs text-gray-400">포인트 조정은 최고 관리자만 가능합니다.</p>;
    }

    return (
        <form onSubmit={submit} className="grid gap-2 md:grid-cols-[120px_1fr_auto]">
            <input
                type="number"
                value={form.data.points}
                onChange={(event) => form.setData('points', event.target.value)}
                placeholder="+1000 / -500"
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
                value={form.data.memo}
                onChange={(event) => form.setData('memo', event.target.value)}
                placeholder="조정 사유"
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                포인트 입력
            </button>
            {(form.errors.points || form.errors.memo) && (
                <p className="text-xs text-red-600 md:col-span-3">{form.errors.points || form.errors.memo}</p>
            )}
        </form>
    );
}

export default function Index({ members = [], filters = {}, canAdjustPoints = false, recentAdjustments = [] }) {
    const { flash } = usePage().props;
    const searchForm = useForm({
        search: filters.search ?? '',
    });

    const submitSearch = (event) => {
        event.preventDefault();
        router.get(route('admin.members.index'), searchForm.data, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">회원관리</h2>}>
            <Head title="회원관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">회원관리</h1>
                                <p className="mt-1 text-sm text-gray-500">회원가입 고객 정보를 조회하고 포인트를 수동으로 지급하거나 차감합니다.</p>
                            </div>
                            <form onSubmit={submitSearch} className="flex gap-2">
                                <label className="relative block">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={searchForm.data.search}
                                        onChange={(event) => searchForm.setData('search', event.target.value)}
                                        placeholder="이름, 이메일, 연락처 검색"
                                        className="w-72 rounded-md border-gray-300 pl-9 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </label>
                                <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700">
                                    검색
                                </button>
                            </form>
                        </div>
                        {flash?.success && (
                            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>
                        )}
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">회원 목록</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {members.map((member) => (
                                <article key={member.id} className="grid gap-4 px-5 py-5">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
                                                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{formatNumber(member.pointBalance)}P</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">{member.email}</p>
                                            <p className="mt-1 text-sm text-gray-500">{member.phone || '연락처 없음'}</p>
                                        </div>
                                        <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-3 lg:text-right">
                                            <span>상담 {formatNumber(member.consultationCount)}건</span>
                                            <span>질문 {formatNumber(member.questionCount)}건</span>
                                            <span>주문 {formatNumber(member.orderCount)}건</span>
                                        </div>
                                    </div>
                                    <dl className="grid gap-3 rounded-md bg-gray-50 p-4 text-sm md:grid-cols-4">
                                        <div>
                                            <dt className="text-xs font-semibold text-gray-500">가입일</dt>
                                            <dd className="mt-1 font-semibold text-gray-900">{member.joinedAt}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-semibold text-gray-500">생년월일</dt>
                                            <dd className="mt-1 font-semibold text-gray-900">{member.birthDate || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-semibold text-gray-500">성별</dt>
                                            <dd className="mt-1 font-semibold text-gray-900">{member.gender || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-semibold text-gray-500">주소</dt>
                                            <dd className="mt-1 font-semibold text-gray-900">{member.address || '-'}</dd>
                                        </div>
                                    </dl>
                                    <PointAdjustForm member={member} canAdjustPoints={canAdjustPoints} search={filters.search ?? ''} />
                                </article>
                            ))}
                        </div>
                        {members.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">조회된 회원이 없습니다.</div>}
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">최근 포인트 수동 조정</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentAdjustments.map((entry) => (
                                <div key={entry.id} className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                                    <div>
                                        <p className="font-semibold text-gray-900">{entry.memberName} <span className="font-normal text-gray-500">{entry.memberEmail}</span></p>
                                        <p className="mt-1 text-gray-500">{entry.memo}</p>
                                    </div>
                                    <span className={entry.points >= 0 ? 'font-bold text-blue-700' : 'font-bold text-red-600'}>
                                        {entry.points >= 0 ? '+' : ''}{formatNumber(entry.points)}P
                                    </span>
                                    <span className="text-xs text-gray-400">{entry.createdAt} · {entry.actorName}</span>
                                </div>
                            ))}
                        </div>
                        {recentAdjustments.length === 0 && <div className="px-5 py-10 text-center text-sm text-gray-500">수동 조정 이력이 없습니다.</div>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
