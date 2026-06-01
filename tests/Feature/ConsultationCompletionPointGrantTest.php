<?php

namespace Tests\Feature;

use App\Enums\ConsultationStatus;
use App\Enums\PointLedgerType;
use App\Models\Consultation;
use App\Models\Event;
use App\Models\PointLedgerEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultationCompletionPointGrantTest extends TestCase
{
    use RefreshDatabase;

    public function test_completing_member_consultation_grants_event_points_once(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();
        $consultation = Consultation::factory()->for($member)->create([
            'status' => ConsultationStatus::Assigned,
        ]);
        Event::factory()->create([
            'slug' => 'consultation_completed_bonus',
            'name' => '상담완료 적립',
            'trigger_type' => 'consultation.completed',
            'point_amount' => 3000,
            'is_active' => true,
        ]);

        $this->actingAs($admin)->patch("/admin/consultations/{$consultation->id}", [
            'status' => 'completed',
            'assigned_planner_id' => null,
            'memo' => '상담 완료',
        ])->assertRedirect("/admin/consultations/{$consultation->id}");

        $entry = PointLedgerEntry::firstOrFail();

        $this->assertSame($member->id, $entry->user_id);
        $this->assertSame(PointLedgerType::Earned, $entry->type);
        $this->assertSame(3000, $entry->points);
        $this->assertSame(3000, $entry->balance_after);
        $this->assertSame('consultation-completed:'.$consultation->id, $entry->idempotency_key);

        $this->actingAs($admin)->patch("/admin/consultations/{$consultation->id}", [
            'status' => 'completed',
            'assigned_planner_id' => null,
            'memo' => '상담 완료 재저장',
        ])->assertRedirect("/admin/consultations/{$consultation->id}");

        $this->assertDatabaseCount('point_ledger_entries', 1);
    }

    public function test_completing_guest_consultation_does_not_grant_points(): void
    {
        $admin = User::factory()->admin()->create();
        $consultation = Consultation::factory()->create([
            'user_id' => null,
            'status' => ConsultationStatus::Assigned,
        ]);
        Event::factory()->create([
            'slug' => 'consultation_completed_bonus',
            'trigger_type' => 'consultation.completed',
            'point_amount' => 3000,
            'is_active' => true,
        ]);

        $this->actingAs($admin)->patch("/admin/consultations/{$consultation->id}", [
            'status' => 'completed',
            'assigned_planner_id' => null,
        ])->assertRedirect("/admin/consultations/{$consultation->id}");

        $this->assertDatabaseCount('point_ledger_entries', 0);
    }
}
