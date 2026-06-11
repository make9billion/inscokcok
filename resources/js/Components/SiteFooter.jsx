import { Link } from '@inertiajs/react';

import logoUrl from '../../images/logo/logo.png';

const footerLinks = [
    ['개인정보처리방침', '/privacy-policy'],
    ['이용약관', '/terms'],
    ['포인트몰 이용안내', '/point-mall-guide'],
    ['제휴문의', '/partnership'],
];

export default function SiteFooter({ dark = false }) {
    return (
        <footer className={dark ? 'border-t border-white/10 bg-[#070b14]' : 'border-t border-toss-grey200 bg-toss-grey50'}>
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                        <img
                            src={logoUrl}
                            alt="보험콕콕"
                            className={dark ? 'h-9 w-auto brightness-0 invert opacity-85' : 'h-9 w-auto grayscale opacity-70'}
                        />
                        <p className={dark ? 'mt-3 max-w-sm text-sm leading-6 text-white/55' : 'mt-3 max-w-sm text-sm leading-6 text-toss-grey600'}>
                            보험 상담, 보장 점검, 포인트몰까지 한곳에서 이용할 수 있는 보험 안내 플랫폼입니다.
                        </p>
                        <dl className={dark ? 'mt-5 space-y-1 text-xs leading-5 text-white/40' : 'mt-5 space-y-1 text-xs leading-5 text-toss-grey500'}>
                            <div>주식회사 만형 | 대표이사: 강준보 | 사업자등록번호: 553-88-01928</div>
                            <div>본점 : 인천광역시 미추홀구 주안로 115 전시문화빌딩 601호</div>
                            <div>지점 : 경기도 수원시 팔달구 인계로94번길 32 정진빌딩 302호</div>
                        </dl>
                    </div>

                    <nav className="flex flex-wrap gap-x-5 gap-y-3 lg:justify-end" aria-label="푸터 메뉴">
                        {footerLinks.map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className={
                                    dark
                                        ? 'text-sm font-semibold text-white/55 transition hover:text-white'
                                        : 'text-sm font-semibold text-toss-grey600 transition hover:text-toss-grey900'
                                }
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
