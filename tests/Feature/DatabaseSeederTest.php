<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\SiteContent;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_admin_and_initial_content_idempotently(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'make9billion@gmail.com')->firstOrFail();

        $this->assertSame('보험CC 관리자', $admin->name);
        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertTrue(Hash::check('password', $admin->password));
        $this->assertSame(1, User::where('email', 'make9billion@gmail.com')->count());

        foreach (['notice', 'faq', 'main_banner', 'company_intro', 'event_guide'] as $type) {
            $this->assertTrue(
                SiteContent::where('type', $type)->where('is_published', true)->exists(),
                "Missing published {$type} seed content."
            );
        }
    }

    public function test_seeded_admin_can_access_core_admin_pages(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'make9billion@gmail.com')->firstOrFail();

        foreach (['/admin/consultations', '/admin/cms', '/admin/events', '/admin/point-mall/orders'] as $path) {
            $this->actingAs($admin)->get($path)->assertOk();
        }
    }
}
