import { Link } from '@inertiajs/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { primaryNavigation } from '@/Constants/siteNavigation';
import logoUrl from '../../images/logo/logo.png';

function DesktopNavigationItem({ item, dark = false }) {
    const linkClass = dark
        ? 'rounded px-3 py-2 text-base font-semibold text-white/75 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f47b20]'
        : 'rounded px-3 py-2 text-base font-semibold text-toss-grey700 transition hover:text-toss-grey900 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue';

    if (!item.children) {
        return (
            <Link href={item.href} className={linkClass}>
                {item.label}
            </Link>
        );
    }

    return (
        <div className="group relative">
            <Link href={item.href} className={`${linkClass} flex items-center gap-1`}>
                <span>{item.label}</span>
                <ChevronDown className="size-4" strokeWidth={1.8} />
            </Link>
            <div
                className={`invisible absolute left-0 top-full z-20 w-52 translate-y-2 rounded-lg p-2 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
                    dark ? 'border border-white/10 bg-[#101827]' : 'border border-toss-grey200 bg-white'
                }`}
            >
                {item.children.map((child) => (
                    <Link
                        key={child.href}
                        href={child.href}
                        className={
                            dark
                                ? 'block rounded-md px-3 py-2 text-[15px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white focus:bg-white/10 focus:outline-none'
                                : 'block rounded-md px-3 py-2 text-[15px] font-medium text-toss-grey700 transition hover:bg-toss-grey50 hover:text-toss-grey900 focus:bg-toss-grey50 focus:outline-none'
                        }
                    >
                        {child.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

function AuthLinks({ auth, mobile = false, dark = false }) {
    const user = auth?.user;
    const baseClass = mobile
        ? dark
            ? 'block rounded-md px-3 py-2 text-base font-semibold text-white/80 transition hover:bg-white/10'
            : 'block rounded-md px-3 py-2 text-base font-semibold text-toss-grey800 transition hover:bg-toss-grey50'
        : dark
          ? 'rounded px-3 py-2 text-base font-semibold text-white/75 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f47b20]'
          : 'rounded px-3 py-2 text-base font-semibold text-toss-grey700 transition hover:text-toss-grey900 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue';

    if (user) {
        return (
            <div className={mobile ? 'space-y-1' : 'flex items-center gap-1'}>
                <Link href={route('dashboard')} className={baseClass}>
                    마이페이지
                </Link>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className={
                        mobile
                            ? `${baseClass} w-full text-left`
                            : dark
                              ? 'rounded px-3 py-2 text-base font-semibold text-white/55 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f47b20]'
                              : 'rounded px-3 py-2 text-base font-semibold text-toss-grey500 transition hover:text-toss-grey900 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue'
                    }
                >
                    로그아웃
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
                        ? 'block rounded-md bg-[#f47b20] px-3 py-2 text-base font-semibold text-white transition hover:bg-[#de6812]'
                        : 'rounded bg-[#f47b20] px-3 py-2 text-base font-semibold text-white transition hover:bg-[#de6812] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f47b20]'
                }
            >
                회원가입
            </Link>
        </div>
    );
}

export default function SiteHeader({ auth, dark = false, insuranceHeader = false, pointMallHeader = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [openMobileMenus, setOpenMobileMenus] = useState({});
    const [isThemedScrolled, setIsThemedScrolled] = useState(false);
    const hasThemedHeader = insuranceHeader || pointMallHeader;
    const themedHeaderClass = pointMallHeader ? 'point-mall-hero-gradient' : 'insurance-hero-gradient';
    const useDarkHeader = dark || (hasThemedHeader && !isThemedScrolled);

    useEffect(() => {
        if (!hasThemedHeader) {
            setIsThemedScrolled(false);
            return undefined;
        }

        const updateHeaderTone = () => {
            setIsThemedScrolled(window.scrollY > 300);
        };

        updateHeaderTone();
        window.addEventListener('scroll', updateHeaderTone, { passive: true });

        return () => window.removeEventListener('scroll', updateHeaderTone);
    }, [hasThemedHeader]);

    useEffect(() => {
        if (!isOpen) {
            setOpenMobileMenus({});
        }
    }, [isOpen]);

    return (
        <header
            className={
                useDarkHeader
                    ? `sticky top-0 z-30 border-b border-white/10 ${hasThemedHeader ? themedHeaderClass : 'bg-[#070b14]'}`
                    : 'sticky top-0 z-30 border-b border-toss-grey200 bg-white'
            }
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="inline-flex items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue"
                >
                    <img src={logoUrl} alt="보험CC" className={useDarkHeader ? 'h-12 w-auto brightness-0 invert' : 'h-12 w-auto'} />
                </Link>

                <nav className="hidden items-center gap-2 lg:flex" aria-label="주요 메뉴">
                    {primaryNavigation.map((item) => (
                        <DesktopNavigationItem key={item.href} item={item} dark={useDarkHeader} />
                    ))}
                </nav>

                <div className="hidden lg:block">
                    <AuthLinks auth={auth} dark={useDarkHeader} />
                </div>

                <button
                    type="button"
                    className={
                        useDarkHeader
                            ? 'inline-flex size-11 items-center justify-center rounded-md text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f47b20] lg:hidden'
                            : 'inline-flex size-11 items-center justify-center rounded-md text-toss-grey800 transition hover:bg-toss-grey50 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue lg:hidden'
                    }
                    aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {isOpen && (
                <div className={useDarkHeader ? `border-t border-white/10 ${hasThemedHeader ? themedHeaderClass : 'bg-[#070b14]'} lg:hidden` : 'border-t border-toss-grey200 bg-white lg:hidden'}>
                    <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6" aria-label="모바일 메뉴">
                        <div className="space-y-1">
                            {primaryNavigation.map((item) => {
                                const isSubmenuOpen = Boolean(openMobileMenus[item.href]);
                                const topLevelClass = useDarkHeader
                                    ? 'rounded-md px-3 py-2 text-base font-semibold text-white/80 transition hover:bg-white/10'
                                    : 'rounded-md px-3 py-2 text-base font-semibold text-toss-grey800 transition hover:bg-toss-grey50';

                                return (
                                    <div key={item.href}>
                                        {item.children ? (
                                            <button
                                                type="button"
                                                className={`flex w-full items-center justify-between gap-3 text-left ${topLevelClass}`}
                                                aria-expanded={isSubmenuOpen}
                                                onClick={() =>
                                                    setOpenMobileMenus((menus) => ({
                                                        ...menus,
                                                        [item.href]: !menus[item.href],
                                                    }))
                                                }
                                            >
                                                <span>{item.label}</span>
                                                <ChevronDown
                                                    className={`size-4 transition ${isSubmenuOpen ? 'rotate-180' : ''}`}
                                                    strokeWidth={1.9}
                                                />
                                            </button>
                                        ) : (
                                            <Link href={item.href} className={`block ${topLevelClass}`}>
                                                {item.label}
                                            </Link>
                                        )}

                                        {item.children && isSubmenuOpen && (
                                            <div className={useDarkHeader ? 'mt-1 space-y-1 border-l border-white/10 pl-3' : 'mt-1 space-y-1 border-l border-toss-grey200 pl-3'}>
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={
                                                            useDarkHeader
                                                                ? 'block rounded-md px-3 py-2 text-[15px] text-white/60 transition hover:bg-white/10 hover:text-white'
                                                                : 'block rounded-md px-3 py-2 text-[15px] text-toss-grey600 transition hover:bg-toss-grey50 hover:text-toss-grey900'
                                                        }
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className={useDarkHeader ? 'mt-4 border-t border-white/10 pt-4' : 'mt-4 border-t border-toss-grey200 pt-4'}>
                            <AuthLinks auth={auth} mobile dark={useDarkHeader} />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
