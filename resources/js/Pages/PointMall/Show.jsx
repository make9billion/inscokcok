import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag, ShoppingCart, Truck } from 'lucide-react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

export default function Show({ auth, product }) {
    const form = useForm({ quantity: 1 });
    const isAvailable = product.stockQuantity > 0;

    const submit = (event) => {
        event.preventDefault();
        form.post(route('point-mall.products.cart.store', product.slug), { preserveScroll: true });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title={product.name} />

            <section className="bg-[#f7f8fb]">
                <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-8">
                    <Link href="/point-mall" className="inline-flex items-center gap-2 text-sm font-black text-gray-600 transition hover:text-gray-950">
                        <ArrowLeft className="size-4" strokeWidth={2.2} />
                        포인트몰로 돌아가기
                    </Link>

                    <div className="mt-8 rounded-[28px] bg-white p-5 ring-1 ring-gray-100 lg:p-8">
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
                            <div className="flex min-h-[520px] overflow-hidden rounded-[24px] bg-[#f3f5f8] text-gray-400">
                                <div className="flex w-full items-center justify-center overflow-hidden">
                                    {product.imagePath ? (
                                        <img src={`/storage/${product.imagePath}`} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="size-24" strokeWidth={1.5} />
                                    )}
                                </div>
                            </div>

                        <aside className="flex flex-col">
                            <p className="inline-flex w-fit self-start rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-black leading-none text-[#f47b20]">
                                {product.categoryName ?? '포인트 상품'}
                            </p>
                            <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal text-gray-950">{product.name}</h1>
                            <p className="mt-3 text-sm font-semibold leading-6 text-gray-500">
                                {product.summary ?? '포인트로 교환할 수 있는 상품입니다.'}
                            </p>

                            <div className="mt-6 rounded-2xl bg-[#f7f8fb] p-5">
                                <div className="flex items-end justify-between gap-4">
                                    <span className="text-sm font-black text-gray-600">교환 포인트</span>
                                    <span className="text-3xl font-black tabular-nums text-[#12284a]">{formatNumber(product.pointPrice)}P</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                                    <span className="inline-flex items-center gap-2 text-sm font-black text-gray-600">
                                        <Truck className="size-4" strokeWidth={2.2} />
                                        배송비
                                    </span>
                                    <span className="text-sm font-black tabular-nums text-gray-950">
                                        {product.deliveryType === 'paid' ? `${formatNumber(product.deliveryFee)}원` : '무료배송'}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={submit} className="mt-5 grid gap-4">
                                <label className="grid gap-2 text-sm font-black text-gray-700">
                                    수량
                                    <input
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={form.data.quantity}
                                        onChange={(event) => form.setData('quantity', Number(event.target.value))}
                                        className="h-12 rounded-2xl border-gray-200 bg-gray-50 text-sm font-bold focus:border-[#f47b20] focus:ring-[#f47b20]"
                                    />
                                </label>
                                {form.errors.quantity && <p className="text-sm font-bold text-red-600">{form.errors.quantity}</p>}

                                {auth?.user ? (
                                    <button
                                        type="submit"
                                        disabled={form.processing || !isAvailable}
                                        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#12284a] px-5 text-base font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                                    >
                                        <ShoppingCart className="size-5" strokeWidth={2.2} />
                                        {isAvailable ? '장바구니 담기' : '현재 교환 불가'}
                                    </button>
                                ) : (
                                    <Link href={route('login')} className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#12284a] px-5 text-base font-black text-white transition hover:-translate-y-0.5">
                                        로그인하고 담기
                                    </Link>
                                )}
                            </form>
                        </aside>
                        </div>
                    </div>

                    <div className="mt-8 rounded-[28px] bg-white p-6 ring-1 ring-gray-100">
                        <h2 className="text-xl font-black text-gray-950">상품 상세정보</h2>
                        {product.description ? (
                            <div className="prose mt-5 max-w-none text-sm leading-7 text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />
                        ) : (
                            <p className="mt-5 text-sm font-semibold leading-7 text-gray-500">등록된 상품 설명이 없습니다.</p>
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
