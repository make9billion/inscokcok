import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

function ContentForm({ content = null, typeOptions }) {
    const form = useForm({
        type: content?.type ?? 'notice',
        title: content?.title ?? '',
        body: content?.body ?? '',
        link_url: content?.linkUrl ?? '',
        sort_order: content?.sortOrder ?? 0,
        is_published: content?.isPublished ?? true,
    });

    const submit = (event) => {
        event.preventDefault();

        if (content) {
            form.patch(route('admin.cms.update', content.id), { preserveScroll: true });
            return;
        }

        form.post(route('admin.cms.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('title', 'body', 'link_url', 'sort_order'),
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-[160px_1fr_120px]">
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    유형
                    <select value={form.data.type} onChange={(event) => form.setData('type', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                        {typeOptions.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    제목
                    <input type="text" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                    정렬
                    <input type="number" min="0" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                </label>
            </div>
            <label className="grid gap-1 text-xs font-semibold text-gray-600">
                본문
                <textarea value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} rows={content ? 3 : 4} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-gray-600">
                링크 URL
                <input type="text" value={form.data.link_url} onChange={(event) => form.setData('link_url', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input type="checkbox" checked={form.data.is_published} onChange={(event) => form.setData('is_published', event.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    게시
                </label>
                <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                    {content ? '저장' : '추가'}
                </button>
            </div>
        </form>
    );
}

export default function Index({ contents, typeOptions }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">CMS 관리</h2>}>
            <Head title="CMS 관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">콘텐츠 추가</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            공지사항, FAQ, 메인 배너, 회사소개, 이벤트 안내 문구를 관리합니다.
                        </p>
                        {flash?.success && (
                            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>
                        )}
                        <div className="mt-5">
                            <ContentForm typeOptions={typeOptions} />
                        </div>
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">콘텐츠 목록</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {contents.map((content) => (
                                <div key={content.id} className="grid gap-4 px-5 py-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{content.typeLabel}</span>
                                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                                            {content.isPublished ? '게시중' : '숨김'}
                                        </span>
                                        {content.publishedAt && (
                                            <span className="text-xs text-gray-400">{content.publishedAt}</span>
                                        )}
                                    </div>
                                    <ContentForm content={content} typeOptions={typeOptions} />
                                </div>
                            ))}
                        </div>
                        {contents.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">등록된 콘텐츠가 없습니다.</div>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
