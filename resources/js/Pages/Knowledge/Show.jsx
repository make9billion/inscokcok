import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ question }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">보험지식인</h2>}
        >
            <Head title={question.title} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <Link href="/knowledge" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                        목록으로
                    </Link>

                    <article className="mt-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                {question.statusLabel}
                            </span>
                            <span className="text-sm text-gray-500">{question.createdAt}</span>
                        </div>

                        <h1 className="mt-4 text-2xl font-bold text-gray-900">{question.title}</h1>
                        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-700">{question.body}</p>
                    </article>

                    {question.answer ? (
                        <section className="mt-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                    답변
                                </span>
                                <span className="text-sm text-gray-500">{question.answer.createdAt}</span>
                            </div>
                            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                {question.answer.body}
                            </p>
                            <p className="mt-4 text-xs text-gray-500">
                                답변자: {question.answer.managerName ?? '-'}
                            </p>
                        </section>
                    ) : (
                        <section className="mt-5 rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm ring-1 ring-gray-200">
                            아직 등록된 답변이 없습니다.
                        </section>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
