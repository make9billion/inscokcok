import { Head, Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

export default function Notices({ auth, notices = [] }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="공지사항" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Notice</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">공지사항</h1>
                    <p className="mt-3 text-sm leading-6 text-toss-grey600">
                        보험CC 서비스 운영과 혜택 안내를 확인하세요.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                <div className="divide-y divide-toss-grey200 rounded-lg border border-toss-grey200 bg-white">
                    {notices.length ? notices.map((notice) => (
                        <Link
                            key={notice.id}
                            href={`/customer/notices/${notice.id}`}
                            className="flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-toss-grey50"
                        >
                            <span>
                                <span className="block text-base font-semibold text-toss-grey900">{notice.title}</span>
                                <span className="mt-1 block text-xs text-toss-grey500">{notice.publishedAt}</span>
                            </span>
                            <ChevronRight className="size-5 shrink-0 text-toss-grey500" />
                        </Link>
                    )) : (
                        <p className="px-5 py-10 text-sm text-toss-grey500">등록된 공지사항이 없습니다.</p>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
