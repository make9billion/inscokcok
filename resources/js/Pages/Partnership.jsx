import { Head, useForm, usePage } from '@inertiajs/react';
import { Handshake } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

export default function Partnership({ auth }) {
    const { flash } = usePage().props;
    const form = useForm({
        company_name: '',
        applicant_name: auth?.user?.name ?? '',
        phone: '',
        email: auth?.user?.email ?? '',
        body: '',
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(route('partnership.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('company_name', 'body'),
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="제휴문의" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Partnership</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">제휴문의</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-toss-grey600">
                        보험 상담, 고객 혜택, 포인트몰, 마케팅 제휴 제안을 남겨주시면 담당자가 확인 후 연락드립니다.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                <aside className="rounded-lg border border-toss-grey200 bg-white p-6 shadow-sm">
                    <span className="grid size-11 place-items-center rounded-full bg-toss-blue/10 text-toss-blue">
                        <Handshake className="size-5" />
                    </span>
                    <h2 className="mt-5 text-xl font-bold text-toss-grey900">제휴 검토 안내</h2>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-toss-grey600">
                        <p>접수된 제휴문의는 관리자 문의함의 `제휴 문의` 말머리로 등록됩니다.</p>
                        <p>회사 소개, 제안 목적, 예상 운영 방식, 연락 가능한 시간대를 함께 적어주시면 더 빠르게 검토할 수 있습니다.</p>
                    </div>
                </aside>

                <form onSubmit={submit} className="rounded-lg border border-toss-grey200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-toss-grey900">제휴문의 작성</h2>
                    <p className="mt-1 text-sm text-toss-grey500">필수 정보를 입력해 주세요.</p>

                    {flash?.success && (
                        <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>
                    )}

                    <div className="mt-6 grid gap-4">
                        <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                            회사명
                            <input value={form.data.company_name} onChange={(event) => form.setData('company_name', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            {form.errors.company_name && <span className="text-xs text-red-600">{form.errors.company_name}</span>}
                        </label>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                                담당자명
                                <input value={form.data.applicant_name} onChange={(event) => form.setData('applicant_name', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                                {form.errors.applicant_name && <span className="text-xs text-red-600">{form.errors.applicant_name}</span>}
                            </label>
                            <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                                연락처
                                <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                                {form.errors.phone && <span className="text-xs text-red-600">{form.errors.phone}</span>}
                            </label>
                        </div>
                        <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                            이메일
                            <input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            {form.errors.email && <span className="text-xs text-red-600">{form.errors.email}</span>}
                        </label>
                        <label className="grid gap-1 text-sm font-semibold text-toss-grey700">
                            제휴 내용
                            <textarea rows="8" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} className="rounded-md border-toss-grey200 text-sm focus:border-toss-blue focus:ring-toss-blue" />
                            {form.errors.body && <span className="text-xs text-red-600">{form.errors.body}</span>}
                        </label>
                    </div>

                    <button type="submit" disabled={form.processing} className="mt-6 w-full rounded-md bg-toss-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">
                        제휴문의 접수
                    </button>
                </form>
            </section>
        </PublicLayout>
    );
}
