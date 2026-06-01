import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';
import companyHistoryImage from '../../../images/company/01.png';
import companyOrganizationImage from '../../../images/company/02.png';

const companyImages = [
    {
        src: companyHistoryImage,
        alt: '보험CC 회사 연혁',
    },
    {
        src: companyOrganizationImage,
        alt: '보험CC 조직도',
    },
];

export default function Company({
    auth,
    title = '회사소개',
    description = '보험CC는 보험 상담, 보장 점검, 포인트 혜택을 더 쉽게 연결하는 온라인 보험 플랫폼입니다.',
}) {
    const isCompanyPage = title === '회사소개';

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

            {isCompanyPage ? (
                <section className="mx-auto max-w-5xl px-0 py-8 sm:px-6 lg:px-8">
                    <div className="space-y-8 bg-white">
                        {companyImages.map((image, index) => (
                            <img
                                key={image.alt}
                                src={image.src}
                                alt={image.alt}
                                className="block h-auto w-full"
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                        ))}
                    </div>

                    <div className="px-5 pt-8 sm:px-0">
                        <Link
                            href="/customer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-toss-blue"
                        >
                            고객센터로 이동
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </section>
            ) : (
                <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-toss-grey200 bg-white p-6">
                        <h2 className="text-base font-bold text-toss-grey900">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-toss-grey600">{description}</p>
                    </div>

                    <Link
                        href="/customer"
                        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-toss-blue"
                    >
                        고객센터로 이동
                        <ArrowRight className="size-4" />
                    </Link>
                </section>
            )}
        </PublicLayout>
    );
}
