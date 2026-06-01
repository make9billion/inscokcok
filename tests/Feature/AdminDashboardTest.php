<?php

namespace Tests\Feature;

use App\Enums\ConsultationStatus;
use App\Enums\KnowledgeQuestionStatus;
use App\Enums\PointMallOrderStatus;
use App\Models\Consultation;
use App\Models\Inquiry;
use App\Models\KnowledgeQuestion;
use App\Models\PointMallOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_admin_sees_admin_dashboard_summary(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();
        Consultation::factory()->create(['status' => ConsultationStatus::Received]);
        Inquiry::create([
            'category' => 'site',
            'applicant_name' => '문의자',
            'title' => '문의 제목',
            'body' => '문의 내용',
            'status' => 'received',
        ]);
        KnowledgeQuestion::factory()->create(['status' => KnowledgeQuestionStatus::Open]);
        PointMallOrder::factory()->create(['status' => PointMallOrderStatus::Pending]);

        $this->actingAs($admin)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('role', 'admin')
            ->where('summary.openConsultations', 1)
            ->where('summary.pendingInquiries', 1)
            ->where('summary.openQuestions', 1)
            ->where('summary.pendingOrders', 1)
            ->where('summary.memberCount', 4)
            ->where('workQueues.consultations.0.statusLabel', '접수')
            ->where('workQueues.inquiries.0.title', '문의 제목')
        );
    }

    public function test_planner_dashboard_only_counts_assigned_consultations(): void
    {
        $planner = User::factory()->planner()->create();
        $assigned = Consultation::factory()->create([
            'assigned_planner_id' => $planner->id,
            'status' => ConsultationStatus::Assigned,
        ]);
        Consultation::factory()->create(['status' => ConsultationStatus::Received]);

        $this->actingAs($planner)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('role', 'planner')
            ->where('summary.openConsultations', 1)
            ->where('workQueues.consultations.0.id', $assigned->id)
            ->missing('workQueues.consultations.1')
            ->where('summary.pendingInquiries', 0)
        );
    }

    public function test_consultation_manager_dashboard_focuses_on_knowledge_questions(): void
    {
        $manager = User::factory()->consultationManager()->create();
        KnowledgeQuestion::factory()->create(['status' => KnowledgeQuestionStatus::Open, 'title' => '답변 필요']);
        Consultation::factory()->create(['status' => ConsultationStatus::Received]);

        $this->actingAs($manager)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('role', 'consultation_manager')
            ->where('summary.openQuestions', 1)
            ->where('summary.openConsultations', 1)
            ->where('workQueues.questions.0.title', '답변 필요')
        );
    }

    public function test_member_still_sees_member_dashboard(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('summary.pointBalance', 0)
        );
    }
}
