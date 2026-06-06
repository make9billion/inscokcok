import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const roleTabs = [
    { value: 'admin', label: '전체권한' },
    { value: 'planner', label: '설계사권한' },
];

export default function Index({ accounts = [], roleOptions = [] }) {
    const { flash } = usePage().props;
    const [activeRole, setActiveRole] = useState('admin');
    const filteredAccounts = useMemo(() => accounts.filter((account) => account.role === activeRole), [accounts, activeRole]);
    const form = useForm({ username: '', password: '', name: '', phone: '', organization: '', role: 'planner' });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.accounts.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('username', 'password', 'name', 'phone', 'organization'),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">관리자관리</h2>}>
            <Head title="관리자관리" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">관리자 계정 생성</h1>
                        <p className="mt-1 text-sm text-gray-500">전체권한과 설계사권한 계정을 생성하고 권한을 관리합니다.</p>
                        {flash?.success && <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                        <form onSubmit={submit} autoComplete="off" className="mt-5 grid gap-3">
                            <div className="grid gap-3 md:grid-cols-3">
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">아이디<input name="new_admin_username" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" value={form.data.username} onChange={(event) => form.setData('username', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />{form.errors.username && <span className="text-xs text-red-600">{form.errors.username}</span>}</label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">비밀번호<input name="new_admin_password" type="password" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />{form.errors.password && <span className="text-xs text-red-600">{form.errors.password}</span>}</label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">권한<select value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">이름<input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">연락처<input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">소속<input value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                            </div>
                            <div className="flex justify-end"><button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">관리자 계정 생성</button></div>
                        </form>
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-base font-semibold text-gray-900">관리자 권한 목록</h2>
                                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                                    {roleTabs.map((tab) => (
                                        <button key={tab.value} type="button" onClick={() => setActiveRole(tab.value)} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${activeRole === tab.value ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{tab.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50"><tr>{['이름', '아이디', '소속', '연락처', '생성일'].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>)}</tr></thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900"><Link href={route('admin.accounts.show', account.id)} className="hover:text-blue-700">{account.name}</Link></td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{account.username}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{account.organization}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{account.phone}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{account.createdAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAccounts.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">등록된 계정이 없습니다.</div>}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
