export const insuranceProductLinks = [
    { label: '암보험', href: '/insurance/cancer' },
    { label: '치매/간병보험', href: '/insurance/dementia-care' },
    { label: '질병/상해보험', href: '/insurance/disease-accident' },
    { label: '치아보험', href: '/insurance/dental' },
    { label: '펫보험', href: '/insurance/pet' },
    { label: '어린이보험', href: '/insurance/child' },
];

export const customerCenterLinks = [
    { label: '공지사항', href: '/customer/notices' },
    { label: 'FAQ', href: '/customer/faq' },
    { label: '문의하기', href: '/customer/inquiries' },
    { label: '회사소개', href: '/customer/company' },
];

export const primaryNavigation = [
    { label: '서비스안내', href: '/services' },
    {
        label: '보험상품',
        href: '/insurance',
        children: insuranceProductLinks,
    },
    { label: '보험점검', href: '/insurance-checkup' },
    { label: '보험지식인', href: '/knowledge' },
    { label: '이벤트', href: '/events' },
    { label: '포인트몰', href: '/point-mall' },
    {
        label: '고객센터',
        href: '/customer',
        children: customerCenterLinks,
    },
];
