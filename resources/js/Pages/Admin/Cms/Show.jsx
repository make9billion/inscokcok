import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

export default function Show({ content, typeOptions = [], fixedType = null, pageTitle = '콘텐츠 상세', backRouteName = 'admin.notices.index', updateRouteName = 'admin.notices.update' }) {
    const { flash } = usePage().props;
    const destroyRouteName = fixedType === 'faq' ? 'admin.faqs.destroy' : 'admin.notices.destroy';
    const form = useForm({
        type: content?.type ?? fixedType ?? 'notice',
        title: content?.title ?? '',
        body: content?.body ?? '',
        link_url: content?.linkUrl ?? '',
        sort_order: content?.sortOrder ?? 0,
        is_published: content?.isPublished ?? true,
    });
    const submit = (event) => {
        event.preventDefault();
        form.patch(route(updateRouteName, content.id), { preserveScroll: true });
    };
    const deleteContent = () => {
        if (window.confirm(`${content.title} 항목을 삭제할까요?`)) {
            router.delete(route(destroyRouteName, content.id));
        }
    };
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{pageTitle}</h2>}>
            <Head title={pageTitle} />
            <div className="py-8"><div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                <Link href={route(backRouteName)} className="inline-flex text-sm font-semibold text-gray-600 hover:text-gray-900">목록으로</Link>
                <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-700">{content.typeLabel}</p>
                            <h1 className="mt-2 text-2xl font-bold text-gray-900">{content.title}</h1>
                        </div>
                        <button type="button" onClick={deleteContent} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                            <Trash2 className="size-4" />
                            삭제
                        </button>
                    </div>
                    {flash?.success && <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                    <form onSubmit={submit} className="mt-6 grid gap-4">
                        <div className={fixedType ? 'grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]' : 'grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_140px]'}>
                            {!fixedType && <label className="grid gap-1 text-sm font-semibold text-gray-700">유형<select value={form.data.type} onChange={(event) => form.setData('type', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">{typeOptions.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>}
                            <label className="grid gap-1 text-sm font-semibold text-gray-700">제목<input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                            <label className="grid min-w-0 gap-1 text-sm font-semibold text-gray-700">정렬순서<input type="number" min="0" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} className="w-full min-w-0 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                        </div>
                        <label className="grid gap-1 text-sm font-semibold text-gray-700">본문<textarea rows="10" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                        <label className="grid gap-1 text-sm font-semibold text-gray-700">링크 URL<input value={form.data.link_url ?? ''} onChange={(event) => form.setData('link_url', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                        <div className="flex items-center justify-between"><label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.data.is_published} onChange={(event) => form.setData('is_published', event.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />게시</label><button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">저장</button></div>
                    </form>
                </section>
            </div></div>
        </AuthenticatedLayout>
    );
}
