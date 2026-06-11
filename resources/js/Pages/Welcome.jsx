import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    ChevronDown,
    ChevronRight,
    Gift,
    MessageSquareText,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import ConsultationConsentPanel, { ConsultationConsentPolicyView } from '@/Components/ConsultationConsentPanel';
import PublicLayout from '@/Layouts/PublicLayout';
import eventBannerOne from '../../images/events/event-banner-1.jpg';
import eventBannerTwo from '../../images/events/event-banner-2.jpg';
import cancerHeroImage from '../../images/hero/bohum-cancer.png';
import cancerCardImage from '../../images/hero/backup-banner-card-20260607/bohum-cancer.png';
import careHeroImage from '../../images/hero/bohum-care.png';
import careCardImage from '../../images/hero/backup-banner-card-20260607/bohum-care.png';
import childHeroImage from '../../images/hero/bohum-child.png';
import childCardImage from '../../images/hero/backup-banner-card-20260607/bohum-child.png';
import dentalHeroImage from '../../images/hero/bohum-dental.png';
import dentalCardImage from '../../images/hero/backup-banner-card-20260607/bohum-dental.png';
import diseaseAccidentHeroImage from '../../images/hero/bohum-disease-accident.png';
import diseaseAccidentCardImage from '../../images/hero/backup-banner-card-20260607/bohum-disease-accident.png';
import liveConsultingImage from '../../images/hero/bohum-live-consulting.png';
import petHeroImage from '../../images/hero/bohum-pet.png';
import petCardImage from '../../images/hero/backup-banner-card-20260607/bohum-pet.png';

const insuranceLogoModules = import.meta.glob('../../images/ins-com-logo/*.png', {
    eager: true,
    import: 'default',
    query: '?url',
});

const insuranceCompanyLogos = Object.entries(insuranceLogoModules)
    .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath, 'ko-KR', { numeric: true }))
    .map(([path, src]) => {
        const fileName = path.split('/').pop() ?? '';

        return {
            name: fileName.replace(/^\d+\s?/, '').replace(/\.png$/i, ''),
            src,
        };
    });

const heroSlides = [
    {
        label: '암보험',
        product: '암보험',
        kicker: '암 보장 한 번에 확인',
        title: '암보험, 내 보장 충분할까요?',
        description: '진단비와 치료비 보장을 현재 상황에 맞춰 점검해드립니다.',
        tags: ['암 진단비', '중복보장 체크', '보장분석'],
        tone: 'bg-[#f7f7f7]',
        accent: 'text-[#6676b8]',
        image: cancerHeroImage,
    },
    {
        label: '치매/간병보험',
        product: '치매/간병보험',
        kicker: '긴 노후를 위한 준비',
        title: '치매/간병보험, 가족 부담까지 생각합니다.',
        description: '간병비, 요양, 치매 관련 보장을 가족 상황에 맞춰 정리합니다.',
        tags: ['간병비', '치매보장', '부모님 상담'],
        tone: 'bg-[#faf5fb]',
        accent: 'text-[#39806c]',
        image: careHeroImage,
    },
    {
        label: '질병/상해보험',
        product: '질병/상해보험',
        kicker: '입원과 수술 보장 점검',
        title: '질병과 상해, 빈틈없이 준비하세요.',
        description: '입원비, 수술비, 후유장해 보장을 생활 패턴과 예산에 맞춰 비교합니다.',
        tags: ['입원비', '수술비', '후유장해'],
        tone: 'bg-[#f3f7fc]',
        accent: 'text-[#51657e]',
        image: diseaseAccidentHeroImage,
    },
    {
        label: '치아보험',
        product: '치아보험',
        kicker: '치료비 부담을 가볍게',
        title: '치아보험, 필요한 치료 중심으로.',
        description: '보존치료, 보철치료, 임플란트 보장을 나이와 치료 계획에 맞춰 확인합니다.',
        tags: ['보존치료', '보철치료', '임플란트'],
        tone: 'bg-[#fdf6ea]',
        accent: 'text-[#c06d2b]',
        image: dentalHeroImage,
    },
    {
        label: '펫보험',
        product: '펫보험',
        kicker: '반려생활 병원비 준비',
        title: '펫보험, 병원비 걱정을 가볍게.',
        description: '통원, 입원, 수술비 보장을 반려동물의 나이와 생활 패턴에 맞춰 비교합니다.',
        tags: ['통원치료', '수술비', '반려생활'],
        tone: 'bg-[#f7f8f1]',
        accent: 'text-[#6b5bb8]',
        image: petHeroImage,
    },
    {
        label: '어린이보험',
        product: '어린이보험',
        kicker: '성장 단계별 보장',
        title: '어린이보험, 필요한 때를 놓치지 않게.',
        description: '영유아부터 청소년기까지 치료비, 진단비, 생활 보장을 비교합니다.',
        tags: ['영유아 상담', '성장기 보장', '부모 부담 절감'],
        tone: 'bg-[#f2f7fd]',
        accent: 'text-[#2f76a8]',
        image: childHeroImage,
    },
];

