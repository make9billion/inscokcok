<?php

namespace Tests\Feature;

use App\Enums\PointLedgerType;
use App\Models\PointLedgerEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberPointHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_view_own_point_history(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        PointLedgerEntry::factory()->for($user)->create([
            'type' => PointLedgerType::Earned,
            'points' => 3000,
            'balance_after' => 3000,
            'memo' => '상담완료 적립',
            'created_at' => now()->subDay(),
        ]);
        PointLedgerEntry::factory()->for($user)->create([
            'type' => PointLedgerType::Spent,
            'points' => -1000,
            'balance_after' => 2000,
            'memo' => '포인트몰 사용',
            'created_at' => now(),
        ]);
        PointLedgerEntry::factory()->for($otherUser)->create([
            'memo' => '다른 회원 내역',
        ]);

        $response = $this->actingAs($user)->get('/mypage/points');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('MyPage/Points')
            ->where('pointBalance', 2000)
            ->where('entries.0.memo', '포인트몰 사용')
            ->where('entries.0.points', -1000)
            ->where('entries.0.balanceAfter', 2000)
            ->where('entries.1.memo', '상담완료 적립')
            ->missing('entries.2')
        );
    }

    public function test_guest_is_redirected_from_point_history(): void
    {
        $this->get('/mypage/points')->assertRedirect('/login');
    }
}
