<?php

namespace App\Http\Controllers;

use App\Enums\ConsultationStatus;
use App\Enums\KnowledgeQuestionStatus;
use App\Enums\PointMallOrderStatus;
use App\Models\Consultation;
use App\Models\Inquiry;
use App\Models\KnowledgeQuestion;
use App\Models\PointMallOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if ($user->canAccessAdmin()) {
            return $this->adminDashboard($user);
        }

        return $this->memberDashboard($user);
    }

    private function adminDashboard(User $user): Response
    {
        $consultationQuery = Consultation::query()->with('assignedPlanner');

        if ($user->isPlanner()) {
            $consultationQuery->where('assigned_planner_id', $user->id);
        }

        $openConsultationStatuses = [
            ConsultationStatus::Received,
            ConsultationStatus::NoAnswer,
            ConsultationStatus::Recall,
            ConsultationStatus::Assigned,
        ];

        $adminSummary = [
            'todayConsultations' => (clone $consultationQuery)->whereDate('created_at', today())->count(),
            'openConsultations' => (clone $consultationQuery)->whereIn('status', $openConsultationStatuses)->count(),
            'assignedConsultations' => (clone $consultationQuery)->whereNotNull('assigned_planner_id')->count(),
            'completedConsultations' => (clone $consultationQuery)->where('status', ConsultationStatus::Completed)->count(),
            'pendingInquiries' => $user->isAdmin() ? Inquiry::query()->whereIn('status', ['received', 'reviewing'])->count() : 0,
            'openQuestions' => ($user->isAdmin() || $user->isPlanner())
                ? KnowledgeQuestion::query()->where('status', KnowledgeQuestionStatus::Open)->count()
                : 0,
            'pendingOrders' => $user->isAdmin() ? PointMallOrder::query()->where('status', PointMallOrderStatus::Pending)->count() : 0,
            'memberCount' => $user->isAdmin() ? User::query()->where('role', 'member')->count() : 0,
        ];

        return Inertia::render('Admin/Dashboard', [
            'role' => $user->role->value,
            'summary' => $adminSummary,
            'statusBreakdown' => collect(ConsultationStatus::cases())
                ->map(fn (ConsultationStatus $status) => [
                    'value' => $status->value,
                    'label' => $this->consultationStatusLabel($status),
                    'count' => (clone $consultationQuery)->where('status', $status)->count(),
                ])
                ->values(),
            'workQueues' => [
                'consultations' => (clone $consultationQuery)
                    ->whereIn('status', $openConsultationStatuses)
                    ->latest()
                    ->take(8)
                    ->get()
                    ->map(fn (Consultation $consultation) => [
                        'id' => $consultation->id,
                        'status' => $consultation->status->value,
                        'statusLabel' => $this->consultationStatusLabel($consultation->status),
                        'applicantName' => $consultation->applicant_name,
                        'phone' => $consultation->phone,
                        'interestedProduct' => $consultation->interested_product,
                        'assignedPlannerName' => $consultation->assignedPlanner?->name,
                        'createdAt' => $consultation->created_at?->format('Y-m-d H:i'),
                    ])
                    ->values(),
                'inquiries' => $user->isAdmin()
                    ? Inquiry::query()
                        ->whereIn('status', ['received', 'reviewing'])
                        ->latest()
                        ->take(6)
                        ->get()
                        ->map(fn (Inquiry $inquiry) => [
                            'id' => $inquiry->id,
                            'category' => Inquiry::CATEGORIES[$inquiry->category] ?? $inquiry->category,
                            'title' => $inquiry->title,
                            'status' => Inquiry::STATUSES[$inquiry->status] ?? $inquiry->status,
                            'createdAt' => $inquiry->created_at?->format('Y-m-d H:i'),
                        ])
                        ->values()
                    : [],
                'orders' => $user->isAdmin()
                    ? PointMallOrder::query()
                        ->with('user')
                        ->where('status', PointMallOrderStatus::Pending)
                        ->latest()
                        ->take(6)
                        ->get()
                        ->map(fn (PointMallOrder $order) => [
                            'id' => $order->id,
                            'orderNumber' => $order->order_number,
                            'memberName' => $order->user?->name,
                            'totalPoints' => $order->total_points,
                            'cashPaymentAmount' => $order->cash_payment_amount,
                            'createdAt' => $order->created_at?->format('Y-m-d H:i'),
                        ])
                        ->values()
                    : [],
                'questions' => ($user->isAdmin() || $user->isPlanner())
                    ? KnowledgeQuestion::query()
                        ->with('user')
                        ->where('status', KnowledgeQuestionStatus::Open)
                        ->latest()
                        ->take(6)
                        ->get()
                        ->map(fn (KnowledgeQuestion $question) => [
                            'id' => $question->id,
                            'title' => $question->title,
                            'authorName' => $question->user?->name,
                            'createdAt' => $question->created_at?->format('Y-m-d H:i'),
                        ])
                        ->values()
                    : [],
            ],
        ]);
    }

    private function memberDashboard(User $user): Response
    {
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
    }

    private function consultationStatusLabel(ConsultationStatus $status): string
    {
        return match ($status) {
            ConsultationStatus::Received => '접수',
            ConsultationStatus::NoAnswer => '부재',
            ConsultationStatus::Recall => '재통화',
            ConsultationStatus::Cancelled => '취소',
            ConsultationStatus::Assigned => '설계사배정',
            ConsultationStatus::Completed => '상담완료',
            ConsultationStatus::ConsultationCancelled => '상담취소',
        };
    }
}
