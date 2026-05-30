import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, PhoneCall, ShieldCheck } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

function FieldError({ message }) {
    return message ? <p className="mt-2 text-xs font-medium text-red-600">{message}</p> : null;
}

export default function InsuranceCheckup({ auth }) {
    const { flash } = usePage().props;
    const form = useForm({
        type: 'checkup',
        applicant_name: '',
        phone: '',
        birth_date: '',
        current_monthly_premium: '',
        preferred_contact_time: '',
        memo: '',
        privacy_agreement: false,
        third_party_agreement: false,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('consultations.store'), {
            preserveScroll: true,
            onSuccess: () =>
                form.reset(
                    'applicant_name',
                    'phone',
                    'birth_date',
                    'current_monthly_premium',
                    'preferred_contact_time',
                    'memo',
                    'privacy_agreement',
                    'third_party_agreement',
                ),
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="보험점검" />

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-toss-grey600 transition hover:text-toss-grey900"
                    >
                        <ArrowLeft className="size-4" strokeWidth={1.8} />
                        홈으로
                    </Link>

                    <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-toss-blue">
                                <ShieldCheck className="size-4" strokeWidth={1.8} />
                                보험점검
                            </p>
                            <h1 className="mt-4 text-3xl font-bold leading-tight text-toss-grey900 sm:text-4xl">
                                지금 내 보험이 충분한지 필요한 항목만 먼저 확인합니다
                            </h1>
                            <p className="mt-5 text-base leading-7 text-toss-grey600">
                                현재 보험료, 가입 목적, 궁금한 점을 남기면 상담사가 중복 보장과 부족한 보장을 기준으로
                                점검 상담을 준비합니다.
                            </p>

                            <div className="mt-8 grid gap-3">
                                {[
                                    '현재 보험료 수준과 보장 구성 확인',
                                    '갱신형, 비갱신형, 진단비 중심 비교',
                                    '상담 완료 후 포인트 적립 단계로 연결',
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 rounded-lg border border-toss-grey200 bg-toss-grey50 px-4 py-3 text-sm font-semibold text-toss-grey800"
                                    >
                                        <ClipboardCheck className="size-4 shrink-0 text-toss-blue" strokeWidth={1.8} />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            className="rounded-lg border border-toss-grey200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-6"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-toss-blue">점검 신청</p>
                                    <h2 className="mt-1 text-xl font-bold text-toss-grey900">보험점검 접수</h2>
                                </div>
                                <PhoneCall className="size-6 text-toss-grey700" strokeWidth={1.8} />
                            </div>

                            {flash?.success && (
                                <div className="mt-5 rounded-lg border border-toss-blue/20 bg-toss-blueLight px-4 py-3 text-sm font-semibold text-toss-blue">
                                    {flash.success}
                                </div>
                            )}

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-semibold text-toss-grey800">이름</span>
                                    <input
                                        type="text"
                                        value={form.data.applicant_name}
                                        onChange={(event) => form.setData('applicant_name', event.target.value)}
                                        placeholder="홍길동"
                                        className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 placeholder:text-toss-grey500 focus:border-toss-blue focus:ring-toss-blue"
                                    />
                                    <FieldError message={form.errors.applicant_name} />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-semibold text-toss-grey800">연락처</span>
                                    <input
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(event) => form.setData('phone', event.target.value)}
                                        placeholder="010-0000-0000"
                                        className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 placeholder:text-toss-grey500 focus:border-toss-blue focus:ring-toss-blue"
                                    />
                                    <FieldError message={form.errors.phone} />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-semibold text-toss-grey800">생년월일</span>
                                    <input
                                        type="date"
                                        value={form.data.birth_date}
                                        onChange={(event) => form.setData('birth_date', event.target.value)}
                                        className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 focus:border-toss-blue focus:ring-toss-blue"
                                    />
                                    <FieldError message={form.errors.birth_date} />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-semibold text-toss-grey800">현재 월 보험료</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.current_monthly_premium}
                                        onChange={(event) =>
                                            form.setData('current_monthly_premium', event.target.value)
                                        }
                                        placeholder="예: 120000"
                                        className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 placeholder:text-toss-grey500 focus:border-toss-blue focus:ring-toss-blue"
                                    />
                                    <FieldError message={form.errors.current_monthly_premium} />
                                </label>
                            </div>

                            <label className="mt-4 block">
                                <span className="text-sm font-semibold text-toss-grey800">희망 연락 시간</span>
                                <input
                                    type="text"
                                    value={form.data.preferred_contact_time}
                                    onChange={(event) => form.setData('preferred_contact_time', event.target.value)}
                                    placeholder="예: 평일 오후 2시 이후"
                                    className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 placeholder:text-toss-grey500 focus:border-toss-blue focus:ring-toss-blue"
                                />
                            </label>

                            <label className="mt-4 block">
                                <span className="text-sm font-semibold text-toss-grey800">상담 메모</span>
                                <textarea
                                    value={form.data.memo}
                                    onChange={(event) => form.setData('memo', event.target.value)}
                                    rows="4"
                                    placeholder="현재 가입한 보험이나 궁금한 점을 적어주세요."
                                    className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 placeholder:text-toss-grey500 focus:border-toss-blue focus:ring-toss-blue"
                                />
                                <FieldError message={form.errors.memo} />
                            </label>

                            <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-toss-grey700">
                                <input
                                    type="checkbox"
                                    checked={form.data.privacy_agreement}
                                    onChange={(event) => form.setData('privacy_agreement', event.target.checked)}
                                    className="mt-1 rounded border-toss-grey300 text-toss-blue focus:ring-toss-blue"
                                />
                                개인정보 수집 및 이용에 동의합니다.
                            </label>
                            <FieldError message={form.errors.privacy_agreement} />

                            <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-toss-grey700">
                                <input
                                    type="checkbox"
                                    checked={form.data.third_party_agreement}
                                    onChange={(event) => form.setData('third_party_agreement', event.target.checked)}
                                    className="mt-1 rounded border-toss-grey300 text-toss-blue focus:ring-toss-blue"
                                />
                                상담 배정을 위한 제3자 제공에 동의합니다.
                            </label>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-toss-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-toss-blueHover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {form.processing ? '접수 중' : '보험점검 접수하기'}
                                <CheckCircle2 className="size-4" strokeWidth={1.8} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
