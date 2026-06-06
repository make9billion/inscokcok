import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ questions }) {
    const { flash } = usePage().props;
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">보험 Q&A 답변</h2>}>
            <Head title="보험 Q&A 답변" />
            <div className="py-8"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {flash?.success && <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                    <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-base font-semibold text-gray-900">지식인 질문 목록</h2></div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50"><tr>{['등록일', '제목', '작성자', '상태', '답변자'].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>)}</tr></thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {questions.map((question) => (
                                    <tr key={question.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{question.createdAt}</td>
                                        <td className="min-w-64 px-5 py-4 text-sm font-semibold text-gray-900"><Link href={route('admin.knowledge.show', question.id)} className="hover:text-blue-700">{question.title}</Link></td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{question.authorName ?? '-'}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm"><span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{question.statusLabel}</span></td>
                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{question.answeredBy ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {questions.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">아직 등록된 질문이 없습니다.</div>}
                    </div>
                </section>
            </div></div>
        </AuthenticatedLayout>
    );
}
