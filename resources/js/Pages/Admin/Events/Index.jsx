import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function EventRow({ event }) {
    const form = useForm({
        point_amount: event.pointAmount,
        is_active: event.isActive,
    });

    const submit = (submitEvent) => {
        submitEvent.preventDefault();
        form.patch(route('admin.events.update', event.id), {
            preserveScroll: true,
        });
    };

    return (
        <form
            onSubmit={submit}
            className="grid gap-4 border-b border-gray-100 px-5 py-5 last:border-b-0 lg:grid-cols-[1fr_180px_140px_100px] lg:items-center"
        >
            <div>
                <h3 className="text-base font-semibold text-gray-900">{event.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{event.slug}</p>
                <p className="mt-1 text-xs text-gray-400">{event.triggerType}</p>
            </div>

            <label className="block">
                <span className="text-xs font-semibold text-gray-500">포인트</span>
                <input
                    type="number"
                    min="0"
                    max="1000000"
                    value={form.data.point_amount}
                    onChange={(inputEvent) => form.setData('point_amount', inputEvent.target.value)}
                    className="mt-1 w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="mt-1 block text-xs text-gray-400">현재 {formatNumber(event.pointAmount)}P</span>
            </label>

            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(inputEvent) => form.setData('is_active', inputEvent.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                활성화
            </label>

            <button
                type="submit"
                disabled={form.processing}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
                저장
            </button>
        </form>
    );
}

export default function Index({ events }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">이벤트 관리</h2>}
        >
            <Head title="이벤트 관리" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                            {flash.success}
                        </div>
                    )}

                    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h1 className="text-lg font-bold text-gray-900">포인트 이벤트 설정</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                회원가입, 상담완료 등 자동 적립 이벤트의 포인트와 활성 여부를 관리합니다.
                            </p>
                        </div>

                        {events.map((event) => (
                            <EventRow key={event.id} event={event} />
                        ))}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
