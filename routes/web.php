<?php

use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\Admin\ConsultationManagementController;
use App\Http\Controllers\Admin\EventManagementController;
use App\Http\Controllers\Admin\KnowledgeAnswerController;
use App\Http\Controllers\KnowledgeQuestionController;
use App\Http\Controllers\MemberPointController;
use App\Http\Controllers\PointMallController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/insurance-checkup', function () {
    return Inertia::render('InsuranceCheckup');
})->name('insurance-checkup');

Route::post('/consultations', [ConsultationController::class, 'store'])
    ->name('consultations.store');
Route::get('/knowledge', [KnowledgeQuestionController::class, 'index'])->name('knowledge.index');
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
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/mypage/points', [MemberPointController::class, 'index'])->name('mypage.points');
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
});

require __DIR__.'/auth.php';
