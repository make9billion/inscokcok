<?php

namespace Tests\Feature;

use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_split_content_management(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/notices')->assertForbidden();
        $this->actingAs($member)->get('/admin/faqs')->assertForbidden();
    }

    public function test_admin_can_create_notice_from_split_notice_page(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/notices', [
            'type' => 'notice',
            'title' => 'New notice',
            'body' => 'Notice body',
            'link_url' => 'https://example.com',
            'sort_order' => 10,
            'is_published' => true,
        ]);

        $response->assertRedirect('/admin/notices');
        $this->assertDatabaseHas('site_contents', [
            'type' => 'notice',
            'title' => 'New notice',
            'body' => 'Notice body',
            'sort_order' => 10,
            'is_published' => true,
        ]);
    }

    public function test_admin_can_create_faq_from_split_faq_page(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/faqs', [
            'type' => 'faq',
            'title' => 'Question',
            'body' => 'Answer',
            'link_url' => null,
            'sort_order' => 3,
            'is_published' => true,
        ]);

        $response->assertRedirect('/admin/faqs');
        $this->assertDatabaseHas('site_contents', [
            'type' => 'faq',
            'title' => 'Question',
            'body' => 'Answer',
        ]);
    }

    public function test_admin_split_pages_expose_fixed_content_type(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin/notices')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Cms/Index')
            ->where('fixedType', 'notice')
            ->where('pageTitle', '공지사항')
            ->where('storeRouteName', 'admin.notices.store')
            ->where('updateRouteName', 'admin.notices.update')
        );

        $this->actingAs($admin)->get('/admin/faqs')->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Cms/Index')
            ->where('fixedType', 'faq')
            ->where('pageTitle', 'FAQ')
            ->where('storeRouteName', 'admin.faqs.store')
            ->where('updateRouteName', 'admin.faqs.update')
        );
    }

    public function test_admin_can_update_notice_from_split_page(): void
    {
        $admin = User::factory()->admin()->create();
        $content = SiteContent::create([
            'type' => 'notice',
            'title' => 'Old notice',
            'body' => 'Old body',
            'sort_order' => 1,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/admin/notices/{$content->id}", [
            'type' => 'notice',
            'title' => 'Updated notice',
            'body' => 'Updated body',
            'link_url' => null,
            'sort_order' => 3,
            'is_published' => false,
        ]);

        $response->assertRedirect('/admin/notices');
        $this->assertDatabaseHas('site_contents', [
            'id' => $content->id,
            'title' => 'Updated notice',
            'body' => 'Updated body',
            'sort_order' => 3,
            'is_published' => false,
        ]);
    }
}
