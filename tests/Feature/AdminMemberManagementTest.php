<?php

namespace Tests\Feature;

use App\Enums\PointLedgerType;
use App\Models\AdminAuditLog;
use App\Models\PointLedgerEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_admin_member_management(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/members')->assertForbidden();
    }

    public function test_admin_can_view_member_information_and_point_balance(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create([
            'name' => '홍길동',
            'email' => 'member@example.com',
            'phone' => '010-1234-5678',
            'address_line1' => '서울시 강남구',
            'address_line2' => '101호',
        ]);
        PointLedgerEntry::factory()->for($member)->create([
            'type' => PointLedgerType::Earned,
            'points' => 3000,
        ]);

        $this->actingAs($admin)->get('/admin/members')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Members/Index')
            ->where('members.0.name', '홍길동')
            ->where('members.0.email', 'member@example.com')
            ->where('members.0.phone', '010-1234-5678')
            ->where('members.0.address', '서울시 강남구 101호')
            ->where('members.0.pointBalance', 3000)
            ->where('canAdjustPoints', true)
        );
    }

    public function test_admin_can_search_members(): void
    {
        $admin = User::factory()->admin()->create();
        $matched = User::factory()->create(['name' => '검색회원', 'email' => 'target@example.com']);
        User::factory()->create(['name' => '다른회원', 'email' => 'other@example.com']);

        $this->actingAs($admin)->get('/admin/members?search=target')->assertOk()->assertInertia(fn ($page) => $page
            ->where('members.0.id', $matched->id)
            ->missing('members.1')
            ->where('filters.search', 'target')
        );
    }

    public function test_only_admin_can_manually_adjust_member_points(): void
    {
        $planner = User::factory()->planner()->create();
        $member = User::factory()->create();

        $this->actingAs($planner)->post("/admin/members/{$member->id}/points", [
            'points' => 1000,
            'memo' => '테스트 지급',
        ])->assertForbidden();
    }

    public function test_admin_can_manually_adjust_member_points(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();
        PointLedgerEntry::factory()->for($member)->create([
            'type' => PointLedgerType::Earned,
            'points' => 2000,
        ]);

        $response = $this->actingAs($admin)->post("/admin/members/{$member->id}/points", [
            'points' => -500,
            'memo' => '관리자 수동 차감',
        ]);

        $response->assertRedirect('/admin/members');
        $this->assertDatabaseHas('point_ledger_entries', [
            'user_id' => $member->id,
            'created_by_id' => $admin->id,
            'type' => PointLedgerType::Adjusted->value,
            'points' => -500,
            'balance_after' => 1500,
            'memo' => '관리자 수동 차감',
        ]);

        $audit = AdminAuditLog::query()->where('action', 'member.points_adjusted')->firstOrFail();

        $this->assertSame($admin->id, $audit->actor_id);
        $this->assertSame(User::class, $audit->subject_type);
        $this->assertSame($member->id, $audit->subject_id);
        $this->assertSame(2000, $audit->before['point_balance']);
        $this->assertSame(1500, $audit->after['point_balance']);
        $this->assertSame(-500, $audit->after['points']);
        $this->assertSame('관리자 수동 차감', $audit->after['memo']);
    }
}
