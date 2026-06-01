import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

function AccountUpdateForm({ account, roleOptions }) {
    const form = useForm({
        role: account.role,
        phone: account.phone ?? '',
        organization: account.organization ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.accounts.update', account.id), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="grid gap-2 md:grid-cols-[150px_1fr_1fr_auto]">
            <select value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
            <input value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
            <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                저장
            </button>
        </form>
    );
}

export default function Index({ accounts = [], roleOptions = [] }) {
    const { flash } = usePage().props;
    const form = useForm({
        username: '',
        password: '',
        name: '',
        phone: '',
        organization: '',
        role: 'planner',
    });

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
                        <h1 className="text-xl font-bold text-gray-900">관리자 회원가입</h1>
                        <p className="mt-1 text-sm text-gray-500">관리자, 설계사, 상담사 계정을 생성하고 권한을 관리합니다.</p>
                        {flash?.success && <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}

                        <form onSubmit={submit} className="mt-5 grid gap-3">
                            <div className="grid gap-3 md:grid-cols-3">
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                    아이디
                                    <input value={form.data.username} onChange={(event) => form.setData('username', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                    {form.errors.username && <span className="text-xs text-red-600">{form.errors.username}</span>}
                                </label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                    비밀번호
                                    <input type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                    {form.errors.password && <span className="text-xs text-red-600">{form.errors.password}</span>}
                                </label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                    권한
                                    <select value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                                        {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                    </select>
                                </label>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                    이름
                                    <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                    연락처
                                    <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </label>
                                <label className="grid gap-1 text-xs font-semibold text-gray-600">
                                    소속
                                    <input value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                                </label>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
                                    관리자 계정 생성
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">관리자 권한 관리</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {accounts.map((account) => (
                                <article key={account.id} className="grid gap-4 px-5 py-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">{account.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">{account.username} · {account.roleLabel}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">생성일 {account.createdAt}</span>
                                    </div>
                                    <AccountUpdateForm account={account} roleOptions={roleOptions} />
                                </article>
                            ))}
                        </div>
                        {accounts.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">등록된 관리자 계정이 없습니다.</div>}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
