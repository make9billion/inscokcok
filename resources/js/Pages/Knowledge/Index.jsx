import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, MessageCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';

import Modal from '@/Components/Modal';
import PublicLayout from '@/Layouts/PublicLayout';
import knowledgeHeroImage from '../../../images/knowledge/hero.png';

function FieldError({ message }) {
    return message ? <p className="mt-2 text-xs font-semibold text-red-600">{message}</p> : null;
}

export default function Index({ auth, questions }) {
    const user = usePage().props.auth.user;
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const form = useForm({
        title: '',
        body: '',
    });

    const openQuestionModal = () => setIsQuestionModalOpen(true);

    const closeQuestionModal = () => {
        setIsQuestionModalOpen(false);
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('knowledge.questions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('title', 'body');
                closeQuestionModal();
            },
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="보험지식인" />

            <section className="bg-[#f5f8ff]">
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-[28px] bg-white ring-1 ring-blue-100">
                        <img
                            src={knowledgeHeroImage}
                            alt="보험지식인 안내"
                            className="block h-auto w-full"
                            loading="eager"
                        />
                        <button
                            type="button"
                            onClick={openQuestionModal}
                            className="absolute bottom-[7%] right-[4%] h-[14%] w-[22%] rounded-[999px] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/60"
                            aria-label="보험지식인 질문 등록"
                        >
                            <span className="sr-only">질문 등록</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-wide text-[#2f6df6]">Knowledge Q&A</p>
                            <h1 className="mt-2 text-3xl font-black tracking-normal text-toss-grey900">보험지식인 질문 리스트</h1>
                            <p className="mt-3 text-sm font-semibold leading-6 text-toss-grey500">
                                보험과 관련된 궁금증을 남기면 전문 설계사가 확인 후 답변을 등록합니다.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openQuestionModal}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#12284a] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0b1a33]"
                        >
                            <Plus className="size-4" strokeWidth={2.4} />
                            질문 등록
                        </button>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-3xl border border-toss-grey200 bg-white">
                        {questions.length > 0 ? (
                            <ul className="divide-y divide-toss-grey200">
                                {questions.map((question) => (
                                    <li key={question.id} className="px-5 py-5 transition hover:bg-toss-grey50 sm:px-7">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={
                                                    question.status === 'answered'
                                                        ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600'
                                                        : 'rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600'
                                                }
                                            >
                                                {question.statusLabel}
                                            </span>
                                            <span className="text-xs font-semibold text-toss-grey400">{question.createdAt}</span>
                                            {question.isMine && (
                                                <span className="rounded-full bg-[#f47b20]/10 px-3 py-1 text-xs font-black text-[#f47b20]">
                                                    내 질문
                                                </span>
                                            )}
                                        </div>
                                        {question.isMine ? (
                                            <Link href={route('knowledge.questions.show', question.id)} className="group mt-3 block">
                                                <h2 className="text-base font-black leading-7 text-toss-grey900 transition group-hover:text-[#2f6df6] sm:text-lg">
                                                    {question.title}
                                                </h2>
                                                <p className="mt-1 text-xs font-bold text-[#2f6df6]">답변 확인하기</p>
                                            </Link>
                                        ) : (
                                            <h2 className="mt-3 text-base font-black leading-7 text-toss-grey900 sm:text-lg">
                                                {question.title}
                                            </h2>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-5 py-16 text-center">
                                <MessageCircle className="mx-auto size-10 text-toss-grey300" strokeWidth={1.8} />
                                <p className="mt-4 text-sm font-bold text-toss-grey500">아직 등록된 질문이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Modal show={isQuestionModalOpen} maxWidth="lg" onClose={closeQuestionModal}>
                <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-5">
                        <div>
                            <p className="text-sm font-black text-[#2f6df6]">보험지식인</p>
                            <h2 className="mt-2 text-2xl font-black text-toss-grey900">질문 등록</h2>
                            <p className="mt-2 text-sm font-semibold leading-6 text-toss-grey500">
                                궁금한 보험 내용을 남겨주시면 전문 설계사가 답변해드립니다.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeQuestionModal}
                            className="grid size-10 shrink-0 place-items-center rounded-full bg-toss-grey100 text-toss-grey600 transition hover:bg-toss-grey200"
                            aria-label="닫기"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {user ? (
                        <form onSubmit={submit} className="mt-7 grid gap-4">
                            <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                제목
                                <input
                                    type="text"
                                    value={form.data.title}
                                    onChange={(event) => form.setData('title', event.target.value)}
                                    className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#2f6df6] focus:ring-[#2f6df6]"
                                    placeholder="예: 암보험 진단비를 얼마나 준비해야 하나요?"
                                />
                                <FieldError message={form.errors.title} />
                            </label>

                            <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                질문 내용
                                <textarea
                                    rows="8"
                                    value={form.data.body}
                                    onChange={(event) => form.setData('body', event.target.value)}
                                    className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#2f6df6] focus:ring-[#2f6df6]"
                                    placeholder="현재 상황과 궁금한 내용을 자세히 적어주세요."
                                />
                                <FieldError message={form.errors.body} />
                            </label>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#12284a] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0b1a33] disabled:opacity-60"
                            >
                                {form.processing ? '등록 중' : '질문 등록하기'}
                                <CheckCircle2 className="size-4" strokeWidth={2.2} />
                            </button>
                        </form>
                    ) : (
                        <div className="mt-7 rounded-2xl bg-toss-grey50 p-5">
                            <p className="text-sm font-bold leading-6 text-toss-grey700">
                                질문 등록은 로그인 후 이용할 수 있습니다. 로그인하면 내 질문과 답변을 마이페이지에서 확인할 수 있어요.
                            </p>
                            <Link
                                href="/login"
                                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#12284a] px-5 text-sm font-black text-white"
                            >
                                로그인하기
                            </Link>
                        </div>
                    )}
                </div>
            </Modal>
        </PublicLayout>
    );
}
