import { Head, Link } from '@inertiajs/react';
import { Bell, ChevronRight, HelpCircle, Phone } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

export default function CustomerIndex({ auth, notices = [], faqs = [] }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="고객센터" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Customer Center</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">고객센터</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-toss-grey600">
                        공지사항, 자주 묻는 질문, 상담 안내를 한 곳에서 확인하세요.
                    </p>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
                <Link href="/customer/notices" className="rounded-lg border border-toss-grey200 bg-white p-6 transition hover:border-toss-grey500">
                    <Bell className="size-7 text-toss-grey800" strokeWidth={1.8} />
                    <h2 className="mt-5 text-lg font-bold text-toss-grey900">공지사항</h2>
                    <p className="mt-2 text-sm leading-6 text-toss-grey600">서비스 운영과 혜택 안내를 확인합니다.</p>
                </Link>
                <Link href="/customer/faq" className="rounded-lg border border-toss-grey200 bg-white p-6 transition hover:border-toss-grey500">
                    <HelpCircle className="size-7 text-toss-grey800" strokeWidth={1.8} />
                    <h2 className="mt-5 text-lg font-bold text-toss-grey900">자주 묻는 질문</h2>
                    <p className="mt-2 text-sm leading-6 text-toss-grey600">상담 전 궁금한 내용을 빠르게 확인합니다.</p>
                </Link>
                <Link href="/customer/company" className="rounded-lg border border-toss-grey200 bg-white p-6 transition hover:border-toss-grey500">
                    <Phone className="size-7 text-toss-grey800" strokeWidth={1.8} />
                    <h2 className="mt-5 text-lg font-bold text-toss-grey900">회사소개</h2>
                    <p className="mt-2 text-sm leading-6 text-toss-grey600">보험CC 운영 정보를 안내합니다.</p>
                </Link>
            </section>

            <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-toss-grey900">공지사항</h2>
                        <Link href="/customer/notices" className="inline-flex items-center gap-1 text-sm font-semibold text-toss-blue">
                            전체보기 <ChevronRight className="size-4" />
                        </Link>
                    </div>
                    <div className="mt-4 divide-y divide-toss-grey200 rounded-lg border border-toss-grey200 bg-white">
                        {notices.length ? notices.map((notice) => (
                            <Link key={notice.id} href={`/customer/notices/${notice.id}`} className="block px-5 py-4 transition hover:bg-toss-grey50">
                                <div className="text-sm font-semibold text-toss-grey900">{notice.title}</div>
                                <div className="mt-1 text-xs text-toss-grey500">{notice.publishedAt}</div>
                            </Link>
                        )) : (
                            <p className="px-5 py-8 text-sm text-toss-grey500">등록된 공지사항이 없습니다.</p>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-toss-grey900">자주 묻는 질문</h2>
                        <Link href="/customer/faq" className="inline-flex items-center gap-1 text-sm font-semibold text-toss-blue">
                            전체보기 <ChevronRight className="size-4" />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-3">
                        {faqs.length ? faqs.map((faq) => (
                            <article key={faq.id} className="rounded-lg border border-toss-grey200 bg-white p-5">
                                <h3 className="text-sm font-bold text-toss-grey900">{faq.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-toss-grey600">{faq.body}</p>
                            </article>
                        )) : (
                            <p className="rounded-lg border border-toss-grey200 bg-white px-5 py-8 text-sm text-toss-grey500">
                                등록된 FAQ가 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
