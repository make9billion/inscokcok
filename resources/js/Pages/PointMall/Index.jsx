import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { Gift, ShoppingBag } from 'lucide-react';

const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value ?? 0);

export default function Index({ auth, categories, products }) {
    return (
        <PublicLayout auth={auth}>
            <Head title="포인트몰" />

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-5 border-b border-toss-grey200 pb-8 md:flex-row md:items-end">
                        <div>
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-toss-blue">
                                <Gift className="size-4" strokeWidth={1.8} />
                                Point Mall
                            </p>
                            <h1 className="mt-3 text-3xl font-bold text-toss-grey900">포인트몰</h1>
                            <p className="mt-3 text-sm leading-6 text-toss-grey600">
                                상담과 이벤트로 모은 포인트를 상품으로 교환하세요.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <span
                                    key={category.id}
                                    className="rounded-lg bg-toss-grey100 px-3 py-2 text-sm font-semibold text-toss-grey700"
                                >
                                    {category.name}
                                </span>
                            ))}
                            {auth?.user && (
                                <Link
                                    href="/point-mall/cart"
                                    className="rounded-lg bg-toss-grey900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-toss-grey700"
                                >
                                    장바구니
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={route('point-mall.products.show', product.slug)}
                                className="rounded-lg border border-toss-grey200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-toss-blue hover:shadow-md"
                            >
                                <div className="flex h-32 items-center justify-center rounded-lg bg-toss-grey50 text-toss-grey500">
                                    <ShoppingBag className="size-9" strokeWidth={1.6} />
                                </div>
                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold text-toss-blue">
                                        {product.categoryName}
                                    </span>
                                    <span className="text-xs text-toss-grey500">
                                        재고 {formatNumber(product.stockQuantity)}
                                    </span>
                                </div>
                                <h2 className="mt-2 text-lg font-bold text-toss-grey900">{product.name}</h2>
                                <p className="mt-2 min-h-10 text-sm leading-5 text-toss-grey600">
                                    {product.summary ?? '포인트로 교환할 수 있는 상품입니다.'}
                                </p>
                                <div className="mt-4 flex items-end justify-between gap-3">
                                    <p className="text-xl font-bold tabular-nums text-toss-grey900">
                                        {formatNumber(product.pointPrice)}P
                                    </p>
                                    <p className="text-xs font-semibold text-toss-grey500">
                                        {product.deliveryType === 'paid'
                                            ? `배송비 ${formatNumber(product.deliveryFee)}원`
                                            : '무료배송'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="mt-8 rounded-lg border border-toss-grey200 px-5 py-12 text-center text-sm text-toss-grey500">
                            교환 가능한 상품이 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
