import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

function InquiryCard({ inquiry, statusOptions }) {
    const form = useForm({
        status: inquiry.status,
        admin_reply: inquiry.adminReply ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.inquiries.update', inquiry.id), { preserveScroll: true });
    };

    return (
        <article className="grid gap-4 px-5 py-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-blue-50 px-2 py-1 font-bold text-blue-700">{inquiry.categoryLabel}</span>
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-600">{inquiry.statusLabel}</span>
                <span className="text-gray-400">{inquiry.createdAt}</span>
            </div>
            <div>
                <h3 className="text-base font-bold text-gray-900">{inquiry.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{inquiry.body}</p>
            </div>
            <dl className="grid gap-2 rounded-md bg-gray-50 p-4 text-sm md:grid-cols-3">
                <div>
                    <dt className="text-xs font-semibold text-gray-500">작성자</dt>
                    <dd className="mt-1 font-semibold text-gray-900">{inquiry.applicantName}</dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold text-gray-500">연락처</dt>
                    <dd className="mt-1 font-semibold text-gray-900">{inquiry.phone || '-'}</dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold text-gray-500">이메일</dt>
                    <dd className="mt-1 font-semibold text-gray-900">{inquiry.email || '-'}</dd>
                </div>
            </dl>
            <form onSubmit={submit} className="grid gap-3">
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    처리상태
                    <select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                        {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    관리자 답변
                    <textarea rows="4" value={form.data.admin_reply} onChange={(event) => form.setData('admin_reply', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                </label>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">{inquiry.repliedAt ? `답변일 ${inquiry.repliedAt}` : '아직 답변이 없습니다.'}</span>
                    <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                        저장
                    </button>
                </div>
            </form>
        </article>
    );
}

export default function Index({ inquiries = [], statusOptions = [] }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">문의하기</h2>}>
            <Head title="문의하기 관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">문의하기 관리</h1>
                        <p className="mt-1 text-sm text-gray-500">고객 문의를 확인하고 처리상태와 답변을 저장합니다.</p>
                        {flash?.success && (
                            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>
                        )}
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">문의 목록</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {inquiries.map((inquiry) => (
                                <InquiryCard key={inquiry.id} inquiry={inquiry} statusOptions={statusOptions} />
                            ))}
                        </div>
                        {inquiries.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">등록된 문의가 없습니다.</div>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
