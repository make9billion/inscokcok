<?php

namespace Tests\Feature;

use App\Enums\PointLedgerType;
use App\Models\Event;
use App\Models\PointLedgerEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SignupPointGrantTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_registration_grants_active_signup_bonus_points(): void
    {
        Event::factory()->create([
            'slug' => 'signup_bonus',
            'name' => '회원가입 적립',
            'trigger_type' => 'member.registered',
            'point_amount' => 1500,
            'is_active' => true,
        ]);

        $this->post('/register', [
            'name' => '김민지',
            'email' => 'member@example.com',
            'phone' => '010-1234-5678',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_agreement' => '1',
            'privacy_agreement' => '1',
        ])->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'member@example.com')->firstOrFail();
        $entry = PointLedgerEntry::firstOrFail();

        $this->assertSame($user->id, $entry->user_id);
        $this->assertSame(PointLedgerType::Earned, $entry->type);
        $this->assertSame(1500, $entry->points);
        $this->assertSame(1500, $entry->balance_after);
        $this->assertSame('signup:'.$user->id, $entry->idempotency_key);
    }

    public function test_inactive_signup_bonus_does_not_grant_points(): void
    {
        Event::factory()->create([
            'slug' => 'signup_bonus',
            'trigger_type' => 'member.registered',
            'point_amount' => 1500,
            'is_active' => false,
        ]);

        $this->post('/register', [
            'name' => '박서준',
            'email' => 'member@example.com',
            'phone' => '010-2222-3333',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms_agreement' => '1',
            'privacy_agreement' => '1',
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseCount('point_ledger_entries', 0);
    }
}
