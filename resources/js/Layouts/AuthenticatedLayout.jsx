import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const adminLinks = [
    ['대시보드', 'dashboard', ['admin', 'planner']],
    ['상담관리', 'admin.consultations.index', ['admin', 'planner']],
    ['관리자관리', 'admin.accounts.index', ['admin']],
    ['회원관리', 'admin.members.index', ['admin']],
    ['문의하기', 'admin.inquiries.index', ['admin']],
    ['제휴문의', 'admin.partnership-inquiries.index', ['admin']],
    ['FAQ', 'admin.faqs.index', ['admin']],
    ['공지사항', 'admin.notices.index', ['admin']],
    ['이벤트관리', 'admin.events.index', ['admin']],
    ['지식인관리', 'admin.knowledge.index', ['admin', 'planner']],
    ['주문관리', 'admin.point-mall.orders.index', ['admin']],
    ['상품관리', 'admin.point-mall.products.index', ['admin']],
];

function allowedLinks(user) {
    return adminLinks.filter(([, , roles]) => roles.includes(user?.role));
}

function roleLabel(user) {
    if (user?.role === 'admin') {
        return '전체권한';
    }

    if (user?.role === 'planner') {
        return '설계사권한';
    }

    return '회원';
}

function isActive(routeName) {
    if (route().current(routeName)) {
        return true;
    }

    if (routeName.includes('.')) {
        return route().current(`${routeName.replace(/\.index$/, '')}.*`);
    }

    return false;
}

function AdminSidebar({ user, className = '' }) {
    const visibleAdminLinks = allowedLinks(user);

    return (
        <aside className={`border-r border-gray-200 bg-white ${className}`}>
            <div className="flex h-16 items-center border-b border-gray-100 px-5">
                <Link href="/" className="inline-flex items-center">
                    <ApplicationLogo variant="admin" className="block h-10 max-w-36 object-contain" />
                </Link>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4" aria-label="관리자 메뉴">
                {visibleAdminLinks.map(([label, routeName]) => {
                    const active = isActive(routeName);

                    return (
                        <Link
                            key={routeName}
                            href={route(routeName)}
                            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                                active
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const hasAdminShell = user?.canAccessAdmin;
    const dashboardLabel = hasAdminShell ? '대시보드' : '마이페이지';

    return (
        <div className="min-h-screen bg-gray-100">
            <div className={hasAdminShell ? 'lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]' : ''}>
                {hasAdminShell && <AdminSidebar user={user} className="hidden lg:block" />}

                <div className="min-w-0">
                    <nav className="border-b border-gray-100 bg-white">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    {hasAdminShell ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                                            aria-label="관리자 메뉴 열기"
                                        >
                                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                                <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                                <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <Link href="/">
                                            <ApplicationLogo className="block h-8 max-w-32 object-contain" />
                                        </Link>
                                    )}

                                    {!hasAdminShell && (
                                        <Link
                                            href={route('dashboard')}
                                            className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                                route().current('dashboard') ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {dashboardLabel}
                                        </Link>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 sm:inline-flex">
                                        {roleLabel(user)}
                                    </span>

                                    <div className="relative ms-3">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition hover:text-gray-700 focus:outline-none"
                                                    >
                                                        {user.name}
                                                        <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                <Dropdown.Link href={route('profile.edit')}>프로필 관리</Dropdown.Link>
                                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                                    로그아웃
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {hasAdminShell && showingNavigationDropdown && (
                            <div className="border-t border-gray-100 lg:hidden">
                                <AdminSidebar user={user} className="border-r-0" />
                            </div>
                        )}
                    </nav>

                    {header && (
                        <header className="bg-white shadow">
                            <div className="px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}

                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
