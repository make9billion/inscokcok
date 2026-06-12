import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import GuestLayout from '@/Layouts/GuestLayout';
import { sections as privacySections } from '@/Pages/PrivacyPolicy';
import { sections as termsSections } from '@/Pages/Terms';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Gift,
    Mail,
    MessageCircle,
    Search,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';

import characterUrl from '../../../images/hero/bohum-live-consulting.png';
import kakaoLogoUrl from '../../../images/logo/logo_kakao.png';
import naverLogoUrl from '../../../images/logo/logo_naver.png';

const policyContent = {
    terms: {
        title: '이용약관',
        description: '보험콕콕 서비스 이용과 관련한 전체 약관입니다.',
        sections: termsSections,
    },
    privacy: {
        title: '개인정보처리방침',
        description: '회원가입과 서비스 제공을 위한 개인정보 처리 기준입니다.',
        sections: privacySections,
    },
};

function formatPhone(value) {
    const digits = value.replace(/\D/g, '').replace(/^010/, '').slice(0, 8);
    const middle = digits.slice(0, 4);
    const last = digits.slice(4, 8);

    if (!middle) return '010-';
    if (!last) return `010-${middle}`;
    return `010-${middle}-${last}`;
}

function Field({ label, error, children }) {
    return (
        <label className="grid gap-1 text-xs font-black text-gray-800">
            {label}
            {children}
            <InputError message={error} />
        </label>
    );
}

function SocialButton({ provider, label, className, href = null, icon = null, iconClassName = '' }) {
    const content = (
        <>
            <span className="inline-flex items-center gap-3">
                {icon && (
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white">
                        <img src={icon} alt="" className={`max-h-6 max-w-6 object-contain ${iconClassName}`} />
                    </span>
                )}
                {label}
            </span>
            <ChevronRight className="size-5" strokeWidth={2.4} />
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                className={`mx-auto flex min-h-16 w-full items-center justify-between rounded-2xl px-5 text-base font-black transition hover:-translate-y-0.5 ${className}`}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type="button"
            onClick={() => alert(`${provider} 간편가입은 실제 소셜 로그인 연동 단계에서 연결할 수 있습니다.`)}
            className={`mx-auto flex min-h-16 w-full items-center justify-between rounded-2xl px-5 text-base font-black transition hover:-translate-y-0.5 ${className}`}
        >
            {content}
        </button>
    );
}

