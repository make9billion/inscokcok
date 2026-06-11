import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const tabs = [
    { value: 'pending', label: '승인대기' },
    { value: 'admin', label: '전체권한' },
    { value: 'planner', label: '설계사권한' },
    { value: 'rejected', label: '반려' },
];

const approvalTone = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-blue-50 text-blue-700 ring-blue-200',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export default function Index({ accounts = [], roleOptions = [] }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('pending');
    const filteredAccounts = useMemo(() => accounts.filter((account) => {
        if (activeTab === 'pending' || activeTab === 'rejected') {
            return account.approvalStatus === activeTab;
        }

        return account.approvalStatus === 'approved' && account.role === activeTab;
    }), [accounts, activeTab]);

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
                        <p className="mt-1 text-sm text-gray-500">내부 관리자 계정은 즉시 승인완료 상태로 생성됩니다.</p>
                        {flash?.success && <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}
                        <form onSubmit={submit} autoComplete="off" className="mt-5 grid gap-3">
                            <div className="grid gap-3 md:grid-cols-3">
                                <Field label="아이디" error={form.errors.username}>
                                    <input name="new_admin_username" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" value={form.data.username} onChange={(event) => form.setData('username', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </Field>
                                <Field label="비밀번호" error={form.errors.password}>
                                    <input name="new_admin_password" type="password" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </Field>
                                <Field label="권한" error={form.errors.role}>
                                    <select value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                                        {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                    </select>
                                </Field>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                <Field label="이름" error={form.errors.name}>
                                    <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </Field>
                                <Field label="연락처" error={form.errors.phone}>
                                    <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </Field>
                                <Field label="소속" error={form.errors.organization}>
                                    <input value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </Field>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">관리자 계정 생성</button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-base font-semibold text-gray-900">관리자 권한 목록</h2>
                                <div className="inline-flex flex-wrap rounded-lg bg-gray-100 p-1">
                                    {tabs.map((tab) => (
                                        <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${activeTab === tab.value ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{tab.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50"><tr>{['이름', '아이디', '신청권한', '승인상태', '소속', '연락처', '생성일'].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</th>)}</tr></thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900"><Link href={route('admin.accounts.show', account.id)} className="hover:text-blue-700">{account.name}</Link></td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{account.username}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{account.roleLabel}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${approvalTone[account.approvalStatus] ?? approvalTone.approved}`}>{account.approvalStatusLabel}</span></td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{account.organization}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{account.phone}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">{account.createdAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAccounts.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">해당 계정이 없습니다.</div>}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="grid gap-1 text-xs font-semibold text-gray-600">
            {label}
            {children}
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}
