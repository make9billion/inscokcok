<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminEventManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_admin_event_list(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->get('/admin/events')->assertForbidden();
    }

    public function test_admin_can_view_point_events(): void
    {
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->create([
            'slug' => 'signup_bonus',
            'name' => '회원가입 적립',
            'trigger_type' => 'member.registered',
            'point_amount' => 1000,
            'is_active' => true,
            'show_on_home' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin/events');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Events/Index')
            ->where('events.0.id', $event->id)
            ->where('events.0.slug', 'signup_bonus')
            ->where('events.0.name', '회원가입 적립')
            ->where('events.0.pointAmount', 1000)
            ->where('events.0.isActive', true)
            ->where('events.0.showOnHome', true)
        );
    }

    public function test_admin_can_create_manual_event(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/events', [
            'name' => '여름 이벤트',
            'point_amount' => 0,
            'is_active' => true,
            'show_on_home' => false,
            'detail_content' => '<p>상세 안내입니다.</p>',
        ]);

        $response->assertRedirect('/admin/events');

        $event = Event::where('name', '여름 이벤트')->firstOrFail();

        $this->assertStringStartsWith('manual.', $event->trigger_type);
        $this->assertSame(0, $event->point_amount);
        $this->assertTrue($event->is_active);
        $this->assertFalse($event->show_on_home);
        $this->assertSame('<p>상세 안내입니다.</p>', $event->detail_content);
    }

    public function test_admin_can_update_event_point_amount_and_active_state(): void
    {
        $admin = User::factory()->admin()->create();
        $event = Event::factory()->create([
            'point_amount' => 1000,
            'is_active' => true,
            'show_on_home' => false,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/events/{$event->id}", [
            'point_amount' => 2500,
            'is_active' => false,
            'show_on_home' => false,
        ]);

        $response->assertRedirect('/admin/events');

        $event->refresh();

        $this->assertSame(2500, $event->point_amount);
        $this->assertFalse($event->is_active);
        $this->assertFalse($event->show_on_home);
    }

    public function test_home_visible_events_are_limited_to_two(): void
    {
        $admin = User::factory()->admin()->create();
        Event::factory()->count(2)->create(['show_on_home' => true]);
        $event = Event::factory()->create(['show_on_home' => false]);

        $response = $this->actingAs($admin)->patch("/admin/events/{$event->id}", [
            'point_amount' => 1000,
            'is_active' => true,
            'show_on_home' => true,
        ]);

        $response->assertSessionHasErrors('show_on_home');
        $this->assertFalse($event->refresh()->show_on_home);
    }
}
