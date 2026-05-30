import { Head, Link } from '@inertiajs/react';

import PublicLayout from '@/Layouts/PublicLayout';

const panels = [
    {
        title: '상담신청',
        description: '필요한 보장과 예산을 기준으로 상담을 시작합니다.',
        href: '/services',
    },
    {
        title: '보험점검',
        description: '가입한 보험의 중복과 빈틈을 차분하게 확인합니다.',
        href: '/insurance-checkup',
    },
    {
        title: '포인트몰',
        description: '상담과 활동으로 쌓은 포인트를 확인합니다.',
        href: '/point-mall',
    },
];

export default function Welcome({ auth }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="보흠CC" />

            <section className="bg-toss-grey50">
                <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center gap-8 px-5 py-16 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-toss-blue">보험을 더 명확하게</p>
                        <h1 className="mt-3 text-3xl font-bold leading-tight text-toss-grey900 sm:text-4xl">
                            보흠CC에서 상담, 점검, 혜택을 한 화면에서 시작하세요.
                        </h1>
                        <p className="mt-4 text-base leading-7 text-toss-grey600">
                            복잡한 설명보다 필요한 다음 행동을 먼저 보여주는 보험 플랫폼입니다.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {panels.map((panel) => (
                            <Link
                                key={panel.href}
                                href={panel.href}
                                className="rounded-lg border border-toss-grey200 bg-white p-5 transition hover:border-toss-grey500 focus:outline-none focus-visible:ring-2 focus-visible:ring-toss-blue"
                            >
                                <h2 className="text-lg font-semibold text-toss-grey900">{panel.title}</h2>
                                <p className="mt-2 text-sm leading-6 text-toss-grey600">{panel.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
