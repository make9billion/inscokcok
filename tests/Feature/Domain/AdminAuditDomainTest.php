<?php

namespace Tests\Feature\Domain;

use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuditDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_audit_log_casts_before_after_payloads_and_links_actor(): void
    {
        $admin = User::factory()->admin()->create();

        $log = AdminAuditLog::factory()->for($admin, 'actor')->create([
            'action' => 'point.adjusted',
            'subject_type' => User::class,
            'subject_id' => $admin->id,
            'before' => ['points' => 1000],
            'after' => ['points' => 1500],
        ]);

        $this->assertTrue($log->actor->is($admin));
        $this->assertSame(['points' => 1000], $log->before);
        $this->assertSame(['points' => 1500], $log->after);
        $this->assertTrue($admin->adminAuditLogs()->first()->is($log));
    }
}
