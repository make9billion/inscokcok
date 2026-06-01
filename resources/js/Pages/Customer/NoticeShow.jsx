import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

export default function NoticeShow({ auth, notice }) {
    return (
        <PublicLayout auth={auth}>
            <Head title={notice.title} />

            <article className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
                <Link href="/customer/notices" className="inline-flex items-center gap-2 text-sm font-semibold text-toss-grey700 hover:text-toss-grey900">
                    <ArrowLeft className="size-4" />
                    공지사항 목록
                </Link>

                <header className="mt-8 border-b border-toss-grey200 pb-8">
                    <p className="text-sm font-semibold text-toss-blue">Notice</p>
                    <h1 className="mt-3 text-3xl font-bold leading-tight text-toss-grey900">{notice.title}</h1>
                    <p className="mt-3 text-sm text-toss-grey500">{notice.publishedAt}</p>
                </header>

                <div className="whitespace-pre-line py-8 text-base leading-8 text-toss-grey700">
                    {notice.body}
                </div>
            </article>
        </PublicLayout>
    );
}
