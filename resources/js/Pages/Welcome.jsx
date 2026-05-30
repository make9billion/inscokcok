import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    ChevronRight,
    Gift,
    MessageSquareText,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import PublicLayout from '@/Layouts/PublicLayout';

const heroSlides = [
    {
        label: '암보험',
        product: '암보험',
        kicker: '암 보장 한 번에 확인',
        title: '암보험, 꼭 가입한 걸까요?',
        description: '부족한 진단비와 중복 보장을 모아보고 내 상황에 맞는 암 보장을 확인하세요.',
        tags: ['암 진단비', '중복보장 체크', '보장분석'],
        tone: 'bg-[#edf7f7]',
        accent: 'text-[#6676b8]',
        badge: 'CANCER',
    },
    {
        label: '치매/간병보험',
        product: '치매/간병보험',
        kicker: '긴 돌봄의 시간을 대비',
        title: '치매/간병보험, 가족 부담까지 생각합니다.',
        description: '간병비, 요양, 치매 관련 보장을 현재 가족 상황에 맞춰 현실적으로 정리합니다.',
        tags: ['간병비', '치매보장', '부모님 상담'],
        tone: 'bg-[#f0faf6]',
        accent: 'text-[#39806c]',
        badge: 'CARE',
    },
    {
        label: '질병/상해보험',
        product: '질병/상해보험',
        kicker: '입원과 수술 보장 점검',
        title: '질병과 상해, 빈틈없이 준비하세요.',
        description: '입원비, 수술비, 후유장해 보장을 생활 패턴과 예산에 맞춰 비교합니다.',
        tags: ['입원비', '수술비', '후유장해'],
        tone: 'bg-[#eef3fb]',
        accent: 'text-[#51657e]',
        badge: 'HEALTH',
    },
    {
        label: '치아보험',
        product: '치아보험',
        kicker: '치료비 부담을 가볍게',
        title: '치아보험, 필요한 치료 중심으로.',
        description: '보존치료, 보철치료, 임플란트 보장을 연령과 치료 계획에 맞춰 확인합니다.',
        tags: ['보존치료', '보철치료', '임플란트'],
        tone: 'bg-[#fff8ec]',
        accent: 'text-[#c06d2b]',
        badge: 'DENTAL',
    },
    {
        label: '펫보험',
        product: '펫보험',
        kicker: '반려생활 병원비 준비',
        title: '펫보험, 병원비 걱정을 가볍게.',
        description: '통원, 입원, 수술비 보장을 반려동물의 나이와 생활 패턴에 맞춰 비교합니다.',
        tags: ['통원치료', '수술비', '반려생활'],
        tone: 'bg-[#f8f5ff]',
        accent: 'text-[#6b5bb8]',
        badge: 'PET',
    },
    {
        label: '어린이보험',
        product: '어린이보험',
        kicker: '성장 단계별 보장',
        title: '어린이보험, 필요한 때를 놓치지 않게.',
        description: '태아부터 청소년기까지 치료비, 진단비, 생활 보장을 한눈에 비교합니다.',
        tags: ['태아 상담', '성장기 보장', '부모 부담 절감'],
        tone: 'bg-[#eef8ff]',
        accent: 'text-[#2f76a8]',
        badge: 'KIDS',
    },
];

const rollingReceiptRows = [
    { name: '김*현', product: '암보험', status: '상담사 배정 완료', time: '1분 전' },
    { name: '박*준', product: '질병/상해보험', status: '보장 분석 중', time: '4분 전' },
    { name: '이*지', product: '치매/간병보험', status: '전화 상담 예약', time: '8분 전' },
    { name: '최*민', product: '펫보험', status: '접수 확인', time: '12분 전' },
];

