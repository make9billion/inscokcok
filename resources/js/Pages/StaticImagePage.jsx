import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowUp,
    Baby,
    CheckCircle2,
    Headphones,
    HeartPulse,
    PawPrint,
    ShieldCheck,
    Smile,
    Stethoscope,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import ConsultationConsentPanel, { ConsultationConsentPolicyView } from '@/Components/ConsultationConsentPanel';
import Modal from '@/Components/Modal';
import PublicLayout from '@/Layouts/PublicLayout';

const imageModules = import.meta.glob('../../images/**/*.{png,jpg,jpeg,webp,svg}', {
    eager: true,
    query: '?url',
    import: 'default',
});

function resolveImage(path) {
    return imageModules[`../../images/${path}`];
}

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

const insuranceTabs = [
    { label: '암보험', href: '/insurance/cancer', icon: ShieldCheck },
    { label: '치매/간병보험', href: '/insurance/dementia-care', icon: HeartPulse },
    { label: '질병/상해보험', href: '/insurance/disease-accident', icon: Stethoscope },
    { label: '치아보험', href: '/insurance/dental', icon: Smile },
    { label: '펫보험', href: '/insurance/pet', icon: PawPrint },
    { label: '어린이보험', href: '/insurance/child', icon: Baby },
];

const consultationClickAreas = {
    '/insurance/dementia-care': 'absolute inset-x-[10%] bottom-[0.7%] h-[2.3%] rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f47b20]/60',
    '/insurance/child': 'absolute inset-x-[9%] bottom-[0.35%] h-[1.7%] rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f47b20]/60',
    default: 'absolute inset-x-[7%] bottom-[4%] h-[24%] rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f47b20]/60',
};

