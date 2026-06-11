import { Head, useForm, usePage } from '@inertiajs/react';
import { ChevronDown, MessageSquareText, Plus, X } from 'lucide-react';
import { useState } from 'react';

import CustomerHeaderNav from '@/Components/CustomerHeaderNav';
import Modal from '@/Components/Modal';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Inquiries({ auth, categories = [], inquiries = [] }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openId, setOpenId] = useState(null);
    const form = useForm({
        category: categories[0]?.value ?? 'site',
        applicant_name: auth?.user?.name ?? '',
        phone: '',
        email: auth?.user?.email ?? '',
        title: '',
        body: '',
    });

    const closeModal = () => {
        setIsModalOpen(false);
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        form.post(route('customer.inquiries.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('title', 'body', 'phone');
                closeModal();
            },
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="문의하기" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
                    <p className="text-sm font-black text-[#f47b20]">Inquiry</p>
                    <h1 className="mt-2 text-2xl font-black leading-tight text-toss-grey900 sm:text-3xl">문의하기</h1>
                    <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-toss-grey500">
                        사이트 이용, 이벤트, 사은품, 배송 관련 문의를 남겨주시면 확인 후 안내드립니다.
                    </p>
                    <CustomerHeaderNav />
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-toss-grey900 sm:text-xl">문의 목록</h2>
                        <p className="mt-2 text-base font-semibold text-toss-grey500">
                            질문을 클릭하면 문의 내용을 펼쳐볼 수 있습니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#12284a] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0b1a33] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12284a]"
                    >
                        <Plus className="size-4" />
                        문의하기
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
                        {flash.success}
                    </div>
                )}

                {inquiries.length ? (
                    <div className="divide-y divide-toss-grey200 border-y border-toss-grey200">
                        {inquiries.map((inquiry) => {
                            const isOpen = openId === inquiry.id;

                            return (
                                <article key={inquiry.id} className="py-8">
                                    <button
                                        type="button"
                                        className="flex w-full items-start justify-between gap-6 text-left"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenId(isOpen ? null : inquiry.id)}
                                    >
                                        <span className="min-w-0">
                                            <span className="flex flex-wrap items-center gap-2 text-sm font-black">
                                                <span className="rounded-full bg-toss-grey100 px-3 py-1 text-toss-grey700">
                                                    {inquiry.category}
                                                </span>
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-toss-blue">
                                                    {inquiry.status}
                                                </span>
                                                {inquiry.hasReply && (
                                                    <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                                                        답변 등록
                                                    </span>
                                                )}
                                                <span className="text-toss-grey400">{inquiry.createdAt}</span>
                                            </span>
                                            <span className="mt-3 block text-lg font-black leading-tight text-toss-grey900 sm:text-xl">
                                                {inquiry.title}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            className={`mt-2 size-8 shrink-0 text-toss-grey500 transition ${isOpen ? 'rotate-180' : ''}`}
                                            strokeWidth={2.2}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="mt-7 space-y-6">
                                            <div>
                                                <p className="text-sm font-black text-[#f47b20]">문의내용</p>
                                                <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-7 text-toss-grey600">
                                                    {inquiry.body}
                                                </p>
                                            </div>
                                            {inquiry.reply && (
                                                <div className="rounded-2xl bg-toss-grey50 p-5">
                                                    <p className="text-sm font-black text-toss-blue">관리자 답변</p>
                                                    <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-7 text-toss-grey700">
                                                        {inquiry.reply}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-toss-grey300 px-6 py-16 text-center">
                        <MessageSquareText className="mx-auto size-10 text-toss-grey400" />
                        <p className="mt-4 text-lg font-black text-toss-grey700">등록된 문의가 없습니다.</p>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#12284a] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0b1a33]"
                        >
                            <Plus className="size-4" />
                            첫 문의 작성하기
                        </button>
                    </div>
                )}
            </section>

            <Modal show={isModalOpen} maxWidth="2xl" onClose={closeModal}>
                <form onSubmit={submit} className="p-7">
                    <div className="flex items-start justify-between gap-5">
                        <div>
                            <p className="text-sm font-black text-[#f47b20]">Inquiry</p>
                            <h2 className="mt-2 text-lg font-black text-toss-grey900">문의 작성</h2>
                            <p className="mt-2 text-sm font-semibold text-toss-grey500">
                                말머리를 선택하고 문의 내용을 입력해주세요.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="grid size-10 place-items-center rounded-full bg-toss-grey100 text-toss-grey600 transition hover:bg-toss-grey200"
                            aria-label="닫기"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="mt-7 grid gap-4">
                        <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                            말머리
                            <select
                                value={form.data.category}
                                onChange={(event) => form.setData('category', event.target.value)}
                                className="rounded-xl border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                이름
                                <input
                                    value={form.data.applicant_name}
                                    onChange={(event) => form.setData('applicant_name', event.target.value)}
                                    className="rounded-xl border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                />
                                {form.errors.applicant_name && <span className="text-xs text-red-600">{form.errors.applicant_name}</span>}
                            </label>
                            <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                이메일
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    className="rounded-xl border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                />
                                {form.errors.email && <span className="text-xs text-red-600">{form.errors.email}</span>}
                            </label>
                        </div>

                        <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                            제목
                            <input
                                value={form.data.title}
                                onChange={(event) => form.setData('title', event.target.value)}
                                className="rounded-xl border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue"
                            />
                            {form.errors.title && <span className="text-xs text-red-600">{form.errors.title}</span>}
                        </label>

                        <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                            문의 내용
                            <textarea
                                rows="7"
                                value={form.data.body}
                                onChange={(event) => form.setData('body', event.target.value)}
                                className="rounded-xl border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue"
                            />
                            {form.errors.body && <span className="text-xs text-red-600">{form.errors.body}</span>}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="mt-7 w-full rounded-xl bg-[#12284a] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0b1a33] disabled:opacity-60"
                    >
                        문의 접수
                    </button>
                </form>
            </Modal>
        </PublicLayout>
    );
}
