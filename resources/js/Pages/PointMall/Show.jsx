import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

export default function Show({ auth, product }) {
    const form = useForm({ quantity: 1 });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('point-mall.products.cart.store', product.slug), {
            preserveScroll: true,
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title={product.name} />

            <section className="bg-white">
                <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
                    <Link
                        href="/point-mall"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-toss-grey600 transition hover:text-toss-grey900"
                    >
                        <ArrowLeft className="size-4" strokeWidth={1.8} />
                        포인트몰
                    </Link>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1fr]">
                        <div className="flex aspect-square items-center justify-center rounded-lg bg-toss-grey50 text-toss-grey500">
                            <ShoppingBag className="size-16" strokeWidth={1.5} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-toss-blue">{product.categoryName}</p>
                            <h1 className="mt-3 text-3xl font-bold text-toss-grey900">{product.name}</h1>
                            <p className="mt-4 text-sm leading-6 text-toss-grey600">
                                {product.summary ?? '포인트로 교환할 수 있는 상품입니다.'}
                            </p>

                            <div className="mt-6 rounded-lg border border-toss-grey200 bg-white p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-semibold text-toss-grey600">교환 포인트</span>
                                    <span className="text-2xl font-bold tabular-nums text-toss-grey900">
                                        {formatNumber(product.pointPrice)}P
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-4 border-t border-toss-grey200 pt-4">
                                    <span className="text-sm font-semibold text-toss-grey600">재고</span>
                                    <span className="text-sm font-bold tabular-nums text-toss-grey900">
                                        {formatNumber(product.stockQuantity)}개
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-4 border-t border-toss-grey200 pt-4">
                                    <span className="text-sm font-semibold text-toss-grey600">배송비</span>
                                    <span className="text-sm font-bold tabular-nums text-toss-grey900">
                                        {product.deliveryType === 'paid'
                                            ? `${formatNumber(product.deliveryFee)}원`
                                            : '무료배송'}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={submit} className="mt-5 grid gap-3">
                                <label className="grid gap-2 text-sm font-semibold text-toss-grey700">
                                    수량
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stockQuantity}
                                        value={form.data.quantity}
                                        onChange={(event) => form.setData('quantity', Number(event.target.value))}
                                        className="rounded-lg border-toss-grey300 text-sm focus:border-toss-blue focus:ring-toss-blue"
                                    />
                                </label>
                                {form.errors.quantity && (
                                    <p className="text-sm font-semibold text-red-600">{form.errors.quantity}</p>
                                )}
                                {auth?.user ? (
                                    <button
                                        type="submit"
                                        disabled={form.processing || product.stockQuantity < 1}
                                        className="w-full rounded-lg bg-toss-grey900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-toss-grey700 disabled:opacity-60"
                                    >
                                        장바구니 담기
                                    </button>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="w-full rounded-lg bg-toss-grey900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-toss-grey700"
                                    >
                                        로그인 후 담기
                                    </Link>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className="mt-8 rounded-lg border border-toss-grey200 bg-toss-grey50 p-5">
                        <h2 className="text-base font-bold text-toss-grey900">상품 설명</h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-toss-grey600">
                            {product.description ?? '등록된 상품 설명이 없습니다.'}
                        </p>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
