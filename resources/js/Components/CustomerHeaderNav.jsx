import { Link, usePage } from '@inertiajs/react';

const customerLinks = [
    { label: '공지사항', href: '/customer/notices' },
    { label: 'FAQ', href: '/customer/faq' },
    { label: '문의하기', href: '/customer/inquiries' },
    { label: '회사소개', href: '/customer/company' },
    { label: '제휴문의', href: '/partnership' },
];

export default function CustomerHeaderNav({ dark = false }) {
    const { url } = usePage();

    return (
        <nav className="mt-8 flex flex-wrap gap-3" aria-label="고객센터 하위 메뉴">
            {customerLinks.map((link) => {
                const isActive = url.startsWith(link.href);

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={
                            dark
                                ? `rounded-full px-5 py-3 text-sm font-black transition ${
                                      isActive
                                          ? 'bg-[#f47b20] text-white'
                                          : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                                  }`
                                : `rounded-full px-5 py-3 text-sm font-black transition ${
                                      isActive
                                          ? 'bg-[#12284a] text-white'
                                          : 'bg-white text-toss-grey700 ring-1 ring-toss-grey200 hover:bg-toss-grey100 hover:text-toss-grey900'
                                  }`
                        }
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
