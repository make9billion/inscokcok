<?php

use App\Http\Controllers\Admin\AdminAccountManagementController;
use App\Http\Controllers\Admin\ContentManagementController;
use App\Http\Controllers\Admin\ConsultationManagementController;
use App\Http\Controllers\Admin\EventManagementController;
use App\Http\Controllers\Admin\InquiryManagementController;
use App\Http\Controllers\Admin\KnowledgeAnswerController;
use App\Http\Controllers\Admin\MemberManagementController;
use App\Http\Controllers\Admin\PointMallOrderManagementController;
use App\Http\Controllers\Admin\PointMallProductManagementController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\CustomerContentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\KnowledgeQuestionController;
use App\Http\Controllers\MemberPointController;
use App\Http\Controllers\PointMallController;
use App\Http\Controllers\ProfileController;
use App\Models\SiteContent;
use App\Models\PointMallProduct;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

$staticImagePage = fn (string $title, string $folder, int $count, ?string $description = null): array => [
    'title' => $title,
    'description' => $description,
    'images' => collect(range(1, $count))
        ->map(fn (int $index) => sprintf('%s/%02d.png', $folder, $index))
        ->all(),
];

Route::get('/', function () {
    $publishedContents = Schema::hasTable('site_contents')
        ? SiteContent::query()
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->latest()
            ->get()
            ->groupBy('type')
        : collect();
    $serializeContent = fn (SiteContent $content) => [
        'id' => $content->id,
        'title' => $content->title,
        'body' => $content->body,
        'linkUrl' => $content->link_url,
        'publishedAt' => $content->published_at?->format('Y.m.d') ?? $content->created_at?->format('Y.m.d'),
    ];

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'cms' => [
            'notices' => ($publishedContents->get('notice') ?? collect())->take(5)->map($serializeContent)->values(),
            'faqs' => ($publishedContents->get('faq') ?? collect())->take(5)->map($serializeContent)->values(),
            'mainBanners' => ($publishedContents->get('main_banner') ?? collect())->take(2)->map($serializeContent)->values(),
        ],
        'pointMallProducts' => Schema::hasTable('point_mall_products')
            ? PointMallProduct::query()
                ->with('category')
                ->where('is_active', true)
                ->orderByDesc('is_main_visible')
                ->orderByDesc('is_featured')
                ->latest()
                ->take(4)
                ->get()
                ->map(fn (PointMallProduct $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'summary' => $product->summary,
                    'imagePath' => $product->image_path,
                    'pointPrice' => $product->point_price,
                    'categoryName' => $product->category?->name,
                ])
                ->values()
            : [],
    ]);
});

Route::get('/insurance-checkup', function () {
    return Inertia::render('InsuranceCheckup');
})->name('insurance-checkup');

Route::get('/services', fn () => Inertia::render('StaticImagePage', $staticImagePage(
    '서비스안내',
    'static-pages',
    1,
    '보험CC의 상담 흐름과 주요 서비스를 안내합니다.'
)))->name('services');
Route::redirect('/insurance', '/insurance/cancer');
Route::get('/insurance/cancer', fn () => Inertia::render('StaticImagePage', $staticImagePage(
    '암보험',
    'cancer-insurance',
    6,
    '암 진단비와 치료비 보장을 이미지 안내 페이지로 확인하세요.'
)))->name('insurance.cancer');
Route::get('/insurance/dementia-care', fn () => Inertia::render('StaticImagePage', $staticImagePage(
    '치매/간병보험',
    'care-insurance',
    1,
    '긴 노후와 가족 부담을 대비하는 보장을 확인하세요.'
)))->name('insurance.dementia-care');
Route::get('/insurance/disease-accident', fn () => Inertia::render('StaticImagePage', $staticImagePage(
    '질병/상해보험',
    'disease-accident',
    6,
    '입원, 수술, 상해 관련 보장을 확인하세요.'
)))->name('insurance.disease-accident');
Route::get('/insurance/dental', fn () => Inertia::render('StaticImagePage', $staticImagePage(
    '치아보험',
    'dental-insurance',
    6,
    '치료비 부담을 줄이는 치아보험 안내 페이지입니다.'
)))->name('insurance.dental');
Route::get('/insurance/pet', fn () => Inertia::render('StaticImagePage', $staticImagePage(
    '펫보험',
    'pet-insurance',
    7,
    '반려동물 병원비를 대비하는 펫보험 안내 페이지입니다.'
)))->name('insurance.pet');
Route::get('/insurance/child', fn () => Inertia::render('StaticImagePage', $staticImagePage(
    '어린이보험',
    'child-insurance',
    1,
    '성장 단계별 보장을 준비하는 어린이보험 안내 페이지입니다.'
)))->name('insurance.child');