export default function Register() {
    const [mode, setMode] = useState('select');
    const [policyModal, setPolicyModal] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '010-',
        birth_date: '',
        gender: '',
        postal_code: '',
        address_line1: '',
        address_line2: '',
        password: '',
        password_confirmation: '',
        terms_agreement: false,
        privacy_agreement: false,
    });

    const activePolicy = policyModal ? policyContent[policyModal] : null;

    const openAddressSearch = () => {
        if (!window.daum?.Postcode) {
            alert('주소검색을 사용하려면 카카오/다음 우편번호 스크립트를 먼저 연결해야 합니다.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: (address) => {
                setData((current) => ({
                    ...current,
                    postal_code: address.zonecode,
                    address_line1: address.roadAddress || address.jibunAddress,
                }));
                window.setTimeout(() => document.getElementById('address_line2')?.focus(), 0);
            },
        }).open();
    };

    const agreePolicy = () => {
        if (policyModal === 'terms') {
            setData('terms_agreement', true);
        }

        if (policyModal === 'privacy') {
            setData('privacy_agreement', true);
        }

        setPolicyModal(null);
    };

    const submit = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout wide>
            <Head title="회원가입" />

            <div className="grid gap-5 p-1 lg:grid-cols-[0.82fr_1.18fr]">
                <aside className="relative overflow-hidden rounded-[24px] bg-[#f4f7ff] px-5 py-5">
                    <div className="absolute -left-16 -top-16 size-40 rounded-full bg-[#f47b20]/15" />
                    <div className="absolute -bottom-20 right-4 size-48 rounded-full bg-[#12284a]/10" />

                    <div className="relative">
                        <p className="text-xs font-black text-[#f47b20]">보험콕콕 회원 혜택</p>
                        <h1 className="mt-2 text-2xl font-black leading-tight tracking-normal text-[#12284a]">
                            가입하고 상담부터
                            <br />
                            포인트 혜택까지
                        </h1>
                        <p className="mt-3 text-xs font-semibold leading-5 text-gray-600">
                            상담 내역, 포인트, 포인트몰 주문을 한곳에서 확인할 수 있어요.
                        </p>

                        <div className="mt-4 grid gap-2">
                            {[
                                [MessageCircle, '상담 신청 내역 확인'],
                                [Gift, '회원가입 포인트 혜택'],
                                [ShieldCheck, '보험지식인 질문 관리'],
                            ].map(([Icon, text]) => (
                                <div key={text} className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2.5">
                                    <span className="grid size-9 place-items-center rounded-xl bg-[#12284a] text-white">
                                        <Icon className="size-4" strokeWidth={2.2} />
                                    </span>
                                    <span className="text-xs font-black text-gray-800">{text}</span>
                                </div>
                            ))}
                        </div>

                        <img
                            src={characterUrl}
                            alt=""
                            className="mx-auto mt-2 w-full max-w-[250px] object-contain"
                        />
                    </div>
                </aside>

                <main className="flex min-h-[620px] flex-col px-1 py-1 sm:px-3">
                    <div className="shrink-0">
                        <p className="text-sm font-black text-[#f47b20]">
                            {mode === 'select' ? 'Create Account' : 'Email Account'}
                        </p>
                        <div className="mt-1 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-black tracking-normal text-gray-950 sm:text-3xl">
                                    {mode === 'select' ? '회원가입' : '이메일 회원가입'}
                                </h2>
                                <p className="mt-2 text-sm font-semibold text-gray-500">
                                    {mode === 'select' ? '원하는 방식으로 시작해 주세요.' : '기본 정보를 입력해 계정을 만들어 주세요.'}
                                </p>
                            </div>

                            {mode === 'email' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('select')}
                                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-3 text-xs font-black text-gray-700 transition hover:bg-gray-50"
                                >
                                    <ArrowLeft className="size-4" />
                                    방식 선택
                                </button>
                            )}
                        </div>
                    </div>

                    {mode === 'select' ? (
                        <div className="flex flex-1 flex-col justify-center">
                            <div className="mx-auto grid w-full max-w-[548px] gap-3">
                                <SocialButton provider="카카오" label="카카오로 시작하기" href={route('social.kakao.redirect')} className="bg-[#fee500] text-[#191600]" icon={kakaoLogoUrl} />
                                <SocialButton provider="네이버" label="네이버로 시작하기" href={route('social.naver.redirect')} className="bg-[#03c75a] text-white" icon={naverLogoUrl} iconClassName="naver-logo-green" />
                                <button
                                    type="button"
                                    onClick={() => setMode('email')}
                                    className="mx-auto flex min-h-16 w-full items-center justify-between rounded-2xl bg-[#12284a] px-5 text-base font-black text-white transition hover:-translate-y-0.5"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <Mail className="size-5" />
                                        이메일주소로 시작하기
                                    </span>
                                    <ChevronRight className="size-5" strokeWidth={2.4} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="mx-auto mt-4 grid w-full max-w-[548px] gap-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="이메일" error={errors.email}>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        autoComplete="username"
                                        onChange={(event) => setData('email', event.target.value)}
                                        required
                                    />
                                </Field>

                                <div className="hidden rounded-2xl bg-[#fff7ed] px-4 py-3 text-xs font-bold leading-5 text-[#9a4a12] sm:block">
                                    가입 후 마이페이지에서 상담 내역과 포인트를 바로 확인할 수 있어요.
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="비밀번호" error={errors.password}>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        autoComplete="new-password"
                                        onChange={(event) => setData('password', event.target.value)}
                                        required
                                    />
                                </Field>

                                <Field label="비밀번호 확인" error={errors.password_confirmation}>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        autoComplete="new-password"
                                        onChange={(event) => setData('password_confirmation', event.target.value)}
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-1 text-xs font-black text-gray-800">
                                    이름 / 성별
                                    <div className="grid min-w-0 gap-2 grid-cols-[65%_minmax(0,35%)]">
                                        <input
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                            autoComplete="name"
                                            onChange={(event) => setData('name', event.target.value)}
                                            required
                                        />
                                        <div className="grid h-10 min-w-0 grid-cols-2 gap-1 rounded-xl bg-gray-50 p-1 ring-1 ring-gray-200">
                                            {[
                                                ['male', '남'],
                                                ['female', '여'],
                                            ].map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setData('gender', value)}
                                                    className={
                                                        data.gender === value
                                                            ? 'min-w-0 rounded-lg bg-[#12284a] text-xs font-black text-white'
                                                            : 'min-w-0 rounded-lg text-xs font-black text-gray-600 transition hover:bg-white'
                                                    }
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <InputError message={errors.name || errors.gender} />
                                </div>

                                <Field label="연락처" error={errors.phone}>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={data.phone}
                                        inputMode="numeric"
                                        className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        autoComplete="tel"
                                        onChange={(event) => setData('phone', formatPhone(event.target.value))}
                                        onFocus={() => {
                                            if (!data.phone.startsWith('010-')) {
                                                setData('phone', '010-');
                                            }
                                        }}
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-black text-gray-900">주소</p>
                                    <button
                                        type="button"
                                        onClick={openAddressSearch}
                                        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-[#12284a] ring-1 ring-gray-200 transition hover:bg-gray-100"
                                    >
                                        <Search className="size-4" />
                                        주소검색
                                    </button>
                                </div>

                                <div className="mt-3 grid gap-2">
                                    <div className="grid gap-2 sm:grid-cols-[110px_1fr]">
                                        <input
                                            id="postal_code"
                                            name="postal_code"
                                            value={data.postal_code}
                                            className="h-10 rounded-xl border-gray-200 bg-white text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                            placeholder="우편번호"
                                            readOnly
                                        />
                                        <input
                                            id="address_line1"
                                            name="address_line1"
                                            value={data.address_line1}
                                            className="h-10 rounded-xl border-gray-200 bg-white text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                            placeholder="주소검색으로 주소를 입력하세요"
                                            readOnly
                                        />
                                    </div>
                                    <input
                                        id="address_line2"
                                        name="address_line2"
                                        value={data.address_line2}
                                        className="h-10 rounded-xl border-gray-200 bg-white text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                                        placeholder="상세주소"
                                        autoComplete="address-line2"
                                        onChange={(event) => setData('address_line2', event.target.value)}
                                    />
                                    <InputError message={errors.postal_code || errors.address_line1 || errors.address_line2} />
                                </div>
                            </div>

                            <div className="grid gap-2 rounded-2xl border border-gray-100 p-3">
                                <label className="flex items-start gap-3 text-sm font-bold leading-6 text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={data.terms_agreement}
                                        onChange={(event) => setData('terms_agreement', event.target.checked)}
                                        className="mt-1 rounded border-gray-300 text-[#f47b20] focus:ring-[#f47b20]"
                                    />
                                    <span>
                                        <button type="button" onClick={() => setPolicyModal('terms')} className="text-[#f47b20] hover:underline">
                                            이용약관
                                        </button>
                                        에 동의합니다.
                                    </span>
                                </label>
                                <InputError message={errors.terms_agreement} />

                                <label className="flex items-start gap-3 text-sm font-bold leading-6 text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={data.privacy_agreement}
                                        onChange={(event) => setData('privacy_agreement', event.target.checked)}
                                        className="mt-1 rounded border-gray-300 text-[#f47b20] focus:ring-[#f47b20]"
                                    />
                                    <span>
                                        <button type="button" onClick={() => setPolicyModal('privacy')} className="text-[#f47b20] hover:underline">
                                            개인정보처리방침
                                        </button>
                                        에 동의합니다.
                                    </span>
                                </label>
                                <InputError message={errors.privacy_agreement} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f47b20] to-[#ff9f43] px-5 text-base font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                            >
                                {processing ? '가입 처리 중' : '회원가입 완료하기'}
                                <CheckCircle2 className="size-5" strokeWidth={2.2} />
                            </button>
                        </form>
                    )}

                    <div className="mt-auto pt-3 text-right text-sm font-semibold text-gray-500">
                        <Link href={route('login')} className="font-black text-[#12284a] hover:underline">
                            이미 가입했어요
                        </Link>
                    </div>
                </main>
            </div>

            <Modal show={Boolean(activePolicy)} maxWidth="lg" onClose={() => setPolicyModal(null)}>
                {activePolicy && (
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-black text-[#f47b20]">Agreement</p>
                                <h3 className="mt-1 text-2xl font-black text-gray-950">{activePolicy.title}</h3>
                                <p className="mt-2 text-sm font-semibold leading-6 text-gray-500">{activePolicy.description}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPolicyModal(null)}
                                className="grid size-10 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                                aria-label="닫기"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="mt-5 max-h-[420px] space-y-5 overflow-y-auto rounded-2xl bg-gray-50 p-4">
                            {activePolicy.sections.map((section) => (
                                <section key={section.title}>
                                    <h4 className="text-sm font-black text-gray-900">{section.title}</h4>
                                    <div className="mt-2 space-y-2">
                                        {section.body.map((item) => (
                                            <p key={item} className="text-sm font-semibold leading-6 text-gray-600">
                                                {item}
                                            </p>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={agreePolicy}
                            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#12284a] text-sm font-black text-white transition hover:bg-[#0b1a33]"
                        >
                            동의하기
                            <CheckCircle2 className="size-4" strokeWidth={2.4} />
                        </button>
                    </div>
                )}
            </Modal>
        </GuestLayout>
    );
}
