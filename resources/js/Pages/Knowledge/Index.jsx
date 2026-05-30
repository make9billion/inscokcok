import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Index({ auth, questions }) {
    const user = usePage().props.auth.user;
    const form = useForm({
        title: '',
        body: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('knowledge.questions.store'), {
            preserveScroll: true,
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="보험지식인" />

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                        <div>
                            <p className="text-sm font-semibold text-toss-blue">Knowledge</p>
                            <h1 className="mt-2 text-3xl font-bold text-toss-grey900">보험지식인</h1>
                            <p className="mt-3 text-sm leading-6 text-toss-grey600">
                                공개 목록에는 제목만 표시됩니다. 질문 본문은 작성자와 담당자만 확인합니다.
                            </p>

                            <div className="mt-8 overflow-hidden rounded-lg border border-toss-grey200 bg-white">
                                {questions.length > 0 ? (
                                    <ul className="divide-y divide-toss-grey200">
                                        {questions.map((question) => (
                                            <li key={question.id} className="px-5 py-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-lg bg-toss-blueLight px-2 py-1 text-xs font-semibold text-toss-blue">
                                                        {question.statusLabel}
                                                    </span>
                                                    <span className="text-xs text-toss-grey500">
                                                        {question.createdAt}
                                                    </span>
                                                </div>
                                                <h2 className="mt-2 text-base font-semibold text-toss-grey900">
                                                    {question.title}
                                                </h2>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-5 py-12 text-center text-sm text-toss-grey500">
                                        아직 등록된 질문이 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="rounded-lg border border-toss-grey200 bg-toss-grey50 p-5">
                            <h2 className="text-lg font-bold text-toss-grey900">질문 작성</h2>
                            {user ? (
                                <form onSubmit={submit} className="mt-5 space-y-4">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-toss-grey800">제목</span>
                                        <input
                                            type="text"
                                            value={form.data.title}
                                            onChange={(event) => form.setData('title', event.target.value)}
                                            className="mt-2 w-full rounded-lg border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                        />
                                        {form.errors.title && (
                                            <p className="mt-2 text-xs font-medium text-red-600">{form.errors.title}</p>
                                        )}
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-semibold text-toss-grey800">내용</span>
                                        <textarea
                                            rows="6"
                                            value={form.data.body}
                                            onChange={(event) => form.setData('body', event.target.value)}
                                            className="mt-2 w-full rounded-lg border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                        />
                                        {form.errors.body && (
                                            <p className="mt-2 text-xs font-medium text-red-600">{form.errors.body}</p>
                                        )}
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="w-full rounded-lg bg-toss-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-toss-blueHover disabled:opacity-60"
                                    >
                                        질문 등록
                                    </button>
                                </form>
                            ) : (
                                <div className="mt-5">
                                    <p className="text-sm leading-6 text-toss-grey600">
                                        질문 작성은 로그인 후 이용할 수 있습니다.
                                    </p>
                                    <Link
                                        href="/login"
                                        className="mt-4 inline-flex w-full justify-center rounded-lg bg-toss-blue px-4 py-3 text-sm font-semibold text-white"
                                    >
                                        로그인
                                    </Link>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
