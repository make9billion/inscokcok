import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

export default function Company({ auth, title = '회사소개', description = '보험CC는 보험 상담과 보장 점검을 더 쉽게 연결하는 온라인 보험 플랫폼입니다.' }) {
    return (
        <PublicLayout auth={auth}>
            <Head title={title} />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">About</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">{title}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-toss-grey600">{description}</p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-4 sm:grid-cols-3">
                    {['상담 신청', '보장 점검', '포인트 혜택'].map((item) => (
                        <div key={item} className="rounded-lg border border-toss-grey200 bg-white p-6">
                            <h2 className="text-base font-bold text-toss-grey900">{item}</h2>
                            <p className="mt-2 text-sm leading-6 text-toss-grey600">
                                고객이 필요한 내용을 빠르게 확인하고 다음 행동으로 이어갈 수 있게 구성합니다.
                            </p>
                        </div>
                    ))}
                </div>

                <Link href="/customer" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-toss-blue">
                    고객센터로 이동
                    <ArrowRight className="size-4" />
                </Link>
            </section>
        </PublicLayout>
    );
}
