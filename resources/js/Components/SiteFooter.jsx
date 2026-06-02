import { Link } from '@inertiajs/react';

import {
    customerCenterLinks,
    insuranceProductLinks,
    primaryNavigation,
} from '@/Constants/siteNavigation';
import logoUrl from '../../images/logo/logo.png';

const serviceLinks = primaryNavigation.filter((item) => !item.children);

function FooterGroup({ title, links }) {
    return (
        <div>
            <h2 className="text-sm font-semibold text-toss-grey800">{title}</h2>
            <ul className="mt-3 space-y-2">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-sm text-toss-grey600 transition hover:text-toss-grey900"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function SiteFooter() {
    return (
        <footer className="border-t border-toss-grey200 bg-toss-grey50">
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
                    <div>
                        <img src={logoUrl} alt="보험CC" className="h-9 w-auto grayscale opacity-70" />
                        <p className="mt-3 max-w-sm text-sm leading-6 text-toss-grey600">
                            보험 상담, 보장 점검, 포인트몰을 한 곳에서 이용할 수 있는 보험 플랫폼입니다.
                            필요한 정보만 명확하게 안내합니다.
                        </p>
                        <dl className="mt-5 space-y-1 text-xs leading-5 text-toss-grey500">
                            <div>주식회사 만형</div>
                            <div>대표이사 강준보</div>
                            <div>사업자등록번호 553-88-01928</div>
                            <div>본점 인천광역시 미추홀구 주안로 115 전시문화빌딩 601호</div>
                            <div>지점 경기도 수원시 팔달구 인계로94번길 32 정진빌딩 302호</div>
                        </dl>
                    </div>

                    <FooterGroup title="서비스" links={serviceLinks} />
                    <FooterGroup title="보험상품" links={insuranceProductLinks} />
                    <FooterGroup title="고객센터" links={customerCenterLinks} />
                </div>

                <div className="mt-8 border-t border-toss-grey200 pt-5 text-xs text-toss-grey500">
                    © 2026 보험CC. 보험계약 체결 전 상품설명서와 약관을 확인하시기 바랍니다.
                </div>
            </div>
        </footer>
    );
}
