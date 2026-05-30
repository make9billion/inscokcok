import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function DetailRow({ label, value }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
        </div>
    );
}

export default function Show({ consultation, planners, statusOptions }) {
    const { flash } = usePage().props;
    const form = useForm({
        status: consultation.status,
        assigned_planner_id: consultation.assignedPlannerId ?? '',
        memo: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.consultations.update', consultation.id), {
            preserveScroll: true,
            onSuccess: () => form.reset('memo'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">상담 상세</h2>}
        >
            <Head title="상담 상세" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('admin.consultations.index')}
                        className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                    >
                        상담 목록으로
                    </Link>

                    {flash?.success && (
                        <div className="mt-5 rounded-lg border border-toss-blue/20 bg-toss-blueLight px-4 py-3 text-sm font-semibold text-toss-blue">
                            {flash.success}
                        </div>
                    )}

                    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                        <section className="rounded-lg bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-toss-blue">{consultation.statusLabel}</p>
                                    <h1 className="mt-1 text-2xl font-bold text-gray-900">
                                        {consultation.applicantName}
                                    </h1>
                                </div>
                                <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                    {consultation.type === 'checkup' ? '보험점검' : '상품상담'}
                                </span>
                            </div>

                            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                                <DetailRow label="연락처" value={consultation.phone} />
                                <DetailRow label="생년월일" value={consultation.birthDate} />
                                <DetailRow label="관심 상품" value={consultation.interestedProduct} />
                                <DetailRow
                                    label="현재 월 보험료"
                                    value={
                                        consultation.currentMonthlyPremium
                                            ? `${Number(consultation.currentMonthlyPremium).toLocaleString()}원`
                                            : null
                                    }
                                />
                                <DetailRow label="희망 연락 시간" value={consultation.preferredContactTime} />
                                <DetailRow label="담당 플래너" value={consultation.assignedPlannerName} />
                            </dl>

                            <div className="mt-6 rounded-lg bg-gray-50 p-4">
                                <h2 className="text-sm font-semibold text-gray-900">상담 메모</h2>
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                                    {consultation.memo || '남겨진 메모가 없습니다.'}
                                </p>
                            </div>
                        </section>

                        <form onSubmit={submit} className="rounded-lg bg-white p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900">상태 변경</h2>

                            <label className="mt-5 block">
                                <span className="text-sm font-semibold text-gray-700">상태</span>
                                <select
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.target.value)}
                                    className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="mt-4 block">
                                <span className="text-sm font-semibold text-gray-700">담당 플래너</span>
                                <select
                                    value={form.data.assigned_planner_id}
                                    onChange={(event) => form.setData('assigned_planner_id', event.target.value)}
                                    className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                >
                                    <option value="">미배정</option>
                                    {planners.map((planner) => (
                                        <option key={planner.id} value={planner.id}>
                                            {planner.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="mt-4 block">
                                <span className="text-sm font-semibold text-gray-700">변경 메모</span>
                                <textarea
                                    value={form.data.memo}
                                    onChange={(event) => form.setData('memo', event.target.value)}
                                    rows="4"
                                    className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-5 w-full rounded-lg bg-toss-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-toss-blueHover disabled:opacity-60"
                            >
                                {form.processing ? '저장 중' : '상태 저장'}
                            </button>
                        </form>
                    </div>

                    <section className="mt-5 rounded-lg bg-white p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900">변경 기록</h2>
                        <div className="mt-4 divide-y divide-gray-100">
                            {consultation.statusLogs.map((log) => (
                                <div key={log.id} className="py-3 text-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-semibold text-gray-900">{log.toStatusLabel}</span>
                                        <span className="text-gray-500">{log.createdAt}</span>
                                    </div>
                                    <p className="mt-1 text-gray-600">{log.memo || '메모 없음'}</p>
                                    <p className="mt-1 text-xs text-gray-500">처리자: {log.actorName || '-'}</p>
                                </div>
                            ))}
                        </div>
                        {consultation.statusLogs.length === 0 && (
                            <p className="mt-4 text-sm text-gray-500">아직 변경 기록이 없습니다.</p>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
