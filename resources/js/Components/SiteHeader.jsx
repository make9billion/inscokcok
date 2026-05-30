import { Link } from '@inertiajs/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { primaryNavigation } from '@/Constants/siteNavigation';
import logoUrl from '../../images/logo/logo.png';

function DesktopNavigationItem({ item }) {
    if (!item.children) {
        return (
            <Link
                href={item.href}
                className="rounded px-2 py-2 text-sm font-medium text-toss-grey700 transition hover:text-toss-grey900 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue"
            >
                {item.label}
            </Link>
        );
    }

    return (
        <div className="group relative">
            <Link
                href={item.href}
                className="flex items-center gap-1 rounded px-2 py-2 text-sm font-medium text-toss-grey700 transition hover:text-toss-grey900 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue"
            >
                <span>{item.label}</span>
                <ChevronDown className="size-4" strokeWidth={1.8} />
            </Link>
            <div className="invisible absolute left-0 top-full z-20 w-52 translate-y-2 rounded-lg border border-toss-grey200 bg-white p-2 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {item.children.map((child) => (
                    <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-toss-grey700 transition hover:bg-toss-grey50 hover:text-toss-grey900 focus:bg-toss-grey50 focus:outline-none"
                    >
                        {child.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

function AuthLinks({ auth, mobile = false }) {
    const user = auth?.user;
    const baseClass = mobile
        ? 'block rounded-md px-3 py-2 text-sm font-semibold text-toss-grey800 transition hover:bg-toss-grey50'
        : 'rounded px-3 py-2 text-sm font-semibold text-toss-grey700 transition hover:text-toss-grey900 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue';

    if (user) {
        return (
            <div className={mobile ? 'space-y-1' : 'flex items-center gap-1'}>
                <Link href={route('dashboard')} className={baseClass}>
                    대시보드
                </Link>
                <Link href={route('profile.edit')} className={baseClass}>
                    내정보
                </Link>
            </div>
        );
    }

    return (
        <div className={mobile ? 'space-y-1' : 'flex items-center gap-1'}>
            <Link href={route('login')} className={baseClass}>
                로그인
            </Link>
            <Link
                href={route('register')}
                className={
                    mobile
                        ? 'block rounded-md bg-toss-blue px-3 py-2 text-sm font-semibold text-white transition hover:bg-toss-blueHover'
                        : 'rounded bg-toss-blue px-3 py-2 text-sm font-semibold text-white transition hover:bg-toss-blueHover focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue'
                }
            >
                회원가입
            </Link>
        </div>
    );
}

export default function SiteHeader({ auth }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-toss-grey200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="inline-flex items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue"
                >
                    <img src={logoUrl} alt="보험CC" className="h-9 w-auto" />
                </Link>

                <nav className="hidden items-center gap-1 lg:flex" aria-label="주요 메뉴">
                    {primaryNavigation.map((item) => (
                        <DesktopNavigationItem key={item.href} item={item} />
                    ))}
                </nav>

                <div className="hidden lg:block">
                    <AuthLinks auth={auth} />
                </div>

                <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-md text-toss-grey800 transition hover:bg-toss-grey50 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue lg:hidden"
                    aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {isOpen && (
                <div className="border-t border-toss-grey200 bg-white lg:hidden">
                    <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6" aria-label="모바일 메뉴">
                        <div className="space-y-1">
                            {primaryNavigation.map((item) => (
                                <div key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="block rounded-md px-3 py-2 text-sm font-semibold text-toss-grey800 transition hover:bg-toss-grey50"
                                    >
                                        {item.label}
                                    </Link>
                                    {item.children && (
                                        <div className="mt-1 space-y-1 border-l border-toss-grey200 pl-3">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className="block rounded-md px-3 py-2 text-sm text-toss-grey600 transition hover:bg-toss-grey50 hover:text-toss-grey900"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 border-t border-toss-grey200 pt-4">
                            <AuthLinks auth={auth} mobile />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
