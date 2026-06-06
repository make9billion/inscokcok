import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Show({ inquiry, statusOptions = [], pageTitle = '문의 상세', backRouteName = 'admin.inquiries.index' }) {
    const { flash } = usePage().props;
    const form = useForm({ status: inquiry.status, admin_reply: inquiry.adminReply ?? '' });
    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.inquiries.update', inquiry.id), { preserveScroll: true });
    };
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{pageTitle}</h2>}>
            <Head title={pageTitle} />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Link href={route(backRouteName)} className="inline-flex text-sm font-semibold text-gray-600 hover:text-gray-900">목록으로</Link>
                    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-blue-50 px-2 py-1 font-bold text-blue-700">{inquiry.categoryLabel}</span><span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-600">{inquiry.statusLabel}</span><span className="text-gray-400">{inquiry.createdAt}</span></div>
                        <h1 className="mt-3 text-2xl font-bold text-gray-900">{inquiry.title}</h1>
                        {flash?.success && <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                        <dl className="mt-6 grid gap-4 rounded-md bg-gray-50 p-4 text-sm md:grid-cols-3">
                            <div><dt className="text-xs font-semibold text-gray-500">작성자</dt><dd className="mt-1 font-semibold text-gray-900">{inquiry.applicantName}</dd></div>
                            <div><dt className="text-xs font-semibold text-gray-500">연락처</dt><dd className="mt-1 font-semibold text-gray-900">{inquiry.phone || '-'}</dd></div>
                            <div><dt className="text-xs font-semibold text-gray-500">이메일</dt><dd className="mt-1 font-semibold text-gray-900">{inquiry.email || '-'}</dd></div>
                        </dl>
                        <div className="mt-6"><h2 className="text-base font-bold text-gray-900">문의 내용</h2><p className="mt-2 whitespace-pre-line rounded-md border border-gray-200 p-4 text-sm leading-6 text-gray-700">{inquiry.body}</p></div>
                    </section>
                    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <h2 className="text-base font-bold text-gray-900">처리 정보</h2>
                        <form onSubmit={submit} className="mt-4 grid gap-4">
                            <label className="grid gap-1 text-sm font-semibold text-gray-700">처리상태<select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">{statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
                            <label className="grid gap-1 text-sm font-semibold text-gray-700">관리자 답변<textarea rows="7" value={form.data.admin_reply} onChange={(event) => form.setData('admin_reply', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                            <div className="flex items-center justify-between"><span className="text-xs text-gray-400">{inquiry.repliedAt ? `답변 ${inquiry.repliedAt}` : '아직 답변이 없습니다.'}</span><button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">저장</button></div>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