const productCardStyles = [
    {
        description: '진단비와 치료비 보장을 한 번에 확인',
        image: cancerCardImage,
        routeName: 'insurance.cancer',
        tone: 'bg-[#fff7ef]',
    },
    {
        description: '간병비와 치매 보장을 가족 상황에 맞게',
        image: careCardImage,
        routeName: 'insurance.dementia-care',
        tone: 'bg-[#fbf4fc]',
    },
    {
        description: '입원, 수술, 상해 보장을 빈틈없이 점검',
        image: diseaseAccidentCardImage,
        routeName: 'insurance.disease-accident',
        tone: 'bg-[#f1f7ff]',
    },
    {
        description: '치료 계획에 맞춘 치아 보장 확인',
        image: dentalCardImage,
        routeName: 'insurance.dental',
        tone: 'bg-[#fff8ec]',
    },
    {
        description: '반려동물 병원비 부담을 가볍게',
        image: petCardImage,
        routeName: 'insurance.pet',
        tone: 'bg-[#f6f8ef]',
    },
    {
        description: '성장 단계별 필요한 보장을 비교',
        image: childCardImage,
        routeName: 'insurance.child',
        tone: 'bg-[#f1f7ff]',
    },
];

const rollingReceiptRows = [
    { name: '김*아', product: '암보험', status: '상담사 배정 완료', tone: 'bg-[#ffd1ad] text-[#8a3500]' },
    { name: '박*준', product: '질병/상해보험', status: '보장 분석 중', tone: 'bg-[#c5ddff] text-[#0f3970]' },
    { name: '이*지', product: '치매/간병보험', status: '전화 상담 예약', tone: 'bg-[#dcc5f4] text-[#4e2175]' },
    { name: '최*미', product: '펫보험', status: '접수 확인', tone: 'bg-[#c8eeb4] text-[#295517]' },
    { name: '정*호', product: '치아보험', status: '상담 접수 완료', tone: 'bg-[#ffe59b] text-[#745000]' },
    { name: '윤*서', product: '어린이보험', status: '담당자 확인 중', tone: 'bg-[#bfe8ff] text-[#064c70]' },
    { name: '한*민', product: '암보험', status: '보험료 비교 중', tone: 'bg-[#ffc1cf] text-[#7e1b36]' },
    { name: '오*린', product: '질병/상해보험', status: '맞춤 상담 대기', tone: 'bg-[#ccd6ff] text-[#203580]' },
];

const fallbackFaqs = [
    {
        question: '보험점검은 어떤 내용을 확인하나요?',
        answer: '가입 중인 보장의 중복, 부족한 진단비, 갱신 시점과 보험료 변화를 함께 확인합니다.',
    },
    {
        question: '상담 신청 후 바로 연락이 오나요?',
        answer: '운영 시간에는 접수 순서대로 배정되며, 원하는 시간을 남기면 일정에 맞춰 안내합니다.',
    },
    {
        question: '포인트는 어디에 사용할 수 있나요?',
        answer: '상담 참여와 이벤트로 적립된 포인트는 포인트몰 상품 교환에 사용할 수 있습니다.',
    },
];

