<?php

namespace Tests\Feature\Domain;

use App\Enums\ConsultationStatus;
use App\Enums\ConsultationType;
use App\Models\Consultation;
use App\Models\ConsultationStatusLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultationDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_consultation_casts_type_status_and_links_user_and_assigned_planner(): void
    {
        $member = User::factory()->create();
        $planner = User::factory()->planner()->create();

        $consultation = Consultation::factory()
            ->for($member, 'user')
            ->for($planner, 'assignedPlanner')
            ->create([
                'type' => ConsultationType::Checkup,
                'status' => ConsultationStatus::Assigned,
            ]);

        $this->assertSame(ConsultationType::Checkup, $consultation->type);
        $this->assertSame(ConsultationStatus::Assigned, $consultation->status);
        $this->assertTrue($consultation->user->is($member));
        $this->assertTrue($consultation->assignedPlanner->is($planner));
    }

    public function test_consultation_status_logs_keep_from_status_to_status_and_actor_history_relationships(): void
    {
        $planner = User::factory()->planner()->create();
        $consultation = Consultation::factory()->create([
            'status' => ConsultationStatus::Received,
        ]);

        $log = ConsultationStatusLog::create([
            'consultation_id' => $consultation->id,
            'actor_id' => $planner->id,
            'from_status' => ConsultationStatus::Received,
            'to_status' => ConsultationStatus::Completed,
            'memo' => '상담 완료',
        ]);

        $this->assertSame(ConsultationStatus::Received, $log->from_status);
        $this->assertSame(ConsultationStatus::Completed, $log->to_status);
        $this->assertTrue($log->actor->is($planner));
        $this->assertTrue($consultation->statusLogs()->first()->is($log));
    }
}
