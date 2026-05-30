<?php

use App\Http\Controllers\ConsultationController;
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
});

require __DIR__.'/auth.php';
