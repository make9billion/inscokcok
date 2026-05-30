import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

function AnswerForm({ question }) {
    const form = useForm({ body: '' });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.knowledge.answers.store', question.id), {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    };

    if (question.answerBody) {
        return (
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">등록된 답변</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{question.answerBody}</p>
                <p className="mt-2 text-xs text-gray-500">답변자: {question.answeredBy ?? '-'}</p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="mt-4">
            <label className="block">
                <span className="text-sm font-semibold text-gray-700">답변</span>
                <textarea
                    rows="4"
                    value={form.data.body}
                    onChange={(event) => form.setData('body', event.target.value)}
                    className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {form.errors.body && <p className="mt-2 text-xs font-medium text-red-600">{form.errors.body}</p>}
            </label>
            <button
                type="submit"
                disabled={form.processing}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
                답변 등록
            </button>
        </form>
    );
}

export default function Index({ questions }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">보험 Q&A 답변</h2>}
        >
            <Head title="보험 Q&A 답변" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {questions.map((question) => (
                            <article key={question.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                        {question.statusLabel}
                                    </span>
                                    <span className="text-xs text-gray-500">{question.createdAt}</span>
                                    <span className="text-xs text-gray-500">작성자: {question.authorName ?? '-'}</span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-gray-900">{question.title}</h3>
                                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                                    {question.body}
                                </p>
                                <AnswerForm question={question} />
                            </article>
                        ))}
                    </div>

                    {questions.length === 0 && (
                        <div className="rounded-lg bg-white px-5 py-12 text-center text-sm text-gray-500 shadow-sm ring-1 ring-gray-200">
                            아직 등록된 질문이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