const events = [
    { title: '보험점검 참여 이벤트', period: '2026.06.01 - 2026.06.30', reward: '최대 20,000P' },
    { title: '펫보험 상담 후기 적립', period: '2026.06.01 - 2026.06.30', reward: '후기 작성 시 5,000P' },
];

const qnaPreviews = [
    {
        category: '암보험',
        title: '비갱신형 진단비를 줄이면 보험료 차이가 큰가요?',
        answer: '연령과 가입 기간에 따라 차이가 큽니다. 기존 보장과 새 설계를 함께 비교해야 합니다.',
    },
    {
        category: '간병',
        title: '부모님 간병보험은 몇 살까지 준비할 수 있나요?',
        answer: '상품별 가입 가능 나이와 고지 항목이 달라 사전 확인이 필요합니다.',
    },
    {
        category: '펫보험',
        title: '강아지와 고양이 보장을 선택할 수 있나요?',
        answer: '반려동물 나이와 병력에 따라 특약 선택 가능 여부가 달라집니다.',
    },
];

const fallbackNotices = [
    { title: '개인정보 처리방침 개정 안내', date: '2026.06.01', href: '/customer/notices' },
    { title: '상담 운영 시간 변경 안내', date: '2026.05.28', href: '/customer/notices' },
    { title: '포인트몰 일부 상품 교환 지연 안내', date: '2026.05.20', href: '/customer/notices' },
];

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').replace(/^010/, '').slice(0, 8);
    const middle = digits.slice(0, 4);
    const last = digits.slice(4, 8);

    if (!middle) return '010-';
    if (!last) return `010-${middle}`;
    return `010-${middle}-${last}`;
};

const renderHeroTitle = (title) => {
    const commaIndex = title.indexOf(',');

    if (commaIndex === -1) {
        return title;
    }

    return (
        <>
            {title.slice(0, commaIndex + 1)}
            <br />
            {title.slice(commaIndex + 1).trim()}
        </>
    );
};

function SectionHeader({ eyebrow, title, description, href }) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-sm font-semibold text-toss-blue">{eyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold leading-8 text-toss-grey900">{title}</h2>
                {description && <p className="mt-2 text-sm leading-6 text-toss-grey600">{description}</p>}
            </div>
            {href && (
                <Link
                    href={href}
                    aria-label={`${title} 더보기`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-toss-grey700 transition hover:text-toss-grey900"
                >
                    더보기
                    <ChevronRight className="size-4" strokeWidth={1.8} />
                </Link>
            )}
        </div>
    );
}

function FieldError({ message }) {
    return message ? <p className="mt-2 text-xs font-medium text-red-600">{message}</p> : null;
}

function BannerStrip({ icon: Icon, title, description, href }) {
    return (
        <Link
            href={href}
            className="flex flex-col gap-4 rounded-lg border border-toss-grey200 bg-toss-grey50 px-5 py-5 transition hover:border-toss-grey500 sm:flex-row sm:items-center sm:justify-between"
        >
            <span className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-toss-grey800">
                    <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <span>
                    <span className="block text-base font-semibold text-toss-grey900">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-toss-grey600">{description}</span>
                </span>
            </span>
            <ArrowRight className="size-5 text-toss-grey500" strokeWidth={1.8} />
        </Link>
    );
}

