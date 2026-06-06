import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function PointAdjustForm({ member, canAdjustPoints }) {
    const form = useForm({ points: '', memo: '' });
    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.members.points.adjust', member.id), { preserveScroll: true, onSuccess: () => form.reset('points', 'memo') });
    };
    if (!canAdjustPoints) return <p className="text-sm text-gray-500">포인트 조정은 최고 관리자만 가능합니다.</p>;
    return (
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
            <input type="number" value={form.data.points} onChange={(event) => form.setData('points', event.target.value)} placeholder="+1000 / -500" className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
            <input value={form.data.memo} onChange={(event) => form.setData('memo', event.target.value)} placeholder="조정 사유" className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
            <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">포인트 입력</button>
            {(form.errors.points || form.errors.memo) && <p className="text-xs text-red-600 md:col-span-3">{form.errors.points || form.errors.memo}</p>}
        </form>
    );
}

export default function Show({ member, canAdjustPoints = false, recentAdjustments = [] }) {
    const { flash } = usePage().props;
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">회원 상세</h2>}>
            <Head title="회원 상세" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Link href={route('admin.members.index')} className="inline-flex text-sm font-semibold text-gray-600 hover:text-gray-900">목록으로</Link>
                    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                        <p className="mt-1 text-sm text-gray-500">{member.email}</p>
                        {flash?.success && <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                        <dl className="mt-6 grid gap-4 rounded-md bg-gray-50 p-4 text-sm md:grid-cols-3 lg:grid-cols-5">
                            <div><dt className="text-xs font-semibold text-gray-500">연락처</dt><dd className="mt-1 font-semibold text-gray-900">{member.phone || '-'}</dd></div>
                            <div><dt className="text-xs font-semibold text-gray-500">포인트</dt><dd className="mt-1 font-bold text-blue-700">{formatNumber(member.pointBalance)}P</dd></div>
                            <div><dt className="text-xs font-semibold text-gray-500">가입일</dt><dd className="mt-1 font-semibold text-gray-900">{member.joinedAt}</dd></div>
                            <div><dt className="text-xs font-semibold text-gray-500">생년월일</dt><dd className="mt-1 font-semibold text-gray-900">{member.birthDate || '-'}</dd></div>
                            <div><dt className="text-xs font-semibold text-gray-500">성별</dt><dd className="mt-1 font-semibold text-gray-900">{member.gender || '-'}</dd></div>
                            <div className="md:col-span-3 lg:col-span-5"><dt className="text-xs font-semibold text-gray-500">주소</dt><dd className="mt-1 font-semibold text-gray-900">{member.address || '-'}</dd></div>
                        </dl>
                    </section>
                    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <h2 className="text-base font-bold text-gray-900">포인트 수동 입력</h2>
                        <div className="mt-4"><PointAdjustForm member={member} canAdjustPoints={canAdjustPoints} /></div>
                    </section>
                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-base font-semibold text-gray-900">포인트 조정 이력</h2></div>
                        <div className="divide-y divide-gray-100">
                            {recentAdjustments.map((entry) => <div key={entry.id} className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_auto_auto]"><span>{entry.memo}</span><span className="font-bold text-blue-700">{entry.points >= 0 ? '+' : ''}{formatNumber(entry.points)}P</span><span className="text-gray-500">{entry.createdAt} / {entry.actorName}</span></div>)}
                        </div>
                        {recentAdjustments.length === 0 && <div className="px-5 py-10 text-center text-sm text-gray-500">조정 이력이 없습니다.</div>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
