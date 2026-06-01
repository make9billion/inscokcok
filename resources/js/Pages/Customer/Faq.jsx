import { Head } from '@inertiajs/react';

import PublicLayout from '@/Layouts/PublicLayout';

export default function Faq({ auth, faqs = [] }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="자주 묻는 질문" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">FAQ</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">자주 묻는 질문</h1>
                    <p className="mt-3 text-sm leading-6 text-toss-grey600">
                        상담 신청, 포인트, 포인트몰 이용과 관련된 내용을 정리했습니다.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    {faqs.length ? faqs.map((faq) => (
                        <article key={faq.id} className="rounded-lg border border-toss-grey200 bg-white p-6">
                            <h2 className="text-base font-bold text-toss-grey900">{faq.title}</h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-toss-grey600">{faq.body}</p>
                        </article>
                    )) : (
                        <p className="rounded-lg border border-toss-grey200 bg-white px-5 py-10 text-sm text-toss-grey500">
                            등록된 FAQ가 없습니다.
                        </p>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