export default function Welcome({ auth, cms = {}, pointMallProducts: mainPointMallProducts = [], events: activeEvents = [] }) {
    const { flash } = usePage().props;
    const [activeSlide, setActiveSlide] = useState(0);
    const [isAutoPaused, setIsAutoPaused] = useState(false);
    const [openMainFaq, setOpenMainFaq] = useState(null);
    const [activeConsentPolicy, setActiveConsentPolicy] = useState(null);
    const activeProduct = heroSlides[activeSlide];
    const cmsNotices = cms.notices?.length
        ? cms.notices.map((notice) => ({
              title: notice.title,
              date: notice.publishedAt ?? '',
              href: notice.linkUrl ?? `/customer/notices/${notice.id}`,
          }))
        : fallbackNotices;
    const cmsFaqs = cms.faqs?.length
        ? cms.faqs.map((faq) => ({
              question: faq.title,
              answer: faq.body ?? '',
          }))
        : fallbackFaqs;
    const cmsMainBanner = cms.mainBanners?.[0] ?? null;
    const visiblePointMallProducts = mainPointMallProducts.slice(0, 4);
    const form = useForm({
        type: 'product',
        source: 'main',
        applicant_name: '',
        phone: '010-',
        interested_product: activeProduct.product,
        preferred_contact_time: '',
        privacy_agreement: false,
        third_party_agreement: false,
    });

    useEffect(() => {
        if (isAutoPaused) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setActiveSlide((current) => {
                const next = (current + 1) % heroSlides.length;
                form.setData('interested_product', heroSlides[next].product);
                return next;
            });
        }, 5200);

        return () => window.clearInterval(timer);
    }, [isAutoPaused]);

    useEffect(() => {
        const revealItems = Array.from(document.querySelectorAll('.scroll-reveal'));

        if (!('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('is-visible'));
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        entry.target.classList.remove('is-visible');
                    }
                });
            },
            { threshold: 0.2 },
        );

        revealItems.forEach((item) => observer.observe(item));

        return () => observer.disconnect();
    }, []);

    const selectSlide = (index) => {
        setIsAutoPaused(true);
        setActiveSlide(index);
        form.setData('interested_product', heroSlides[index].product);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('consultations.store'), {
            preserveScroll: true,
            onSuccess: () =>
                form.reset(
                    'applicant_name',
                    'preferred_contact_time',
                    'privacy_agreement',
                    'third_party_agreement',
                ),
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="보험콕콕" />

            <section
                className={`hero-stage relative overflow-hidden transition-colors duration-700 ease-out ${activeProduct.tone}`}
                aria-label="보험상품 상담 신청"
            >
                <div className="hero-viewport relative mx-auto min-h-[720px] max-w-[1320px] lg:h-[720px]">
                    <div className="relative min-h-[590px] lg:h-full">
                        {heroSlides.map((slide, index) => {
                            const isActive = activeSlide === index;

                            return (
                                <article
                                    key={slide.label}
                                    aria-hidden={!isActive}
                                    className={`absolute inset-0 px-5 py-14 transition-all duration-1000 ease-out sm:px-10 lg:px-[118px] lg:py-[86px] lg:pr-[500px] ${
                                        isActive
                                            ? 'z-10 translate-y-0 scale-100 opacity-100'
                                            : 'z-0 translate-y-4 scale-[0.985] opacity-0'
                                    }`}
                                >
                                    <div className="relative z-10 max-w-2xl">
                                        <span className="text-2xl font-black text-[#f47b20] lg:text-3xl">{slide.kicker}</span>
                                        <h1 className="mt-9 text-4xl font-black leading-tight text-[#111111] lg:text-6xl">
                                            {renderHeroTitle(slide.title)}
                                        </h1>
                                        <p className={`mt-5 max-w-2xl text-2xl font-black leading-snug lg:text-4xl ${slide.accent}`}>
                                            {slide.description}
                                        </p>
                                        <div className="mt-7 flex flex-wrap gap-2">
                                            {slide.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[#555d73]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="hero-image-motion pointer-events-none absolute bottom-0 right-[424px] hidden w-[468px] lg:block">
                                        <img
                                            src={slide.image}
                                            alt=""
                                            className="h-auto w-full object-contain"
                                        />
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <aside className="consult-panel relative z-20 mx-auto -mt-10 flex min-h-[520px] w-[min(100%-24px,430px)] flex-col rounded-[20px] bg-white/90 px-7 py-6 backdrop-blur lg:absolute lg:right-[18px] lg:top-[92px] lg:mt-0 lg:w-[414px]">
                        {activeConsentPolicy ? (
                            <ConsultationConsentPolicyView
                                policyKey={activeConsentPolicy}
                                accent="#f47b20"
                                bodyClassName="max-h-[390px]"
                                onBack={() => setActiveConsentPolicy(null)}
                                onAgree={() => {
                                    form.setData(activeConsentPolicy === 'privacy' ? 'privacy_agreement' : 'third_party_agreement', true);
                                    setActiveConsentPolicy(null);
                                }}
                            />
                        ) : (
                            <>
                        <div className="product-tabs grid grid-cols-3 gap-2" aria-label="보험상품 선택">
                            {heroSlides.map((slide, index) => (
                                <button
                                    key={slide.label}
                                    type="button"
                                    aria-pressed={form.data.interested_product === slide.product}
                                    onClick={() => selectSlide(index)}
                                    className={`min-h-10 rounded-full border-2 border-[#12284a] px-3 text-sm font-black transition ${
                                        form.data.interested_product === slide.product
                                            ? 'bg-[#f47b20] text-white border-[#f47b20]'
                                            : 'bg-white text-[#12284a] hover:border-[#f47b20] hover:bg-[#fff4eb] hover:text-[#d85f00]'
                                    }`}
                                >
                                    {slide.label}
                                </button>
                            ))}
                            <Link
                                href="/insurance-checkup"
                                className="col-span-3 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[#12284a] bg-[#f7fbff] px-4 text-base font-black text-[#12284a] transition hover:border-[#f47b20] hover:bg-[#fff4eb] hover:text-[#d85f00]"
                            >
                                보험점검
                            </Link>
                        </div>

                        <form onSubmit={submit} className="lead-form mt-5 grid gap-3">
                            <div className="text-center">
                                <strong className="inline-block border-b-[3px] border-[#f47b20] pb-1 text-xl font-black text-[#12284a]">
                                    간편상담 신청하기
                                </strong>
                            </div>

                            {flash?.success && (
                                <div className="rounded-lg border border-toss-blue/20 bg-toss-blueLight px-4 py-3 text-sm font-semibold text-toss-blue">
                                    {flash.success}
                                </div>
                            )}

                            <label className="grid gap-1 text-sm font-bold text-[#344056]">
                                이름
                                <input
                                    type="text"
                                    value={form.data.applicant_name}
                                    onChange={(event) => form.setData('applicant_name', event.target.value)}
                                    placeholder="이름"
                                    className="h-11 border-0 border-b border-[#cfd6df] bg-transparent px-1 text-base font-semibold text-[#12284a] placeholder:text-[#8a95a6] focus:border-[#f47b20] focus:ring-0"
                                />
                                <FieldError message={form.errors.applicant_name} />
                            </label>

                            <label className="grid gap-1 text-sm font-bold text-[#344056]">
                                휴대폰번호
                                <input
                                    type="tel"
                                    value={form.data.phone}
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    onChange={(event) => form.setData('phone', formatPhone(event.target.value))}
                                    onFocus={() => {
                                        if (!form.data.phone.startsWith('010-')) {
                                            form.setData('phone', '010-');
                                        }
                                    }}
                                    className="h-11 border-0 border-b border-[#cfd6df] bg-transparent px-1 text-base font-semibold text-[#12284a] placeholder:text-[#8a95a6] focus:border-[#f47b20] focus:ring-0"
                                />
                                <FieldError message={form.errors.phone} />
                            </label>

                            <ConsultationConsentPanel
                                onViewPolicy={setActiveConsentPolicy}
                                checkboxClassName="size-6 rounded border-[#cfd6df] text-[#f47b20] focus:ring-[#f47b20]"
                                agreements={[
                                    {
                                        field: 'privacy_agreement',
                                        policyKey: 'privacy',
                                        label: '개인정보 수집 및 이용동의',
                                        checked: form.data.privacy_agreement,
                                        onChange: (checked) => form.setData('privacy_agreement', checked),
                                        error: form.errors.privacy_agreement,
                                    },
                                    {
                                        field: 'third_party_agreement',
                                        policyKey: 'thirdParty',
                                        label: '제3자 정보제공 동의',
                                        checked: form.data.third_party_agreement,
                                        onChange: (checked) => form.setData('third_party_agreement', checked),
                                        error: form.errors.third_party_agreement,
                                    },
                                ]}
                            />

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="min-h-[52px] rounded-lg bg-[#f47b20] text-lg font-black text-white transition hover:bg-[#d85f00] disabled:opacity-60"
                            >
                                {form.processing ? '접수 중' : '빠른 상담신청'}
                            </button>
                            <p className="text-xs font-bold leading-5 text-[#4b4b4b]">
                                입력하신 정보는 상담 목적 외에 사용하지 않습니다.
                            </p>
                        </form>
                            </>
                        )}
                    </aside>
                </div>
            </section>

            <section className="overflow-hidden bg-white" aria-label="제휴 보험사 로고">
                <div className="insurance-logo-marquee flex py-5">
                    {[0, 1].map((group) => (
                        <div
                            key={group}
                            className="insurance-logo-track flex min-w-max shrink-0 items-center gap-12 px-6"
                            aria-hidden={group === 1}
                        >
                            {insuranceCompanyLogos.map((logo) => (
                                <div
                                    key={`${group}-${logo.name}`}
                                    className="flex h-12 min-w-[150px] items-center justify-center"
                                >
                                    <img
                                        src={logo.src}
                                        alt={group === 0 ? logo.name : ''}
                                        className="max-h-10 w-auto max-w-[150px] object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-gradient-to-br from-[#fff3e7] via-[#fff8f0] to-[#eaf6ff]">
                <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
                    <h2 className="text-center text-4xl font-black tracking-normal text-[#12284a] sm:text-5xl">EVENT</h2>
                    <div className="mt-10 grid justify-center gap-6 md:grid-cols-2">
                        {(activeEvents.length
                            ? activeEvents.map((event) => ({
                                  src: event.bannerImageUrl || (event.slug === 'signup_bonus' ? eventBannerOne : eventBannerTwo),
                                  alt: event.name,
                                  href: route('events.show', event.slug),
                              }))
                            : [
                                  { src: eventBannerOne, alt: '회원가입 포인트 적립 이벤트', href: '/events' },
                                  { src: eventBannerTwo, alt: '보험점검 완료 포인트 적립 이벤트', href: '/events' },
                              ]
                        ).map((banner) => (
                            <Link
                                key={banner.alt}
                                href={banner.href}
                                className="group mx-auto h-[200px] w-full max-w-[500px] overflow-hidden rounded-[24px] bg-white ring-1 ring-white/70 transition hover:-translate-y-1 hover:ring-[#f47b20]/40"
                            >
                                <img
                                    src={banner.src}
                                    alt={banner.alt}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-28">
                <div className="mx-auto max-w-6xl px-5 sm:px-6">
                <div className="scroll-reveal mb-9 max-w-3xl">
                    <p className="text-lg font-black text-[#f47b20]">보험상품 바로가기</p>
                    <h2 className="mt-3 text-4xl font-black leading-tight text-[#171827]">
                        비교해서 나에게 맞는 보험을 콕콕 알려드릴게요.
                    </h2>
                    <p className="mt-4 text-lg font-semibold leading-8 text-[#667085]">
                        필요한 보장은 채우고 불필요한 보험료는 줄일 수 있도록 상품별 핵심 보장을 쉽게 확인해보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                    {heroSlides.map((slide, index) => {
                        const card = productCardStyles[index];

                        return (
                            <Link
                                key={slide.label}
                                href={route(card.routeName)}
                                className="scroll-reveal group overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_50px_rgba(22,36,58,0.09)] transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(22,36,58,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f47b20]"
                                style={{ '--reveal-delay': `${index * 130}ms` }}
                            >
                                <span className={`block h-[330px] overflow-hidden ${card.tone}`}>
                                    <img
                                        src={card.image}
                                        alt=""
                                        className="h-full w-full object-cover object-[right_center] transition duration-500 group-hover:scale-105"
                                    />
                                </span>
                                <span className="flex min-h-[164px] items-center justify-between gap-6 bg-white px-8 py-8">
                                    <span className="min-w-0">
                                        <strong className="block text-3xl font-black leading-tight text-[#171827]">
                                            {slide.label}
                                        </strong>
                                        <span className="mt-5 block text-lg font-semibold leading-7 text-[#667085]">
                                            {card.description}
                                        </span>
                                    </span>
                                    <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#4a4d5f] text-[#4a4d5f] transition group-hover:border-[#f47b20] group-hover:bg-[#f47b20] group-hover:text-white">
                                        <ArrowRight className="size-7 transition group-hover:translate-x-1" strokeWidth={1.8} />
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
                </div>
            </section>

            {false && (
            <section className="border-y border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        {cmsMainBanner && (
                            <BannerStrip
                                icon={Bell}
                                title={cmsMainBanner.title}
                                description={cmsMainBanner.body ?? ''}
                                href={cmsMainBanner.linkUrl ?? '/customer'}
                            />
                        )}
                        <BannerStrip
                            icon={Sparkles}
                            title="오늘의 맞춤 보험점검"
                            description="가입 내역을 정리하고 부족한 보장만 빠르게 확인하세요."
                            href="/insurance-checkup"
                        />
                        <BannerStrip
                            icon={Gift}
                            title="상담 참여 포인트 안내"
                            description="상담 완료 후 받을 수 있는 포인트 혜택을 확인하세요."
                            href="/point-mall"
                        />
                    </div>
                </div>
            </section>
            )}

            <section className="overflow-hidden bg-[#fff8f0]">
                <div className="mx-auto grid max-w-7xl gap-8 px-5 py-24 sm:px-6 lg:grid-cols-[25fr_75fr] lg:items-center lg:px-8">
                    <div className="scroll-reveal reveal-from-left flex items-end justify-center lg:justify-start">
                        <img src={liveConsultingImage} alt="" className="h-80 w-auto object-contain sm:h-96 lg:h-[430px]" />
                    </div>

                    <div className="scroll-reveal reveal-from-right min-w-0">
                        <div className="mb-7">
                            <p className="text-lg font-black text-[#f47b20]">실시간 상담 접수현황</p>
                            <h2 className="mt-3 text-3xl font-black leading-tight text-[#171827] sm:text-4xl">
                                지금도 고객님의 보험 고민을 콕 집어 상담하고 있어요.
                            </h2>
                        </div>

                        <div className="relative overflow-hidden py-3">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#fff8f0] to-transparent" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#fff8f0] to-transparent" />
                            <div className="consultation-feed-track flex w-max gap-4 px-6">
                                {[0, 1].map((group) =>
                                    rollingReceiptRows.map((row) => (
                                        <div
                                            key={`${group}-${row.name}-${row.product}-${row.status}`}
                                            className={`flex h-[168px] w-[280px] shrink-0 flex-col justify-between rounded-3xl p-6 ${row.tone}`}
                                            aria-hidden={group === 1}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm">
                                                    {row.product}
                                                </span>
                                                <span className="text-sm font-black opacity-70">{row.name}님</span>
                                            </div>
                                            <p className="text-2xl font-black leading-tight">{row.status}</p>
                                        </div>
                                    )),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="bg-toss-grey50">
                <div className="mx-auto max-w-4xl px-5 py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-toss-blue">FAQ</p>
                        <h2 className="mt-2 text-2xl font-bold leading-8 text-toss-grey900">자주 묻는 질문</h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-toss-grey600">
                            상담 전에 가장 많이 확인하는 내용을 모았습니다.
                        </p>
                        <Link
                            href="/customer/faq"
                            className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-semibold text-toss-grey700 transition hover:text-toss-grey900"
                        >
                            더보기
                            <ChevronRight className="size-4" strokeWidth={1.8} />
                        </Link>
                    </div>

                    <div className="mt-9 divide-y divide-toss-grey200 border-y border-toss-grey200">
                        {cmsFaqs.map((faq, index) => {
                            const isOpen = openMainFaq === index;

                            return (
                                <article key={faq.question} className="py-5">
                                    <button
                                        type="button"
                                        className="flex w-full items-start justify-between gap-5 text-left"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenMainFaq(isOpen ? null : index)}
                                    >
                                        <span className="flex gap-3">
                                            <span className="text-base font-black text-[#f47b20]">Q</span>
                                            <span className="text-base font-bold leading-7 text-toss-grey900">
                                                {faq.question}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            className={`mt-1 size-5 shrink-0 text-toss-grey500 transition ${isOpen ? 'rotate-180' : ''}`}
                                            strokeWidth={2}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="mt-4 flex gap-3">
                                            <span className="text-base font-black text-toss-blue">A</span>
                                            <p className="whitespace-pre-line text-sm font-semibold leading-7 text-toss-grey600">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
            {visiblePointMallProducts.length > 0 && (
                <section className="bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
                        <SectionHeader
                            eyebrow="Point Mall"
                            title="포인트몰 추천 상품"
                            description="상담과 이벤트로 모은 포인트를 원하는 상품으로 교환해보세요."
                            href="/point-mall"
                        />
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {visiblePointMallProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={route('point-mall.products.show', product.slug)}
                                    className="group overflow-hidden rounded-[22px] border border-toss-grey200 bg-white transition hover:-translate-y-1 hover:border-[#f47b20]/40"
                                >
                                    <span className="flex aspect-square items-center justify-center bg-[#f3f5f8] text-toss-grey400">
                                        {product.imagePath ? (
                                            <img
                                                src={`/storage/${product.imagePath}`}
                                                alt=""
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <ShoppingBag className="size-12" strokeWidth={1.5} />
                                        )}
                                    </span>
                                    <span className="block p-5">
                                        <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-black text-[#f47b20]">
                                            {product.categoryName ?? '포인트 상품'}
                                        </span>
                                        <strong className="mt-4 line-clamp-2 block text-base font-black leading-6 text-toss-grey900">
                                            {product.name}
                                        </strong>
                                        <span className="mt-3 block text-xl font-black tabular-nums text-[#12284a]">
                                            {formatNumber(product.pointPrice)}P
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {false && (
            <section className="bg-toss-grey50">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        eyebrow="Event"
                        title="진행 중인 이벤트"
                        description="상담과 보험점검을 가볍게 시작할 수 있는 혜택입니다."
                        href="/events"
                    />
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {events.map((event) => (
                            <div key={event.title} className="rounded-lg border border-toss-grey200 bg-white p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <Gift className="size-6 shrink-0 text-toss-grey700" strokeWidth={1.8} />
                                    <span className="text-sm font-semibold text-toss-blue">{event.reward}</span>
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-toss-grey900">{event.title}</h3>
                                <p className="mt-2 text-sm tabular-nums text-toss-grey600">{event.period}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {false && (
            <section className="bg-white">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
                    <div>
                        <SectionHeader
                            eyebrow="Knowledge"
                            title="보험지식인"
                            description="자주 헷갈리는 보험 질문을 쉽게 정리했습니다."
                            href="/knowledge"
                        />
                        <div className="mt-8 space-y-3">
                            {qnaPreviews.map((item) => (
                                <div key={item.title} className="rounded-lg border border-toss-grey200 bg-white p-5">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-toss-blue">
                                        <MessageSquareText className="size-4" strokeWidth={1.8} />
                                        {item.category}
                                    </div>
                                    <h3 className="mt-3 text-base font-semibold text-toss-grey900">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-toss-grey600">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <SectionHeader eyebrow="Notice" title="공지사항" href="/customer/notices" />
                        <div className="mt-8 divide-y divide-toss-grey200 rounded-lg border border-toss-grey200 bg-white">
                            {cmsNotices.map((notice) => (
                                <Link
                                    key={notice.title}
                                    href={notice.href}
                                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-toss-grey50"
                                >
                                    <span className="flex items-center gap-3">
                                        <Bell className="size-4 shrink-0 text-toss-grey500" strokeWidth={1.8} />
                                        <span className="text-sm font-semibold text-toss-grey800">{notice.title}</span>
                                    </span>
                                    <span className="text-xs tabular-nums text-toss-grey500">{notice.date}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-6 rounded-lg border border-toss-grey200 bg-toss-grey50 p-5">
                            <p className="text-sm font-semibold text-toss-grey900">고객센터</p>
                            <p className="mt-2 text-sm leading-6 text-toss-grey600">
                                상담 접수, 포인트 이용, CMS 공지와 FAQ를 한 곳에서 확인할 수 있습니다.
                            </p>
                            <Link
                                href="/customer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-toss-blue"
                            >
                                문의하러 가기
                                <ArrowRight className="size-4" strokeWidth={1.8} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            )}
        </PublicLayout>
    );
}