Route::post('/consultations', [ConsultationController::class, 'store'])
    ->name('consultations.store');
Route::get('/knowledge', [KnowledgeQuestionController::class, 'index'])->name('knowledge.index');
Route::get('/events', [EventController::class, 'index'])->name('events.index');
Route::redirect('/customer', '/customer/notices')->name('customer.index');
Route::get('/customer/notices', [CustomerContentController::class, 'notices'])->name('customer.notices.index');
Route::get('/customer/notices/{content}', [CustomerContentController::class, 'notice'])->name('customer.notices.show');
Route::get('/customer/faq', [CustomerContentController::class, 'faq'])->name('customer.faq');
Route::get('/customer/inquiries', [InquiryController::class, 'index'])->name('customer.inquiries.index');
Route::post('/customer/inquiries', [InquiryController::class, 'store'])->name('customer.inquiries.store');
Route::get('/customer/company', [CustomerContentController::class, 'company'])->name('customer.company');
Route::get('/privacy-policy', fn () => Inertia::render('PrivacyPolicy'))->name('privacy-policy');
Route::get('/terms', fn () => Inertia::render('Terms'))->name('terms');
Route::get('/point-mall-guide', fn () => Inertia::render('PointMallGuide'))->name('point-mall-guide');
Route::get('/partnership', [InquiryController::class, 'partnership'])->name('partnership');
Route::post('/partnership', [InquiryController::class, 'storePartnership'])->name('partnership.store');
Route::get('/point-mall', [PointMallController::class, 'index'])->name('point-mall.index');
Route::get('/point-mall/products/{slug}', [PointMallController::class, 'show'])->name('point-mall.products.show');

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::redirect('/admin', '/dashboard')->name('admin.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/mypage/points', [MemberPointController::class, 'index'])->name('mypage.points');
    Route::get('/mypage/point-mall/orders', [PointMallController::class, 'orders'])
        ->name('mypage.point-mall.orders');
    Route::post('/mypage/point-mall/orders/{order}/cancel', [PointMallController::class, 'cancelOrder'])
        ->name('mypage.point-mall.orders.cancel');
    Route::get('/point-mall/cart', [PointMallController::class, 'cart'])->name('point-mall.cart.show');
    Route::patch('/point-mall/cart/items/{item}', [PointMallController::class, 'updateCartItem'])
        ->name('point-mall.cart.items.update');
    Route::delete('/point-mall/cart/items/{item}', [PointMallController::class, 'destroyCartItem'])
        ->name('point-mall.cart.items.destroy');
    Route::post('/point-mall/cart/checkout', [PointMallController::class, 'checkout'])
        ->name('point-mall.cart.checkout');
    Route::get('/point-mall/orders/{order}/payment', [PointMallController::class, 'payment'])
        ->name('point-mall.orders.payment');
    Route::get('/point-mall/payment/success', [PointMallController::class, 'paymentSuccess'])
        ->name('point-mall.payment.success');
    Route::get('/point-mall/payment/fail', [PointMallController::class, 'paymentFail'])
        ->name('point-mall.payment.fail');
    Route::post('/point-mall/products/{slug}/cart', [PointMallController::class, 'addToCart'])
        ->name('point-mall.products.cart.store');
    Route::post('/knowledge/questions', [KnowledgeQuestionController::class, 'store'])
        ->name('knowledge.questions.store');
    Route::get('/knowledge/questions/{question}', [KnowledgeQuestionController::class, 'show'])
        ->name('knowledge.questions.show');

    Route::get('/admin/consultations', [ConsultationManagementController::class, 'index'])
        ->name('admin.consultations.index');
    Route::get('/admin/consultations/export', [ConsultationManagementController::class, 'export'])
        ->name('admin.consultations.export');
    Route::patch('/admin/consultations/bulk', [ConsultationManagementController::class, 'bulkUpdate'])
        ->name('admin.consultations.bulk');
    Route::get('/admin/consultations/{consultation}', [ConsultationManagementController::class, 'show'])
        ->name('admin.consultations.show');
    Route::patch('/admin/consultations/{consultation}', [ConsultationManagementController::class, 'update'])
        ->name('admin.consultations.update');
    Route::get('/admin/events', [EventManagementController::class, 'index'])
        ->name('admin.events.index');
    Route::patch('/admin/events/{event}', [EventManagementController::class, 'update'])
        ->name('admin.events.update');
    Route::get('/admin/knowledge', [KnowledgeAnswerController::class, 'index'])
        ->name('admin.knowledge.index');
    Route::get('/admin/knowledge/{question}', [KnowledgeAnswerController::class, 'show'])
        ->name('admin.knowledge.show');
    Route::post('/admin/knowledge/{question}/answer', [KnowledgeAnswerController::class, 'store'])
        ->name('admin.knowledge.answers.store');
    Route::get('/admin/inquiries', [InquiryManagementController::class, 'index'])
        ->name('admin.inquiries.index');
    Route::get('/admin/inquiries/{inquiry}', [InquiryManagementController::class, 'show'])
        ->name('admin.inquiries.show');
    Route::patch('/admin/inquiries/{inquiry}', [InquiryManagementController::class, 'update'])
        ->name('admin.inquiries.update');
    Route::get('/admin/partnership-inquiries', [InquiryManagementController::class, 'partnershipIndex'])
        ->name('admin.partnership-inquiries.index');
    Route::get('/admin/partnership-inquiries/{inquiry}', [InquiryManagementController::class, 'partnershipShow'])
        ->name('admin.partnership-inquiries.show');
    Route::get('/admin/members', [MemberManagementController::class, 'index'])
        ->name('admin.members.index');
    Route::get('/admin/members/export', [MemberManagementController::class, 'export'])
        ->name('admin.members.export');
    Route::get('/admin/members/{member}', [MemberManagementController::class, 'show'])
        ->name('admin.members.show');
    Route::post('/admin/members/{member}/points', [MemberManagementController::class, 'adjustPoints'])
        ->name('admin.members.points.adjust');
    Route::get('/admin/accounts', [AdminAccountManagementController::class, 'index'])
        ->name('admin.accounts.index');
    Route::get('/admin/accounts/{account}', [AdminAccountManagementController::class, 'show'])
        ->name('admin.accounts.show');
    Route::post('/admin/accounts', [AdminAccountManagementController::class, 'store'])
        ->name('admin.accounts.store');
    Route::patch('/admin/accounts/{account}', [AdminAccountManagementController::class, 'update'])
        ->name('admin.accounts.update');
    Route::delete('/admin/accounts/{account}', [AdminAccountManagementController::class, 'destroy'])
        ->name('admin.accounts.destroy');
    Route::get('/admin/notices', [ContentManagementController::class, 'notices'])
        ->name('admin.notices.index');
    Route::get('/admin/notices/{content}', [ContentManagementController::class, 'noticeShow'])
        ->name('admin.notices.show');
    Route::post('/admin/notices', [ContentManagementController::class, 'storeNotice'])
        ->name('admin.notices.store');
    Route::patch('/admin/notices/{content}', [ContentManagementController::class, 'updateNotice'])
        ->name('admin.notices.update');
    Route::delete('/admin/notices/{content}', [ContentManagementController::class, 'destroyNotice'])
        ->name('admin.notices.destroy');
    Route::get('/admin/faqs', [ContentManagementController::class, 'faqs'])
        ->name('admin.faqs.index');
    Route::get('/admin/faqs/{content}', [ContentManagementController::class, 'faqShow'])
        ->name('admin.faqs.show');
    Route::post('/admin/faqs', [ContentManagementController::class, 'storeFaq'])
        ->name('admin.faqs.store');
    Route::patch('/admin/faqs/{content}', [ContentManagementController::class, 'updateFaq'])
        ->name('admin.faqs.update');
    Route::delete('/admin/faqs/{content}', [ContentManagementController::class, 'destroyFaq'])
        ->name('admin.faqs.destroy');
    Route::get('/admin/cms', [ContentManagementController::class, 'index'])
        ->name('admin.cms.index');
    Route::post('/admin/cms', [ContentManagementController::class, 'store'])
        ->name('admin.cms.store');
    Route::patch('/admin/cms/{content}', [ContentManagementController::class, 'update'])
        ->name('admin.cms.update');
    Route::get('/admin/point-mall/products', [PointMallProductManagementController::class, 'index'])
        ->name('admin.point-mall.products.index');
    Route::get('/admin/point-mall/products/create', [PointMallProductManagementController::class, 'create'])
        ->name('admin.point-mall.products.create');
    Route::post('/admin/point-mall/products', [PointMallProductManagementController::class, 'store'])
        ->name('admin.point-mall.products.store');
    Route::post('/admin/point-mall/products/description-images', [PointMallProductManagementController::class, 'uploadDescriptionImage'])
        ->name('admin.point-mall.products.description-images.store');
    Route::get('/admin/point-mall/products/{product}', [PointMallProductManagementController::class, 'show'])
        ->name('admin.point-mall.products.show');
    Route::patch('/admin/point-mall/products/{product}', [PointMallProductManagementController::class, 'update'])
        ->name('admin.point-mall.products.update');
    Route::delete('/admin/point-mall/products/{product}', [PointMallProductManagementController::class, 'destroy'])
        ->name('admin.point-mall.products.destroy');
    Route::patch('/admin/point-mall/products/{product}/delivery', [PointMallProductManagementController::class, 'updateDelivery'])
        ->name('admin.point-mall.products.delivery.update');
    Route::post('/admin/point-mall/categories', [PointMallProductManagementController::class, 'storeCategory'])
        ->name('admin.point-mall.categories.store');
    Route::patch('/admin/point-mall/categories/{category}', [PointMallProductManagementController::class, 'updateCategory'])
        ->name('admin.point-mall.categories.update');
    Route::get('/admin/point-mall/orders', [PointMallOrderManagementController::class, 'index'])
        ->name('admin.point-mall.orders.index');
    Route::get('/admin/point-mall/orders/export', [PointMallOrderManagementController::class, 'export'])
        ->name('admin.point-mall.orders.export');
    Route::patch('/admin/point-mall/orders/{order}/status', [PointMallOrderManagementController::class, 'updateStatus'])
        ->name('admin.point-mall.orders.status.update');
    Route::patch('/admin/point-mall/orders/{order}/tracking', [PointMallOrderManagementController::class, 'updateTracking'])
        ->name('admin.point-mall.orders.tracking.update');
    Route::post('/admin/point-mall/orders/{order}/cancel', [PointMallOrderManagementController::class, 'cancel'])
        ->name('admin.point-mall.orders.cancel');
});

require __DIR__.'/auth.php';
