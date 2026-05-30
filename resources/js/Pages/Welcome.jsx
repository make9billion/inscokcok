import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    CheckCircle2,
    ChevronRight,
    Gift,
    MessageSquareText,
    PhoneCall,
    SearchCheck,
    ShoppingBag,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import PublicLayout from '@/Layouts/PublicLayout';

const productOptions = [
    { name: '암보험', description: '진단비와 치료비 중심으로 확인' },
    { name: '치매/간병보험', description: '장기 돌봄과 생활비 대비' },
    { name: '질병/상해보험', description: '입원, 수술, 후유장해 보장' },
    { name: '펫보험', description: '반려동물 병원비 부담 완화' },
];

const rollingReceiptRows = [
    { name: '김○연', product: '암보험', status: '상담사 배정 완료', time: '1분 전' },
    { name: '박○훈', product: '질병/상해보험', status: '보장 분석 중', time: '4분 전' },
    { name: '이○서', product: '치매/간병보험', status: '전화 상담 예약', time: '8분 전' },
    { name: '최○민', product: '펫보험', status: '접수 확인', time: '12분 전' },
];

const faqs = [
    {
        question: '보험점검은 어떤 내용을 확인하나요?',
        answer: '가입 중인 보장의 중복, 부족한 진단비, 갱신 시점과 보험료 변화를 함께 봅니다.',
    },
    {
        question: '상담 신청 후 바로 연락이 오나요?',
        answer: '운영 시간에는 접수 순서대로 배정되며, 원하는 시간대를 남기면 일정에 맞춰 안내합니다.',
    },
    {
        question: '포인트는 어디에 사용할 수 있나요?',
        answer: '상담 참여와 이벤트로 적립한 포인트는 포인트몰 상품 교환에 사용할 수 있습니다.',
    },
];

const pointMallProducts = [
    { title: '모바일 커피 쿠폰', points: '4,500P', tag: '교환 1위' },
    { title: '편의점 금액권', points: '10,000P', tag: '실속형' },
    { title: '건강검진 할인권', points: '18,000P', tag: '건강관리' },
];

const events = [
    { title: '5월 보험점검 참여 이벤트', period: '2026.05.01 - 2026.05.31', reward: '최대 20,000P' },
    { title: '펫보험 상담 후기 적립', period: '2026.05.10 - 2026.06.09', reward: '후기 승인 시 5,000P' },
];

const qnaPreviews = [
    {
        category: '암보험',
        title: '비갱신형 진단비를 줄이면 보험료 차이가 큰가요?',
        answer: '연령과 납입 기간에 따라 차이가 큽니다. 기존 보장과 새 설계를 같이 비교해야 합니다.',
    },
    {
        category: '간병',
        title: '부모님 간병보험은 몇 세까지 준비할 수 있나요?',
        answer: '상품별 가입 가능 나이와 고지 항목이 달라 사전 확인이 필요합니다.',
    },
    {
        category: '펫보험',
        title: '슬개골 보장도 선택할 수 있나요?',
        answer: '반려동물 나이와 병력에 따라 특약 선택 가능 여부가 달라집니다.',
    },
];

const notices = [
    { title: '개인정보 처리방침 개정 안내', date: '2026.05.28' },
    { title: '상담 운영 시간 변경 안내', date: '2026.05.24' },
    { title: '포인트몰 일부 상품 교환 지연 안내', date: '2026.05.20' },
];

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
    const [selectedProduct, setSelectedProduct] = useState(productOptions[0].name);

    return (
        <PublicLayout auth={auth}>
            <Head title="보흠CC" />

            <section className="bg-white">
                <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                    <div>
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-toss-blue">
                            <ShieldCheck className="size-4" strokeWidth={1.8} />
                            보험을 더 명확하게
                        </p>
                        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-toss-grey900 sm:text-4xl lg:text-5xl">
                            상담부터 보험점검까지 한 화면에서 차분하게 시작하세요.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-toss-grey600">
                            필요한 보장만 고르고 연락처를 남기면 보흠CC 상담사가 현재 상황에 맞춰 안내합니다.
                            복잡한 설명보다 먼저 확인해야 할 선택지를 보여드립니다.
                        </p>

                        <div className="mt-8">
                            <div className="flex items-center gap-2 text-sm font-semibold text-toss-grey800">
                                <SearchCheck className="size-4 text-toss-blue" strokeWidth={1.8} />
                                관심 상품 선택
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {productOptions.map((product) => (
                                    <button
                                        key={product.name}
                                        type="button"
                                        aria-pressed={selectedProduct === product.name}
                                        onClick={() => setSelectedProduct(product.name)}
                                        className={`rounded-lg border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue ${
                                            selectedProduct === product.name
                                                ? 'border-toss-blue bg-toss-blueLight'
                                                : 'border-toss-grey200 bg-white hover:border-toss-blue hover:bg-toss-blueLight'
                                        }`}
                                    >
                                        <span className="block text-base font-semibold text-toss-grey900">
                                            {product.name}
                                        </span>
                                        <span className="mt-1 block text-sm leading-5 text-toss-grey600">
                                            {product.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/insurance-checkup"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-toss-blue px-5 py-4 text-base font-semibold text-white transition hover:bg-toss-blueHover focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue sm:w-auto"
                            >
                                보험점검 바로가기
                                <ArrowRight className="size-5" strokeWidth={1.8} />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg border border-toss-grey200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-toss-blue">상담신청</p>
                                <h2 className="mt-1 text-xl font-bold text-toss-grey900">상담 접수 미리보기</h2>
                            </div>
                            <PhoneCall className="size-6 text-toss-grey700" strokeWidth={1.8} />
                        </div>

                        <div className="mt-6 space-y-4">
                            <label className="block">
                                <span className="text-sm font-semibold text-toss-grey800">이름</span>
                                <input
                                    type="text"
                                    placeholder="홍길동"
                                    className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 placeholder:text-toss-grey500 focus:border-toss-blue focus:ring-toss-blue"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-toss-grey800">연락처</span>
                                <input
                                    type="tel"
                                    placeholder="010-0000-0000"
                                    className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 placeholder:text-toss-grey500 focus:border-toss-blue focus:ring-toss-blue"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-toss-grey800">상담 희망 상품</span>
                                <select
                                    value={selectedProduct}
                                    onChange={(event) => setSelectedProduct(event.target.value)}
                                    className="mt-2 w-full rounded-lg border-toss-grey200 bg-toss-grey50 text-toss-grey800 focus:border-toss-blue focus:ring-toss-blue"
                                >
                                    {productOptions.map((product) => (
                                        <option key={product.name}>{product.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <button
                            type="button"
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-toss-grey900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-toss-grey800 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-grey900"
                        >
                            상담 접수하기
                            <CheckCircle2 className="size-4" strokeWidth={1.8} />
                        </button>

                        <p className="mt-4 text-xs leading-5 text-toss-grey500">
                            실제 접수 기능은 준비 중입니다. 남겨진 정보는 저장되지 않습니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="border-y border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-2">
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
                        description="상담과 보험점검을 더 가볍게 시작할 수 있는 혜택입니다."
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
                            description="자주 올라오는 보험 질문을 짧게 정리했습니다."
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
                                상담 접수와 포인트 이용 문의는 운영 시간 내 순서대로 안내합니다.
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
