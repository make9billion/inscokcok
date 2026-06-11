import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AdminRegister() {
    const form = useForm({
        username: '',
        password: '',
        password_confirmation: '',
        name: '',
        phone: '',
        organization: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.register'), {
            preserveScroll: true,
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="관리자 가입 신청" />

            <div className="mx-auto w-full max-w-xl">
                <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                    <div>
                        <div>
                            <p className="text-sm font-black text-[#f47b20]">Admin Request</p>
                            <h1 className="mt-2 text-2xl font-black text-gray-950">관리자 가입 신청</h1>
                            <p className="mt-2 text-sm font-semibold text-gray-500">가입 신청 후 전체권한 관리자의 승인이 완료되면 로그인할 수 있습니다.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="mt-6 grid gap-4">
                        <div className="grid gap-4">
                            <Field label="아이디" error={form.errors.username}>
                                <input value={form.data.username} onChange={(event) => form.setData('username', event.target.value)} autoComplete="username" className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]" />
                            </Field>
                        </div>

                        <div className="grid gap-4">
                            <Field label="비밀번호" error={form.errors.password}>
                                <input type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} autoComplete="new-password" className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]" />
                            </Field>
                            <Field label="비밀번호 확인" error={form.errors.password_confirmation}>
                                <input type="password" value={form.data.password_confirmation} onChange={(event) => form.setData('password_confirmation', event.target.value)} autoComplete="new-password" className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]" />
                            </Field>
                        </div>

                        <div className="grid gap-4">
                            <Field label="이름" error={form.errors.name}>
                                <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]" />
                            </Field>
                            <Field label="연락처" error={form.errors.phone}>
                                <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]" />
                            </Field>
                            <Field label="소속" error={form.errors.organization}>
                                <input value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]" />
                            </Field>
                        </div>

                        <button type="submit" disabled={form.processing} className="mt-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-black text-white transition hover:bg-gray-800 disabled:opacity-60">
                            가입 신청하기
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <Link href={route('admin.login')} className="text-sm font-bold text-gray-500 hover:text-gray-900">
                            이미 신청했어요
                        </Link>
                    </div>
                </section>
            </div>
        </GuestLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="grid gap-1 text-sm font-bold text-gray-700">
            {label}
            {children}
            <InputError message={error} />
        </label>
    );
}
