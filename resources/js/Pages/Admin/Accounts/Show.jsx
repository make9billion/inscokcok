import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

const approvalTone = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-blue-50 text-blue-700 ring-blue-200',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export default function Show({ account, roleOptions = [], approvalOptions = [] }) {
    const { flash, auth } = usePage().props;
    const form = useForm({
        role: account.requestedRole ?? account.role,
        phone: account.phone ?? '',
        organization: account.organization ?? '',
        approval_status: account.approvalStatus ?? 'pending',
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.accounts.update', account.id), { preserveScroll: true });
    };

    const approve = () => {
        router.patch(route('admin.accounts.update', account.id), { ...form.data, approval_status: 'approved' }, {
            preserveScroll: true,
        });
    };

    const reject = () => {
        if (!window.confirm(`${account.name} 계정을 반려할까요?`)) {
            return;
        }
        router.patch(route('admin.accounts.update', account.id), { ...form.data, approval_status: 'rejected' }, {
            preserveScroll: true,
        });
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
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-blue-700">{account.roleLabel}</p>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${approvalTone[account.approvalStatus] ?? approvalTone.approved}`}>
                                        {account.approvalStatusLabel}
                                    </span>
                                </div>
                                <h1 className="mt-2 text-2xl font-bold text-gray-900">{account.name}</h1>
                                <p className="mt-1 text-sm text-gray-500">{account.username}</p>
                                {account.approvedAt && <p className="mt-1 text-xs font-semibold text-gray-400">승인일 {account.approvedAt}</p>}
                            </div>
                            <button type="button" onClick={deleteAccount} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                                <Trash2 className="size-4" />
                                삭제
                            </button>
                        </div>
                        {flash?.success && <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{flash.success}</div>}

                        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-4">
                            <Field label="권한" error={form.errors.role}>
                                <select value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                                    {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                </select>
                            </Field>
                            <Field label="승인상태" error={form.errors.approval_status}>
                                <select value={form.data.approval_status} onChange={(event) => form.setData('approval_status', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                                    {approvalOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </select>
                            </Field>
                            <Field label="연락처" error={form.errors.phone}>
                                <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                            </Field>
                            <Field label="소속" error={form.errors.organization}>
                                <input value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500" />
                            </Field>
                            <div className="flex flex-wrap gap-2 md:col-span-4">
                                <button type="submit" disabled={form.processing} className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">저장</button>
                                {account.approvalStatus === 'pending' && (
                                    <>
                                        <button type="button" onClick={approve} disabled={form.processing} className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60">승인</button>
                                        <button type="button" onClick={reject} disabled={form.processing} className="rounded-md border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60">반려</button>
                                    </>
                                )}
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="grid gap-1 text-sm font-semibold text-gray-700">
            {label}
            {children}
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}
