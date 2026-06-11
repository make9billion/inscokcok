import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays } from 'lucide-react';

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

export default function EventShow({ auth, event }) {
    const banner = event.bannerImageUrl || fallbackBanners[event.slug];

    return (
        <PublicLayout auth={auth}>
            <Head title={`보험콕콕-${event.name}`} />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
                    <Link href={route('events.index')} className="inline-flex items-center gap-2 text-sm font-semibold text-toss-grey600">
                        <ArrowLeft className="size-4" strokeWidth={1.8} />
                        이벤트 목록
                    </Link>
                    <p className="mt-7 text-sm font-semibold text-toss-blue">Event Detail</p>
                    <h1 className="mt-3 text-3xl font-bold text-toss-grey900">{event.name}</h1>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-toss-grey600">
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays className="size-4" strokeWidth={1.8} />
                            {eventPeriod(event)}
                        </span>
                        <span className="rounded-full bg-toss-blueLight px-4 py-1.5 font-black text-toss-blue">
                            {formatNumber(event.pointAmount)}P
                        </span>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                {banner && (
                    <div className="mx-auto aspect-[5/2] max-w-[500px] overflow-hidden rounded-[24px] bg-toss-grey100">
                        <img src={banner} alt={event.name} className="h-full w-full object-cover" />
                    </div>
                )}

                <article
                    className="prose prose-slate mt-10 max-w-none rounded-[24px] border border-toss-grey200 bg-white p-8 leading-8"
                    dangerouslySetInnerHTML={{
                        __html:
                            event.detailContent ||
                            '<p>이벤트 상세 안내가 준비 중입니다. 자세한 내용은 고객센터를 통해 확인해주세요.</p>',
                    }}
                />
            </section>
        </PublicLayout>
    );
}
