import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ consultations }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">상담 관리</h2>}
        >
            <Head title="상담 관리" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h3 className="text-base font-semibold text-gray-900">상담 접수 목록</h3>
                            <p className="mt-1 text-sm text-gray-500">최근 접수된 상담 50건을 확인합니다.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['접수일', '이름', '연락처', '상품', '상태', '담당'].map((label) => (
                                            <th
                                                key={label}
                                                scope="col"
                                                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                                            >
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {consultations.map((consultation) => (
                                        <tr key={consultation.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                                {consultation.createdAt}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                                                <Link
                                                    href={route('admin.consultations.show', consultation.id)}
                                                    className="hover:text-toss-blue"
                                                >
                                                    {consultation.applicantName}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                {consultation.phone}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                {consultation.interestedProduct ?? '보험점검'}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                <span className="rounded-lg bg-toss-blueLight px-2 py-1 font-semibold text-toss-blue">
                                                    {consultation.statusLabel}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                {consultation.assignedPlannerName ?? '미배정'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {consultations.length === 0 && (
                            <div className="px-5 py-12 text-center text-sm text-gray-500">
                                아직 접수된 상담이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
