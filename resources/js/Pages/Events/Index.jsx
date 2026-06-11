import { Head, Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';

import PublicLayout from '@/Layouts/PublicLayout';
import eventBannerOne from '../../../images/events/event-banner-1.jpg';
import eventBannerTwo from '../../../images/events/event-banner-2.jpg';

const fallbackBanners = {
    signup_bonus: eventBannerOne,
    consultation_completed_bonus: eventBannerTwo,
};

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
                        회원가입, 보험점검 참여 등 받을 수 있는 포인트 혜택을 확인하세요.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                {events.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {events.map((event) => {
                            const banner = event.bannerImageUrl || fallbackBanners[event.slug];

                            return (
                                <Link
                                    key={event.id}
                                    href={route('events.show', event.slug)}
                                    className="group overflow-hidden rounded-[24px] border border-toss-grey200 bg-white transition hover:-translate-y-1 hover:border-toss-blue/30"
                                >
                                    <div className="aspect-[5/2] bg-toss-grey100">
                                        {banner && (
                                            <img
                                                src={banner}
                                                alt={event.name}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-4 p-5">
                                        <div>
                                            <h2 className="text-lg font-bold text-toss-grey900">{event.name}</h2>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-toss-grey600">
                                                <CalendarDays className="size-4" strokeWidth={1.8} />
                                                {eventPeriod(event)}
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-toss-blueLight px-4 py-2 text-sm font-black text-toss-blue">
                                            {formatNumber(event.pointAmount)}P
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-lg border border-toss-grey200 bg-white px-5 py-12 text-center">
                        <h2 className="text-lg font-bold text-toss-grey900">진행 중인 이벤트가 없습니다.</h2>
                        <p className="mt-2 text-sm text-toss-grey600">새 이벤트가 시작되면 이 페이지에서 안내해드릴게요.</p>
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
