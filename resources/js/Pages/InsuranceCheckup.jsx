import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowUp, CheckCircle2, Headphones, X } from 'lucide-react';
import { useState } from 'react';

import ConsultationConsentPanel, { ConsultationConsentPolicyView } from '@/Components/ConsultationConsentPanel';
import Modal from '@/Components/Modal';
import PublicLayout from '@/Layouts/PublicLayout';
import checkupDetailImage from '../../images/insurance-checkup/01.jpg';

function formatPhone(value) {
    const digits = value.replace(/\D/g, '').replace(/^010/, '').slice(0, 8);
    const middle = digits.slice(0, 4);
    const last = digits.slice(4, 8);

    if (!middle) return '010-';
    if (!last) return `010-${middle}`;
    return `010-${middle}-${last}`;
}

function FieldError({ message }) {
    return message ? <p className="mt-2 text-xs font-semibold text-red-600">{message}</p> : null;
}

export default function InsuranceCheckup({ auth }) {
    const { flash } = usePage().props;
    const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
    const [activeConsentPolicy, setActiveConsentPolicy] = useState(null);
    const form = useForm({
        type: 'checkup',
        source: 'main',
        applicant_name: '',
        phone: '010-',
        birth_date: '',
        current_monthly_premium: '',
        preferred_contact_time: '',
        interested_product: '보험점검',
        memo: '',
        privacy_agreement: false,
        third_party_agreement: false,
    });

    const openConsultModal = () => setIsConsultModalOpen(true);

    const closeConsultModal = () => {
        setIsConsultModalOpen(false);
        setActiveConsentPolicy(null);
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        form.post(route('consultations.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset(
                    'applicant_name',
                    'phone',
                    'birth_date',
                    'current_monthly_premium',
                    'preferred_contact_time',
                    'memo',
                    'privacy_agreement',
                    'third_party_agreement',
                );
                form.setData('phone', '010-');
                form.setData('interested_product', '보험점검');
                closeConsultModal();
            },
        });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="보험점검" />

            {flash?.success && (
                <div className="mx-auto mt-6 max-w-5xl px-5 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
                        {flash.success}
                    </div>
                </div>
            )}

            <section className="mx-auto max-w-5xl px-0 py-8 pb-28 sm:px-6 md:pb-8 lg:px-8">
                <div className="overflow-hidden bg-white">
                    <div className="relative">
                        <img
                            src={checkupDetailImage}
                            alt="보험점검 상세 안내"
                            className="block h-auto w-full"
                            loading="eager"
                        />
                        <button
                            type="button"
                            onClick={openConsultModal}
                            className="absolute inset-x-[17%] bottom-[1.25%] h-[4.3%] rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f47b20]/60"
                            aria-label="보험점검 상담신청"
                        >
                            <span className="sr-only">상담신청</span>
                        </button>
                    </div>
                </div>
            </section>

            <div className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex">
                <button
                    type="button"
                    onClick={openConsultModal}
                    className="group flex size-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff9f43] to-[#f47b20] text-white transition hover:-translate-y-0.5"
                    aria-label="보험점검 상담신청"
                >
                    <Headphones className="size-6" strokeWidth={2.2} />
                    <span className="mt-1 text-xs font-black">보험점검</span>
                </button>
                <button
                    type="button"
                    onClick={scrollToTop}
                    className="grid size-16 place-items-center rounded-2xl border border-toss-grey200 bg-white text-[#12284a] transition hover:-translate-y-0.5 hover:border-[#12284a]"
                    aria-label="페이지 상단으로 이동"
                >
                    <ArrowUp className="size-6" strokeWidth={2.4} />
                </button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/40 bg-white/88 px-4 py-3 backdrop-blur md:hidden">
                <button
                    type="button"
                    onClick={openConsultModal}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f47b20] to-[#ff9f43] text-base font-black text-white"
                >
                    <Headphones className="size-5" strokeWidth={2.2} />
                    보험점검 상담신청
                </button>
            </div>

            <Modal show={isConsultModalOpen} maxWidth="lg" onClose={closeConsultModal}>
                <div className="min-h-[720px] p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-5">
                        <div>
                            <p className="text-sm font-black text-[#f47b20]">보험점검 접수</p>
                            <h2 className="mt-2 text-2xl font-black text-toss-grey900">무료 보장 점검 신청</h2>
                            <p className="mt-2 text-sm font-semibold leading-6 text-toss-grey500">
                                현재 보험료와 궁금한 점을 남겨주시면 전문 설계사가 확인 후 안내드립니다.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeConsultModal}
                            className="grid size-10 shrink-0 place-items-center rounded-full bg-toss-grey100 text-toss-grey600 transition hover:bg-toss-grey200"
                            aria-label="닫기"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {activeConsentPolicy ? (
                        <div className="mt-7 h-[580px]">
                            <ConsultationConsentPolicyView
                                policyKey={activeConsentPolicy}
                                accent="#f47b20"
                                bodyClassName="max-h-[440px]"
                                onBack={() => setActiveConsentPolicy(null)}
                                onAgree={() => {
                                    form.setData(
                                        activeConsentPolicy === 'privacy' ? 'privacy_agreement' : 'third_party_agreement',
                                        true,
                                    );
                                    setActiveConsentPolicy(null);
                                }}
                            />
                        </div>
                    ) : (
                        <form onSubmit={submit}>
                            <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                    이름
                                    <input
                                        type="text"
                                        value={form.data.applicant_name}
                                        onChange={(event) => form.setData('applicant_name', event.target.value)}
                                        className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        placeholder="이름을 입력해주세요"
                                    />
                                    <FieldError message={form.errors.applicant_name} />
                                </label>

                                <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                    연락처
                                    <input
                                        type="tel"
                                        value={form.data.phone}
                                        inputMode="numeric"
                                        onChange={(event) => form.setData('phone', formatPhone(event.target.value))}
                                        onFocus={() => {
                                            if (!form.data.phone.startsWith('010-')) {
                                                form.setData('phone', '010-');
                                            }
                                        }}
                                        className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        placeholder="010-0000-0000"
                                    />
                                    <FieldError message={form.errors.phone} />
                                </label>

                                <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                    생년월일
                                    <input
                                        type="date"
                                        value={form.data.birth_date}
                                        onChange={(event) => form.setData('birth_date', event.target.value)}
                                        className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                    />
                                    <FieldError message={form.errors.birth_date} />
                                </label>

                                <label className="grid gap-1 text-sm font-bold text-toss-grey700">
                                    현재 월 보험료
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.current_monthly_premium}
                                        onChange={(event) => form.setData('current_monthly_premium', event.target.value)}
                                        className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        placeholder="예: 120000"
                                    />
                                    <FieldError message={form.errors.current_monthly_premium} />
                                </label>

                                <label className="grid gap-1 text-sm font-bold text-toss-grey700 sm:col-span-2">
                                    희망 연락 시간
                                    <input
                                        type="text"
                                        value={form.data.preferred_contact_time}
                                        onChange={(event) => form.setData('preferred_contact_time', event.target.value)}
                                        className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        placeholder="예: 평일 오후 2시 이후"
                                    />
                                    <FieldError message={form.errors.preferred_contact_time} />
                                </label>

                                <label className="grid gap-1 text-sm font-bold text-toss-grey700 sm:col-span-2">
                                    상담 메모
                                    <textarea
                                        rows="3"
                                        value={form.data.memo}
                                        onChange={(event) => form.setData('memo', event.target.value)}
                                        className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        placeholder="현재 가입한 보험이나 궁금한 점을 적어주세요."
                                    />
                                    <FieldError message={form.errors.memo} />
                                </label>

                                <div className="sm:col-span-2">
                                    <ConsultationConsentPanel
                                        onViewPolicy={setActiveConsentPolicy}
                                        checkboxClassName="mt-1 rounded border-toss-grey300 text-[#f47b20] focus:ring-[#f47b20]"
                                        agreements={[
                                            {
                                                field: 'privacy_agreement',
                                                policyKey: 'privacy',
                                                label: '개인정보 수집 및 이용에 동의합니다.',
                                                checked: form.data.privacy_agreement,
                                                onChange: (checked) => form.setData('privacy_agreement', checked),
                                                error: form.errors.privacy_agreement,
                                            },
                                            {
                                                field: 'third_party_agreement',
                                                policyKey: 'thirdParty',
                                                label: '상담 배정을 위한 제3자 정보제공에 동의합니다.',
                                                checked: form.data.third_party_agreement,
                                                onChange: (checked) => form.setData('third_party_agreement', checked),
                                                error: form.errors.third_party_agreement,
                                            },
                                        ]}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#12284a] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0b1a33] disabled:opacity-60"
                            >
                                {form.processing ? '접수 중' : '보험점검 접수하기'}
                                <CheckCircle2 className="size-4" strokeWidth={2.2} />
                            </button>
                        </form>
                    )}
                </div>
            </Modal>
        </PublicLayout>
    );
}
