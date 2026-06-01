<?php

namespace Tests\Feature;

use App\Enums\ConsultationStatus;
use App\Enums\PointLedgerType;
use App\Models\Consultation;
use App\Models\KnowledgeQuestion;
use App\Models\PointLedgerEntry;
use App\Models\PointMallOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_receives_member_summary_props(): void
    {
        $user = User::factory()->create();

        Consultation::factory()->for($user)->create([
            'interested_product' => '암보험',
            'status' => ConsultationStatus::Received,
        ]);
        KnowledgeQuestion::factory()->for($user)->create([
            'title' => '보험료 질문',
        ]);
        PointMallOrder::factory()->for($user)->create([
            'order_number' => 'PM-TEST-001',
            'total_points' => 3000,
        ]);
        PointLedgerEntry::factory()->for($user)->create([
            'type' => PointLedgerType::Earned,
            'points' => 1000,
            'memo' => '회원가입 적립',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('summary.pointBalance', 1000)
            ->where('summary.consultationCount', 1)
            ->where('summary.questionCount', 1)
            ->where('summary.orderCount', 1)
            ->where('recentConsultations.0.interestedProduct', '암보험')
            ->where('recentOrders.0.orderNumber', 'PM-TEST-001')
            ->where('recentQuestions.0.title', '보험료 질문')
        );
    }
}
