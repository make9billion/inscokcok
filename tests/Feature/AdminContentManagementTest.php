<?php

namespace Tests\Feature;

use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_cms_management(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/cms')->assertForbidden();
    }

    public function test_admin_can_create_site_content(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/cms', [
            'type' => 'notice',
            'title' => 'New notice',
            'body' => 'Notice body',
            'link_url' => 'https://example.com',
            'sort_order' => 10,
            'is_published' => true,
        ]);

        $response->assertRedirect('/admin/cms');
        $this->assertDatabaseHas('site_contents', [
            'type' => 'notice',
            'title' => 'New notice',
            'body' => 'Notice body',
            'sort_order' => 10,
            'is_published' => true,
        ]);
    }

    public function test_admin_can_update_site_content(): void
    {
        $admin = User::factory()->admin()->create();
        $content = SiteContent::create([
            'type' => 'faq',
            'title' => 'Old question',
            'body' => 'Old answer',
            'sort_order' => 1,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/cms/{$content->id}", [
            'type' => 'faq',
            'title' => 'Updated question',
            'body' => 'Updated answer',
            'link_url' => null,
            'sort_order' => 3,
            'is_published' => false,
        ]);

        $response->assertRedirect('/admin/cms');
        $this->assertDatabaseHas('site_contents', [
            'id' => $content->id,
            'title' => 'Updated question',
            'body' => 'Updated answer',
            'sort_order' => 3,
            'is_published' => false,
        ]);
    }
}
