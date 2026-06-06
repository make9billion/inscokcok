import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function AnswerForm({ question }) {
    const form = useForm({ body: '' });
    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.knowledge.answers.store', question.id), { preserveScroll: true, onSuccess: () => form.reset('body') });
    };
    if (question.answerBody) return <div className="rounded-lg bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-700">등록된 답변</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{question.answerBody}</p><p className="mt-2 text-xs text-gray-500">답변자 {question.answeredBy ?? '-'}</p></div>;
    return (
        <form onSubmit={submit}>
            <label className="block"><span className="text-sm font-semibold text-gray-700">답변</span><textarea rows="8" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />{form.errors.body && <p className="mt-2 text-xs font-medium text-red-600">{form.errors.body}</p>}</label>
            <button type="submit" disabled={form.processing} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">답변 등록</button>
        </form>
    );
}

export default function Show({ question }) {
    const { flash } = usePage().props;
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">보험 Q&A 상세</h2>}>
            <Head title="보험 Q&A 상세" />
            <div className="py-8"><div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                <Link href={route('admin.knowledge.index')} className="inline-flex text-sm font-semibold text-gray-600 hover:text-gray-900">목록으로</Link>
                {flash?.success && <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{question.statusLabel}</span><span className="text-xs text-gray-500">{question.createdAt}</span><span className="text-xs text-gray-500">작성자 {question.authorName ?? '-'}</span></div>
                    <h1 className="mt-3 text-2xl font-bold text-gray-900">{question.title}</h1>
                    <div className="mt-6"><h2 className="text-base font-bold text-gray-900">질문 내용</h2><p className="mt-2 whitespace-pre-line rounded-md border border-gray-200 p-4 text-sm leading-6 text-gray-700">{question.body}</p></div>
                </section>
                <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200"><h2 className="mb-4 text-base font-bold text-gray-900">답변 관리</h2><AnswerForm question={question} /></section>
            </div></div>
        </AuthenticatedLayout>
    );
}
