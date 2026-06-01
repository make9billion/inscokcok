import { Head, useForm, usePage } from '@inertiajs/react';
import { MessageSquareText } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

export default function Inquiries({ auth, categories = [], inquiries = [] }) {
    const { flash } = usePage().props;
    const form = useForm({
        category: categories[0]?.value ?? 'site',
        applicant_name: auth?.user?.name ?? '',
        phone: '',
        email: auth?.user?.email ?? '',
        title: '',
        body: '',
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(route('customer.inquiries.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('title', 'body'),
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="문의하기" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Inquiry</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">문의하기</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-toss-grey600">
                        사이트 이용, 이벤트, 사은품, 배송 관련 문의를 남겨주시면 확인 후 안내드리겠습니다.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
                <form onSubmit={submit} className="rounded-lg border border-toss-grey200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-full bg-toss-blue/10 text-toss-blue">
                            <MessageSquareText className="size-5" />
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-toss-grey900">문의 작성</h2>
                            <p className="text-sm text-toss-grey500">말머리를 선택하고 문의 내용을 입력해주세요.</p>
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>
                    )}

                    <div className="mt-6 grid gap-4">
                        <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                            말머리
                            <select value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue">
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>{category.label}</option>
                                ))}
                            </select>
                        </label>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                                이름
                                <input value={form.data.applicant_name} onChange={(event) => form.setData('applicant_name', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                                {form.errors.applicant_name && <span className="text-xs text-red-600">{form.errors.applicant_name}</span>}
                            </label>
                            <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                                연락처
                                <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            </label>
                        </div>
                        <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                            이메일
                            <input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            {form.errors.email && <span className="text-xs text-red-600">{form.errors.email}</span>}
                        </label>
                        <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                            제목
                            <input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            {form.errors.title && <span className="text-xs text-red-600">{form.errors.title}</span>}
                        </label>
                        <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                            문의 내용
                            <textarea rows="7" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            {form.errors.body && <span className="text-xs text-red-600">{form.errors.body}</span>}
                        </label>
                    </div>

                    <button type="submit" disabled={form.processing} className="mt-6 w-full rounded-md bg-toss-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">
                        문의 접수
                    </button>
                </form>

                <aside className="rounded-lg border border-toss-grey200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-toss-grey900">최근 문의</h2>
                    <div className="mt-5 divide-y divide-toss-grey200">
                        {inquiries.length ? inquiries.map((inquiry) => (
                            <article key={inquiry.id} className="py-4 first:pt-0 last:pb-0">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded bg-toss-grey100 px-2 py-1 font-semibold text-toss-grey700">{inquiry.category}</span>
                                    <span className="rounded bg-blue-50 px-2 py-1 font-semibold text-toss-blue">{inquiry.status}</span>
                                    {inquiry.hasReply && <span className="rounded bg-green-50 px-2 py-1 font-semibold text-green-700">답변등록</span>}
                                </div>
                                <h3 className="mt-2 text-sm font-bold text-toss-grey900">{inquiry.title}</h3>
                                <p className="mt-1 text-xs text-toss-grey500">{inquiry.createdAt}</p>
                            </article>
                        )) : (
                            <p className="py-10 text-sm text-toss-grey500">등록된 문의가 없습니다.</p>
                        )}
                    </div>
                </aside>
            </section>
        </PublicLayout>
    );
}
