import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AdminLogin({ status }) {
    const form = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.login'), {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="관리자 로그인" />

            <div className="mx-auto w-full max-w-md">
                <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                    <p className="text-sm font-black text-[#f47b20]">Admin</p>
                    <h1 className="mt-2 text-2xl font-black text-gray-950">관리자 로그인</h1>
                    <p className="mt-2 text-sm font-semibold text-gray-500">승인된 관리자와 설계사만 접속할 수 있습니다.</p>

                    {status && (
                        <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <label className="grid gap-1 text-sm font-bold text-gray-700">
                            아이디
                            <input
                                type="text"
                                value={form.data.username}
                                onChange={(event) => form.setData('username', event.target.value)}
                                autoComplete="username"
                                className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                            />
                            <InputError message={form.errors.username} />
                        </label>

                        <label className="grid gap-1 text-sm font-bold text-gray-700">
                            비밀번호
                            <input
                                type="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                autoComplete="current-password"
                                className="rounded-xl border-gray-300 text-sm focus:border-[#f47b20] focus:ring-[#f47b20]"
                            />
                            <InputError message={form.errors.password} />
                        </label>

                        <label className="inline-flex items-center gap-2 text-sm font-bold text-gray-600">
                            <input
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(event) => form.setData('remember', event.target.checked)}
                                className="rounded border-gray-300 text-[#f47b20] focus:ring-[#f47b20]"
                            />
                            로그인 유지
                        </label>

                        <button type="submit" disabled={form.processing} className="w-full rounded-xl bg-gray-950 px-4 py-3 text-sm font-black text-white transition hover:bg-gray-800 disabled:opacity-60">
                            관리자 로그인
                        </button>
                    </form>

                    <div className="mt-5 flex items-center justify-between text-sm font-bold">
                        <Link href={route('admin.register')} className="text-[#f47b20] hover:text-orange-600">관리자 가입 신청</Link>
                        <Link href={route('login')} className="text-gray-500 hover:text-gray-900">일반 로그인</Link>
                    </div>
                </section>
            </div>
        </GuestLayout>
    );
}
