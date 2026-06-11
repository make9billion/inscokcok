import { Head } from '@inertiajs/react';

import PublicLayout from '@/Layouts/PublicLayout';

const guideSections = [
    {
        title: '1. 포인트몰 이용 대상',
        body: '포인트몰은 보험콕콕 회원이 보유 포인트를 사용하여 사은품 또는 제휴 상품을 신청할 수 있는 서비스입니다. 일부 상품은 재고, 배송 가능 지역, 이벤트 조건에 따라 이용이 제한될 수 있습니다.',
    },
    {
        title: '2. 포인트 적립',
        body: '포인트는 회원가입, 상담 신청, 이벤트 참여, 회사가 정한 프로모션 조건 충족 시 적립될 수 있습니다. 적립 기준, 지급 시점, 지급 한도는 이벤트 또는 서비스 정책에 따라 달라질 수 있습니다.',
    },
    {
        title: '3. 포인트 사용',
        body: '회원은 보유 포인트 범위 내에서 포인트몰 상품을 신청할 수 있습니다. 포인트가 부족한 경우 회사가 제공하는 결제 수단을 통해 부족 금액을 결제할 수 있도록 기능을 제공할 수 있으며, 실제 결제 연동 전에는 해당 기능이 제한될 수 있습니다.',
    },
    {
        title: '4. 배송 안내',
        body: '상품별로 무료배송 또는 유료배송이 적용될 수 있습니다. 유료배송 상품은 주문 화면에서 배송비가 별도로 표시되며, 배송지 정보가 정확하지 않아 발생하는 배송 지연 또는 반송은 회원에게 책임이 있을 수 있습니다.',
    },
    {
        title: '5. 주문 취소 및 변경',
        body: '주문 접수 후 배송 준비 전까지는 취소 또는 변경을 요청할 수 있습니다. 배송 준비가 시작된 이후에는 상품 특성, 제휴사 정책, 배송 상태에 따라 취소 또는 변경이 제한될 수 있습니다.',
    },
    {
        title: '6. 교환 및 반품',
        body: '상품 하자 또는 오배송의 경우 확인 후 교환 또는 재발송을 진행합니다. 단순 변심에 따른 교환 및 반품은 상품 특성, 포장 훼손 여부, 배송 상태에 따라 제한될 수 있으며 왕복 배송비가 발생할 수 있습니다.',
    },
    {
        title: '7. 포인트 환급 및 소멸',
        body: '주문 취소가 승인된 경우 사용한 포인트는 원칙적으로 회원 계정으로 반환됩니다. 부정 적립, 중복 지급, 시스템 오류로 지급된 포인트는 회수될 수 있습니다. 포인트 유효기간과 소멸 기준은 별도 정책 또는 이벤트 안내에 따릅니다.',
    },
    {
        title: '8. 유의사항',
        body: '상품 이미지는 이해를 돕기 위한 예시이며 실제 상품과 다를 수 있습니다. 회사는 재고 부족, 제휴사 사정, 단종 등의 사유로 동일 가치의 대체 상품을 안내하거나 주문을 취소할 수 있습니다.',
    },
];

export default function PointMallGuide({ auth }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="포인트몰 이용안내" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Point Mall Guide</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">포인트몰 이용안내</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-toss-grey600">
                        보험콕콕 포인트 적립, 사용, 배송, 취소 및 교환 기준을 안내합니다.
                    </p>
                    <p className="mt-2 text-xs text-toss-grey500">시행일: 2026년 6월 8일</p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-toss-grey200 bg-white p-6 shadow-sm">
                    <p className="text-sm leading-6 text-toss-grey600">
                        본 안내는 포인트몰 운영을 위한 기본안입니다. 실제 상품 공급사, 배송사, 결제 연동, 포인트 유효기간이 확정되면
                        세부 기준을 업데이트해야 합니다.
                    </p>
                    <div className="mt-8 divide-y divide-toss-grey200">
                        {guideSections.map((section) => (
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
