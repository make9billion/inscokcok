<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ConsultationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationStatusLog;
use App\Models\User;
use App\Services\AdminAuditLogger;
use App\Services\PointLedgerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeConsultationAccess($request);

        $validated = $request->validate([
            'status' => ['nullable', new Enum(ConsultationStatus::class)],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $status = $validated['status'] ?? null;
        $search = trim((string) ($validated['search'] ?? ''));
        $user = $request->user();

        return Inertia::render('Admin/Consultations/Index', [
            'consultations' => Consultation::query()
                ->with('assignedPlanner')
                ->when($user?->isPlanner(), fn ($query) => $query->where('assigned_planner_id', $user->id))
                ->when($status, fn ($query) => $query->where('status', $status))
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query
                        ->where('applicant_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('interested_product', 'like', "%{$search}%");
                }))
                ->latest()
                ->take(50)
                ->get()
                ->map(fn (Consultation $consultation) => $this->serializeConsultation($consultation)),
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function show(Request $request, Consultation $consultation): Response
    {
        $this->authorizeConsultationAccess($request);
        $this->authorizePlannerAssignment($request, $consultation);

        return Inertia::render('Admin/Consultations/Show', [
            'consultation' => $this->serializeConsultation(
                $consultation->load(['assignedPlanner', 'statusLogs.actor'])
            ),
            'planners' => $this->plannerOptions($request),
            'statusOptions' => $this->statusOptions($request),
            'canChangePlanner' => $request->user()?->isAdmin() ?? false,
        ]);
    }

    public function update(
        Request $request,
        Consultation $consultation,
        PointLedgerService $pointLedger,
        AdminAuditLogger $audit
    ): RedirectResponse {
        $this->authorizeConsultationAccess($request);
        $this->authorizePlannerAssignment($request, $consultation);

        $allowedStatuses = $this->allowedStatusValues($request);
        $validated = $request->validate([
            'status' => ['required', Rule::in($allowedStatuses)],
            'assigned_planner_id' => ['nullable', 'exists:users,id'],
            'memo' => ['nullable', 'string', 'max:1000'],
        ]);

        $fromStatus = $consultation->status;
        $before = [
            'status' => $consultation->status->value,
            'assigned_planner_id' => $consultation->assigned_planner_id,
            'completed_at' => $consultation->completed_at?->toISOString(),
            'cancelled_at' => $consultation->cancelled_at?->toISOString(),
        ];
        $toStatus = ConsultationStatus::from($validated['status']);
        $assignedPlannerId = $request->user()?->isPlanner()
            ? $request->user()->id
            : ($validated['assigned_planner_id'] ?? null);

        $consultation->update([
            'status' => $toStatus,
            'assigned_planner_id' => $assignedPlannerId,
            'completed_at' => $toStatus === ConsultationStatus::Completed ? now() : $consultation->completed_at,
            'cancelled_at' => in_array($toStatus, [ConsultationStatus::Cancelled, ConsultationStatus::ConsultationCancelled], true)
                ? now()
                : $consultation->cancelled_at,
        ]);

        ConsultationStatusLog::create([
            'consultation_id' => $consultation->id,
            'actor_id' => $request->user()?->id,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'memo' => $validated['memo'] ?? null,
        ]);

        if ($toStatus === ConsultationStatus::Completed) {
            $pointLedger->grantConsultationCompletedBonus($consultation->refresh());
        }

        $consultation->refresh();
        $audit->record($request, 'consultation.updated', $consultation, $before, [
            'status' => $consultation->status->value,
            'assigned_planner_id' => $consultation->assigned_planner_id,
            'completed_at' => $consultation->completed_at?->toISOString(),
            'cancelled_at' => $consultation->cancelled_at?->toISOString(),
            'memo' => $validated['memo'] ?? null,
        ]);

        return redirect()
            ->route('admin.consultations.show', $consultation)
            ->with('success', '상담 상태가 변경되었습니다.');
    }

    private function authorizeConsultationAccess(Request $request): void
    {
        abort_unless($request->user()?->isAdmin() || $request->user()?->isPlanner(), 403);
    }

    private function authorizePlannerAssignment(Request $request, Consultation $consultation): void
    {
        if ($request->user()?->isPlanner()) {
            abort_unless($consultation->assigned_planner_id === $request->user()->id, 403);
        }
    }

    private function plannerOptions(Request $request): array
    {
        if ($request->user()?->isPlanner()) {
            return [[
                'id' => $request->user()->id,
                'name' => $request->user()->name,
            ]];
        }

        return User::query()
            ->where('role', UserRole::Planner)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $planner) => [
                'id' => $planner->id,
                'name' => $planner->name,
            ])
            ->all();
    }

    private function allowedStatusValues(Request $request): array
    {
        if ($request->user()?->isPlanner()) {
            return [
                ConsultationStatus::Assigned->value,
                ConsultationStatus::Completed->value,
                ConsultationStatus::ConsultationCancelled->value,
            ];
        }

        return collect(ConsultationStatus::cases())->map->value->all();
    }

    private function statusOptions(?Request $request = null): array
    {
        $statuses = ConsultationStatus::cases();

        if ($request?->user()?->isPlanner()) {
            $statuses = [
                ConsultationStatus::Assigned,
                ConsultationStatus::Completed,
                ConsultationStatus::ConsultationCancelled,
            ];
        }

        return collect($statuses)->map(fn (ConsultationStatus $status) => [
            'value' => $status->value,
            'label' => $this->statusLabel($status),
        ])->all();
    }

    private function serializeConsultation(Consultation $consultation): array
    {
        return [
            'id' => $consultation->id,
            'type' => $consultation->type->value,
            'status' => $consultation->status->value,
            'statusLabel' => $this->statusLabel($consultation->status),
            'applicantName' => $consultation->applicant_name,
            'phone' => $consultation->phone,
            'birthDate' => $consultation->birth_date?->format('Y-m-d'),
            'currentMonthlyPremium' => $consultation->current_monthly_premium,
            'interestedProduct' => $consultation->interested_product,
            'preferredContactTime' => $consultation->preferred_contact_time,
            'memo' => $consultation->memo,
            'assignedPlannerId' => $consultation->assigned_planner_id,
            'assignedPlannerName' => $consultation->assignedPlanner?->name,
            'createdAt' => $consultation->created_at?->format('Y-m-d H:i'),
            'statusLogs' => $consultation->statusLogs?->map(fn (ConsultationStatusLog $log) => [
                'id' => $log->id,
                'fromStatus' => $log->from_status?->value,
                'toStatus' => $log->to_status->value,
                'toStatusLabel' => $this->statusLabel($log->to_status),
                'memo' => $log->memo,
                'actorName' => $log->actor?->name,
                'createdAt' => $log->created_at?->format('Y-m-d H:i'),
            ])->values() ?? [],
        ];
    }

    private function statusLabel(ConsultationStatus $status): string
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
