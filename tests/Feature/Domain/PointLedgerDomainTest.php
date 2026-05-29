<?php

namespace Tests\Feature\Domain;

use App\Enums\PointLedgerType;
use App\Models\Event;
use App\Models\PointLedgerEntry;
use App\Models\User;
use Database\Seeders\EventSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PointLedgerDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_event_seeder_creates_default_point_events(): void
    {
        $this->seed(EventSeeder::class);

        $this->assertDatabaseHas('events', [
            'slug' => 'signup_bonus',
            'point_amount' => 1000,
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('events', [
            'slug' => 'consultation_completed_bonus',
            'point_amount' => 1000,
            'is_active' => true,
        ]);
    }

    public function test_ledger_entries_are_signed_and_idempotent(): void
    {
        $user = User::factory()->create();
        $event = Event::factory()->create(['slug' => 'signup_bonus']);

        $entry = PointLedgerEntry::factory()->for($user)->for($event)->create([
            'type' => PointLedgerType::Earned,
            'points' => 1000,
            'balance_after' => 1000,
            'idempotency_key' => 'signup:'.$user->id,
        ]);

        $this->assertSame(PointLedgerType::Earned, $entry->type);
        $this->assertSame(1000, $user->pointLedgerEntries()->sum('points'));

        $this->expectException(QueryException::class);
        PointLedgerEntry::factory()->for($user)->for($event)->create([
            'idempotency_key' => 'signup:'.$user->id,
        ]);
    }
}
