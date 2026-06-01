import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Gift } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function eventPeriod(event) {
    if (event.startsAt && event.endsAt) return `${event.startsAt} - ${event.endsAt}`;
    if (event.startsAt) return `${event.startsAt}부터`;
    if (event.endsAt) return `${event.endsAt}까지`;
    return '상시 진행';
}

export default function EventIndex({ auth, events = [] }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="이벤트" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
                    <p className="text-sm font-semibold text-toss-blue">Event</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">진행 중인 이벤트</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-toss-grey600">
                        상담, 회원가입, 보험점검 참여로 받을 수 있는 포인트 혜택을 확인하세요.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                {events.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {events.map((event) => (
                            <article key={event.id} className="rounded-lg border border-toss-grey200 bg-white p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-toss-blueLight text-toss-blue">
                                        <Gift className="size-5" strokeWidth={1.8} />
                                    </span>
                                    <span className="rounded-lg bg-toss-grey100 px-3 py-1 text-sm font-bold tabular-nums text-toss-grey800">
                                        {formatNumber(event.pointAmount)}P
                                    </span>
                                </div>
                                <h2 className="mt-5 text-lg font-bold text-toss-grey900">{event.name}</h2>
                                <div className="mt-3 flex items-center gap-2 text-sm text-toss-grey600">
                                    <CalendarDays className="size-4" strokeWidth={1.8} />
                                    {eventPeriod(event)}
                                </div>
                                <p className="mt-2 text-xs text-toss-grey500">{event.triggerType}</p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-toss-grey200 bg-white px-5 py-12 text-center">
                        <h2 className="text-lg font-bold text-toss-grey900">진행 중인 이벤트가 없습니다.</h2>
                        <p className="mt-2 text-sm text-toss-grey600">새 이벤트가 시작되면 이 페이지에서 안내해드릴게요.</p>
                    </div>
                )}

                <Link href="/insurance-checkup" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-toss-blue">
                    보험점검 신청하기
                    <ArrowRight className="size-4" strokeWidth={1.8} />
                </Link>
            </section>
        </PublicLayout>
    );
}
