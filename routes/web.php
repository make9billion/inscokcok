<?php

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
use App\Http\Controllers\EventController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\KnowledgeQuestionController;
use App\Http\Controllers\MemberPointController;
use App\Http\Controllers\PointMallController;
use App\Http\Controllers\ProfileController;
use App\Models\SiteContent;
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
    5,
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
Route::get('/customer', [CustomerContentController::class, 'index'])->name('customer.index');
Route::get('/customer/notices', [CustomerContentController::class, 'notices'])->name('customer.notices.index');
Route::get('/customer/notices/{content}', [CustomerContentController::class, 'notice'])->name('customer.notices.show');
Route::get('/customer/faq', [CustomerContentController::class, 'faq'])->name('customer.faq');
Route::get('/customer/inquiries', [InquiryController::class, 'index'])->name('customer.inquiries.index');
Route::post('/customer/inquiries', [InquiryController::class, 'store'])->name('customer.inquiries.store');
Route::get('/customer/company', [CustomerContentController::class, 'company'])->name('customer.company');
Route::get('/point-mall', [PointMallController::class, 'index'])->name('point-mall.index');
Route::get('/point-mall/products/{slug}', [PointMallController::class, 'show'])->name('point-mall.products.show');

Route::get('/dashboard', function () {
    $user = request()->user();

    return Inertia::render('Dashboard', [
        'summary' => [
            'pointBalance' => (int) $user->pointLedgerEntries()->sum('points'),
            'consultationCount' => $user->consultations()->count(),
            'questionCount' => $user->knowledgeQuestions()->count(),
            'orderCount' => $user->pointMallOrders()->count(),
        ],
        'recentPointEntries' => $user->pointLedgerEntries()
            ->latest()
            ->take(5)
            ->get(['type', 'points', 'memo', 'created_at'])
            ->map(fn ($entry) => [
                'type' => $entry->type->value,
                'points' => $entry->points,
                'memo' => $entry->memo,
                'createdAt' => $entry->created_at?->format('Y-m-d'),
            ]),
        'recentConsultations' => $user->consultations()
            ->latest()
            ->take(5)
            ->get(['id', 'status', 'interested_product', 'preferred_contact_time', 'created_at'])
            ->map(fn ($consultation) => [
                'id' => $consultation->id,
                'status' => $consultation->status->value,
                'interestedProduct' => $consultation->interested_product,
                'preferredContactTime' => $consultation->preferred_contact_time,
                'createdAt' => $consultation->created_at?->format('Y-m-d'),
            ]),
        'recentOrders' => $user->pointMallOrders()
            ->latest()
            ->take(5)
            ->get(['id', 'status', 'order_number', 'total_points', 'cash_payment_amount', 'ordered_at', 'created_at'])
            ->map(fn ($order) => [
                'id' => $order->id,
                'status' => $order->status->value,
                'orderNumber' => $order->order_number,
                'totalPoints' => $order->total_points,
                'cashPaymentAmount' => $order->cash_payment_amount,
                'orderedAt' => ($order->ordered_at ?? $order->created_at)?->format('Y-m-d'),
            ]),
        'recentQuestions' => $user->knowledgeQuestions()
            ->latest()
            ->take(5)
            ->get(['id', 'status', 'title', 'created_at'])
            ->map(fn ($question) => [
                'id' => $question->id,
                'status' => $question->status->value,
                'title' => $question->title,
                'createdAt' => $question->created_at?->format('Y-m-d'),
            ]),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/mypage/points', [MemberPointController::class, 'index'])->name('mypage.points');
    Route::get('/mypage/point-mall/orders', [PointMallController::class, 'orders'])
        ->name('mypage.point-mall.orders');
    Route::post('/mypage/point-mall/orders/{order}/cancel', [PointMallController::class, 'cancelOrder'])
        ->name('mypage.point-mall.orders.cancel');
    Route::get('/point-mall/cart', [PointMallController::class, 'cart'])->name('point-mall.cart.show');
    Route::post('/point-mall/cart/checkout', [PointMallController::class, 'checkout'])
        ->name('point-mall.cart.checkout');
    Route::post('/point-mall/products/{slug}/cart', [PointMallController::class, 'addToCart'])
        ->name('point-mall.products.cart.store');
    Route::post('/knowledge/questions', [KnowledgeQuestionController::class, 'store'])
        ->name('knowledge.questions.store');
    Route::get('/knowledge/questions/{question}', [KnowledgeQuestionController::class, 'show'])
        ->name('knowledge.questions.show');

    Route::get('/admin/consultations', [ConsultationManagementController::class, 'index'])
        ->name('admin.consultations.index');
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
    Route::post('/admin/knowledge/{question}/answer', [KnowledgeAnswerController::class, 'store'])
        ->name('admin.knowledge.answers.store');
    Route::get('/admin/inquiries', [InquiryManagementController::class, 'index'])
        ->name('admin.inquiries.index');
    Route::patch('/admin/inquiries/{inquiry}', [InquiryManagementController::class, 'update'])
        ->name('admin.inquiries.update');
    Route::get('/admin/members', [MemberManagementController::class, 'index'])
        ->name('admin.members.index');
    Route::post('/admin/members/{member}/points', [MemberManagementController::class, 'adjustPoints'])
        ->name('admin.members.points.adjust');
    Route::get('/admin/notices', [ContentManagementController::class, 'notices'])
        ->name('admin.notices.index');
    Route::post('/admin/notices', [ContentManagementController::class, 'storeNotice'])
        ->name('admin.notices.store');
    Route::patch('/admin/notices/{content}', [ContentManagementController::class, 'updateNotice'])
        ->name('admin.notices.update');
    Route::get('/admin/faqs', [ContentManagementController::class, 'faqs'])
        ->name('admin.faqs.index');
    Route::post('/admin/faqs', [ContentManagementController::class, 'storeFaq'])
        ->name('admin.faqs.store');
    Route::patch('/admin/faqs/{content}', [ContentManagementController::class, 'updateFaq'])
        ->name('admin.faqs.update');
    Route::get('/admin/cms', [ContentManagementController::class, 'index'])
        ->name('admin.cms.index');
    Route::post('/admin/cms', [ContentManagementController::class, 'store'])
        ->name('admin.cms.store');
    Route::patch('/admin/cms/{content}', [ContentManagementController::class, 'update'])
        ->name('admin.cms.update');
    Route::get('/admin/point-mall/products', [PointMallProductManagementController::class, 'index'])
        ->name('admin.point-mall.products.index');
    Route::patch('/admin/point-mall/products/{product}', [PointMallProductManagementController::class, 'update'])
        ->name('admin.point-mall.products.update');
    Route::patch('/admin/point-mall/products/{product}/delivery', [PointMallProductManagementController::class, 'updateDelivery'])
        ->name('admin.point-mall.products.delivery.update');
    Route::get('/admin/point-mall/orders', [PointMallOrderManagementController::class, 'index'])
        ->name('admin.point-mall.orders.index');
    Route::patch('/admin/point-mall/orders/{order}/status', [PointMallOrderManagementController::class, 'updateStatus'])
        ->name('admin.point-mall.orders.status.update');
    Route::post('/admin/point-mall/orders/{order}/cancel', [PointMallOrderManagementController::class, 'cancel'])
        ->name('admin.point-mall.orders.cancel');
});

require __DIR__.'/auth.php';
