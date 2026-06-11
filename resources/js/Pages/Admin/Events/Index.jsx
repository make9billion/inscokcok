import ProductDescriptionEditor from '@/Components/Admin/ProductDescriptionEditor';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ChevronDown, ImagePlus, Plus, Save } from 'lucide-react';
import { useState } from 'react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function FieldError({ message }) {
    if (!message) return null;

    return <p className="mt-1 text-xs font-semibold text-red-600">{message}</p>;
}

function EventFormFields({ form, event = null }) {
    return (
        <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
            <section className="grid content-start gap-5">
                <div className="rounded-xl border border-gray-200 p-5">
                    <h3 className="text-base font-black text-gray-950">이벤트 기본 설정</h3>
                    <p className="mt-1 text-sm text-gray-500">노출 상태, 메인 노출 여부, 포인트 표시값을 관리합니다.</p>

                    <label className="mt-5 block">
                        <span className="text-xs font-bold text-gray-600">이벤트명</span>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(inputEvent) => form.setData('name', inputEvent.target.value)}
                            className="mt-1 w-full rounded-lg border-gray-300 text-sm font-semibold focus:border-blue-500 focus:ring-blue-500"
                        />
                        <FieldError message={form.errors.name} />
                    </label>

                    <label className="mt-4 block">
                        <span className="text-xs font-bold text-gray-600">표시 포인트</span>
                        <input
                            type="number"
                            min="0"
                            max="1000000"
                            value={form.data.point_amount}
                            onChange={(inputEvent) => form.setData('point_amount', inputEvent.target.value)}
                            className="mt-1 w-full rounded-lg border-gray-300 text-sm font-semibold focus:border-blue-500 focus:ring-blue-500"
                        />
                        {event && <span className="mt-1 block text-xs text-gray-400">현재 {formatNumber(event.pointAmount)}P</span>}
                        <FieldError message={form.errors.point_amount} />
                    </label>

                    <div className="mt-5 grid gap-3">
                        <label className="inline-flex items-center gap-3 text-sm font-bold text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(inputEvent) => form.setData('is_active', inputEvent.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            이벤트 페이지 노출
                        </label>

                        <label className="inline-flex items-center gap-3 text-sm font-bold text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.data.show_on_home}
                                onChange={(inputEvent) => form.setData('show_on_home', inputEvent.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            메인페이지 EVENT 섹션 노출
                        </label>
                        <FieldError message={form.errors.show_on_home} />
                        <p className="text-xs leading-5 text-gray-500">메인페이지에는 체크된 이벤트 중 최대 2개만 노출됩니다.</p>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-5">
                    <h3 className="text-base font-black text-gray-950">배너 이미지</h3>
                    <p className="mt-1 text-sm text-gray-500">500x200 JPG, PNG 이미지를 등록하세요.</p>

                    <div className="mt-4 aspect-[5/2] overflow-hidden rounded-xl bg-gray-100">
                        {event?.bannerImageUrl ? (
                            <img src={event.bannerImageUrl} alt={event.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm font-semibold text-gray-400">
                                등록된 배너가 없습니다.
                            </div>
                        )}
                    </div>

                    <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                        <ImagePlus className="size-4" />
                        배너 이미지 선택
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(inputEvent) => form.setData('banner_image', inputEvent.target.files?.[0] ?? null)}
                            className="sr-only"
                        />
                    </label>
                    {form.data.banner_image && (
                        <p className="mt-2 text-xs font-semibold text-blue-600">{form.data.banner_image.name}</p>
                    )}
                    <FieldError message={form.errors.banner_image} />
                </div>
            </section>

            <section className="grid content-start gap-4">
                <div>
                    <h3 className="text-base font-black text-gray-950">이벤트 상세 안내</h3>
                    <p className="mt-1 text-sm text-gray-500">상세 안내 페이지에 표시될 내용을 작성합니다.</p>
                </div>

                <ProductDescriptionEditor
                    value={form.data.detail_content}
                    onChange={(value) => form.setData('detail_content', value)}
                    uploadRouteName="admin.events.detail-images.store"
                />
                <FieldError message={form.errors.detail_content} />
            </section>
        </div>
    );
}

function CreateEventPanel() {
    const [open, setOpen] = useState(false);
    const form = useForm({
        name: '',
        point_amount: 0,
        is_active: true,
        show_on_home: false,
        banner_image: null,
        detail_content: '',
    });

    const submit = (submitEvent) => {
        submitEvent.preventDefault();
        form.post(route('admin.events.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <section className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
                <span>
                    <span className="inline-flex items-center gap-2 text-lg font-black text-gray-950">
                        <Plus className="size-5" />
                        이벤트 추가
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">추가 이벤트는 자동 적립 없이 배너와 상세 안내로만 운영됩니다.</span>
                </span>
                <ChevronDown className={`size-5 text-gray-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <form onSubmit={submit} className="border-t border-gray-100">
                    <EventFormFields form={form} />
                    <div className="flex justify-end border-t border-gray-100 px-6 py-4">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            <Plus className="size-4" />
                            이벤트 추가
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}

function EventAccordion({ event }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        _method: 'patch',
        name: event.name,
        point_amount: event.pointAmount,
        is_active: event.isActive,
        show_on_home: event.showOnHome,
        banner_image: null,
        detail_content: event.detailContent || '',
    });

    const submit = (submitEvent) => {
        submitEvent.preventDefault();
        form.post(route('admin.events.update', event.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.setData('banner_image', null),
        });
    };

    return (
        <section className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-gray-50"
            >
                <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                        <strong className="text-lg font-black text-gray-950">{event.name}</strong>
                        {event.isAutomatic && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">자동적립</span>
                        )}
                        {event.showOnHome && (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">메인노출</span>
                        )}
                        {!event.isActive && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">숨김</span>
                        )}
                    </span>
                </span>
                <ChevronDown className={`size-5 shrink-0 text-gray-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <form onSubmit={submit} className="border-t border-gray-100">
                    <EventFormFields form={form} event={event} />
                    <div className="flex justify-end border-t border-gray-100 px-6 py-4">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-60"
                        >
                            <Save className="size-4" />
                            저장
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}

export default function Index({ events }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">이벤트 관리</h2>}>
            <Head title="이벤트 관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-gray-950">이벤트 관리</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            자동 적립 이벤트와 운영 이벤트의 포인트, 배너, 상세 안내, 메인 노출 여부를 관리합니다.
                        </p>
                    </div>

                    <div className="grid gap-5">
                        <CreateEventPanel />
                        {events.map((event) => (
                            <EventAccordion key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
