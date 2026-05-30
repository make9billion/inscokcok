<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ConsultationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationStatusLog;
use App\Models\User;
use App\Services\PointLedgerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Consultations/Index', [
            'consultations' => Consultation::query()
                ->latest()
                ->take(50)
                ->get()
                ->map(fn (Consultation $consultation) => $this->serializeConsultation($consultation)),
        ]);
    }

    public function show(Request $request, Consultation $consultation): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Consultations/Show', [
            'consultation' => $this->serializeConsultation(
                $consultation->load(['assignedPlanner', 'statusLogs.actor'])
            ),
            'planners' => User::query()
                ->where('role', UserRole::Planner)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (User $planner) => [
                    'id' => $planner->id,
                    'name' => $planner->name,
                ]),
            'statusOptions' => collect(ConsultationStatus::cases())->map(fn (ConsultationStatus $status) => [
                'value' => $status->value,
                'label' => $this->statusLabel($status),
            ]),
        ]);
    }

    public function update(
        Request $request,
        Consultation $consultation,
        PointLedgerService $pointLedger
    ): RedirectResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', new Enum(ConsultationStatus::class)],
            'assigned_planner_id' => ['nullable', 'exists:users,id'],
            'memo' => ['nullable', 'string', 'max:1000'],
        ]);

        $fromStatus = $consultation->status;
        $toStatus = ConsultationStatus::from($validated['status']);

        $consultation->update([
            'status' => $toStatus,
            'assigned_planner_id' => $validated['assigned_planner_id'] ?? null,
            'completed_at' => $toStatus === ConsultationStatus::Completed ? now() : $consultation->completed_at,
            'cancelled_at' => $toStatus === ConsultationStatus::Cancelled ? now() : $consultation->cancelled_at,
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

        return redirect()
            ->route('admin.consultations.show', $consultation)
            ->with('success', '상담 상태가 변경되었습니다.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->canAccessAdmin(), 403);
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
            ConsultationStatus::Assigned => '배정',
            ConsultationStatus::InProgress => '진행 중',
            ConsultationStatus::Completed => '완료',
            ConsultationStatus::Cancelled => '취소',
        };
    }
}
