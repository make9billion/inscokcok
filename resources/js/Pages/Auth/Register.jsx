import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        gender: '',
        postal_code: '',
        address_line1: '',
        address_line2: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="회원가입" />

            <form onSubmit={submit}>
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        회원가입
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        보흠씨씨 회원 정보를 입력해 주세요.
                    </p>
                </div>

                <div className="grid gap-3">
                    <button
                        type="button"
                        disabled
                        className="w-full rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-900 opacity-70"
                    >
                        카카오로 시작하기
                    </button>
                    <button
                        type="button"
                        disabled
                        className="w-full rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900 opacity-70"
                    >
                        네이버로 시작하기
                    </button>
                    <p className="text-center text-xs text-gray-500">
                        소셜 로그인 연동 준비 중
                    </p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                    <InputLabel htmlFor="name" value="이름" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="이메일" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="phone" value="휴대폰 번호" />

                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        placeholder="010-1234-5678"
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                    />

                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="birth_date" value="생년월일" />

                        <TextInput
                            id="birth_date"
                            type="date"
                            name="birth_date"
                            value={data.birth_date}
                            className="mt-1 block w-full"
                            autoComplete="bday"
                            onChange={(e) =>
                                setData('birth_date', e.target.value)
                            }
                        />

                        <InputError
                            message={errors.birth_date}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="gender" value="성별" />

                        <select
                            id="gender"
                            name="gender"
                            value={data.gender}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <option value="">선택 안 함</option>
                            <option value="male">남성</option>
                            <option value="female">여성</option>
                            <option value="other">기타</option>
                        </select>

                        <InputError message={errors.gender} className="mt-2" />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="postal_code" value="우편번호" />

                    <TextInput
                        id="postal_code"
                        name="postal_code"
                        value={data.postal_code}
                        className="mt-1 block w-full"
                        autoComplete="postal-code"
                        onChange={(e) =>
                            setData('postal_code', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.postal_code}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="address_line1" value="주소" />

                    <TextInput
                        id="address_line1"
                        name="address_line1"
                        value={data.address_line1}
                        className="mt-1 block w-full"
                        autoComplete="address-line1"
                        onChange={(e) =>
                            setData('address_line1', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.address_line1}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="address_line2" value="상세주소" />

                    <TextInput
                        id="address_line2"
                        name="address_line2"
                        value={data.address_line2}
                        className="mt-1 block w-full"
                        autoComplete="address-line2"
                        onChange={(e) =>
                            setData('address_line2', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.address_line2}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="비밀번호" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="비밀번호 확인"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        이미 가입하셨나요?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        가입하기
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
