import { Head } from '@inertiajs/react';

import PublicLayout from '@/Layouts/PublicLayout';

const policySections = [
    {
        title: '수집하는 개인정보 항목',
        body: '보험 상담, 문의 응대, 이벤트 참여, 포인트몰 이용 과정에서 이름, 연락처, 이메일, 생년월일, 상담 희망 상품, 배송지 등 서비스 제공에 필요한 정보를 수집할 수 있습니다.',
    },
    {
        title: '개인정보 이용 목적',
        body: '상담 접수와 안내, 본인 확인, 문의 처리, 이벤트 및 사은품 배송, 포인트 적립과 사용, 서비스 품질 개선을 위해 개인정보를 이용합니다.',
    },
    {
        title: '보관 및 파기',
        body: '개인정보는 수집 목적 달성 후 관련 법령에 따른 보관 기간이 지나면 지체 없이 파기합니다. 단, 관계 법령상 보존이 필요한 정보는 해당 기간 동안 별도 보관합니다.',
    },
    {
        title: '제3자 제공 및 처리위탁',
        body: '보험 상담 진행, 사은품 배송, 시스템 운영 등 서비스 제공에 필요한 범위에서 제휴사 또는 위탁사에 개인정보가 제공될 수 있으며, 제공 항목과 목적은 이용자에게 고지하고 동의를 받습니다.',
    },
    {
        title: '이용자의 권리',
        body: '이용자는 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 관련 요청은 고객센터 또는 문의하기를 통해 접수할 수 있습니다.',
    },
];

export default function PrivacyPolicy({ auth }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="개인정보처리방침" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Privacy Policy</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">개인정보처리방침</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-toss-grey600">
                        보험CC는 이용자의 개인정보를 안전하게 보호하기 위해 필요한 기준과 절차를 정하고 있습니다.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-toss-grey200 bg-white p-6 shadow-sm">
                    <p className="text-sm leading-6 text-toss-grey600">
                        이 개인정보처리방침은 운영 정책 확정 전 기본안입니다. 실제 배포 전에는 법무 검토와 실제 개인정보 처리 흐름에 맞춘
                        보완이 필요합니다.
                    </p>
                    <div className="mt-8 divide-y divide-toss-grey200">
                        {policySections.map((section) => (
                            <article key={section.title} className="py-6 first:pt-0 last:pb-0">
                                <h2 className="text-lg font-bold text-toss-grey900">{section.title}</h2>
                                <p className="mt-3 text-sm leading-7 text-toss-grey600">{section.body}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
