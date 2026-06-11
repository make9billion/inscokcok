import { Head } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import CustomerHeaderNav from '@/Components/CustomerHeaderNav';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Notices({ auth, notices = [] }) {
    const [openId, setOpenId] = useState(null);

    return (
        <PublicLayout auth={auth}>
            <Head title="공지사항" />

            <section className="border-b border-toss-grey200 bg-toss-grey50">
                <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
                    <p className="text-sm font-black text-[#f47b20]">Notice</p>
                    <h1 className="mt-2 text-2xl font-black leading-tight text-toss-grey900 sm:text-3xl">공지사항</h1>
                    <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-toss-grey500">
                        보험콕콕 서비스 운영과 혜택 안내를 확인하세요.
                    </p>
                    <CustomerHeaderNav />
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                {notices.length ? (
                    <div className="divide-y divide-toss-grey200 border-y border-toss-grey200">
                        {notices.map((notice) => {
                            const isOpen = openId === notice.id;

                            return (
                                <article key={notice.id} className="py-8">
                                    <button
                                        type="button"
                                        className="flex w-full items-start justify-between gap-6 text-left"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenId(isOpen ? null : notice.id)}
                                    >
                                        <span className="min-w-0">
                                            <span className="text-sm font-black text-[#f47b20]">{notice.publishedAt}</span>
                                            <span className="mt-3 block text-lg font-black leading-tight text-toss-grey900 sm:text-xl">
                                                {notice.title}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            className={`mt-2 size-8 shrink-0 text-toss-grey500 transition ${isOpen ? 'rotate-180' : ''}`}
                                            strokeWidth={2.2}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="mt-7">
                                            <p className="whitespace-pre-line text-sm font-semibold leading-7 text-toss-grey600">
                                                {notice.body}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="py-14 text-lg font-black text-toss-grey500">등록된 공지사항이 없습니다.</p>
                )}
            </section>
        </PublicLayout>
    );
}
