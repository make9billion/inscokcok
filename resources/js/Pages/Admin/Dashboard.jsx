import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

const cardMeta = [
    ['todayConsultations', '오늘 상담접수', '/admin/consultations'],
    ['openConsultations', '처리중 상담', '/admin/consultations'],
    ['assignedConsultations', '설계사 배정', '/admin/consultations?status=assigned'],
    ['completedConsultations', '상담완료', '/admin/consultations?status=completed'],
    ['pendingInquiries', '미처리 문의', '/admin/inquiries'],
    ['openQuestions', '답변대기 지식인', '/admin/knowledge'],
    ['pendingOrders', '결제대기 주문', '/admin/point-mall/orders?status=pending'],
    ['memberCount', '가입회원', '/admin/members'],
];

const roleTitle = {
    admin: '전체 운영 대시보드',
    planner: '설계사 대시보드',
};

function SummaryCard({ label, value, href }) {
    return (
        <Link href={href} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-3 text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        </Link>
    );
}

function QueueSection({ title, href, empty, children }) {
    return (
        <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                {href && <Link href={href} className="text-sm font-semibold text-blue-600 hover:text-blue-700">바로가기</Link>}
            </div>
            {children || <div className="px-5 py-10 text-sm text-gray-500">{empty}</div>}
        </section>
    );
}

export default function AdminDashboard({ role, summary = {}, statusBreakdown = [], workQueues = {} }) {
    const visibleCards = cardMeta.filter(([key]) => summary[key] !== 0 || ['todayConsultations', 'openConsultations', 'assignedConsultations', 'completedConsultations'].includes(key));

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">관리자 대시보드</h2>}>
            <Head title="관리자 대시보드" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="border-b border-gray-200 pb-6">
                        <p className="text-sm font-semibold text-blue-600">Admin Dashboard</p>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900">{roleTitle[role] ?? '관리자 대시보드'}</h1>
                        <p className="mt-2 text-sm leading-6 text-gray-600">오늘 들어온 업무와 처리가 필요한 항목을 한 화면에서 확인합니다.</p>
                    </section>

                    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {visibleCards.map(([key, label, href]) => (
                            <SummaryCard key={key} label={label} value={summary[key]} href={href} />
                        ))}
                    </section>

                    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <h2 className="text-base font-semibold text-gray-900">상담 상태 현황</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
                            {statusBreakdown.map((status) => (
                                <Link key={status.value} href={`/admin/consultations?status=${status.value}`} className="rounded-md border border-gray-200 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50">
                                    <p className="text-xs font-semibold text-gray-500">{status.label}</p>
                                    <p className="mt-2 text-xl font-bold text-gray-900">{formatNumber(status.count)}</p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <QueueSection title="처리중 상담" href="/admin/consultations" empty="처리중 상담이 없습니다.">
                            {workQueues.consultations?.length > 0 && (
                                <div className="divide-y divide-gray-100">
                                    {workQueues.consultations.map((consultation) => (
                                        <Link key={consultation.id} href={route('admin.consultations.show', consultation.id)} className="block px-5 py-4 transition hover:bg-gray-50">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-semibold text-gray-900">{consultation.applicantName}</p>
                                                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{consultation.statusLabel}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">{consultation.phone} · {consultation.interestedProduct ?? '보험점검'}</p>
                                            <p className="mt-1 text-xs text-gray-400">{consultation.createdAt} · {consultation.assignedPlannerName ?? '미배정'}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </QueueSection>

                        <QueueSection title="답변대기 지식인" href="/admin/knowledge" empty="답변대기 질문이 없습니다.">
                            {workQueues.questions?.length > 0 && (
                                <div className="divide-y divide-gray-100">
                                    {workQueues.questions.map((question) => (
                                        <Link key={question.id} href="/admin/knowledge" className="block px-5 py-4 transition hover:bg-gray-50">
                                            <p className="line-clamp-1 font-semibold text-gray-900">{question.title}</p>
                                            <p className="mt-1 text-sm text-gray-500">{question.authorName ?? '회원'} · {question.createdAt}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </QueueSection>

                        <QueueSection title="미처리 문의" href="/admin/inquiries" empty="미처리 문의가 없습니다.">
                            {workQueues.inquiries?.length > 0 && (
                                <div className="divide-y divide-gray-100">
                                    {workQueues.inquiries.map((inquiry) => (
                                        <Link key={inquiry.id} href="/admin/inquiries" className="block px-5 py-4 transition hover:bg-gray-50">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="line-clamp-1 font-semibold text-gray-900">{inquiry.title}</p>
                                                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{inquiry.status}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">{inquiry.category} · {inquiry.createdAt}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </QueueSection>

                        <QueueSection title="결제대기 주문" href="/admin/point-mall/orders?status=pending" empty="결제대기 주문이 없습니다.">
                            {workQueues.orders?.length > 0 && (
                                <div className="divide-y divide-gray-100">
                                    {workQueues.orders.map((order) => (
                                        <Link key={order.id} href="/admin/point-mall/orders?status=pending" className="block px-5 py-4 transition hover:bg-gray-50">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                                                <p className="text-sm font-bold text-gray-900">{formatNumber(order.cashPaymentAmount)}원</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">{order.memberName ?? '회원'} · {formatNumber(order.totalPoints)}P · {order.createdAt}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </QueueSection>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
