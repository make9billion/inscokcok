import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Gift, ShoppingBag, ShoppingCart, Sparkles, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import PublicLayout from '@/Layouts/PublicLayout';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);
const desktopFeaturedCount = 4;
const mobileFeaturedCount = 2;

export default function Index({ auth, categories, products, selectedCategory = null }) {
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [visibleFeaturedCount, setVisibleFeaturedCount] = useState(desktopFeaturedCount);
    const categoryLinks = [{ id: 'all', name: '전체 상품', slug: null }, ...categories];
    const featuredProducts = useMemo(() => {
        const featured = products.filter((product) => product.isFeatured);
        return featured.length > 0 ? featured : products;
    }, [products]);

    const visibleFeaturedProducts = useMemo(() => {
        if (featuredProducts.length <= visibleFeaturedCount) {
            return featuredProducts;
        }

        return Array.from({ length: visibleFeaturedCount }, (_, offset) => {
            const index = (featuredIndex + offset) % featuredProducts.length;
            return featuredProducts[index];
        });
    }, [featuredIndex, featuredProducts]);

    const canSlideFeatured = featuredProducts.length > visibleFeaturedCount;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 639px)');
        const updateVisibleCount = () => {
            setVisibleFeaturedCount(mediaQuery.matches ? mobileFeaturedCount : desktopFeaturedCount);
        };

        updateVisibleCount();
        mediaQuery.addEventListener('change', updateVisibleCount);

        return () => mediaQuery.removeEventListener('change', updateVisibleCount);
    }, []);

    const moveFeatured = (direction) => {
        if (!canSlideFeatured) return;

        setFeaturedIndex((current) => {
            const next = current + direction;
            if (next < 0) return featuredProducts.length - 1;
            return next % featuredProducts.length;
        });
    };

    useEffect(() => {
        if (!canSlideFeatured) return undefined;

        const timer = window.setInterval(() => {
            setFeaturedIndex((current) => (current + 1) % featuredProducts.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, [canSlideFeatured, featuredProducts.length]);

    return (
        <PublicLayout auth={auth} pointMallHeader>
            <Head title="포인트몰" />

            <section className="point-mall-hero-gradient overflow-hidden text-white">
                <div className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-black ring-1 ring-white/18 backdrop-blur">
                            <Gift className="size-4" strokeWidth={2.3} />
                            Point Mall
                        </p>
                        <h1 className="mt-5 text-4xl font-black tracking-normal sm:text-5xl">
                            모은 포인트로
                            <br />
                            필요한 선물을 콕콕.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/82">
                            상담, 이벤트, 활동으로 적립한 포인트를 실속 있는 상품으로 교환해보세요.
                            부족한 금액과 배송비는 주문 단계에서 한 번에 확인할 수 있습니다.
                        </p>

                        {auth?.user && (
                            <Link
                                href="/point-mall/cart"
                                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-[#12284a] transition hover:-translate-y-0.5"
                            >
                                <ShoppingCart className="size-4" strokeWidth={2.4} />
                                장바구니 보기
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-[#f5f7fb]">
                <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {categoryLinks.map((category) => {
                            const isActive = selectedCategory === category.slug || (!selectedCategory && category.slug === null);

                            return (
                                <Link
                                    key={category.id}
                                    href={category.slug ? `/point-mall?category=${category.slug}` : '/point-mall'}
                                    preserveScroll
                                    className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-black transition ${
                                        isActive
                                            ? 'bg-[#12284a] text-white'
                                            : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-950'
                                    }`}
                                >
                                    {category.name}
                                </Link>
                            );
                        })}
                    </div>

                    {featuredProducts.length > 0 && (
                        <section className="mt-8 rounded-[28px] bg-white p-5 ring-1 ring-gray-100 sm:p-7">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="inline-flex items-center gap-2 text-sm font-black text-[#f47b20]">
                                        <Sparkles className="size-4" strokeWidth={2.3} />
                                        추천상품
                                    </p>
                                    <h2 className="mt-1 text-2xl font-black tracking-normal text-gray-950">
                                        지금 많이 찾는 포인트 상품
                                    </h2>
                                </div>

                                {canSlideFeatured && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveFeatured(-1)}
                                            className="grid size-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#12284a] hover:text-[#12284a]"
                                            aria-label="이전 추천상품"
                                        >
                                            <ChevronLeft className="size-5" strokeWidth={2.4} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveFeatured(1)}
                                            className="grid size-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#12284a] hover:text-[#12284a]"
                                            aria-label="다음 추천상품"
                                        >
                                            <ChevronRight className="size-5" strokeWidth={2.4} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                                {visibleFeaturedProducts.map((product) => (
                                    <FeaturedProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="mt-10 flex items-end justify-between gap-5">
                        <div>
                            <p className="text-sm font-black uppercase tracking-wide text-[#f47b20]">All Products</p>
                            <h2 className="mt-1 text-2xl font-black tracking-normal text-gray-950">포인트몰 상품</h2>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-14 text-center text-sm font-semibold text-gray-500">
                            교환 가능한 상품이 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}

function FeaturedProductCard({ product }) {
    return (
        <Link
            href={route('point-mall.products.show', product.slug)}
            className="group overflow-hidden rounded-[24px] bg-[#f7f8fb] ring-1 ring-gray-100 transition hover:-translate-y-1 hover:ring-[#f47b20]/30"
        >
            <div className="aspect-[4/3] bg-[#edf1f7]">
                {product.imagePath ? (
                    <img
                        src={`/storage/${product.imagePath}`}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        <ShoppingBag className="size-10" strokeWidth={1.5} />
                    </div>
                )}
            </div>
            <div className="p-4">
                <p className="w-fit rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-black text-[#f47b20]">
                    {product.categoryName ?? '포인트 상품'}
                </p>
                <h3 className="mt-3 line-clamp-2 text-base font-black leading-6 text-gray-950">{product.name}</h3>
                <p className="mt-3 text-xl font-black tabular-nums text-[#12284a]">{formatNumber(product.pointPrice)}P</p>
            </div>
        </Link>
    );
}

function ProductCard({ product }) {
    return (
        <Link
            href={route('point-mall.products.show', product.slug)}
            className="group overflow-hidden rounded-[22px] bg-white ring-1 ring-gray-100 transition hover:-translate-y-1 hover:ring-[#f47b20]/30"
        >
            <div className="aspect-square bg-[#f3f5f8]">
                {product.imagePath ? (
                    <img
                        src={`/storage/${product.imagePath}`}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        <ShoppingBag className="size-12" strokeWidth={1.5} />
                    </div>
                )}
            </div>

            <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-black text-[#f47b20]">
                        {product.categoryName ?? '포인트 상품'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500">
                        <Truck className="size-3.5" strokeWidth={2.2} />
                        {product.deliveryType === 'paid' ? `${formatNumber(product.deliveryFee)}원` : '무료배송'}
                    </span>
                </div>
                <h2 className="mt-3 line-clamp-2 text-base font-black leading-6 text-gray-950 sm:text-lg">{product.name}</h2>
                <p className="mt-2 min-h-10 text-sm font-semibold leading-5 text-gray-500">
                    {product.summary ?? '포인트로 교환할 수 있는 상품입니다.'}
                </p>
                <p className="mt-4 text-xl font-black tabular-nums text-[#12284a] sm:text-2xl">
                    {formatNumber(product.pointPrice)}P
                </p>
            </div>
        </Link>
    );
}
