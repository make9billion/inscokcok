<?php

namespace Tests\Feature;

use App\Enums\ConsultationStatus;
use App\Enums\UserRole;
use App\Models\AdminAuditLog;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_full_admin_can_access_admin_account_management(): void
    {
        $planner = User::factory()->planner()->create();

        $this->actingAs($planner)->get('/admin/accounts')->assertForbidden();
    }

    public function test_admin_can_create_admin_account_with_username(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/accounts', [
            'username' => 'planner01',
            'password' => 'password123',
            'name' => '설계사A',
            'phone' => '010-1111-2222',
            'organization' => '서울지점',
            'role' => UserRole::Planner->value,
        ]);

        $response->assertRedirect('/admin/accounts');
        $this->assertDatabaseHas('users', [
            'username' => 'planner01',
            'email' => 'planner01@admin.local',
            'name' => '설계사A',
            'phone' => '010-1111-2222',
            'organization' => '서울지점',
            'role' => UserRole::Planner->value,
        ]);

        $createdAccount = User::query()->where('username', 'planner01')->firstOrFail();
        $audit = AdminAuditLog::query()->where('action', 'admin_account.created')->firstOrFail();

        $this->assertSame($admin->id, $audit->actor_id);
        $this->assertSame(User::class, $audit->subject_type);
        $this->assertSame($createdAccount->id, $audit->subject_id);
        $this->assertSame('planner01', $audit->after['username']);
        $this->assertSame(UserRole::Planner->value, $audit->after['role']);
    }

    public function test_admin_can_update_admin_account_role(): void
    {
        $admin = User::factory()->admin()->create();
        $account = User::factory()->planner()->create([
            'username' => 'staff01',
            'organization' => '기존소속',
        ]);

        $response = $this->actingAs($admin)->patch("/admin/accounts/{$account->id}", [
            'role' => UserRole::Admin->value,
            'phone' => '010-3333-4444',
            'organization' => '운영팀',
        ]);

        $response->assertRedirect('/admin/accounts');
        $this->assertDatabaseHas('users', [
            'id' => $account->id,
            'role' => UserRole::Admin->value,
            'phone' => '010-3333-4444',
            'organization' => '운영팀',
        ]);

        $audit = AdminAuditLog::query()->where('action', 'admin_account.updated')->firstOrFail();

        $this->assertSame($admin->id, $audit->actor_id);
        $this->assertSame(User::class, $audit->subject_type);
        $this->assertSame($account->id, $audit->subject_id);
        $this->assertSame(UserRole::Planner->value, $audit->before['role']);
        $this->assertSame(UserRole::Admin->value, $audit->after['role']);
        $this->assertSame('010-3333-4444', $audit->after['phone']);
    }

    public function test_admin_can_delete_managed_admin_account(): void
    {
        $admin = User::factory()->admin()->create();
        $account = User::factory()->planner()->create(['username' => 'delete-me']);

        $response = $this->actingAs($admin)->delete("/admin/accounts/{$account->id}");

        $response->assertRedirect('/admin/accounts');
        $this->assertDatabaseMissing('users', ['id' => $account->id]);

        $audit = AdminAuditLog::query()->where('action', 'admin_account.deleted')->firstOrFail();
        $this->assertSame($admin->id, $audit->actor_id);
        $this->assertSame('delete-me', $audit->before['username']);
    }

    public function test_admin_cannot_delete_self_account(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->delete("/admin/accounts/{$admin->id}")->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_account_role_options_only_include_admin_and_planner(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin/accounts')->assertOk()->assertInertia(fn ($page) => $page
            ->where('roleOptions.0.value', UserRole::Admin->value)
            ->where('roleOptions.0.label', '전체권한')
            ->where('roleOptions.1.value', UserRole::Planner->value)
            ->where('roleOptions.1.label', '설계사권한')
            ->missing('roleOptions.2')
        );
    }

    public function test_admin_account_can_login_with_username(): void
    {
        User::factory()->planner()->create([
            'username' => 'plannerlogin',
            'email' => 'plannerlogin@admin.local',
            'password' => 'password123',
        ]);

        $response = $this->post('/login', [
            'email' => 'plannerlogin',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_planner_only_sees_assigned_consultations_and_limited_statuses(): void
    {
        $planner = User::factory()->planner()->create();
        $assigned = Consultation::factory()->create([
            'assigned_planner_id' => $planner->id,
            'status' => ConsultationStatus::Assigned,
        ]);
        Consultation::factory()->create([
            'status' => ConsultationStatus::Received,
        ]);

        $this->actingAs($planner)->get('/admin/consultations')->assertOk()->assertInertia(fn ($page) => $page
            ->where('consultations.0.id', $assigned->id)
            ->has('consultations', 1)
        );

        $this->actingAs($planner)->get("/admin/consultations/{$assigned->id}")->assertOk()->assertInertia(fn ($page) => $page
            ->where('statusOptions.0.value', ConsultationStatus::Assigned->value)
            ->where('statusOptions.1.value', ConsultationStatus::Completed->value)
            ->where('statusOptions.2.value', ConsultationStatus::ConsultationCancelled->value)
            ->where('canChangePlanner', false)
        );
    }

    public function test_consultation_status_options_keep_cancelled_after_recall(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin/consultations')->assertOk()->assertInertia(fn ($page) => $page
            ->where('statusOptions.0.value', ConsultationStatus::Received->value)
            ->where('statusOptions.1.value', ConsultationStatus::NoAnswer->value)
            ->where('statusOptions.2.value', ConsultationStatus::Recall->value)
            ->where('statusOptions.3.value', ConsultationStatus::Cancelled->value)
            ->where('statusOptions.4.value', ConsultationStatus::Assigned->value)
            ->where('statusOptions.5.value', ConsultationStatus::Completed->value)
            ->where('statusOptions.6.value', ConsultationStatus::ConsultationCancelled->value)
        );
    }

    public function test_planner_cannot_access_unassigned_consultation_or_other_admin_pages(): void
    {
        $planner = User::factory()->planner()->create();
        $consultation = Consultation::factory()->create();

        $this->actingAs($planner)->get("/admin/consultations/{$consultation->id}")->assertForbidden();
        $this->actingAs($planner)->get('/admin/knowledge')->assertOk();
        $this->actingAs($planner)->get('/admin/members')->assertForbidden();
    }

    public function test_planner_is_blocked_from_admin_only_management_routes(): void
    {
        $planner = User::factory()->planner()->create();
        $adminAccount = User::factory()->admin()->create();

        $adminOnlyGetRoutes = [
            '/admin/accounts',
            "/admin/accounts/{$adminAccount->id}",
            '/admin/members',
            '/admin/members/export',
            '/admin/inquiries',
            '/admin/partnership-inquiries',
            '/admin/faqs',
            '/admin/notices',
            '/admin/events',
            '/admin/point-mall/orders',
            '/admin/point-mall/products',
            '/admin/point-mall/products/create',
        ];

        foreach ($adminOnlyGetRoutes as $uri) {
            $this->actingAs($planner)->get($uri)->assertForbidden();
        }
    }

    public function test_planner_cannot_use_disallowed_consultation_statuses_or_reassign_consultation(): void
    {
        $planner = User::factory()->planner()->create();
        $otherPlanner = User::factory()->planner()->create();
        $consultation = Consultation::factory()->create([
            'assigned_planner_id' => $planner->id,
            'status' => ConsultationStatus::Assigned,
        ]);

        $this->actingAs($planner)->patch("/admin/consultations/{$consultation->id}", [
            'status' => ConsultationStatus::Received->value,
            'assigned_planner_id' => $otherPlanner->id,
        ])->assertSessionHasErrors('status');

        $this->actingAs($planner)->patch("/admin/consultations/{$consultation->id}", [
            'status' => ConsultationStatus::Completed->value,
            'assigned_planner_id' => $otherPlanner->id,
        ])->assertRedirect("/admin/consultations/{$consultation->id}");

        $this->assertDatabaseHas('consultations', [
            'id' => $consultation->id,
            'status' => ConsultationStatus::Completed->value,
            'assigned_planner_id' => $planner->id,
        ]);
    }
}
