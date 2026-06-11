import { Head } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import CustomerHeaderNav from '@/Components/CustomerHeaderNav';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Faq({ auth, faqs = [] }) {
    const [openId, setOpenId] = useState(null);

    return (
        <PublicLayout auth={auth} dark>
            <Head title="FAQ" />

            <section className="border-b border-white/10 bg-[#070b14]">
                <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
                    <p className="text-sm font-black text-[#f47b20]">FAQ</p>
                    <h1 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">자주 묻는 질문</h1>
                    <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/55">
                        궁금한 질문을 클릭하면 답변을 바로 확인할 수 있습니다.
                    </p>
                    <CustomerHeaderNav dark />
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                {faqs.length ? (
                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {faqs.map((faq) => {
                            const isOpen = openId === faq.id;

                            return (
                                <article key={faq.id} className="py-8">
                                    <button
                                        type="button"
                                        className="flex w-full items-start justify-between gap-6 text-left"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                                    >
                                        <span className="flex gap-5">
                                            <span className="text-lg font-black text-[#f47b20] sm:text-xl">Q</span>
                                            <span className="text-lg font-black leading-tight text-white sm:text-xl">
                                                {faq.title}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            className={`mt-2 size-8 shrink-0 text-white/55 transition ${isOpen ? 'rotate-180' : ''}`}
                                            strokeWidth={2.2}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="mt-7 flex gap-5">
                                            <span className="text-lg font-black text-[#7aa7ff] sm:text-xl">A</span>
                                            <p className="whitespace-pre-line text-sm font-semibold leading-7 text-white/70">
                                                {faq.body}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="py-14 text-lg font-black text-white/60">등록된 FAQ가 없습니다.</p>
                )}
            </section>
        </PublicLayout>
    );
}
