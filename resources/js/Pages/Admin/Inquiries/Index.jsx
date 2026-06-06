import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({
    inquiries = [],
    pageTitle = '문의하기 관리',
    pageDescription = '고객 문의를 확인합니다.',
    emptyMessage = '등록된 문의가 없습니다.',
}) {
    const { flash } = usePage().props;
    const showRouteName = pageTitle.includes('제휴') ? 'admin.partnership-inquiries.show' : 'admin.inquiries.show';
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{pageTitle}</h2>}>
            <Head title={pageTitle} />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
                        <p className="mt-1 text-sm text-gray-500">{pageDescription} 제목을 클릭하면 상세 화면으로 이동합니다.</p>
                        {flash?.success && <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                    </section>
                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-base font-semibold text-gray-900">문의 목록</h2></div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50"><tr>{['접수일', '말머리', '제목', '작성자', '상태'].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>)}</tr></thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {inquiries.map((inquiry) => (
                                        <tr key={inquiry.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{inquiry.createdAt}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{inquiry.categoryLabel}</td>
                                            <td className="min-w-64 px-5 py-4 text-sm font-semibold text-gray-900"><Link href={route(showRouteName, inquiry.id)} className="hover:text-blue-700">{inquiry.title}</Link></td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{inquiry.applicantName}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm"><span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{inquiry.statusLabel}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {inquiries.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">{emptyMessage}</div>}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
