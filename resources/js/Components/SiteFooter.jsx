import { Link } from '@inertiajs/react';

import logoUrl from '../../images/logo/logo.png';

const footerLinks = [
    ['개인정보처리방침', '/privacy-policy'],
    ['제휴문의', '/partnership'],
];

export default function SiteFooter() {
    return (
        <footer className="border-t border-toss-grey200 bg-toss-grey50">
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                        <img src={logoUrl} alt="보험CC" className="h-9 w-auto grayscale opacity-70" />
                        <p className="mt-3 max-w-sm text-sm leading-6 text-toss-grey600">
                            보험 상담, 보장 점검, 포인트몰을 한 곳에서 이용할 수 있는 보험 플랫폼입니다.
                        </p>
                        <dl className="mt-5 space-y-1 text-xs leading-5 text-toss-grey500">
                            <div>주식회사 만형 │ 대표이사 : 강준보 │ 사업자등록번호 : 553-88-01928</div>
                            <div>본점 : 인천광역시 미추홀구 주안로 115 전시문화빌딩 601호</div>
                            <div>지점 : 경기도 수원시 팔달구 인계로94번길 32 정진빌딩 302호</div>
                        </dl>
                    </div>

                    <nav className="flex flex-col gap-3 lg:items-end" aria-label="푸터 메뉴">
                        {footerLinks.map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className="text-sm font-semibold text-toss-grey600 transition hover:text-toss-grey900"
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
