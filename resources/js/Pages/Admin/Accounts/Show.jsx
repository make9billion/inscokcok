import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

export default function Show({ account, roleOptions = [] }) {
    const { flash, auth } = usePage().props;
    const form = useForm({
        role: account.role,
        phone: account.phone ?? '',
        organization: account.organization ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.accounts.update', account.id), { preserveScroll: true });
    };

    const deleteAccount = () => {
        if (account.id === auth.user.id) {
            window.alert('현재 로그인한 계정은 삭제할 수 없습니다.');
            return;
        }
        if (window.confirm(`${account.name} 관리자 계정을 삭제할까요?`)) {
            router.delete(route('admin.accounts.destroy', account.id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">관리자 상세</h2>}>
            <Head title="관리자 상세" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <Link href={route('admin.accounts.index')} className="inline-flex text-sm font-semibold text-gray-600 hover:text-gray-900">목록으로</Link>
                    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-700">{account.roleLabel}</p>
                                <h1 className="mt-2 text-2xl font-bold text-gray-900">{account.name}</h1>
                                <p className="mt-1 text-sm text-gray-500">{account.username}</p>
                            </div>
                            <button type="button" onClick={deleteAccount} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                                <Trash2 className="size-4" />
                                삭제
                            </button>
                        </div>
                        {flash?.success && <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}

                        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-3">
                            <label className="grid gap-1 text-sm font-semibold text-gray-700">권한<select value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
                            <label className="grid gap-1 text-sm font-semibold text-gray-700">연락처<input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                            <label className="grid gap-1 text-sm font-semibold text-gray-700">소속<input value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                            <div className="md:col-span-3"><button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">저장</button></div>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
