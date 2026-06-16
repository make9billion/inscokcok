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
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConsultationManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeConsultationAccess($request);

        $validated = $request->validate([
            'status' => ['nullable', new Enum(ConsultationStatus::class)],
            'search' => ['nullable', 'string', 'max:100'],
            'assigned_planner_id' => ['nullable', 'string', 'max:20'],
            'product' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $filters = $this->normalizedFilters($validated);

        return Inertia::render('Admin/Consultations/Index', [
            'consultations' => $this->filteredConsultationQuery($request, $filters)
                ->latest()
                ->take(20)
                ->get()
                ->map(fn (Consultation $consultation) => $this->serializeConsultation($consultation)),
            'filters' => $filters,
            'planners' => $this->plannerOptions($request),
            'productOptions' => $this->productOptions($request),
            'statusOptions' => $this->statusOptions($request),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizeConsultationAccess($request);

        $validated = $request->validate([
            'status' => ['nullable', new Enum(ConsultationStatus::class)],
            'search' => ['nullable', 'string', 'max:100'],
            'assigned_planner_id' => ['nullable', 'string', 'max:20'],
            'product' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);
        $filters = $this->normalizedFilters($validated);

        return response()->stream(function () use ($request, $filters) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['접수일', '구분', '이름', '연락처', '상품', '상태', '담당자', '메모']);

            $this->filteredConsultationQuery($request, $filters)
                ->oldest()
                ->chunk(200, function ($consultations) use ($handle) {
                    foreach ($consultations as $consultation) {
                        fputcsv($handle, [
                            $consultation->created_at?->format('Y-m-d H:i'),
                            $this->sourceLabel($consultation->source ?? 'main'),
                            $consultation->applicant_name,
                            $consultation->phone,
                            $consultation->interested_product,
                            $this->statusLabel($consultation->status),
                            $consultation->assignedPlanner?->name,
                            $consultation->memo,
                        ]);
                    }
                });

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=consultations.csv',
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

    public function bulkUpdate(
        Request $request,
        PointLedgerService $pointLedger,
        AdminAuditLogger $audit
    ): RedirectResponse {
        $this->authorizeConsultationAccess($request);

        $allowedStatuses = $this->allowedStatusValues($request);
        $validated = $request->validate([
            'consultation_ids' => ['required', 'array', 'min:1', 'max:100'],
            'consultation_ids.*' => ['integer', 'exists:consultations,id'],
            'status' => ['required', Rule::in($allowedStatuses)],
            'assigned_planner_id' => ['nullable', 'exists:users,id'],
            'memo' => ['nullable', 'string', 'max:1000'],
        ]);

        $consultations = Consultation::query()
            ->whereIn('id', $validated['consultation_ids'])
            ->get();

        if ($request->user()?->isPlanner()) {
            abort_unless($consultations->every(fn (Consultation $consultation) => $consultation->assigned_planner_id === $request->user()->id), 403);
        }

        $toStatus = ConsultationStatus::from($validated['status']);
        $assignedPlannerId = $request->user()?->isPlanner()
            ? $request->user()->id
            : ($validated['assigned_planner_id'] ?? null);

        foreach ($consultations as $consultation) {
            $fromStatus = $consultation->status;
            $before = [
                'status' => $consultation->status->value,
                'assigned_planner_id' => $consultation->assigned_planner_id,
            ];

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
            $audit->record($request, 'consultation.bulk_updated', $consultation, $before, [
                'status' => $consultation->status->value,
                'assigned_planner_id' => $consultation->assigned_planner_id,
                'memo' => $validated['memo'] ?? null,
            ]);
        }

        return redirect()
            ->route('admin.consultations.index')
            ->with('success', '선택한 상담이 일괄 변경되었습니다.');
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

    private function productOptions(Request $request): array
    {
        return Consultation::query()
            ->when($request->user()?->isPlanner(), fn ($query) => $query->where('assigned_planner_id', $request->user()->id))
            ->whereNotNull('interested_product')
            ->distinct()
            ->orderBy('interested_product')
            ->pluck('interested_product')
            ->values()
            ->all();
    }

    private function normalizedFilters(array $validated): array
    {
        return [
            'status' => $validated['status'] ?? null,
            'search' => trim((string) ($validated['search'] ?? '')),
            'assigned_planner_id' => $validated['assigned_planner_id'] ?? '',
            'product' => trim((string) ($validated['product'] ?? '')),
            'date_from' => $validated['date_from'] ?? '',
            'date_to' => $validated['date_to'] ?? '',
        ];
    }

    private function filteredConsultationQuery(Request $request, array $filters)
    {
        $search = $filters['search'];

        return Consultation::query()
            ->with('assignedPlanner')
            ->when($request->user()?->isPlanner(), fn ($query) => $query->where('assigned_planner_id', $request->user()->id))
            ->when(! $request->user()?->isPlanner() && $filters['assigned_planner_id'] !== '', function ($query) use ($filters) {
                if ($filters['assigned_planner_id'] === 'unassigned') {
                    $query->whereNull('assigned_planner_id');

                    return;
                }

                $query->where('assigned_planner_id', (int) $filters['assigned_planner_id']);
            })
            ->when($filters['status'], fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['product'] !== '', fn ($query) => $query->where('interested_product', $filters['product']))
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query
                    ->where('applicant_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('interested_product', 'like', "%{$search}%");
            }));
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
            'source' => $consultation->source ?? 'main',
            'sourceLabel' => $this->sourceLabel($consultation->source ?? 'main'),
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

    private function sourceLabel(?string $source): string
    {
        return match ($source) {
            'product' => '상품',
            default => '메인',
        };
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
