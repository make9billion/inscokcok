import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Download, Mail, Search } from 'lucide-react';
import kakaoLogoUrl from '../../../../images/logo/logo_kakao.png';
import naverLogoUrl from '../../../../images/logo/logo_naver.png';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

function SignupProviderBadge({ provider = 'email' }) {
    if (provider === 'kakao') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#fee500]/70 px-2.5 py-1 text-xs font-black text-[#191600]">
                <span className="grid size-6 place-items-center rounded-full bg-white">
                    <img src={kakaoLogoUrl} alt="" className="max-h-4 max-w-4 object-contain" />
                </span>
                카카오
            </span>
        );
    }

    if (provider === 'naver') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#03c75a]/10 px-2.5 py-1 text-xs font-black text-[#03a84e]">
                <span className="grid size-6 place-items-center rounded-full bg-white">
                    <img src={naverLogoUrl} alt="" className="naver-logo-green max-h-4 max-w-4 object-contain" />
                </span>
                네이버
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-xs font-black text-gray-700 ring-1 ring-gray-200">
            <span className="grid size-6 place-items-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200">
                <Mail className="size-3.5" strokeWidth={2.4} />
            </span>
            이메일
        </span>
    );
}

export default function Index({ members = [], filters = {}, recentAdjustments = [] }) {
    const { flash } = usePage().props;
    const searchForm = useForm({ search: filters.search ?? '' });
    const exportHref = `${route('admin.members.export')}${filters.search ? `?search=${encodeURIComponent(filters.search)}` : ''}`;

    const submitSearch = (event) => {
        event.preventDefault();
        router.get(route('admin.members.index'), searchForm.data, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">회원관리</h2>}>
            <Head title="회원관리" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">회원관리</h1>
                                <p className="mt-1 text-sm text-gray-500">회원가입 고객 정보를 조회하고 CSV로 내려받습니다.</p>
                            </div>
                            <form onSubmit={submitSearch} className="flex flex-wrap gap-2">
                                <label className="relative block">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                    <input value={searchForm.data.search} onChange={(event) => searchForm.setData('search', event.target.value)} placeholder="이름, 이메일, 연락처 검색" className="w-72 rounded-md border-gray-300 pl-9 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </label>
                                <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700">검색</button>
                                <a href={exportHref} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                    <Download className="size-4" />
                                    CSV 다운로드
                                </a>
                            </form>
                        </div>
                        {flash?.success && <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-base font-semibold text-gray-900">회원 목록</h2></div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>{['가입구분', '이름', '이메일', '연락처', '포인트', '상담', '질문', '주문', '가입일'].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {members.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <SignupProviderBadge provider={member.signupProvider} />
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900"><Link href={route('admin.members.show', member.id)} className="hover:text-blue-700">{member.name}</Link></td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{member.email}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{member.phone || '-'}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-blue-700">{formatNumber(member.pointBalance)}P</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{formatNumber(member.consultationCount)}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{formatNumber(member.questionCount)}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{formatNumber(member.orderCount)}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{member.joinedAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {members.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">조회된 회원이 없습니다.</div>}
                        </div>
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4"><h2 className="text-base font-semibold text-gray-900">최근 포인트 수동 조정</h2></div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {recentAdjustments.map((entry) => (
                                        <tr key={entry.id}>
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900">{entry.memberName}</td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{entry.memo}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-blue-700">{entry.points >= 0 ? '+' : ''}{formatNumber(entry.points)}P</td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{entry.createdAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {recentAdjustments.length === 0 && <div className="px-5 py-10 text-center text-sm text-gray-500">수동 조정 이력이 없습니다.</div>}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