export default function StaticImagePage({ auth, title, description, images }) {
    const page = usePage();
    const { flash } = page.props;
    const currentUrl = page.url ?? '';
    const isInsurancePage = currentUrl.startsWith('/insurance/');
    const isServicePage = currentUrl.startsWith('/services');
    const currentTab = insuranceTabs.find((tab) => currentUrl.startsWith(tab.href));
    const displayTitle = currentTab?.label ?? title;
    const consultationClickArea =
        consultationClickAreas[currentTab?.href] ?? consultationClickAreas.default;
    const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
    const [activeConsentPolicy, setActiveConsentPolicy] = useState(null);
    const form = useForm({
        type: 'product',
        source: 'product',
        applicant_name: '',
        phone: '010-',
        interested_product: displayTitle,
        memo: '',
        privacy_agreement: false,
        third_party_agreement: false,
    });
    const resolvedImages = images
        .map((image) => ({
            key: image,
            src: resolveImage(image),
        }))
        .filter((image) => image.src);

    useEffect(() => {
        form.setData('interested_product', displayTitle);
    }, [displayTitle]);

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
                    'memo',
                    'privacy_agreement',
                    'third_party_agreement',
                );
                form.setData('phone', '010-');
                form.setData('interested_product', displayTitle);
                closeConsultModal();
            },
        });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <PublicLayout auth={auth} insuranceHeader={isInsurancePage}>
            <Head title={displayTitle} />

            {isInsurancePage ? (
                <section className="insurance-hero-gradient overflow-hidden">
                    <div className="mx-auto max-w-6xl px-5 py-8 text-white sm:px-6 sm:py-12 lg:px-8">
                        <h1 className="text-center text-2xl font-black tracking-normal sm:text-3xl lg:text-4xl">{displayTitle}</h1>

                        <nav className="mt-6 grid grid-cols-3 gap-2 sm:mt-9 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6" aria-label="보험상품 이동">
                            {insuranceTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = currentUrl.startsWith(tab.href);

                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={
                                            isActive
                                                ? 'group flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-2 text-center text-[#12284a] shadow-[0_16px_34px_rgba(0,0,0,0.16)] transition sm:min-h-24 sm:gap-2 sm:rounded-2xl sm:px-3'
                                                : 'group flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2 text-center text-white/82 backdrop-blur transition hover:border-white/40 hover:bg-white/18 hover:text-white sm:min-h-24 sm:gap-2 sm:rounded-2xl sm:px-3'
                                        }
                                    >
                                        <span
                                            className={
                                                isActive
                                                    ? 'grid size-8 place-items-center rounded-full bg-[#f47b20] text-white sm:size-10'
                                                    : 'grid size-8 place-items-center rounded-full bg-white/12 text-white transition group-hover:bg-white/18 sm:size-10'
                                            }
                                        >
                                            <Icon className="size-4 sm:size-5" strokeWidth={2.1} />
                                        </span>
                                        <span className="text-xs font-black leading-tight sm:text-sm">{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </section>
            ) : !isServicePage ? (
                <section className="border-b border-toss-grey200 bg-toss-grey50">
                    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                        <p className="text-sm font-semibold text-toss-blue">Guide</p>
                        <h1 className="mt-3 text-3xl font-bold tracking-normal text-toss-grey900">{title}</h1>
                        {description && (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-toss-grey600">{description}</p>
                        )}
                    </div>
                </section>
            ) : null}

            {isInsurancePage && flash?.success && (
                <div className="mx-auto mt-6 max-w-5xl px-5 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
                        {flash.success}
                    </div>
                </div>
            )}

            <section className={`mx-auto max-w-5xl px-0 py-8 sm:px-6 lg:px-8 ${isInsurancePage ? 'pb-28 md:pb-8' : ''}`}>
                <div className="overflow-hidden bg-white">
                    {resolvedImages.map((image, index) => {
                        const isLastImage = index === resolvedImages.length - 1;

                        return (
                            <div key={image.key} className="relative">
                                <img
                                    src={image.src}
                                    alt={`${displayTitle} 안내 이미지 ${index + 1}`}
                                    className="block h-auto w-full"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />
                                {isInsurancePage && isLastImage && (
                                    <button
                                        type="button"
                                        onClick={openConsultModal}
                                        className={consultationClickArea}
                                        aria-label={`${displayTitle} 상담신청`}
                                    >
                                        <span className="sr-only">상담신청</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {isInsurancePage && (
                <>
                    <div className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex">
                        <button
                            type="button"
                            onClick={openConsultModal}
                            className="group flex size-16 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff9f43] to-[#f47b20] text-white transition hover:-translate-y-0.5"
                            aria-label={`${displayTitle} 상담 신청`}
                        >
                            <Headphones className="size-6" strokeWidth={2.2} />
                            <span className="mt-1 text-xs font-black">문의</span>
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
                            {displayTitle} 상담신청
                        </button>
                    </div>

                    <Modal show={isConsultModalOpen} maxWidth="lg" onClose={closeConsultModal}>
                        <div className="min-h-[610px] p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-5">
                                <div>
                                    <p className="text-sm font-black text-[#f47b20]">빠른 상담신청</p>
                                    <h2 className="mt-2 text-2xl font-black text-toss-grey900">{displayTitle}</h2>
                                    <p className="mt-2 text-sm font-semibold leading-6 text-toss-grey500">
                                        연락처를 남겨주시면 담당자가 확인 후 안내드립니다.
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
                                <div className="mt-7 h-[470px]">
                                    <ConsultationConsentPolicyView
                                        policyKey={activeConsentPolicy}
                                        accent="#f47b20"
                                        bodyClassName="max-h-[330px]"
                                        onBack={() => setActiveConsentPolicy(null)}
                                        onAgree={() => {
                                            form.setData(activeConsentPolicy === 'privacy' ? 'privacy_agreement' : 'third_party_agreement', true);
                                            setActiveConsentPolicy(null);
                                        }}
                                    />
                                </div>
                            ) : (
                                <form onSubmit={submit}>
                            <div className="mt-7 grid gap-4">
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
                                    상담 메모
                                    <textarea
                                        rows="3"
                                        value={form.data.memo}
                                        onChange={(event) => form.setData('memo', event.target.value)}
                                        className="rounded-xl border-toss-grey200 bg-toss-grey50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        placeholder="궁금한 내용을 간단히 적어주세요"
                                    />
                                    <FieldError message={form.errors.memo} />
                                </label>

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

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#12284a] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0b1a33] disabled:opacity-60"
                            >
                                {form.processing ? '접수 중' : '상담신청 완료하기'}
                                <CheckCircle2 className="size-4" strokeWidth={2.2} />
                            </button>
                                </form>
                            )}
                        </div>
                    </Modal>
                </>
            )}
        </PublicLayout>
    );
}
