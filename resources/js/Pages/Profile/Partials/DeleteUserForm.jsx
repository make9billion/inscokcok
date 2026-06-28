import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '', requiresPassword = true, socialProviders = [] }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();
    const socialProviderText = socialProviders.join(', ');

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (event) => {
        event.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    회원 탈퇴
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    회원 탈퇴 시 계정과 관련 데이터가 삭제됩니다. 필요한 정보가 있다면 탈퇴 전 미리 확인해 주세요.
                </p>

                {!requiresPassword && (
                    <p className="mt-3 rounded-lg bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
                        {socialProviderText || '소셜'} 간편가입 회원은 비밀번호 입력 없이 탈퇴할 수 있습니다.
                    </p>
                )}
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                회원 탈퇴
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        정말 회원 탈퇴를 진행할까요?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        {requiresPassword
                            ? '탈퇴 후 계정과 관련 데이터는 복구하기 어렵습니다. 계속하려면 비밀번호를 입력해 주세요.'
                            : '탈퇴 시 보험콕콕 계정과 소셜 로그인 연결 정보가 함께 삭제됩니다. 카카오/네이버 계정 자체는 삭제되지 않습니다.'}
                    </p>

                    {requiresPassword && (
                        <div className="mt-6">
                            <InputLabel
                                htmlFor="password"
                                value="비밀번호"
                                className="sr-only"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                className="mt-1 block w-3/4"
                                isFocused
                                placeholder="비밀번호"
                            />

                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            취소
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            회원 탈퇴
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
