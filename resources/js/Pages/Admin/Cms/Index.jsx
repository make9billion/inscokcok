import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function ContentForm({ fixedType = null, typeOptions, storeRouteName }) {
    const form = useForm({ type: fixedType ?? 'notice', title: '', body: '', link_url: '', sort_order: 0, is_published: true });
    const submit = (event) => {
        event.preventDefault();
        form.post(route(storeRouteName), { preserveScroll: true, onSuccess: () => form.reset('title', 'body', 'link_url', 'sort_order') });
    };
    return (
        <form onSubmit={submit} className="grid gap-3">
            <div className={fixedType ? 'grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]' : 'grid gap-3 md:grid-cols-[160px_minmax(0,1fr)_120px]'}>
                {!fixedType && <label className="grid gap-1 text-xs font-semibold text-gray-600">유형<select value={form.data.type} onChange={(event) => form.setData('type', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">{typeOptions.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>}
                <label className="grid gap-1 text-xs font-semibold text-gray-600">제목<input type="text" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                <label className="grid min-w-0 gap-1 text-xs font-semibold text-gray-600">정렬순서<input type="number" min="0" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} className="w-full min-w-0 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
            </div>
            <label className="grid gap-1 text-xs font-semibold text-gray-600">본문<textarea value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} rows="4" className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
            <label className="grid gap-1 text-xs font-semibold text-gray-600">링크 URL<input type="text" value={form.data.link_url ?? ''} onChange={(event) => form.setData('link_url', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
            <div className="flex flex-wrap items-center justify-between gap-3"><label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.data.is_published} onChange={(event) => form.setData('is_published', event.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />게시</label><button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">추가</button></div>
        </form>
    );
}

export default function Index({ contents, typeOptions, fixedType = null, pageTitle = 'CMS 관리', pageDescription = '사이트 콘텐츠를 관리합니다.', storeRouteName = 'admin.cms.store' }) {
    const { flash } = usePage().props;
    const showRouteName = fixedType === 'faq' ? 'admin.faqs.show' : 'admin.notices.show';
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{pageTitle}</h2>}>
            <Head title={pageTitle} />
            <div className="py-8"><div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200"><h1 className="text-xl font-bold text-gray-900">{pageTitle} 추가</h1><p className="mt-1 text-sm text-gray-500">{pageDescription}</p>{flash?.success && <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}<div className="mt-5"><ContentForm fixedType={fixedType} typeOptions={typeOptions} storeRouteName={storeRouteName} /></div></section>
                <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                    <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-base font-semibold text-gray-900">{pageTitle} 목록</h2></div>
                    <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-100"><thead className="bg-gray-50"><tr>{['유형', '제목', '상태', '정렬순서', '게시일'].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 bg-white">{contents.map((content) => <tr key={content.id} className="hover:bg-gray-50"><td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{content.typeLabel}</td><td className="min-w-64 px-5 py-4 text-sm font-semibold text-gray-900"><Link href={route(showRouteName, content.id)} className="hover:text-blue-700">{content.title}</Link></td><td className="whitespace-nowrap px-5 py-4 text-sm"><span className={`rounded px-2 py-1 text-xs font-semibold ${content.isPublished ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{content.isPublished ? '게시중' : '숨김'}</span></td><td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{content.sortOrder}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{content.publishedAt || '-'}</td></tr>)}</tbody></table>{contents.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">등록된 콘텐츠가 없습니다.</div>}</div>
                </section>
            </div></div>
        </AuthenticatedLayout>
    );
}
