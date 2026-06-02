<?php

namespace Tests\Feature;

use App\Enums\ConsultationStatus;
use App\Models\AdminAuditLog;
use App\Models\Consultation;
use App\Models\ConsultationStatusLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminConsultationManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_admin_consultation_list(): void
    {
        $member = User::factory()->create();

        $response = $this->actingAs($member)->get('/admin/consultations');

        $response->assertForbidden();
    }

    public function test_admin_can_view_consultation_list(): void
    {
        $admin = User::factory()->admin()->create();
        $consultation = Consultation::factory()->create([
            'applicant_name' => '김민준',
            'phone' => '010-1234-5678',
            'status' => ConsultationStatus::Received,
            'interested_product' => '암보험',
        ]);

        $response = $this->actingAs($admin)->get('/admin/consultations');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Consultations/Index')
            ->where('consultations.0.id', $consultation->id)
            ->where('consultations.0.applicantName', '김민준')
            ->where('consultations.0.phone', '010-1234-5678')
            ->where('consultations.0.status', 'received')
            ->where('consultations.0.interestedProduct', '암보험')
        );
    }

    public function test_admin_can_filter_consultations_by_status_and_search_keyword(): void
    {
        $admin = User::factory()->admin()->create();
        $matching = Consultation::factory()->create([
            'applicant_name' => '김필터',
            'phone' => '010-2222-3333',
            'status' => ConsultationStatus::Assigned,
            'interested_product' => '간병보험',
        ]);
        Consultation::factory()->create([
            'applicant_name' => '박제외',
            'phone' => '010-9999-8888',
            'status' => ConsultationStatus::Received,
            'interested_product' => '암보험',
        ]);

        $response = $this->actingAs($admin)->get('/admin/consultations?status=assigned&search=필터');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Consultations/Index')
            ->where('filters.status', 'assigned')
            ->where('filters.search', '필터')
            ->where('consultations.0.id', $matching->id)
            ->has('consultations', 1)
        );
    }

    public function test_admin_can_update_consultation_status_and_log_change(): void
    {
        $admin = User::factory()->admin()->create();
        $planner = User::factory()->planner()->create();
        $consultation = Consultation::factory()->create([
            'status' => ConsultationStatus::Received,
            'assigned_planner_id' => null,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/consultations/{$consultation->id}", [
            'status' => 'assigned',
            'assigned_planner_id' => $planner->id,
            'memo' => '플래너 배정 완료',
        ]);

        $response->assertRedirect("/admin/consultations/{$consultation->id}");

        $consultation->refresh();

        $this->assertSame(ConsultationStatus::Assigned, $consultation->status);
        $this->assertSame($planner->id, $consultation->assigned_planner_id);

        $log = ConsultationStatusLog::firstOrFail();

        $this->assertSame($consultation->id, $log->consultation_id);
        $this->assertSame($admin->id, $log->actor_id);
        $this->assertSame(ConsultationStatus::Received, $log->from_status);
        $this->assertSame(ConsultationStatus::Assigned, $log->to_status);
        $this->assertSame('플래너 배정 완료', $log->memo);

        $audit = AdminAuditLog::query()->where('action', 'consultation.updated')->firstOrFail();

        $this->assertSame($admin->id, $audit->actor_id);
        $this->assertSame(Consultation::class, $audit->subject_type);
        $this->assertSame($consultation->id, $audit->subject_id);
        $this->assertSame(ConsultationStatus::Received->value, $audit->before['status']);
        $this->assertNull($audit->before['assigned_planner_id']);
        $this->assertSame(ConsultationStatus::Assigned->value, $audit->after['status']);
        $this->assertSame($planner->id, $audit->after['assigned_planner_id']);
    }
}
