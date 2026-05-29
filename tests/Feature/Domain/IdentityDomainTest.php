<?php

namespace Tests\Feature\Domain;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdentityDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_role_casts_to_enum_and_defaults_to_member(): void
    {
        $user = User::factory()->create();

        $this->assertSame(UserRole::Member, $user->role);
        $this->assertTrue($user->isMember());
        $this->assertFalse($user->isPlanner());
        $this->assertFalse($user->isConsultationManager());
        $this->assertFalse($user->isAdmin());
    }

    public function test_role_helpers_identify_privileged_users(): void
    {
        $member = User::factory()->create();
        $planner = User::factory()->planner()->create();
        $consultationManager = User::factory()->consultationManager()->create();
        $admin = User::factory()->admin()->create();

        $this->assertTrue($planner->isPlanner());
        $this->assertTrue($planner->canAccessAdmin());
        $this->assertFalse($planner->isMember());

        $this->assertTrue($consultationManager->isConsultationManager());
        $this->assertTrue($consultationManager->canAccessAdmin());
        $this->assertFalse($consultationManager->isMember());

        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($admin->canAccessAdmin());
        $this->assertFalse($admin->isMember());

        $this->assertFalse($member->canAccessAdmin());
    }
}