const faqs = [
    {
        question: '보험진단은 어떤 내용을 확인하나요?',
        answer: '가입 중인 보장의 중복, 부족한 진단비, 갱신 시점과 보험료 변화를 함께 살펴봅니다.',
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

const pointMallProducts = [
    { title: '모바일 커피 쿠폰', points: '4,500P', tag: '교환 1위' },
    { title: '편의점 금액권', points: '10,000P', tag: '인기' },
    { title: '건강검진 할인권', points: '18,000P', tag: '건강관리' },
];

const events = [
    { title: '5월 보험진단 참여 이벤트', period: '2026.05.01 - 2026.05.31', reward: '최대 20,000P' },
    { title: '펫보험 상담 후기 적립', period: '2026.05.10 - 2026.06.09', reward: '후기 작성 시 5,000P' },
];

const qnaPreviews = [
    {
        category: '암보험',
        title: '비갱신형 진단비를 줄이면 보험료 차이가 큰가요?',
        answer: '연령과 가입 기간에 따라 차이가 큽니다. 기존 보장과 새 설계를 함께 비교해야 합니다.',
    },
    {
        category: '간병',
        title: '부모님 간병보험은 몇 세까지 준비할 수 있나요?',
        answer: '상품별 가입 가능 나이와 고지 항목이 달라 사전 확인이 필요합니다.',
    },
    {
        category: '펫보험',
        title: '강아지와 고양이 보장을 선택할 수 있나요?',
        answer: '반려동물 나이와 병력에 따라 특약 선택 가능 여부가 달라집니다.',
    },
];

const notices = [
    { title: '개인정보 처리방침 개정 안내', date: '2026.05.28' },
    { title: '상담 운영 시간 변경 안내', date: '2026.05.24' },
    { title: '포인트몰 일부 상품 교환 지연 안내', date: '2026.05.20' },
];

const formatPhone = (value) => {
    const rest = value.replace(/\D/g, '').replace(/^010/, '').slice(0, 8);
    const middle = rest.slice(0, 4);
    const last = rest.slice(4, 8);

    if (!middle) return '010-';
    if (!last) return `010-${middle}`;
    return `010-${middle}-${last}`;
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

export default function Welcome({ auth }) {
    const { flash } = usePage().props;
    const [activeSlide, setActiveSlide] = useState(0);
    const activeProduct = heroSlides[activeSlide];
    const form = useForm({
        type: 'product',
        applicant_name: '',
        phone: '010-',
        birth_date: '',
        interested_product: activeProduct.product,
        preferred_contact_time: '',
        privacy_agreement: false,
        third_party_agreement: false,
    });

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveSlide((current) => {
                const next = (current + 1) % heroSlides.length;
                form.setData('interested_product', heroSlides[next].product);
                return next;
            });
        }, 5200);

        return () => window.clearInterval(timer);
    }, []);

    const selectSlide = (index) => {
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
            <Head title="보험CC" />

            <section className="hero-stage relative overflow-hidden bg-[#edf7f7]" aria-label="보험상품 상담 신청">
                <div className="hero-viewport relative mx-auto min-h-[620px] max-w-[1320px] lg:h-[620px]">
                    <div className="overflow-hidden lg:h-full">
                        <div
                            className="hero-track flex h-full transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                        >
                            {heroSlides.map((slide) => (
                                <article
                                    key={slide.label}
                                    className={`relative min-h-[520px] w-full shrink-0 px-5 py-12 sm:px-10 lg:h-[620px] lg:px-[118px] lg:py-[72px] lg:pr-[470px] ${slide.tone}`}
                                >
                                    <div className="relative z-10 max-w-2xl">
                                        <span className="text-xl font-black text-[#111111]">{slide.kicker}</span>
                                        <h1 className="mt-8 text-4xl font-black leading-tight text-[#111111] lg:text-5xl">
                                            {slide.title}
                                        </h1>
                                        <p className={`mt-4 max-w-2xl text-2xl font-black leading-snug lg:text-4xl ${slide.accent}`}>
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

                                    <div className="pointer-events-none absolute bottom-10 right-[430px] hidden w-[210px] rounded-[34px] bg-white p-6 text-center shadow-[0_30px_80px_rgba(22,36,58,0.18)] lg:block">
                                        <div className="mx-auto grid size-20 place-items-center rounded-full border-4 border-[#16243a] text-xl font-black text-[#16243a]">
                                            <ShieldCheck className="size-9" strokeWidth={1.8} />
                                        </div>
                                        <strong className="mt-6 block text-lg font-black tracking-widest text-[#081a33]">
                                            {slide.badge}
                                        </strong>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="hero-dots absolute bottom-7 left-5 z-10 flex gap-2 sm:left-10 lg:left-[118px] lg:bottom-14">
                        {heroSlides.map((slide, index) => (
                            <button
                                key={slide.label}
                                type="button"
                                aria-label={`${slide.label} 배너 보기`}
                                onClick={() => selectSlide(index)}
                                className={`h-2.5 rounded-full transition-all ${
                                    activeSlide === index ? 'w-7 bg-[#081a33]' : 'w-2.5 bg-[#c3c7c7]'
                                }`}
                            />
                        ))}
                    </div>

                    <aside className="consult-panel relative z-20 mx-auto -mt-6 w-[min(100%-24px,430px)] rounded-[20px] border-4 border-[#081a33] bg-white/95 px-7 py-6 shadow-[0_18px_44px_rgba(22,36,58,0.11)] lg:absolute lg:right-[18px] lg:top-[66px] lg:mt-0 lg:w-[414px]">
                        <div className="product-tabs grid grid-cols-3 gap-2" aria-label="보험상품 선택">
                            {heroSlides.map((slide, index) => (
                                <button
                                    key={slide.label}
                                    type="button"
                                    aria-pressed={form.data.interested_product === slide.product}
                                    onClick={() => selectSlide(index)}
                                    className={`min-h-8 rounded-full border-2 border-[#081a33] px-2 text-xs font-black transition ${
                                        form.data.interested_product === slide.product
                                            ? 'bg-[#081a33] text-white'
                                            : 'bg-white text-[#222222] hover:bg-[#081a33] hover:text-white'
                                    }`}
                                >
                                    {slide.label}
                                </button>
                            ))}
                            <Link
                                href="/insurance-checkup"
                                className="col-span-3 inline-flex min-h-10 items-center justify-center rounded-full border-2 border-[#081a33] bg-[#eef3fb] px-3 text-sm font-black text-[#081a33] transition hover:bg-[#081a33] hover:text-white"
                            >
                                보험점검
                            </Link>
                        </div>

                        <form onSubmit={submit} className="lead-form mt-5 grid gap-3">
                            <div className="text-center">
                                <strong className="inline-block border-b-4 border-[#333333] pb-1 text-2xl font-black text-[#333333]">
                                    어떤 상품이 필요하신가요?
                                </strong>
                            </div>

                            {flash?.success && (
                                <div className="rounded-lg border border-toss-blue/20 bg-toss-blueLight px-4 py-3 text-sm font-semibold text-toss-blue">
                                    {flash.success}
                                </div>
                            )}

                            <label className="grid gap-1 text-xs font-bold text-[#555555]">
                                이름
                                <input
                                    type="text"
                                    value={form.data.applicant_name}
                                    onChange={(event) => form.setData('applicant_name', event.target.value)}
                                    placeholder="이름"
                                    className="h-9 border-0 border-b border-[#d5d5d5] bg-transparent px-1 text-sm text-[#222222] focus:border-[#081a33] focus:ring-0"
                                />
                                <FieldError message={form.errors.applicant_name} />
                            </label>

                            <label className="grid gap-1 text-xs font-bold text-[#555555]">
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
                                    className="h-9 border-0 border-b border-[#d5d5d5] bg-transparent px-1 text-sm text-[#222222] focus:border-[#081a33] focus:ring-0"
                                />
                                <FieldError message={form.errors.phone} />
                            </label>

                            <label className="mt-1 flex items-center gap-2 text-sm font-black text-[#222222]">
                                <input
                                    type="checkbox"
                                    checked={form.data.privacy_agreement}
                                    onChange={(event) => form.setData('privacy_agreement', event.target.checked)}
                                    className="size-6 rounded border-[#d5d5d5] text-[#081a33] focus:ring-[#081a33]"
                                />
                                개인정보 수집 및 이용동의
                            </label>
                            <FieldError message={form.errors.privacy_agreement} />

                            <label className="flex items-center gap-2 text-sm font-black text-[#222222]">
                                <input
                                    type="checkbox"
                                    checked={form.data.third_party_agreement}
                                    onChange={(event) => form.setData('third_party_agreement', event.target.checked)}
                                    className="size-6 rounded border-[#d5d5d5] text-[#081a33] focus:ring-[#081a33]"
                                />
                                제3자 정보제공 동의
                            </label>
                            <FieldError message={form.errors.third_party_agreement} />

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="min-h-12 rounded-lg bg-[#081a33] text-base font-black text-white transition hover:bg-[#0f2b52] disabled:opacity-60"
                            >
                                {form.processing ? '접수 중' : '빠른 상담신청'}
                            </button>
                            <p className="text-xs font-bold leading-5 text-[#4b4b4b]">
                                입력하신 정보는 상담 목적 외에 사용하지 않습니다.
                            </p>
                        </form>
                    </aside>
                </div>
            </section>

            <section className="mx-auto my-12 grid max-w-6xl grid-cols-2 gap-3 px-5 sm:grid-cols-4 lg:grid-cols-8">
                {[...heroSlides.map((slide) => slide.label), '보장분석', '포인트몰'].map((label) => (
                    <button key={label} type="button" className="grid place-items-center gap-2">
                        <span className="grid size-16 place-items-center rounded-full bg-[#eeeeee] text-xl font-black text-[#081a33] shadow-[inset_0_0_0_8px_#f7f7f7]">
                            {label.slice(0, 1)}
                        </span>
                        <strong className="text-sm font-black text-[#333333]">{label}</strong>
                    </button>
                ))}
            </section>

            <section className="border-y border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <BannerStrip
                            icon={Sparkles}
                            title="오늘의 맞춤 보험진단"
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

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        eyebrow="Live"
                        title="실시간 상담 접수 현황"
                        description="최근 접수 흐름을 간단히 보여드립니다."
                    />
                    <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {rollingReceiptRows.map((row) => (
                            <div key={`${row.name}-${row.time}`} className="rounded-lg border border-toss-grey200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-toss-grey900">{row.name}</span>
                                    <span className="text-xs text-toss-grey500">{row.time}</span>
                                </div>
                                <p className="mt-3 text-sm text-toss-grey600">{row.product}</p>
                                <p className="mt-1 text-sm font-semibold text-toss-blue">{row.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-toss-grey50">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <SectionHeader
                        eyebrow="FAQ"
                        title="자주 묻는 질문"
                        description="상담 전에 가장 많이 확인하는 내용을 모았습니다."
                    />
                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <div key={faq.question} className="rounded-lg border border-toss-grey200 bg-white p-5">
                                <h3 className="text-base font-semibold text-toss-grey900">{faq.question}</h3>
                                <p className="mt-2 text-sm leading-6 text-toss-grey600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        eyebrow="Point Mall"
                        title="포인트몰 인기 상품"
                        description="적립 포인트로 교환하기 좋은 상품을 먼저 보여드립니다."
                        href="/point-mall"
                    />
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {pointMallProducts.map((product) => (
                            <div key={product.title} className="rounded-lg border border-toss-grey200 bg-white p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <ShoppingBag className="size-6 text-toss-grey700" strokeWidth={1.8} />
                                    <span className="rounded-lg bg-toss-grey100 px-2 py-1 text-xs font-semibold text-toss-grey700">
                                        {product.tag}
                                    </span>
                                </div>
                                <h3 className="mt-5 text-base font-semibold text-toss-grey900">{product.title}</h3>
                                <p className="mt-2 text-xl font-bold tabular-nums text-toss-grey900">{product.points}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-toss-grey50">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        eyebrow="Event"
                        title="진행 중인 이벤트"
                        description="상담과 보험진단을 가볍게 시작할 수 있는 혜택입니다."
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
                            {notices.map((notice) => (
                                <Link
                                    key={notice.title}
                                    href="/customer/notices"
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
                                상담 접수와 포인트 이용 문의를 운영 시간 안에 순서대로 안내합니다.
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
        </PublicLayout>
    );
}
